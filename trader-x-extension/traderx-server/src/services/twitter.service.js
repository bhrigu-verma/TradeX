// src/services/twitter.service.js
// ============================================================================
// Twitter/X Data Service
// - If TWITTER_BEARER_TOKEN is set: uses the official v2 API
// - Otherwise: returns structured demo tweets for development/testing
// ============================================================================

const axios = require('axios');
const config = require('../config/env');
const logger = require('../config/logger');
const { extractTickers } = require('./sentiment.service');

const DEMO_TWEETS = {
    BTC: [
        { id: 'demo1', text: '$BTC holding strong at $67K. Institutional accumulation continues. Very bullish setup.', author: 'CryptoAnalyst', likes: 1200, retweets: 340, replies: 89, timestamp: new Date(Date.now() - 1800000).toISOString() },
        { id: 'demo2', text: 'Bitcoin breakout imminent. Golden cross forming on the 4H. Loading more $BTC here.', author: 'TradingPro', likes: 890, retweets: 210, replies: 45, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'demo3', text: '$BTC dumping hard. Bears in control. Watch the $64K support.', author: 'BearMarket2024', likes: 234, retweets: 89, replies: 120, timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 'demo4', text: 'Not financial advice but $BTC chart looks absolutely parabolic rn DYOR', author: 'CryptoNews', likes: 567, retweets: 145, replies: 78, timestamp: new Date(Date.now() - 900000).toISOString() },
        { id: 'demo5', text: 'Sold my $BTC position. Not convinced the rally is real. Resistance at $69K too strong.', author: 'TechTrader', likes: 345, retweets: 67, replies: 234, timestamp: new Date(Date.now() - 5400000).toISOString() },
        { id: 'demo6', text: 'Bitcoin going to $100K this cycle. Don\'t overthink it. $BTC accumulation zone here.', author: 'CryptoBull', likes: 2100, retweets: 567, replies: 189, timestamp: new Date(Date.now() - 1200000).toISOString() },
        { id: 'demo7', text: '$BTC ETF flows positive again. BlackRock buying $340M today. This is just the beginning.', author: 'InstitutionalFlow', likes: 3400, retweets: 890, replies: 234, timestamp: new Date(Date.now() - 600000).toISOString() },
        { id: 'demo8', text: 'Bitcoin chart forming a beautiful cup and handle. $BTC target: $75K.', author: 'ChartMaster', likes: 678, retweets: 145, replies: 56, timestamp: new Date(Date.now() - 2700000).toISOString() },
    ],
    ETH: [
        { id: 'demo9', text: '$ETH Pectra upgrade will be massive. Staking yields improving. Very bullish long term.', author: 'EthVibe', likes: 890, retweets: 234, replies: 67, timestamp: new Date(Date.now() - 2400000).toISOString() },
        { id: 'demo10', text: 'Ethereum underperforming Bitcoin. $ETH bulls need to step up here.', author: 'CryptoSkeptic', likes: 456, retweets: 123, replies: 89, timestamp: new Date(Date.now() - 4800000).toISOString() },
        { id: 'demo11', text: 'Just bought more $ETH at $3,200. This dip is a gift. Not financial advice.', author: 'DeFiKing', likes: 1234, retweets: 345, replies: 78, timestamp: new Date(Date.now() - 1800000).toISOString() },
    ],
    TSLA: [
        { id: 'demo12', text: '$TSLA deliveries missed expectations again. Bearish short term.', author: 'AutoAnalyst', likes: 567, retweets: 145, replies: 234, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'demo13', text: 'Tesla robotaxi launch will be revolutionary. $TSLA going higher.', author: 'EVBull', likes: 890, retweets: 234, replies: 89, timestamp: new Date(Date.now() - 7200000).toISOString() },
    ],
    NVDA: [
        { id: 'demo14', text: '$NVDA earnings beat. AI compute demand still insane. Buy the dip.', author: 'TechInvestor', likes: 2340, retweets: 678, replies: 123, timestamp: new Date(Date.now() - 1800000).toISOString() },
        { id: 'demo15', text: 'Nvidia forming a bearish divergence on RSI. $NVDA might correct 10-15%.', author: 'TechBear', likes: 345, retweets: 89, replies: 145, timestamp: new Date(Date.now() - 5400000).toISOString() },
        { id: 'demo16', text: 'AI infrastructure spending showing no signs of slowing. $NVDA is a generational hold.', author: 'MacroMind', likes: 3456, retweets: 890, replies: 234, timestamp: new Date(Date.now() - 900000).toISOString() },
    ]
};

class TwitterService {
    constructor() {
        this.apiEnabled = !!(config.TWITTER_BEARER_TOKEN && config.TWITTER_BEARER_TOKEN !== 'your_twitter_bearer_token_here');
        this.baseUrl = 'https://api.twitter.com/2';
        this.requestCache = new Map();
        this.cacheExpiry = 30000; // 30s cache
        logger.info(`[Twitter] API ${this.apiEnabled ? 'ENABLED (live data)' : 'DISABLED (demo mode)'}`);
    }

