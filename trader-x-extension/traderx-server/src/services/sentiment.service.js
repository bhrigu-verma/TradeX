// src/services/sentiment.service.js
// ============================================================================
// SENTIMENT ENGINE — Server-side port of the Chrome extension's analysis
// Adds: time decay, engagement weighting, negation detection, EMA spikes
// ============================================================================

const DECAY_CONSTANT = 0.15; // Half-life ~4.6 hours
const NEGATION_WINDOW = 4;

const NEGATION_WORDS = new Set([
    'not', "don't", "doesn't", "didn't", "won't", "wouldn't", "can't",
    'never', 'no', 'without', 'barely', 'hardly', "isn't", "aren't",
    "wasn't", "weren't", "hasn't", "haven't", "hadn't", "shouldn't"
]);

const BULLISH_KEYWORDS = {
    'moon': 0.8, 'mooning': 0.9, 'breakout': 0.7, 'bullish': 0.6,
    'pump': 0.5, 'rally': 0.6, 'surge': 0.6, 'soar': 0.7,
    'ath': 0.8, 'new high': 0.7, 'bullrun': 0.8, 'parabolic': 0.9,
    'buy': 0.3, 'buying': 0.3, 'long': 0.4, 'accumulate': 0.4,
    'undervalued': 0.5, 'oversold': 0.4, 'support': 0.3, 'hodl': 0.4,
    'green': 0.2, 'gains': 0.3, 'profit': 0.3, 'golden cross': 0.7,
    'higher low': 0.4, 'higher high': 0.4, 'load up': 0.5
};

const BEARISH_KEYWORDS = {
    'crash': 0.8, 'crashed': 0.8, 'crashing': 0.9, 'dump': 0.7,
    'dumping': 0.7, 'plunge': 0.8, 'collapse': 0.9, 'bearish': 0.6,
    'selloff': 0.7, 'capitulation': 0.8, 'liquidation': 0.7, 'rekt': 0.6,
    'sell': 0.3, 'selling': 0.3, 'short': 0.4, 'overbought': 0.4,
    'overvalued': 0.5, 'breakdown': 0.5, 'breaking down': 0.6,
    'red': 0.2, 'loss': 0.3, 'death cross': 0.7, 'lower high': 0.4,
    'lower low': 0.4, 'rejection': 0.3
};

const TIER_WEIGHTS = {
    tier1: 3.0,
    tier2: 2.0,
    tier3: 1.5,
    default: 1.0
};

// ============================================================================
// CORE TEXT ANALYSIS (with negation detection)
// ============================================================================

function isWordNegated(words, index) {
    const start = Math.max(0, index - NEGATION_WINDOW);
    for (let i = start; i < index; i++) {
        const w = (words[i] || '').replace(/[^a-z']/g, '');
        if (NEGATION_WORDS.has(w)) return true;
    }
    return false;
}

function analyzeText(text) {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    let bullishScore = 0;
    let bearishScore = 0;
    let totalWeight = 0;

    // Check multi-word phrases first
    for (const [keyword, weight] of Object.entries(BULLISH_KEYWORDS)) {
        if (keyword.includes(' ') && lowerText.includes(keyword)) {
            const negated = isNegatedPhrase(lowerText, keyword);
            if (negated) bearishScore += weight * 0.7;
            else bullishScore += weight;
            totalWeight += weight;
        }
    }

    for (const [keyword, weight] of Object.entries(BEARISH_KEYWORDS)) {
        if (keyword.includes(' ') && lowerText.includes(keyword)) {
            const negated = isNegatedPhrase(lowerText, keyword);
            if (negated) bullishScore += weight * 0.7;
            else bearishScore += weight;
            totalWeight += weight;
        }
    }

    // Check single words
    for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^a-z]/g, '');
        if (!word) continue;

        if (BULLISH_KEYWORDS[word] !== undefined) {
            const weight = BULLISH_KEYWORDS[word];
            if (isWordNegated(words, i)) bearishScore += weight * 0.7;
            else bullishScore += weight;
            totalWeight += weight;
        }

        if (BEARISH_KEYWORDS[word] !== undefined) {
            const weight = BEARISH_KEYWORDS[word];
            if (isWordNegated(words, i)) bullishScore += weight * 0.7;
            else bearishScore += weight;
            totalWeight += weight;
        }
    }

    if (totalWeight === 0) return 0;

    const rawScore = (bullishScore - bearishScore) / totalWeight;
    return Math.max(-1, Math.min(1, rawScore));
}

