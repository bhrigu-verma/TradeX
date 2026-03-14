// ============================================================================
// X FEED SERVICE — Free X/Twitter Data Without Paid API
// ============================================================================
// Fetches tweets from tracked accounts using:
//   1. Nitter RSS feeds (multiple instance fallback)
//   2. X Syndication/Embed endpoints
//   3. Extension-pushed data (from DB)
// ============================================================================

const axios = require('axios');
const logger = require('../config/logger');
const { getDb } = require('../db/setup');

// ============================================================================
// NITTER INSTANCES — We try multiple, failover automatically
// ============================================================================
const NITTER_INSTANCES = [
    'https://nitter.privacydev.net',
    'https://nitter.poast.org',
    'https://nitter.1d4.us',
    'https://nitter.kavin.rocks',
    'https://nitter.unixfox.eu',
    'https://nitter.d420.de',
    'https://nitter.moomoo.me',
    'https://nitter.it',
    'https://nitter.net',
];

let healthyInstances = [...NITTER_INSTANCES]; // Track which instances are alive
let lastHealthCheck = 0;

// ============================================================================
// FETCH TIMELINE - Try Nitter RSS for a single account
// ============================================================================
async function fetchAccountTweetsNitter(handle) {
    const cleanHandle = handle.replace('@', '').toLowerCase();
    const tweets = [];

    for (const instance of healthyInstances.slice(0, 4)) { // Try up to 4 instances
        try {
            const url = `${instance}/${cleanHandle}/rss`;
            const res = await axios.get(url, {
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            if (res.status === 200 && res.data && res.data.includes('<item>')) {
                const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];

                for (const item of items) {
                    const title = (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || [])[1]
                        || (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1]
                        || '';
                    const description = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || [])[1]
                        || (item.match(/<description>([\s\S]*?)<\/description>/) || [])[1]
                        || '';
                    const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
                    const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
                    const creator = (item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/) || [])[1] || cleanHandle;

                    // Clean HTML from description
                    const cleanText = (description || title)
                        .replace(/<[^>]*>/g, '')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .trim();

                    if (cleanText) {
                        // Create a stable unique ID from the tweet URL or content
                        const tweetId = link
                            ? `x_${link.split('/').pop()}`
                            : `x_${Buffer.from(cleanText.substring(0, 50)).toString('base64').substring(0, 16)}`;

                        tweets.push({
                            id: tweetId,
                            text: cleanText,
                            author: creator.replace('@', ''),
                            authorHandle: cleanHandle,
                            authorFollowers: 0,
                            timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                            likes: 0,
                            retweets: 0,
                            replies: 0,
                            source: 'nitter',
                            url: link.replace(instance, 'https://x.com'),
                            nitterInstance: instance
                        });
                    }
                }

                if (tweets.length > 0) {
                    logger.debug(`[X-Feed] Nitter ${instance}: ${tweets.length} tweets from @${cleanHandle}`);
                    return tweets;
                }
            }
        } catch (e) {
            logger.debug(`[X-Feed] Nitter ${instance} failed for @${cleanHandle}: ${e.message}`);
            // Mark instance as unhealthy temporarily
            continue;
        }
    }

    return tweets;
}

