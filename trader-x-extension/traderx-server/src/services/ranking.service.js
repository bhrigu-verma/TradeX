// ============================================================================
// RANKING SERVICE — Smart Tweet/Signal Importance Scoring
// ============================================================================
// Takes raw posts from all sources, deduplicates, scores, and ranks them.
// Returns the "Top N Most Important Signals" for any given ticker.
// ============================================================================

const logger = require('../config/logger');

// ============================================================================
// IMPORTANCE SCORING FORMULA
// ============================================================================
// Score = (engagement_score × recency_weight × source_trust × influencer_bonus)
//
// engagement_score = log2(likes + 1) × 2 + log2(retweets + 1) × 3 + log2(replies + 1) × 1
// recency_weight  = exponential decay, 1.0 for just now → 0.1 for 24h old
// source_trust    = { stocktwits: 0.8, reddit: 0.7, x_extension: 1.0, cryptopanic: 0.9, google_news: 0.6 }
// influencer_bonus= 1.0 + log10(followers + 1) / 10
// ============================================================================

const SOURCE_TRUST = {
    'dom': 1.0,        // From Chrome extension DOM scrape
    'search': 1.0,     // From extension search
    'api': 1.0,        // From extension API intercept
    'extension': 1.0,  // Generic extension
    'stocktwits': 0.85,
    'reddit': 0.75,
    'cryptopanic': 0.9,
    'google_news': 0.65
};

function calculateRecencyWeight(timestamp) {
    if (!timestamp) return 0.5;

    const now = Date.now();
    let postTime;

    if (typeof timestamp === 'number') {
        postTime = timestamp > 1e12 ? timestamp : timestamp * 1000;
    } else {
        postTime = new Date(timestamp).getTime();
    }

    if (isNaN(postTime)) return 0.5;

    const hoursAgo = (now - postTime) / (1000 * 60 * 60);

    if (hoursAgo <= 0) return 1.0;
    if (hoursAgo <= 1) return 0.95;
    if (hoursAgo <= 2) return 0.85;
    if (hoursAgo <= 4) return 0.7;
    if (hoursAgo <= 8) return 0.5;
    if (hoursAgo <= 12) return 0.35;
    if (hoursAgo <= 24) return 0.2;
    return 0.1;
}

function calculateEngagementScore(post) {
    const likes = Math.max(0, post.likes || 0);
    const retweets = Math.max(0, post.retweets || 0);
    const replies = Math.max(0, post.replies || 0);

    return (
        Math.log2(likes + 1) * 2 +
        Math.log2(retweets + 1) * 3 +
        Math.log2(replies + 1) * 1
    );
}

function calculateInfluencerBonus(post) {
    const followers = post.authorFollowers || 0;
    if (followers <= 0) return 1.0;
    return 1.0 + Math.log10(followers + 1) / 10;
}

function scorePost(post) {
    const engagement = calculateEngagementScore(post);
    const recency = calculateRecencyWeight(post.timestamp);
    const trust = SOURCE_TRUST[post.source] || 0.5;
    const influencer = calculateInfluencerBonus(post);

    const score = engagement * recency * trust * influencer;

    return {
        ...post,
        _score: Math.round(score * 100) / 100,
        _engagement: Math.round(engagement * 100) / 100,
        _recency: Math.round(recency * 100) / 100,
        _trust: trust,
        _influencer: Math.round(influencer * 100) / 100
    };
}

// ============================================================================
// DEDUPLICATION — Jaccard similarity to remove near-duplicates
// ============================================================================
function jaccardSimilarity(a, b) {
    if (!a || !b) return 0;

    const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    if (setA.size === 0 || setB.size === 0) return 0;

    let intersection = 0;
    for (const word of setA) {
        if (setB.has(word)) intersection++;
    }

    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? intersection / union : 0;
}

