// ============================================================================
// AGGREGATOR SERVICE — Multi-Source Free Intelligence Pipeline
// ============================================================================
// Layer 3: Fetches from StockTwits, Reddit, CryptoPanic, Google News
// Zero cost, zero auth needed for most, always available.
// ============================================================================

const axios = require('axios');
const logger = require('../config/logger');

// ============================================================================
// TICKER MAPPING (for APIs that need specific formats)
// ============================================================================
const CRYPTO_MAP = {
    'BTC': { coingecko: 'bitcoin', stocktwits: 'BTC.X', subreddits: ['Bitcoin', 'CryptoCurrency'] },
    'ETH': { coingecko: 'ethereum', stocktwits: 'ETH.X', subreddits: ['ethereum', 'CryptoCurrency'] },
    'SOL': { coingecko: 'solana', stocktwits: 'SOL.X', subreddits: ['solana', 'CryptoCurrency'] },
    'DOGE': { coingecko: 'dogecoin', stocktwits: 'DOGE.X', subreddits: ['dogecoin', 'CryptoCurrency'] },
    'XRP': { coingecko: 'ripple', stocktwits: 'XRP.X', subreddits: ['Ripple', 'CryptoCurrency'] },
    'ADA': { coingecko: 'cardano', stocktwits: 'ADA.X', subreddits: ['cardano', 'CryptoCurrency'] },
    'AVAX': { coingecko: 'avalanche-2', stocktwits: 'AVAX.X', subreddits: ['Avax', 'CryptoCurrency'] },
    'LINK': { coingecko: 'chainlink', stocktwits: 'LINK.X', subreddits: ['Chainlink', 'CryptoCurrency'] },
    'DOT': { coingecko: 'polkadot', stocktwits: 'DOT.X', subreddits: ['dot', 'CryptoCurrency'] },
    'MATIC': { coingecko: 'matic-network', stocktwits: 'MATIC.X', subreddits: ['0xPolygon', 'CryptoCurrency'] },
};

const STOCK_TICKERS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOG', 'META', 'AMD', 'PLTR', 'GME', 'AMC'];

function isCrypto(ticker) {
    return !!CRYPTO_MAP[ticker.toUpperCase()];
}

function getStockTwitsTicker(ticker) {
    const upper = ticker.toUpperCase();
    if (CRYPTO_MAP[upper]) return CRYPTO_MAP[upper].stocktwits;
    return upper; // stocks use plain ticker
}

function getSubreddits(ticker) {
    const upper = ticker.toUpperCase();
    if (CRYPTO_MAP[upper]) return CRYPTO_MAP[upper].subreddits;
    if (STOCK_TICKERS.includes(upper)) return ['wallstreetbets', 'stocks', 'investing'];
    return ['wallstreetbets', 'stocks'];
}

// ============================================================================
// SOURCE 1: STOCKTWITS (Free, No Auth, Real-time)
// ============================================================================
async function fetchStockTwits(ticker) {
    const symbol = getStockTwitsTicker(ticker);
    const posts = [];

    try {
        const url = `https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`;
        const res = await axios.get(url, { timeout: 8000 });

        if (res.data && res.data.messages) {
            for (const msg of res.data.messages) {
                posts.push({
                    id: `st_${msg.id}`,
                    text: msg.body || '',
                    author: msg.user?.username || 'stocktwits_user',
                    authorFollowers: msg.user?.followers || 0,
                    timestamp: msg.created_at,
                    likes: msg.likes?.total || 0,
                    retweets: 0,
                    replies: 0,
                    source: 'stocktwits',
                    sentiment_label: msg.entities?.sentiment?.basic || null, // 'Bullish' or 'Bearish'
                    url: `https://stocktwits.com/symbol/${symbol}`
                });
            }
        }

        logger.debug(`[Aggregator] StockTwits: ${posts.length} posts for ${symbol}`);
    } catch (e) {
        logger.warn(`[Aggregator] StockTwits failed for ${symbol}: ${e.message}`);
    }

    return posts;
}

// ============================================================================
// SOURCE 2: REDDIT (Free, Public JSON endpoint)
// ============================================================================
async function fetchReddit(ticker) {
    const subreddits = getSubreddits(ticker);
    const posts = [];

    for (const sub of subreddits.slice(0, 2)) { // max 2 subreddits to avoid rate limits
        try {
            // Reddit public JSON endpoint (no auth needed)
            const url = `https://www.reddit.com/r/${sub}/search.json?q=${ticker}&sort=new&t=day&limit=15&restrict_sr=on`;
            const res = await axios.get(url, {
                timeout: 8000,
                headers: {
                    'User-Agent': 'TraderX-Intelligence/1.0'
                }
            });

            if (res.data?.data?.children) {
                for (const child of res.data.data.children) {
                    const post = child.data;
                    if (!post.title) continue;

                    posts.push({
                        id: `reddit_${post.id}`,
                        text: `${post.title}${post.selftext ? '. ' + post.selftext.substring(0, 200) : ''}`,
                        author: post.author || 'reddit_user',
                        authorFollowers: 0,
                        timestamp: new Date(post.created_utc * 1000).toISOString(),
                        likes: post.ups || 0,
                        retweets: 0,
                        replies: post.num_comments || 0,
                        source: 'reddit',
                        subreddit: sub,
                        sentiment_label: null,
                        url: `https://reddit.com${post.permalink}`
                    });
                }
            }

            logger.debug(`[Aggregator] Reddit r/${sub}: ${posts.length} posts for ${ticker}`);
        } catch (e) {
            logger.warn(`[Aggregator] Reddit r/${sub} failed: ${e.message}`);
        }
    }

    return posts;
}

