// src/api/routes/sync.routes.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { apiKeyAuth } = require('../middleware/auth');
const { analyzeTweets } = require('../../services/sentiment.service');
const priceService = require('../../services/price.service');
const alertService = require('../../services/alert.service');
const logger = require('../../config/logger');

// POST /api/sync/tweets — Extension pushes scraped/API tweets here
router.post('/tweets', apiKeyAuth, async (req, res) => {
    try {
        const { ticker, tweets } = req.body;

        if (!ticker || !Array.isArray(tweets) || tweets.length === 0) {
            return res.status(400).json({ error: 'Valid ticker and non-empty tweets array required' });
        }

        const cleanTicker = ticker.toUpperCase().replace('$', '');
        const db = getDb();

        logger.debug(`[Sync] Received ${tweets.length} tweets for ${cleanTicker} from extension`);

        // 1. Save raw tweets to DB (optional, but good for backtesting)
        const insertTweet = db.prepare(`
      INSERT OR IGNORE INTO tweets 
      (id, ticker, text, author_handle, tweet_created_at, likes, retweets, replies, sentiment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        // 2. Load volume history for volume spike detection
        const volumeHistory = db.prepare(`
      SELECT sample_size as count, created_at as timestamp
      FROM sentiment_snapshots
      WHERE ticker = ? AND created_at > ?
      ORDER BY created_at ASC
    `).all(cleanTicker, Math.floor(Date.now() / 1000) - 86400);

        // 3. Analyze the batch
        const analysis = analyzeTweets(tweets, new Map(), volumeHistory);

        // Save individual tweets with their rough score
        db.transaction(() => {
            for (const t of tweets) {
                // Very basic single-tweet score for DB storage
                const score = analysis.sentiment; // we can just store the aggregate or calculate individual
                insertTweet.run(
                    t.id || t.tweet_id || String(Math.random()).substring(2),
                    cleanTicker,
                    t.text,
                    t.author || t.author_handle || t.username || 'unknown',
                    t.timestamp || new Date().toISOString(),
                    t.likes || 0,
                    t.retweets || 0,
                    t.replies || 0,
                    score
                );
            }
        })();

        // 4. Save the snapshot
        db.prepare(`
      INSERT INTO sentiment_snapshots 
      (ticker, sentiment, status, sample_size, confidence, bullish_count, bearish_count, neutral_count, volume_spike, spike_intensity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            cleanTicker,
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

        // 5. Evaluate alerts for this ticker
        // Find users tracking this ticker
        const users = db.prepare(`
      SELECT DISTINCT u.* FROM users u
      INNER JOIN watchlist w ON w.user_id = u.id
      WHERE w.ticker = ?
    `).all(cleanTicker);

        const priceData = await priceService.getPrice(cleanTicker);
        let triggeredAlertsCount = 0;

        // We dispatch alerts manually here since we don't have the bot instance in the route
        // But we can use an event emitter, or attach bot to req, or just import a service
        // Let's use the alertService evaluation. The actual sending requires the bot.
        // The scheduler does it by having the bot injected. We can inject it into app.locals.
        const bot = req.app.locals.telegramBot;
        const sendAlertFn = req.app.locals.sendAlertFn;

        for (const user of users) {
            const triggered = await alertService.evaluateForUser(user.id, cleanTicker, analysis, priceData);

            for (const alert of triggered) {
                triggeredAlertsCount++;
                logger.info(`[Sync] Alert triggered: ${alert.name} for user ${user.telegram_id} — $${cleanTicker}`);

                if (bot && sendAlertFn && user.telegram_id) {
                    try {
                        await sendAlertFn(bot, user.id, alert);
                    } catch (e) {
                        logger.error(`[Sync] Failed to send alert to ${user.telegram_id}: ${e.message}`);
                    }
                }
            }
        }

        res.json({
            success: true,
            ticker: cleanTicker,
            processed: tweets.length,
            analysis: {
                sentiment: analysis.sentiment,
                status: analysis.status
            },
            alertsTriggered: triggeredAlertsCount
        });

    } catch (e) {
        logger.error(`[Sync] Error syncing tweets: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/sync/watchlist — Extension asks what to scrape
router.get('/watchlist', apiKeyAuth, (req, res) => {
    try {
        const db = getDb();
        // Get unique tickers across ALL users (for global scraping)
        const tickers = db.prepare('SELECT DISTINCT ticker FROM watchlist').all().map(r => r.ticker);

        // Get unique tracked accounts
        const accounts = db.prepare('SELECT DISTINCT handle FROM tracked_accounts').all().map(r => r.handle);

        res.json({ tickers, accounts });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