function isNegatedPhrase(text, keyword) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex < 0) return false;
    const before = text.substring(Math.max(0, keywordIndex - 40), keywordIndex);
    const wordsBefore = before.trim().split(/\s+/);
    const windowWords = wordsBefore.slice(-NEGATION_WINDOW);
    return windowWords.some(w => NEGATION_WORDS.has(w.replace(/[^a-z']/g, '')));
}

// ============================================================================
// TIME DECAY
// ============================================================================

function computeTimeDecay(timestamp) {
    if (!timestamp) return 0.7;
    const tweetDate = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
    if (isNaN(tweetDate.getTime())) return 0.7;
    const ageHours = (Date.now() - tweetDate.getTime()) / 3_600_000;
    if (ageHours < 0) return 1.0;
    return Math.max(0.1, Math.exp(-DECAY_CONSTANT * ageHours));
}

// ============================================================================
// ENGAGEMENT WEIGHT
// ============================================================================

function computeEngagementWeight(likes = 0, retweets = 0, replies = 0) {
    const engagementScore = likes + (retweets * 3) + (replies * 2);
    return Math.max(1.0, Math.log10(1 + engagementScore));
}

// ============================================================================
// EMA + Z-SCORE VOLUME SPIKE
// ============================================================================

function computeEMA(values, smoothing = 0.2) {
    if (!values || values.length === 0) return 0;
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
        ema = (values[i] * smoothing) + (ema * (1 - smoothing));
    }
    return ema;
}

function checkVolumeSpike(history, currentCount) {
    if (!history || history.length < 5) return { isSpike: false, intensity: 0, label: 'INSUFFICIENT' };

    const counts = history.map(h => h.count);
    const ema = computeEMA(counts);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    const zScore = stdDev > 0 ? (currentCount - ema) / stdDev : 0;

    return {
        isSpike: zScore > 2.0,
        intensity: Math.max(0, zScore),
        label: zScore > 3.0 ? 'EXTREME' : zScore > 2.0 ? 'NOTABLE' : 'NORMAL',
        ema,
        stdDev,
        zScore
    };
}

// ============================================================================
// MAIN ANALYSIS — takes array of tweet objects
// ============================================================================

function analyzeTweets(tweets, trustedAccounts = new Map(), volumeHistory = []) {
    if (!tweets || tweets.length === 0) {
        return {
            sentiment: 0, status: 'NO DATA', confidence: 'low',
            insufficientData: true, sampleSize: 0,
            breakdown: { bullish: 0, bearish: 0, neutral: 0 },
            volumeSpike: false, spikeIntensity: 0
        };
    }

    const analyses = tweets.map(tweet => {
        const text = typeof tweet === 'string' ? tweet : (tweet.text || '');
        const author = (tweet.author || tweet.author_handle || tweet.username || '').toLowerCase().replace('@', '');
        const timestamp = tweet.timestamp || tweet.tweet_created_at || tweet.created_at || null;

        // Core sentiment
        const score = analyzeText(text);

        // Tier weight
        const tier = trustedAccounts.get(author) || 'default';
        const tierWeight = TIER_WEIGHTS[tier] || TIER_WEIGHTS.default;

        // Time decay
        const decayFactor = computeTimeDecay(timestamp);

        // Engagement weight
        const engagementMultiplier = computeEngagementWeight(
            tweet.likes || 0,
            tweet.retweets || 0,
            tweet.replies || 0
        );

        const effectiveWeight = tierWeight * decayFactor * engagementMultiplier;

        return { score, weight: effectiveWeight, tierWeight, decayFactor, author, tier, text: text.substring(0, 100) };
    });

    // Weighted average
    let totalWeight = 0, weightedSum = 0;
    let bullishCount = 0, bearishCount = 0, neutralCount = 0;

    analyses.forEach(a => {
        weightedSum += a.score * a.weight;
        totalWeight += a.weight;
        if (a.score > 0.2) bullishCount++;
        else if (a.score < -0.2) bearishCount++;
        else neutralCount++;
    });

    const avgSentiment = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Standard deviation
    const scores = analyses.map(a => a.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Volume spike
    const vsResult = checkVolumeSpike(volumeHistory, tweets.length);

    // Confidence
    const confidence = tweets.length >= 25 ? 'high' : tweets.length >= 10 ? 'medium' : 'low';
    const insufficientData = tweets.length < 5;

    // Determine status
    let status;
    if (insufficientData) status = 'LOW DATA';
    else if (stdDev > 0.35 || vsResult.isSpike) status = 'VOLATILE';
    else if (avgSentiment > 0.3) status = 'VERY BULLISH';
    else if (avgSentiment > 0.15) status = 'BULLISH';
    else if (avgSentiment < -0.3) status = 'VERY BEARISH';
    else if (avgSentiment < -0.15) status = 'BEARISH';
    else status = 'NEUTRAL';

    return {
        sentiment: avgSentiment,
        status,
        confidence,
        insufficientData,
        sampleSize: tweets.length,
        breakdown: { bullish: bullishCount, bearish: bearishCount, neutral: neutralCount },
        stdDev,
        volumeSpike: vsResult.isSpike,
        spikeIntensity: vsResult.intensity,
        spikeLabel: vsResult.label,
        influencerCount: analyses.filter(a => a.tier !== 'default').length
    };
}

// ============================================================================
// TICKER EXTRACTION
// ============================================================================

const COMMON_TICKERS = new Set([
    'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'MATIC', 'DOT', 'LINK',
    'SPY', 'QQQ', 'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD',
    'GME', 'AMC', 'PLTR', 'NIO', 'RIVN', 'LCID', 'SOFI', 'COIN', 'HOOD', 'MARA',
    'VIX', 'DXY', 'GLD', 'SLV', 'USO', 'UNG', 'TLT', 'IWM', 'DIA', 'XLF',
    'RIOT', 'CLSK', 'SQ', 'PYPL', 'V', 'MA', 'JPM', 'GS', 'SNOW', 'CRM'
]);

const CRYPTO_NAMES = {
    'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL', 'ripple': 'XRP',
    'dogecoin': 'DOGE', 'cardano': 'ADA', 'avalanche': 'AVAX', 'polygon': 'MATIC',
    'polkadot': 'DOT', 'chainlink': 'LINK'
};

function extractTickers(text) {
    const tickers = new Set();
    const textLower = text.toLowerCase();

    // $TICKER format
    const dollarMatches = text.match(/\$[A-Za-z]{1,6}\b/g);
    if (dollarMatches) {
        dollarMatches.forEach(m => {
            const t = m.substring(1).toUpperCase();
            if (t.length >= 2) tickers.add(t);
        });
    }

    // Crypto names
    Object.entries(CRYPTO_NAMES).forEach(([name, ticker]) => {
        if (new RegExp(`\\b${name}\\b`, 'i').test(text)) tickers.add(ticker);
    });

    // Known tickers as standalone words
    text.toUpperCase().split(/\s+/).forEach(word => {
        const clean = word.replace(/[^A-Z]/g, '');
        if (COMMON_TICKERS.has(clean)) tickers.add(clean);
    });

    return Array.from(tickers);
}

module.exports = {
    analyzeText,
    analyzeTweets,
    extractTickers,
    computeTimeDecay,
    computeEngagementWeight,
    checkVolumeSpike,
    computeEMA
};