    // ========================================================================
    // FETCH TWEETS FOR A TICKER
    // ========================================================================

    async fetchTickerTweets(ticker, options = {}) {
        const cacheKey = `ticker_${ticker}`;
        const cached = this.requestCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < this.cacheExpiry) {
            return cached.data;
        }

        let tweets = [];

        if (this.apiEnabled) {
            tweets = await this._fetchFromAPI(ticker, options);
        } else {
            // Demo mode — return realistic demo data
            tweets = this._getDemoTweets(ticker);
        }

        const result = { tweets, source: this.apiEnabled ? 'api' : 'demo', ticker, fetchedAt: Date.now() };
        this.requestCache.set(cacheKey, { data: result, ts: Date.now() });
        return result;
    }

    // ========================================================================
    // FETCH FROM TRACKED ACCOUNTS (main Telegram bot use case)
    // ========================================================================

    async fetchFromTrackedAccounts(handles, tickers = []) {
        if (!this.apiEnabled) {
            return this._getDemoAccountTweets(handles, tickers);
        }

        try {
            const fromQuery = handles.slice(0, 10).map(h => `from:${h.replace('@', '')}`).join(' OR ');
            const tickerQuery = tickers.map(t => `$${t}`).join(' OR ');
            const query = tickers.length > 0 ? `(${fromQuery}) (${tickerQuery})` : `(${fromQuery})`;

            return await this._searchRecent(query, { maxResults: 50 });
        } catch (e) {
            logger.error(`[Twitter] Tracked accounts fetch failed: ${e.message}`);
            return [];
        }
    }

    // ========================================================================
    // PRIVATE: Real API calls
    // ========================================================================

    async _fetchFromAPI(ticker, options = {}) {
        const query = `$${ticker} lang:en -is:retweet min_faves:1`;
        return this._searchRecent(query, { maxResults: options.maxResults || 50 });
    }

    async _searchRecent(query, { maxResults = 50 } = {}) {
        const cacheKey = `search_${query}`;
        const cached = this.requestCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
                headers: { Authorization: `Bearer ${config.TWITTER_BEARER_TOKEN}` },
                params: {
                    query,
                    max_results: Math.min(maxResults, 100),
                    'tweet.fields': 'created_at,public_metrics,author_id',
                    'user.fields': 'username,name,verified',
                    expansions: 'author_id',
                    sort_order: 'recency'
                }
            });

            const users = {};
            (response.data.includes?.users || []).forEach(u => {
                users[u.id] = u.username;
            });

            const tweets = (response.data.data || []).map(t => ({
                id: t.id,
                text: t.text,
                author: users[t.author_id] || 'unknown',
                author_id: t.author_id,
                timestamp: t.created_at,
                likes: t.public_metrics?.like_count || 0,
                retweets: t.public_metrics?.retweet_count || 0,
                replies: t.public_metrics?.reply_count || 0,
                source: 'twitter_api'
            }));

            this.requestCache.set(cacheKey, { data: tweets, ts: Date.now() });
            logger.debug(`[Twitter] API returned ${tweets.length} tweets for query`);
            return tweets;

        } catch (error) {
            if (error.response?.status === 429) {
                logger.warn('[Twitter] Rate limited — backing off');
            } else {
                logger.error(`[Twitter] API error: ${error.message}`);
            }
            return [];
        }
    }

    // ========================================================================
    // DEMO DATA HELPERS
    // ========================================================================

    _getDemoTweets(ticker) {
        const base = DEMO_TWEETS[ticker] || [];
        if (base.length > 0) return base;

        // Generate generic demo tweets for unknown tickers
        return [
            { id: `d_${ticker}_1`, text: `$${ticker} looking very bullish. Strong support holding.`, author: 'DemoTrader1', likes: 234, retweets: 56, replies: 23, timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: `d_${ticker}_2`, text: `$${ticker} might dip here. Watch the resistance level.`, author: 'DemoTrader2', likes: 123, retweets: 34, replies: 45, timestamp: new Date(Date.now() - 7200000).toISOString() },
            { id: `d_${ticker}_3`, text: `Accumulating $${ticker} on weakness. Long term bullish thesis intact.`, author: 'DemoTrader3', likes: 567, retweets: 123, replies: 67, timestamp: new Date(Date.now() - 1800000).toISOString() },
        ];
    }

    _getDemoAccountTweets(handles, tickers) {
        const results = [];
        handles.forEach((handle, i) => {
            const ticker = tickers[i % tickers.length] || 'BTC';
            results.push({
                id: `demo_acct_${i}`,
                text: `$${ticker} analysis: Strong momentum. Not financial advice. DYOR. [Demo tweet from @${handle}]`,
                author: handle.replace('@', ''),
                likes: Math.floor(Math.random() * 2000) + 100,
                retweets: Math.floor(Math.random() * 500) + 20,
                replies: Math.floor(Math.random() * 200) + 10,
                timestamp: new Date(Date.now() - Math.random() * 3600000 * 4).toISOString(),
                source: 'demo'
            });
        });
        return results;
    }

    clearCache() {
        this.requestCache.clear();
    }
}

module.exports = new TwitterService();