// ============================================================================
// FETCH TIMELINE - Try X Syndication API (public embed endpoint)
// ============================================================================
async function fetchAccountTweetsSyndication(handle) {
    const cleanHandle = handle.replace('@', '');
    const tweets = [];

    try {
        // X's syndication timeline endpoint (used by Twitter widgets)
        const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${cleanHandle}`;
        const res = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,*/*'
            }
        });

        if (res.data) {
            // Extract tweet text from the HTML response
            const tweetBlocks = res.data.match(/data-tweet-id="(\d+)"[\s\S]*?<p[^>]*class="[^"]*timeline-Tweet-text[^"]*"[^>]*>([\s\S]*?)<\/p>/g) || [];

            for (const block of tweetBlocks) {
                const idMatch = block.match(/data-tweet-id="(\d+)"/);
                const textMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/);

                if (idMatch && textMatch) {
                    const cleanText = textMatch[1].replace(/<[^>]*>/g, '').trim();
                    tweets.push({
                        id: `x_${idMatch[1]}`,
                        text: cleanText,
                        author: cleanHandle,
                        authorHandle: cleanHandle,
                        authorFollowers: 0,
                        timestamp: new Date().toISOString(),
                        likes: 0,
                        retweets: 0,
                        replies: 0,
                        source: 'x_syndication',
                        url: `https://x.com/${cleanHandle}/status/${idMatch[1]}`
                    });
                }
            }

            logger.debug(`[X-Feed] Syndication: ${tweets.length} tweets from @${cleanHandle}`);
        }
    } catch (e) {
        logger.debug(`[X-Feed] Syndication failed for @${cleanHandle}: ${e.message}`);
    }

    return tweets;
}

// ============================================================================
// MASTER FETCH — Try all sources for a single account
// ============================================================================
async function fetchAccountTweets(handle) {
    const cleanHandle = handle.replace('@', '').toLowerCase();

    // Try Nitter first (most reliable free source)
    let tweets = await fetchAccountTweetsNitter(cleanHandle);

    // If Nitter failed, try syndication
    if (tweets.length === 0) {
        tweets = await fetchAccountTweetsSyndication(cleanHandle);
    }

    // Also pull any tweets from the DB (pushed by Chrome extension)
    const dbTweets = getExtensionTweetsForAccount(cleanHandle);
    if (dbTweets.length > 0) {
        tweets = [...tweets, ...dbTweets];
        logger.debug(`[X-Feed] DB: ${dbTweets.length} extension tweets from @${cleanHandle}`);
    }

    return tweets;
}

// ============================================================================
// GET ALL TWEETS for a TICKER from X (across tracked accounts + search)
// ============================================================================
async function fetchTickerTweetsFromX(ticker) {
    const db = getDb();
    const allTweets = [];

    // 1. Get all tracked accounts across all users
    const trackedAccounts = db.prepare('SELECT DISTINCT handle FROM tracked_accounts').all();

    if (trackedAccounts.length > 0) {
        logger.info(`[X-Feed] Checking ${trackedAccounts.length} tracked accounts for $${ticker}...`);

        // Fetch tweets from tracked accounts in parallel (max 5 at a time)
        const batchSize = 5;
        for (let i = 0; i < trackedAccounts.length; i += batchSize) {
            const batch = trackedAccounts.slice(i, i + batchSize);
            const results = await Promise.allSettled(
                batch.map(acc => fetchAccountTweets(acc.handle))
            );

            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    // Filter tweets that mention the ticker
                    const relevant = result.value.filter(tweet =>
                        tweet.text.toUpperCase().includes(ticker.toUpperCase()) ||
                        tweet.text.toUpperCase().includes(`$${ticker.toUpperCase()}`)
                    );
                    allTweets.push(...relevant);
                }
            }
        }
    }

    // 2. Also get any tweets from DB (from extension) for this ticker
    const dbTweets = getExtensionTweetsForTicker(ticker);
    allTweets.push(...dbTweets);

    logger.info(`[X-Feed] Total X tweets for $${ticker}: ${allTweets.length}`);
    return allTweets;
}

// ============================================================================
// DB HELPERS — Get tweets pushed by Chrome Extension
// ============================================================================
function getExtensionTweetsForAccount(handle) {
    try {
        const db = getDb();
        const fourHoursAgo = Math.floor(Date.now() / 1000) - (4 * 60 * 60);

        return db.prepare(`
      SELECT id, text, author_handle as author, tweet_created_at as timestamp,
             likes, retweets, replies, source
      FROM tweets
      WHERE LOWER(author_handle) = LOWER(?) AND analyzed_at > ?
      ORDER BY analyzed_at DESC LIMIT 50
    `).all(handle, fourHoursAgo).map(r => ({
            ...r,
            authorHandle: handle,
            authorFollowers: 0,
            timestamp: r.timestamp ? new Date(r.timestamp * 1000).toISOString() : null,
            source: 'extension'
        }));
    } catch (e) {
        return [];
    }
}