function deduplicatePosts(posts, threshold = 0.7) {
    const unique = [];

    for (const post of posts) {
        let isDuplicate = false;

        for (const existing of unique) {
            if (jaccardSimilarity(post.text, existing.text) > threshold) {
                // Keep the one with higher engagement
                if (scorePost(post)._score > scorePost(existing)._score) {
                    const idx = unique.indexOf(existing);
                    unique[idx] = post; // replace with higher quality version
                }
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) {
            unique.push(post);
        }
    }

    return unique;
}

// ============================================================================
// RANK AND SELECT — Main ranking pipeline
// ============================================================================
function rankPosts(posts, topN = 5) {
    if (!posts || posts.length === 0) {
        return { rankedPosts: [], totalAnalyzed: 0 };
    }

    // Step 1: Deduplicate
    const uniquePosts = deduplicatePosts(posts);

    // Step 2: Score each post
    const scoredPosts = uniquePosts.map(scorePost);

    // Step 3: Sort by score (descending)
    scoredPosts.sort((a, b) => b._score - a._score);

    // Step 4: Take top N
    const topPosts = scoredPosts.slice(0, topN);

    logger.debug(`[Ranking] Analyzed ${posts.length} → ${uniquePosts.length} unique → Top ${topPosts.length} selected`);

    return {
        rankedPosts: topPosts,
        totalAnalyzed: posts.length,
        uniqueCount: uniquePosts.length
    };
}

// ============================================================================
// FORMAT FOR TELEGRAM — Pretty-print the top tweets for messaging
// ============================================================================
function formatTopPostsForTelegram(ticker, rankedPosts, analysis, priceData, sourceCounts) {
    const statusEmoji = {
        'VERY BULLISH': '🟢🟢',
        'BULLISH': '🟢',
        'NEUTRAL': '⚪',
        'BEARISH': '🔴',
        'VERY BEARISH': '🔴🔴',
        'LOW DATA': '⚠️',
        'NO DATA': '❌'
    };

    const emoji = statusEmoji[analysis.status] || '⚪';
    const priceStr = priceData?.price ? `$${priceData.price.toLocaleString()}` : 'N/A';
    const changeStr = priceData?.change24h != null
        ? `${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%`
        : 'N/A';

    let msg = '';
    msg += `📊 *$${ticker} — Intelligence Report*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `${emoji} *Status:* ${analysis.status} (Score: ${(analysis.sentiment * 100).toFixed(0)}%)\n`;
    msg += `🎯 *Confidence:* ${(analysis.confidence || 'low').toUpperCase()} (${analysis.sampleSize} signals)\n`;
    msg += `💰 *Price:* ${priceStr} (${changeStr} 24h)\n`;

    if (analysis.volumeSpike) {
        msg += `🚨 *VOLUME SPIKE DETECTED* (${analysis.spikeIntensity?.toFixed(1)}x normal)\n`;
    }

    msg += `\n🏆 *Top ${rankedPosts.length} Key Signals:*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    rankedPosts.forEach((post, idx) => {
        const sourceTag = {
            'stocktwits': '💬ST',
            'reddit': '🟠RD',
            'cryptopanic': '📰CP',
            'google_news': '📰GN',
            'dom': '🐦X',
            'search': '🐦X',
            'api': '🐦X',
            'extension': '🐦X'
        }[post.source] || '📡';

        const engStr = post.likes > 0 ? `${post.likes} ❤️` : '';
        const replStr = post.replies > 0 ? ` ${post.replies} 💬` : '';
        const authorStr = post.author ? `@${post.author}` : '';

        // Truncate text to keep it readable
        const truncatedText = post.text.length > 120
            ? post.text.substring(0, 117) + '...'
            : post.text;

        msg += `\n${idx + 1}. ${sourceTag} ${authorStr}${engStr ? ` (${engStr}${replStr})` : ''}\n`;
        msg += `   _${truncatedText}_\n`;
    });

    // Source breakdown
    const activeSources = Object.entries(sourceCounts || {})
        .filter(([, count]) => count > 0)
        .map(([name, count]) => `${name}:${count}`)
        .join(', ');

    msg += `\n📡 *Sources:* ${activeSources || 'cached data'}\n`;
    msg += `🔄 Updated: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;

    return msg;
}

module.exports = {
    scorePost,
    rankPosts,
    deduplicatePosts,
    formatTopPostsForTelegram,
    calculateRecencyWeight,
    calculateEngagementScore
};
