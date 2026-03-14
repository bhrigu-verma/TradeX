// ============================================================================
// TRACKED ACCOUNT POLLER — Background job that watches X accounts
// ============================================================================
// Runs every 2-3 minutes. For each tracked account:
//   1. Fetches their latest tweets (Nitter RSS / Syndication / Extension DB)
//   2. Compares with previously seen tweets
//   3. If new tweet found → checks if it mentions any watchlist ticker
//   4. If it does → INSTANT Telegram alert to the user
//   5. Even if no ticker match → stores tweet for future /sentiment queries
// ============================================================================

const { getDb } = require('../db/setup');
const { fetchAccountTweets, filterNewTweets, saveTweetsToDb, refreshNitterHealth } = require('../services/x-feed.service');
const { analyzeTweets, extractTickers } = require('../services/sentiment.service');
const logger = require('../config/logger');

let botInstance = null;
let isRunning = false;
let pollCount = 0;

// ============================================================================
// INJECT BOT — Called from index.js on startup
// ============================================================================
function injectBot(bot) {
    botInstance = bot;
    logger.info('[Poller] Telegram bot injected into poller');
}

// ============================================================================
// MAIN POLL CYCLE
// ============================================================================
async function pollTrackedAccounts() {
    if (isRunning) {
        logger.debug('[Poller] Previous cycle still running, skipping...');
        return;
    }

    isRunning = true;
    pollCount++;

    try {
        const db = getDb();

        // Refresh Nitter health check periodically
        if (pollCount % 10 === 1) {
            await refreshNitterHealth();
        }

        // Get all unique tracked accounts with their associated users
        const trackedAccounts = db.prepare(`
      SELECT ta.handle, ta.user_id, ta.tier, u.telegram_id, u.muted_until
      FROM tracked_accounts ta
      JOIN users u ON ta.user_id = u.id
      WHERE u.telegram_id IS NOT NULL
      ORDER BY ta.tier ASC
    `).all();

        if (trackedAccounts.length === 0) {
            logger.debug('[Poller] No tracked accounts to poll');
            isRunning = false;
            return;
        }

        // Group by handle (one account can be tracked by multiple users)
        const handleMap = {};
        for (const entry of trackedAccounts) {
            if (!handleMap[entry.handle]) {
                handleMap[entry.handle] = {
                    handle: entry.handle,
                    users: []
                };
            }
            handleMap[entry.handle].users.push({
                userId: entry.user_id,
                telegramId: entry.telegram_id,
                tier: entry.tier,
                isMuted: entry.muted_until && Math.floor(Date.now() / 1000) < entry.muted_until
            });
        }

        const handles = Object.keys(handleMap);
        logger.info(`[Poller] Cycle #${pollCount}: Checking ${handles.length} accounts (${trackedAccounts.length} subscriptions)...`);

        let totalNewTweets = 0;
        let alertsSent = 0;

        // Process accounts sequentially to avoid rate limits
        for (const handle of handles) {
            try {
                // 1. Fetch latest tweets for this account
                const tweets = await fetchAccountTweets(handle);

                if (tweets.length === 0) {
                    continue;
                }

                // 2. Filter to only NEW tweets (not seen before)
                const newTweets = filterNewTweets(tweets);

                if (newTweets.length === 0) {
                    continue;
                }

                totalNewTweets += newTweets.length;
                logger.info(`[Poller] @${handle}: ${newTweets.length} new tweets detected!`);

                // 3. For each new tweet, check ticker mentions and alert users
                for (const tweet of newTweets) {
                    // Extract any ticker mentions from the tweet text
                    const mentionedTickers = extractTickersFromText(tweet.text);

                    // Get each user's watchlist to see if there's a match
                    for (const userInfo of handleMap[handle].users) {
                        if (userInfo.isMuted) continue;

                        const userWatchlist = db.prepare(
                            'SELECT ticker FROM watchlist WHERE user_id = ?'
                        ).all(userInfo.userId).map(r => r.ticker);

                        // Check if any mentioned ticker is in the user's watchlist
                        const matchedTickers = mentionedTickers.filter(t => userWatchlist.includes(t));

                        // Also check if the tweet mentions any watchlist ticker by name
                        const textUpper = tweet.text.toUpperCase();
                        for (const wt of userWatchlist) {
                            if (textUpper.includes(wt) || textUpper.includes(`$${wt}`)) {
                                if (!matchedTickers.includes(wt)) matchedTickers.push(wt);
                            }
                        }

                        if (matchedTickers.length > 0) {
                            // MATCH! Send instant alert to this user
                            await sendTrackedAccountAlert(userInfo, handle, tweet, matchedTickers);
                            alertsSent++;
                        } else if (userInfo.tier <= 2) {
                            // For high-tier tracked accounts (Critical/Trusted), alert on ALL tweets
                            await sendTrackedAccountAlert(userInfo, handle, tweet, ['GENERAL']);
                            alertsSent++;
                        }

                        // Save tweet to DB for each matched ticker
                        for (const ticker of matchedTickers) {
                            saveTweetsToDb([tweet], ticker);
                        }
                    }

                    // Also save with GENERAL ticker if no specific match
                    if (mentionedTickers.length === 0) {
                        saveTweetsToDb([tweet], 'GENERAL');
                    }
                }

                // Small delay between accounts to be respectful
                await sleep(1500);

            } catch (e) {
                logger.warn(`[Poller] Error polling @${handle}: ${e.message}`);
            }
        }

        logger.info(`[Poller] Cycle #${pollCount} complete: ${totalNewTweets} new tweets, ${alertsSent} alerts sent`);

    } catch (e) {
        logger.error(`[Poller] Fatal error in poll cycle: ${e.message}`);
    } finally {
        isRunning = false;
    }
}