function getExtensionTweetsForTicker(ticker) {
    try {
        const db = getDb();
        const fourHoursAgo = Math.floor(Date.now() / 1000) - (4 * 60 * 60);

        return db.prepare(`
      SELECT id, text, author_handle as author, tweet_created_at as timestamp,
             likes, retweets, replies, source
      FROM tweets
      WHERE ticker = ? AND analyzed_at > ?
      ORDER BY analyzed_at DESC LIMIT 50
    `).all(ticker, fourHoursAgo).map(r => ({
            ...r,
            authorHandle: r.author,
            authorFollowers: 0,
            timestamp: r.timestamp ? new Date(r.timestamp * 1000).toISOString() : null,
            source: r.source || 'extension'
        }));
    } catch (e) {
        return [];
    }
}

// ============================================================================
// DETECT NEW TWEETS — Compare with DB, return only unseen ones
// ============================================================================
function filterNewTweets(tweets) {
    if (tweets.length === 0) return [];

    const db = getDb();
    const newTweets = [];

    for (const tweet of tweets) {
        try {
            const existing = db.prepare('SELECT id FROM tweets WHERE id = ?').get(tweet.id);
            if (!existing) {
                newTweets.push(tweet);
            }
        } catch (e) {
            // If DB error, assume it's new to be safe
            newTweets.push(tweet);
        }
    }

    return newTweets;
}

// ============================================================================
// SAVE TWEETS TO DB
// ============================================================================
function saveTweetsToDb(tweets, ticker) {
    if (tweets.length === 0) return;

    try {
        const db = getDb();
        const insert = db.prepare(`
      INSERT OR IGNORE INTO tweets 
      (id, ticker, text, author_handle, tweet_created_at, likes, retweets, replies, source, sentiment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

        db.transaction(() => {
            for (const tweet of tweets) {
                insert.run(
                    tweet.id,
                    ticker || 'GENERAL',
                    (tweet.text || '').substring(0, 500),
                    tweet.author || tweet.authorHandle || 'unknown',
                    tweet.timestamp ? Math.floor(new Date(tweet.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000),
                    tweet.likes || 0,
                    tweet.retweets || 0,
                    tweet.replies || 0,
                    tweet.source || 'nitter'
                );
            }
        })();
    } catch (e) {
        logger.warn(`[X-Feed] Failed to save tweets: ${e.message}`);
    }
}

// ============================================================================
// HEALTH CHECK — Periodically test which Nitter instances are alive
// ============================================================================
async function refreshNitterHealth() {
    if (Date.now() - lastHealthCheck < 30 * 60 * 1000) return; // Only check every 30 min
    lastHealthCheck = Date.now();

    const alive = [];
    for (const instance of NITTER_INSTANCES) {
        try {
            const res = await axios.get(`${instance}/`, { timeout: 5000 });
            if (res.status === 200) alive.push(instance);
        } catch (e) {
            // Instance is dead
        }
    }

    if (alive.length > 0) {
        healthyInstances = alive;
        logger.info(`[X-Feed] Healthy Nitter instances: ${alive.length}/${NITTER_INSTANCES.length}`);
    } else {
        logger.warn(`[X-Feed] No healthy Nitter instances found, keeping all as fallback`);
    }
}

module.exports = {
    fetchAccountTweets,
    fetchAccountTweetsNitter,
    fetchAccountTweetsSyndication,
    fetchTickerTweetsFromX,
    filterNewTweets,
    saveTweetsToDb,
    refreshNitterHealth,
    getExtensionTweetsForAccount,
    getExtensionTweetsForTicker
};