// ============================================================================
// SOURCE 3: CRYPTOPANIC (Free tier, crypto news aggregator)
// ============================================================================
async function fetchCryptoPanic(ticker) {
    const posts = [];

    // CryptoPanic has a free public feed
    if (!isCrypto(ticker)) return posts;

    try {
        const url = `https://cryptopanic.com/api/free/v1/posts/?auth_token=free&currencies=${ticker}&kind=news&filter=hot`;
        const res = await axios.get(url, { timeout: 8000 });

        if (res.data?.results) {
            for (const item of res.data.results.slice(0, 15)) {
                posts.push({
                    id: `cp_${item.id}`,
                    text: `${item.title}${item.metadata?.description ? '. ' + item.metadata.description.substring(0, 200) : ''}`,
                    author: item.source?.title || 'crypto_news',
                    authorFollowers: 0,
                    timestamp: item.published_at || item.created_at,
                    likes: item.votes?.positive || 0,
                    retweets: 0,
                    replies: item.votes?.comments || 0,
                    source: 'cryptopanic',
                    sentiment_label: item.votes?.positive > item.votes?.negative ? 'Bullish' : item.votes?.negative > item.votes?.positive ? 'Bearish' : null,
                    url: item.url
                });
            }
        }

        logger.debug(`[Aggregator] CryptoPanic: ${posts.length} news items for ${ticker}`);
    } catch (e) {
        logger.warn(`[Aggregator] CryptoPanic failed for ${ticker}: ${e.message}`);
    }

    return posts;
}

// ============================================================================
// SOURCE 4: GOOGLE NEWS RSS (Free, always available)
// ============================================================================
async function fetchGoogleNews(ticker) {
    const posts = [];

    try {
        const query = isCrypto(ticker)
            ? `${ticker}+cryptocurrency+price`
            : `${ticker}+stock+market`;

        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
        const res = await axios.get(url, {
            timeout: 8000,
            headers: { 'User-Agent': 'TraderX-Intelligence/1.0' }
        });

        // Parse XML RSS feed (simple regex-based, no extra dep)
        const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];

        for (const item of items.slice(0, 10)) {
            const title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
            const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
            const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
            const source = (item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || 'Google News';

            if (title) {
                posts.push({
                    id: `gn_${Buffer.from(title).toString('base64').substring(0, 16)}`,
                    text: title.replace(/<!\[CDATA\[|\]\]>/g, ''),
                    author: source.replace(/<!\[CDATA\[|\]\]>/g, ''),
                    authorFollowers: 0,
                    timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                    likes: 0,
                    retweets: 0,
                    replies: 0,
                    source: 'google_news',
                    sentiment_label: null,
                    url: link
                });
            }
        }

        logger.debug(`[Aggregator] Google News: ${posts.length} articles for ${ticker}`);
    } catch (e) {
        logger.warn(`[Aggregator] Google News failed for ${ticker}: ${e.message}`);
    }

    return posts;
}

// ============================================================================
// MASTER AGGREGATOR — Fetch from all sources in parallel
// ============================================================================
async function fetchAllSources(ticker) {
    const cleanTicker = ticker.toUpperCase().replace('$', '');

    logger.info(`[Aggregator] Fetching from all sources for $${cleanTicker}...`);

    const [stocktwits, reddit, cryptopanic, googleNews] = await Promise.allSettled([
        fetchStockTwits(cleanTicker),
        fetchReddit(cleanTicker),
        fetchCryptoPanic(cleanTicker),
        fetchGoogleNews(cleanTicker)
    ]);

    const allPosts = [];
    const sourceCounts = {};

    const results = { stocktwits, reddit, cryptopanic, googleNews };
    for (const [name, result] of Object.entries(results)) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allPosts.push(...result.value);
            sourceCounts[name] = result.value.length;
        } else {
            sourceCounts[name] = 0;
        }
    }

    logger.info(`[Aggregator] Total: ${allPosts.length} signals | Sources: ${JSON.stringify(sourceCounts)}`);

    return {
        posts: allPosts,
        sourceCounts,
        fetchedAt: new Date().toISOString()
    };
}

module.exports = {
    fetchAllSources,
    fetchStockTwits,
    fetchReddit,
    fetchCryptoPanic,
    fetchGoogleNews,
    isCrypto,
    CRYPTO_MAP
};
