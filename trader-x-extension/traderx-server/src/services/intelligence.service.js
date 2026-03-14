// ============================================================================
// INTELLIGENCE SERVICE — Master Orchestrator for All Data Layers
// ============================================================================
// Combines: Extension data (DB), Free APIs (Aggregator), and ranking.
// This is THE single function that gets called when anyone asks for
// intelligence on a ticker — whether from Telegram, Web Dashboard, or API.
// ============================================================================

const { getDb } = require('../db/setup');
const { fetchAllSources } = require('./aggregator.service');
const { fetchTickerTweetsFromX } = require('./x-feed.service');
const { analyzeTweets } = require('./sentiment.service');
const { rankPosts, formatTopPostsForTelegram } = require('./ranking.service');
const priceService = require('./price.service');
const logger = require('../config/logger');

// ============================================================================
// CACHE — In-memory short-lived cache to avoid spamming free APIs
// ============================================================================
const intelligenceCache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

// ============================================================================
// MAIN INTELLIGENCE FUNCTION
// ============================================================================
async function getIntelligence(ticker, options = {}) {
    const cleanTicker = ticker.toUpperCase().replace('$', '');
    const topN = options.topN || 5;
    const forceRefresh = options.forceRefresh || false;

    // Check cache first
    if (!forceRefresh) {
        const cached = intelligenceCache.get(cleanTicker);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            logger.debug(`[Intelligence] Cache hit for $${cleanTicker} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
            return cached.data;
        }
    }

    logger.info(`[Intelligence] Building report for $${cleanTicker}...`);

    // ========================================================================
    // LAYER 1 + 2: Pull any recent posts from DB (from Extension + Headless)
    // ========================================================================
    const dbPosts = getDbPosts(cleanTicker);
    logger.info(`[Intelligence] Layer 1+2 (DB): ${dbPosts.length} cached tweets`);

    // ========================================================================
    // LAYER 3a: Fetch from free public APIs (StockTwits, Reddit, etc.)
    // ========================================================================
    let apiPosts = [];
    let sourceCounts = {};

    try {
        const aggregatorResult = await fetchAllSources(cleanTicker);
        apiPosts = aggregatorResult.posts;
        sourceCounts = aggregatorResult.sourceCounts;
    } catch (e) {
        logger.error(`[Intelligence] Aggregator failed: ${e.message}`);
    }

    // ========================================================================
    // LAYER 3b: Fetch LIVE X tweets from tracked accounts (via Nitter/Syndication)
    // ========================================================================
    let xTweets = [];
    try {
        xTweets = await fetchTickerTweetsFromX(cleanTicker);
        sourceCounts.x_live = xTweets.length;
        logger.info(`[Intelligence] Layer 3b (X Live): ${xTweets.length} tweets`);
    } catch (e) {
        logger.warn(`[Intelligence] X feed failed: ${e.message}`);
        sourceCounts.x_live = 0;
    }

    // ========================================================================
    // MERGE ALL SOURCES
    // ========================================================================
    const allPosts = [...dbPosts, ...apiPosts, ...xTweets];

    if (allPosts.length === 0) {
        logger.warn(`[Intelligence] No data found anywhere for $${cleanTicker}`);

        return {
            ticker: cleanTicker,
            analysis: { status: 'NO DATA', sentiment: 0, sampleSize: 0, confidence: 'none' },
            topPosts: [],
            price: await priceService.getPrice(cleanTicker),
            sourceCounts: { db: 0, ...sourceCounts },
            timestamp: new Date().toISOString()
        };
    }

    // ========================================================================
    // LAYER 4: Rank & Select Top Signals
    // ========================================================================
    const { rankedPosts, totalAnalyzed, uniqueCount } = rankPosts(allPosts, topN);

    // ========================================================================
    // RUN SENTIMENT ENGINE on all unique posts
    // ========================================================================
    // Pull volume history from DB for volume spike detection
    const db = getDb();
    const volumeHistory = db.prepare(`
    SELECT sample_size as count, created_at as timestamp
    FROM sentiment_snapshots
    WHERE ticker = ? AND created_at > ?
    ORDER BY created_at ASC
  `).all(cleanTicker, Math.floor(Date.now() / 1000) - 86400);

    const analysis = analyzeTweets(allPosts, new Map(), volumeHistory);

    // ========================================================================
    // GET PRICE DATA
    // ========================================================================
    const priceData = await priceService.getPrice(cleanTicker);

    // ========================================================================
    // SAVE SNAPSHOT TO DB
    // ========================================================================
    try {
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
    } catch (e) {
        logger.warn(`[Intelligence] Failed to save snapshot: ${e.message}`);
    }

    // ========================================================================
    // SAVE INDIVIDUAL POSTS TO DB (for future ranking improvements)
    // ========================================================================
    try {
        const insertPost = db.prepare(`
      INSERT OR IGNORE INTO tweets 
      (id, ticker, text, author_handle, tweet_created_at, likes, retweets, replies, source, sentiment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        db.transaction(() => {
            for (const post of allPosts.slice(0, 100)) { // cap at 100 to avoid DB bloat
                insertPost.run(
                    post.id || `auto_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    cleanTicker,
                    (post.text || '').substring(0, 500),
                    post.author || 'unknown',
                    post.timestamp ? Math.floor(new Date(post.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000),
                    post.likes || 0,
                    post.retweets || 0,
                    post.replies || 0,
                    post.source || 'aggregator',
                    analysis.sentiment
                );
            }
        })();
    } catch (e) {
        logger.warn(`[Intelligence] Failed to save posts: ${e.message}`);
    }

    // ========================================================================
    // ASSEMBLE FINAL RESULT
    // ========================================================================
    const result = {
        ticker: cleanTicker,
        analysis: {
            ...analysis,
            totalSignals: totalAnalyzed,
            uniqueSignals: uniqueCount
        },
        topPosts: rankedPosts,
        price: priceData,
        sourceCounts: {
            db: dbPosts.length,
            ...sourceCounts,
            total: allPosts.length
        },
        timestamp: new Date().toISOString()
    };

    // Cache the result
    intelligenceCache.set(cleanTicker, {
        data: result,
        timestamp: Date.now()
    });

    logger.info(`[Intelligence] Report ready for $${cleanTicker}: ${analysis.status} | ${allPosts.length} signals | Top ${rankedPosts.length} selected`);

    return result;
}

// ============================================================================
// HELPER: Pull recent posts from SQLite (from Extension / Headless scraper)
// ============================================================================
function getDbPosts(ticker) {
    try {
        const db = getDb();
        const fourHoursAgo = Math.floor(Date.now() / 1000) - (4 * 60 * 60);

        const rows = db.prepare(`
      SELECT id, text, author_handle as author, tweet_created_at as timestamp,
             likes, retweets, replies, source, sentiment
      FROM tweets
      WHERE ticker = ? AND analyzed_at > ?
      ORDER BY analyzed_at DESC
      LIMIT 100
    `).all(ticker, fourHoursAgo);

        return rows.map(r => ({
            ...r,
            timestamp: r.timestamp
                ? new Date((typeof r.timestamp === 'number' && r.timestamp < 1e12) ? r.timestamp * 1000 : r.timestamp).toISOString()
                : null,
            authorFollowers: 0
        }));
    } catch (e) {
        logger.warn(`[Intelligence] DB query failed: ${e.message}`);
        return [];
    }
}


// ============================================================================
// FORMAT HELPER for Telegram
// ============================================================================
async function getFormattedIntelligence(ticker, options = {}) {
    const intel = await getIntelligence(ticker, options);
    const telegramMsg = formatTopPostsForTelegram(
        intel.ticker,
        intel.topPosts,
        intel.analysis,
        intel.price,
        intel.sourceCounts
    );

    return {
        ...intel,
        telegramMessage: telegramMsg
    };
}

module.exports = {
    getIntelligence,
    getFormattedIntelligence
};