// ============================================================================
// SEND TELEGRAM ALERT for a tracked account tweet
// ============================================================================
async function sendTrackedAccountAlert(userInfo, handle, tweet, matchedTickers) {
    if (!botInstance) {
        logger.warn('[Poller] No bot instance, cannot send alert');
        return;
    }

    try {
        const tickerStr = matchedTickers.filter(t => t !== 'GENERAL').map(t => `$${t}`).join(', ') || 'General';
        const truncatedText = tweet.text.length > 300
            ? tweet.text.substring(0, 297) + '...'
            : tweet.text;

        const tierEmoji = {
            1: '⭐⭐ CRITICAL',
            2: '⭐ TRUSTED',
            3: '📡 TRACKED'
        };

        const msg =
            `🐦 <b>NEW TWEET — @${handle}</b>\n` +
            `${tierEmoji[userInfo.tier] || '📡 TRACKED'}\n\n` +
            `<blockquote>${truncatedText}</blockquote>\n\n` +
            `🏷️ <b>Tickers:</b> ${tickerStr}\n` +
            `🕐 ${new Date(tweet.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n\n` +
            `<i>via TraderX Intelligence</i>`;

        const tweetUrl = tweet.url || `https://x.com/${handle}`;

        await botInstance.telegram.sendMessage(userInfo.telegramId, msg, {
            parse_mode: 'HTML',
            disable_web_page_preview: false,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔗 View Tweet', url: tweetUrl },
                        { text: `📊 Sentiment`, callback_data: `refresh_${matchedTickers[0] || 'BTC'}` }
                    ]
                ]
            }
        });

        // Log to alert history
        try {
            const db = getDb();
            db.prepare(`
        INSERT INTO alert_history (user_id, alert_name, ticker, type, payload)
        VALUES (?, ?, ?, 'tracked_account_tweet', ?)
      `).run(
                userInfo.userId,
                `@${handle} tweeted about ${tickerStr}`,
                matchedTickers[0] || 'GENERAL',
                JSON.stringify({
                    handle,
                    tweetText: truncatedText.substring(0, 200),
                    tweetUrl,
                    matchedTickers
                })
            );
        } catch (dbErr) {
            logger.warn(`[Poller] Failed to log alert history: ${dbErr.message}`);
        }

        logger.info(`[Poller] ✅ Alert sent to ${userInfo.telegramId}: @${handle} → ${tickerStr}`);

    } catch (e) {
        logger.error(`[Poller] Failed to send alert to ${userInfo.telegramId}: ${e.message}`);
    }
}

// ============================================================================
// TICKER EXTRACTION — Find $TICKER mentions in tweet text
// ============================================================================
function extractTickersFromText(text) {
    if (!text) return [];

    const tickers = new Set();

    // Match $TICKER patterns
    const dollarMatches = text.match(/\$([A-Z]{2,6})/g) || [];
    for (const m of dollarMatches) {
        tickers.add(m.replace('$', ''));
    }

    // Match #TICKER and #ticker patterns
    const hashMatches = text.match(/#([A-Za-z]{2,6})/g) || [];
    for (const m of hashMatches) {
        const clean = m.replace('#', '').toUpperCase();
        // Only add if it looks like a real ticker
        const knownTickers = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT', 'MATIC',
            'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOG', 'META', 'AMD', 'PLTR', 'GME', 'AMC',
            'SPY', 'QQQ', 'COIN', 'MSTR', 'SQ', 'SOFI', 'HOOD', 'RIOT', 'MARA'];
        if (knownTickers.includes(clean)) {
            tickers.add(clean);
        }
    }

    // Also match common crypto names
    const textUpper = text.toUpperCase();
    const nameMap = {
        'BITCOIN': 'BTC', 'ETHEREUM': 'ETH', 'SOLANA': 'SOL', 'DOGECOIN': 'DOGE',
        'RIPPLE': 'XRP', 'CARDANO': 'ADA', 'POLKADOT': 'DOT', 'CHAINLINK': 'LINK',
        'AVALANCHE': 'AVAX', 'POLYGON': 'MATIC', 'TESLA': 'TSLA', 'NVIDIA': 'NVDA',
        'APPLE': 'AAPL', 'MICROSOFT': 'MSFT', 'AMAZON': 'AMZN', 'GOOGLE': 'GOOG'
    };

    for (const [name, ticker] of Object.entries(nameMap)) {
        if (textUpper.includes(name)) {
            tickers.add(ticker);
        }
    }

    return Array.from(tickers);
}

// ============================================================================
// UTILITY
// ============================================================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    pollTrackedAccounts,
    injectBot,
    extractTickersFromText
};
