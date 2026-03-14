// src/jobs/scheduler.js
// ============================================================================
// Background job scheduler — polls tweets, evaluates alerts, prices, backtest
// Uses node-cron for scheduling (no Redis required in dev mode)
// ============================================================================

const cron = require('node-cron');
const { getDb } = require('../db/setup');
const { analyzeTweets } = require('../services/sentiment.service');
const twitterService = require('../services/twitter.service');
const priceService = require('../services/price.service');
const alertService = require('../services/alert.service');
const trackedPoller = require('./tracked-poller');
const logger = require('../config/logger');

let telegramBot = null; // Injected after bot starts
let sendAlertFn = null; // Injected after bot starts

function injectBot(bot, sendFn) {
    telegramBot = bot;
    sendAlertFn = sendFn;
    // Also inject bot into the X account poller
    trackedPoller.injectBot(bot);
    logger.info('[Scheduler] Bot injected into scheduler + poller');
}

// ============================================================================
// JOB 1: Poll tweets for all watched tickers (every 60s)
// ============================================================================

async function runTickerAnalysis() {
    const db = getDb();

    try {
        // Get all unique tickers across all user watchlists
        const allTickers = db.prepare(`
      SELECT DISTINCT ticker FROM watchlist
      ORDER BY ticker ASC
    `).all().map(r => r.ticker);

        if (allTickers.length === 0) return;

        logger.debug(`[Scheduler] Analyzing ${allTickers.length} tickers`);

        for (const ticker of allTickers) {
            try {
                // Fetch tweets
                const fetchResult = await twitterService.fetchTickerTweets(ticker);
                const tweets = fetchResult.tweets || [];

                // Load volume history
                const volumeHistory = db.prepare(`
          SELECT sample_size as count, created_at as timestamp
          FROM sentiment_snapshots
          WHERE ticker = ? AND created_at > ?
          ORDER BY created_at ASC
        `).all(ticker, Math.floor(Date.now() / 1000) - 86400); // Last 24h

                // Analyze
                const analysis = analyzeTweets(tweets, new Map(), volumeHistory);

                // Save snapshot
                db.prepare(`
          INSERT INTO sentiment_snapshots
          (ticker, sentiment, status, sample_size, confidence, bullish_count, bearish_count, neutral_count, volume_spike, spike_intensity)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
                    ticker,
                    analysis.sentiment,
                    analysis.status,
                    analysis.sampleSize,
                    analysis.confidence,
                    analysis.breakdown?.bullish || 0,
                    analysis.breakdown?.bearish || 0,
                    analysis.breakdown?.neutral || 0,
                    analysis.volumeSpike ? 1 : 0,
                    analysis.spikeIntensity || 0
                );

                // Evaluate alerts for each user watching this ticker
                const users = db.prepare(`
          SELECT DISTINCT u.* FROM users u
          INNER JOIN watchlist w ON w.user_id = u.id
          WHERE w.ticker = ?
        `).all(ticker);

                const priceData = await priceService.getPrice(ticker);

                for (const user of users) {
                    const triggered = await alertService.evaluateForUser(user.id, ticker, analysis, priceData);

                    for (const alert of triggered) {
                        logger.info(`[Scheduler] Alert triggered: ${alert.name} for user ${user.telegram_id} — $${ticker}`);
                        if (sendAlertFn && telegramBot && user.telegram_id) {
                            await sendAlertFn(telegramBot, user.id, alert);
                        }
                    }
                }

                // Small delay between tickers to avoid rate limits
                await sleep(500);
            } catch (tickerErr) {
                logger.error(`[Scheduler] Error analyzing ${ticker}: ${tickerErr.message}`);
            }
        }

        logger.debug('[Scheduler] Ticker analysis cycle complete');
    } catch (e) {
        logger.error(`[Scheduler] runTickerAnalysis failed: ${e.message}`);
    }
}

// ============================================================================
// JOB 2: Poll tracked X accounts for new tweets (every 3 minutes)
// — Now powered by the dedicated X Feed poller with Nitter/Syndication
// ============================================================================

async function checkTrackedAccounts() {
    try {
        await trackedPoller.pollTrackedAccounts();
    } catch (e) {
        logger.error(`[Scheduler] X account polling failed: ${e.message}`);
    }
}

// ============================================================================
// JOB 3: Price cache refresh (every 30s)
// ============================================================================

async function refreshPriceCache() {
    const db = getDb();

    try {
        const tickers = db.prepare('SELECT DISTINCT ticker FROM watchlist').all().map(r => r.ticker);
        if (tickers.length === 0) return;

        const prices = await priceService.getMultiplePrices(tickers);

        for (const [ticker, priceData] of Object.entries(prices)) {
            if (priceData?.price) {
                db.prepare(`
          INSERT OR REPLACE INTO price_cache (ticker, price, change_24h, type, updated_at)
          VALUES (?, ?, ?, ?, unixepoch())
        `).run(ticker, priceData.price, priceData.change24h || 0, priceData.type || 'unknown');
            }
        }
    } catch (e) {
        logger.error(`[Scheduler] Price refresh failed: ${e.message}`);
    }
}

// ============================================================================
// JOB 4: Backtest scoring (hourly)
// ============================================================================

async function runBacktestScoring() {
    const db = getDb();

    try {
        // Find signals from 1h, 4h, 24h ago that need price resolution
        const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
        const fourHoursAgo = Math.floor(Date.now() / 1000) - 14400;
        const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

        // Check 1h results
        const pending1h = db.prepare(`
      SELECT * FROM backtest_results
      WHERE price_after_1h IS NULL AND signal_time <= ? AND price_at_signal IS NOT NULL
      LIMIT 20
    `).all(oneHourAgo);

        for (const result of pending1h) {
            const priceData = await priceService.getPrice(result.ticker);
            if (priceData?.price) {
                const correct = result.signal_sentiment > 0
                    ? priceData.price > result.price_at_signal
                    : priceData.price < result.price_at_signal;

                db.prepare(`
          UPDATE backtest_results SET price_after_1h = ?, correct_1h = ? WHERE id = ?
        `).run(priceData.price, correct ? 1 : 0, result.id);
            }
            await sleep(300);
        }

        // Check 4h results
        const pending4h = db.prepare(`
      SELECT * FROM backtest_results
      WHERE price_after_4h IS NULL AND price_after_1h IS NOT NULL AND signal_time <= ? AND price_at_signal IS NOT NULL
      LIMIT 20
    `).all(fourHoursAgo);

        for (const result of pending4h) {
            const priceData = await priceService.getPrice(result.ticker);
            if (priceData?.price) {
                const correct = result.signal_sentiment > 0
                    ? priceData.price > result.price_at_signal
                    : priceData.price < result.price_at_signal;

                db.prepare(`
          UPDATE backtest_results SET price_after_4h = ?, correct_4h = ? WHERE id = ?
        `).run(priceData.price, correct ? 1 : 0, result.id);
            }
            await sleep(300);
        }

        // Check 24h results
        const pending24h = db.prepare(`
      SELECT * FROM backtest_results
      WHERE price_after_24h IS NULL AND price_after_4h IS NOT NULL AND signal_time <= ? AND price_at_signal IS NOT NULL
      LIMIT 20
    `).all(oneDayAgo);

        for (const result of pending24h) {
            const priceData = await priceService.getPrice(result.ticker);
            if (priceData?.price) {
                const correct = result.signal_sentiment > 0
                    ? priceData.price > result.price_at_signal
                    : priceData.price < result.price_at_signal;

                db.prepare(`
          UPDATE backtest_results SET price_after_24h = ?, correct_24h = ? WHERE id = ?
        `).run(priceData.price, correct ? 1 : 0, result.id);
            }
            await sleep(300);
        }

        logger.debug(`[Scheduler] Backtest scoring: updated ${pending1h.length} 1h, ${pending4h.length} 4h, ${pending24h.length} 24h results`);
    } catch (e) {
        logger.error(`[Scheduler] Backtest scoring failed: ${e.message}`);
    }
}

// ============================================================================
// JOB 5: Daily digest (every day at 8 AM IST = 2:30 AM UTC)
// ============================================================================

async function sendDailyDigest() {
    const db = getDb();

    try {
        const users = db.prepare("SELECT * FROM users WHERE settings LIKE '%daily_digest%'").all();

        for (const user of users) {
            try {
                const settings = JSON.parse(user.settings || '{}');
                if (!settings.dailyDigest || !user.telegram_id) continue;

                const watchlist = db.prepare('SELECT ticker FROM watchlist WHERE user_id = ?').all(user.id).map(r => r.ticker);
                if (watchlist.length === 0) continue;

                const lines = [];
                for (const ticker of watchlist.slice(0, 6)) {
                    const latest = db.prepare(`
            SELECT * FROM sentiment_snapshots WHERE ticker = ?
            ORDER BY created_at DESC LIMIT 1
          `).get(ticker);

                    if (latest) {
                        const emoji = latest.sentiment > 0.15 ? '🟢' : latest.sentiment < -0.15 ? '🔴' : '⚪';
                        const priceData = db.prepare('SELECT * FROM price_cache WHERE ticker = ?').get(ticker);
                        const priceStr = priceData?.price ? `$${priceData.price.toFixed(2)} (${priceData.change_24h >= 0 ? '+' : ''}${priceData.change_24h?.toFixed(1)}%)` : '--';
                        lines.push(`${emoji} <b>$${ticker}</b>: ${latest.status} | ${priceStr}`);
                    }
                }

                if (lines.length > 0) {
                    const digestMsg = `📋 <b>TraderX Daily Digest</b>\n${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', month: 'short', day: 'numeric' })}\n\n` +
                        lines.join('\n') +
                        `\n\n<i>Reply /sentiment TICKER for detailed analysis</i>`;

                    await telegramBot.telegram.sendMessage(user.telegram_id, digestMsg, { parse_mode: 'HTML' });
                    await sleep(500);
                }
            } catch (userErr) {
                logger.warn(`[Scheduler] Digest error for user ${user.id}: ${userErr.message}`);
            }
        }

        logger.info('[Scheduler] Daily digest sent');
    } catch (e) {
        logger.error(`[Scheduler] Daily digest failed: ${e.message}`);
    }
}

// ============================================================================
// START ALL JOBS
// ============================================================================

function startScheduler() {
    logger.info('[Scheduler] Starting background jobs...');

    // Run once immediately
    setTimeout(runTickerAnalysis, 5000);
    setTimeout(refreshPriceCache, 2000);

    // Ticker analysis: every 60 seconds
    cron.schedule('* * * * *', runTickerAnalysis);

    // Tracked accounts: every 3 minutes via X Feed Poller
    cron.schedule('*/3 * * * *', checkTrackedAccounts);

    // Run first X poll shortly after startup
    setTimeout(checkTrackedAccounts, 10000);

    // Price cache: every 30 seconds
    cron.schedule('*/30 * * * * *', refreshPriceCache, { scheduled: true });

    // Backtest scoring: every hour
    cron.schedule('0 * * * *', runBacktestScoring);

    // Daily digest: 8 AM IST (2:30 AM UTC)
    cron.schedule('30 2 * * *', sendDailyDigest);

    logger.info('[Scheduler] All jobs scheduled ✓');
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

module.exports = { startScheduler, injectBot, runTickerAnalysis };
