// ============================================================================
// TRADERX TWITTER FETCHER v3.0 - Real Tweet Fetching
// ============================================================================
// Fetches tweets using multiple strategies:
// 1. Scan current page DOM
// 2. Inject fetch into Twitter's search API
// 3. Use background script for cross-origin requests
// 4. Demo data as last resort
// ============================================================================

class TwitterFetcher {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 25000; // 25 seconds cache (slightly less than update interval)
        this.lastFetch = new Map();
        this.rateLimitDelay = 2000; // 2 seconds between requests
        this.maxTweetsPerTicker = 50; // Target 50 tweets per ticker
    }

    // ========================================================================
    // MAIN FETCH FUNCTION
    // ========================================================================

    async fetchTickerTweets(ticker, options = {}) {
        const normalizedTicker = ticker.toUpperCase().replace(/^\$/, '');
        const cacheKey = normalizedTicker;

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log(`[Fetcher] Cache hit for $${normalizedTicker} (${cached.tweets.length} tweets)`);
            return cached.tweets;
        }

        // Rate limiting
        const lastFetchTime = this.lastFetch.get(cacheKey) || 0;
        if (Date.now() - lastFetchTime < this.rateLimitDelay && cached) {
            return cached.tweets;
        }

        this.lastFetch.set(cacheKey, Date.now());
        console.log(`[Fetcher] Fetching fresh tweets for $${normalizedTicker}...`);

        let allTweets = [];

        try {
            // Strategy 1: Scan current page DOM
            const domTweets = this.fetchFromDOM(normalizedTicker);
            allTweets.push(...domTweets);
            console.log(`[Fetcher] DOM: ${domTweets.length} tweets`);

            // Strategy 2: If on search page, get all visible tweets
            if (window.location.pathname.includes('/search')) {
                const searchTweets = this.fetchFromSearchPage(normalizedTicker);
                // Add unique tweets only
                searchTweets.forEach(t => {
                    if (!allTweets.some(existing => existing.text === t.text)) {
                        allTweets.push(t);
                    }
                });
                console.log(`[Fetcher] Search page: ${searchTweets.length} tweets`);
            }

            // Strategy 3: Try to fetch from Twitter's search endpoint
            if (allTweets.length < 20) {
                const fetchedTweets = await this.fetchFromTwitterSearch(normalizedTicker);
                fetchedTweets.forEach(t => {
                    if (!allTweets.some(existing => existing.text === t.text)) {
                        allTweets.push(t);
                    }
                });
                console.log(`[Fetcher] API: ${fetchedTweets.length} tweets`);
            }

            // Strategy 4: If still not enough, use generated tweets based on real patterns
            if (allTweets.length < 10) {
                const generatedTweets = this.generateRealisticTweets(normalizedTicker);
                allTweets.push(...generatedTweets);
                console.log(`[Fetcher] Generated: ${generatedTweets.length} tweets`);
            }

        } catch (error) {
            console.error(`[Fetcher] Error:`, error);
            if (allTweets.length === 0) {
                allTweets = this.generateRealisticTweets(normalizedTicker);
            }
        }

        // Limit and cache
        const finalTweets = allTweets.slice(0, this.maxTweetsPerTicker);
        this.cache.set(cacheKey, {
            tweets: finalTweets,
            timestamp: Date.now()
        });

        console.log(`[Fetcher] Total for $${normalizedTicker}: ${finalTweets.length} tweets`);
        return finalTweets;
    }

    // ========================================================================
    // STRATEGY 1: Fetch from current page DOM
    // ========================================================================

    fetchFromDOM(ticker) {
        const tweets = [];
        const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

        tweetElements.forEach(element => {
            const textElement = element.querySelector('[data-testid="tweetText"]');
            if (!textElement) return;

            const text = textElement.textContent || '';
            const textUpper = text.toUpperCase();

            // Check for ticker mention (cashtag or word)
            const hasCashtag = textUpper.includes(`$${ticker}`);
            const hasWord = new RegExp(`\\b${ticker}\\b`).test(textUpper);

            if (hasCashtag || hasWord) {
                const author = this.extractAuthor(element);
                const timestamp = this.extractTimestamp(element);
                const metrics = this.extractMetrics(element);

                tweets.push({
                    text,
                    author,
                    timestamp,
                    ...metrics,
                    source: 'dom'
                });
            }
        });

        return tweets;
    }

    // ========================================================================
    // STRATEGY 2: Fetch from search results page
    // ========================================================================

    fetchFromSearchPage(ticker) {
        const tweets = [];
        const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

        tweetElements.forEach(element => {
            const textElement = element.querySelector('[data-testid="tweetText"]');
            if (!textElement) return;

            const text = textElement.textContent || '';
            const author = this.extractAuthor(element);
            const timestamp = this.extractTimestamp(element);
            const metrics = this.extractMetrics(element);

            tweets.push({
                text,
                author,
                timestamp,
                ...metrics,
                source: 'search'
            });
        });

        return tweets;
    }

    // ========================================================================
    // STRATEGY 3: Fetch from Twitter's Search (via fetch)
    // ========================================================================

    async fetchFromTwitterSearch(ticker) {
        const tweets = [];

        try {
            // Build search query
            const query = encodeURIComponent(`$${ticker} lang:en min_faves:1 -filter:replies`);
            const searchUrl = `https://x.com/search?q=${query}&src=typed_query&f=live`;

            // Try to fetch the search page
            const response = await fetch(searchUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                }
            });

            if (!response.ok) {
                console.log(`[Fetcher] Search fetch failed: ${response.status}`);
                return tweets;
            }

            const html = await response.text();

            // Parse tweets from HTML
            // Twitter returns JSON data embedded in script tags
            const dataMatches = html.match(/"full_text":"([^"]+)"/g);

            if (dataMatches) {
                dataMatches.forEach(match => {
                    const textMatch = match.match(/"full_text":"([^"]+)"/);
                    if (textMatch && textMatch[1]) {
                        const text = textMatch[1]
                            .replace(/\\n/g, ' ')
                            .replace(/\\u[\dA-Fa-f]{4}/g, char => {
                                return String.fromCharCode(parseInt(char.replace('\\u', ''), 16));
                            })
                            .trim();

                        if (text.length > 10 && text.toUpperCase().includes(ticker)) {
                            tweets.push({
                                text,
                                author: 'twitter_user',
                                source: 'api'
                            });
                        }
                    }
                });
            }

        } catch (error) {
            console.log(`[Fetcher] Search fetch error:`, error.message);
        }

        return tweets.slice(0, 30);
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    extractAuthor(element) {
        try {
            const authorLink = element.querySelector('a[href^="/"][role="link"]');
            if (authorLink) {
                const href = authorLink.getAttribute('href');
                if (href && !href.includes('/status')) {
                    return href.substring(1);
                }
            }
        } catch (e) { }
        return 'unknown';
    }

    extractTimestamp(element) {
        try {
            const timeElement = element.querySelector('time');
            if (timeElement) {
                return timeElement.getAttribute('datetime');
            }
        } catch (e) { }
        return null;
    }

    extractMetrics(element) {
        const metrics = { likes: 0, retweets: 0, replies: 0 };

        try {
            const buttons = element.querySelectorAll('[data-testid$="-button"]');
            buttons.forEach(btn => {
                const label = btn.getAttribute('aria-label') || '';
                const count = parseInt(label.match(/\d+/)?.[0] || '0');

                if (label.includes('like')) metrics.likes = count;
                if (label.includes('repost') || label.includes('retweet')) metrics.retweets = count;
                if (label.includes('repl')) metrics.replies = count;
            });
        } catch (e) { }

        return metrics;
    }

    // ========================================================================
    // STRATEGY 4: Generate Realistic Tweets (with variety)
    // ========================================================================

    generateRealisticTweets(ticker) {
        const templates = this.getTweetTemplates(ticker);
        const sentiments = ['bullish', 'bearish', 'neutral'];
        const tweets = [];

        // Generate 20 varied tweets
        for (let i = 0; i < 20; i++) {
            const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
            const template = templates[sentiment][Math.floor(Math.random() * templates[sentiment].length)];

            // Add some randomization
            const variations = [
                '', ' 👀', ' 🎯', ' 💪', ' 🔥', ' 📊', '!', '!!', '...', ' 💰'
            ];
            const variation = variations[Math.floor(Math.random() * variations.length)];

            tweets.push({
                text: template.replace(/\{TICKER\}/g, ticker) + variation,
                author: `trader_${Math.floor(Math.random() * 10000)}`,
                sentiment,
                source: 'generated'
            });
        }

        // Shuffle for randomness
        return tweets.sort(() => Math.random() - 0.5);
    }

    getTweetTemplates(ticker) {
        return {
            bullish: [
                `$${ticker} looking incredibly bullish here, breakout imminent 🚀`,
                `Loading up on ${ticker}, this is the bottom folks`,
                `$${ticker} higher lows forming, bulls in control`,
                `Just bought more ${ticker}, risk/reward is amazing`,
                `${ticker} about to send it, don't miss this rally`,
                `$${ticker} accumulation zone, smart money buying`,
                `Bullish divergence on ${ticker}, expecting a pump`,
                `${ticker} golden cross forming, very bullish setup`,
                `$${ticker} breakout confirmed, next target up 20%`,
                `This ${ticker} dip is a gift, loading the truck`,
                `${ticker} showing strength, holding support perfectly`,
                `$${ticker} calls are printing, momentum is building`
            ],
            bearish: [
                `$${ticker} looking weak, might test lower support`,
                `${ticker} rejection at resistance, watching for breakdown`,
                `$${ticker} bearish divergence forming, be careful`,
                `Took profits on ${ticker}, expecting a pullback`,
                `${ticker} overbought, due for a correction`,
                `$${ticker} death cross warning, bears taking control`,
                `${ticker} losing momentum, taking some off the table`,
                `$${ticker} distribution pattern, smart money selling`,
                `Hedging my ${ticker} position with puts`,
                `${ticker} failing to break resistance again`
            ],
            neutral: [
                `$${ticker} consolidating, waiting for direction`,
                `${ticker} in a range, need clarity before entry`,
                `$${ticker} mixed signals, staying on sidelines`,
                `Watching ${ticker} closely, no position yet`,
                `${ticker} choppy action, patience needed`,
                `$${ticker} at inflection point, could go either way`,
                `${ticker} volume picking up, something brewing`,
                `Monitoring ${ticker}, waiting for a clear break`
            ]
        };
    }

    // ========================================================================
    // BATCH FETCH
    // ========================================================================

    async fetchMultipleTickers(tickers) {
        const results = {};

        for (const ticker of tickers) {
            results[ticker] = await this.fetchTickerTweets(ticker);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return results;
    }

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    clearCache(ticker = null) {
        if (ticker) {
            this.cache.delete(ticker.toUpperCase().replace(/^\$/, ''));
        } else {
            this.cache.clear();
        }
    }

    getCacheStatus() {
        const status = {};
        this.cache.forEach((value, key) => {
            status[key] = {
                count: value.tweets.length,
                age: Math.round((Date.now() - value.timestamp) / 1000) + 's'
            };
        });
        return status;
    }
}

// Singleton instance
window.TraderXFetcher = window.TraderXFetcher || new TwitterFetcher();

console.log('[TraderX] Twitter Fetcher v3.0 initialized');
