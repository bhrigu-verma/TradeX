// ============================================================================
// TRADERX ANALYSIS ENGINE v3.0 - FinBERT + Influencer Weighting
// ============================================================================
// Features:
// - FinBERT-based sentiment analysis (via Transformers.js)
// - Influencer weighting based on accounts.json tiers
// - Volume spike detection
// - Fallback to keyword analysis if model unavailable
// ============================================================================

class EnhancedAnalysisEngine {
    constructor() {
        this.isModelLoaded = false;
        this.modelLoadAttempted = false;
        this.pipeline = null;

        // Influencer tiers from accounts.json
        this.tierWeights = {
            tier1: 3.0,  // Critical sources (central banks, official)
            tier2: 2.0,  // Trusted analysts
            tier3: 1.5,  // Signals
            default: 1.0
        };

        this.trustedAccounts = new Map(); // handle -> tier
        this.accountsLoaded = false;

        // Volume tracking
        this.volumeHistory = new Map(); // ticker -> array of {count, timestamp}
        this.volumeWindowHours = 24;

        // Sentiment thresholds
        this.BULLISH_THRESHOLD = 0.15;
        this.BEARISH_THRESHOLD = -0.15;
        this.HIGH_VOL_THRESHOLD = 0.35;

        // Enhanced keyword weights (fallback)
        this.bullishKeywords = {
            // Strong bullish
            'moon': 0.8, 'mooning': 0.9, 'breakout': 0.7, 'bullish': 0.6,
            'pump': 0.5, 'rally': 0.6, 'surge': 0.6, 'soar': 0.7,
            'ath': 0.8, 'all time high': 0.8, 'new high': 0.7,
            'bullrun': 0.8, 'bull run': 0.8, 'parabolic': 0.9,
            'explosion': 0.7, 'exploding': 0.7, 'skyrocket': 0.8,

            // Medium bullish
            'buy': 0.3, 'buying': 0.3, 'long': 0.4, 'longing': 0.4,
            'accumulate': 0.4, 'accumulation': 0.4, 'load up': 0.5,
            'undervalued': 0.5, 'oversold': 0.4, 'dip': 0.2,
            'support': 0.3, 'holding': 0.2, 'hodl': 0.4,

            // Mild bullish
            'green': 0.2, 'gains': 0.3, 'profit': 0.3, 'up': 0.1,
            'bullish divergence': 0.6, 'golden cross': 0.7,
            'higher low': 0.4, 'higher high': 0.4
        };

        this.bearishKeywords = {
            // Strong bearish
            'crash': 0.8, 'crashed': 0.8, 'crashing': 0.9, 'dump': 0.7,
            'dumping': 0.7, 'plunge': 0.8, 'plummeting': 0.8, 'collapse': 0.9,
            'bearish': 0.6, 'selloff': 0.7, 'sell-off': 0.7,
            'capitulation': 0.8, 'liquidation': 0.7, 'liquidated': 0.7,
            'rekt': 0.6, 'wrecked': 0.6, 'destroyed': 0.5,

            // Medium bearish
            'sell': 0.3, 'selling': 0.3, 'short': 0.4, 'shorting': 0.4,
            'overbought': 0.4, 'overvalued': 0.5, 'resistance': 0.2,
            'breakdown': 0.5, 'break down': 0.5, 'breaking down': 0.6,

            // Mild bearish
            'red': 0.2, 'loss': 0.3, 'losses': 0.3, 'down': 0.1,
            'bearish divergence': 0.6, 'death cross': 0.7,
            'lower high': 0.4, 'lower low': 0.4, 'rejection': 0.3
        };

        this.volatilityKeywords = [
            'volatile', 'volatility', 'choppy', 'whipsaw', 'wild',
            'uncertain', 'unstable', 'swinging', 'unpredictable',
            'squeeze', 'gamma squeeze', 'short squeeze'
        ];
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    async init() {
        console.log('[AnalysisEngine] Initializing v3.0...');

        // Load trusted accounts
        await this.loadTrustedAccounts();

        // Load volume history
        this.loadVolumeHistory();

        // Try to load FinBERT model
        await this.loadModel();

        console.log('[AnalysisEngine] Initialization complete');
    }

    async loadTrustedAccounts() {
        try {
            const url = chrome.runtime.getURL('accounts.json');
            const response = await fetch(url);
            const data = await response.json();

            // Build tier map
            const categories = data.accounts || {};

            // Map categories to tiers
            const tier1Categories = ['Macro_CentralBanks', 'Regulatory_Government'];
            const tier2Categories = ['Institutional_AssetMgmt', 'Media_News', 'Wealth_ValueInvesting'];
            const tier3Categories = ['Trading_TechnicalAnalysis', 'Crypto_DeFi', 'Forex', 'Commodities'];

            Object.entries(categories).forEach(([category, handles]) => {
                let tier = 'tier3';
                if (tier1Categories.includes(category)) tier = 'tier1';
                else if (tier2Categories.includes(category)) tier = 'tier2';

                handles.forEach(handle => {
                    const normalized = handle.toLowerCase().replace('@', '');
                    this.trustedAccounts.set(normalized, tier);
                });
            });

            this.accountsLoaded = true;
            console.log(`[AnalysisEngine] Loaded ${this.trustedAccounts.size} trusted accounts`);
        } catch (e) {
            console.error('[AnalysisEngine] Failed to load accounts:', e);
        }
    }

    async loadModel() {
        if (this.modelLoadAttempted) return;
        this.modelLoadAttempted = true;

        try {
            // Check if Transformers.js is available
            if (typeof window.transformers !== 'undefined' || typeof window.pipeline !== 'undefined') {
                console.log('[AnalysisEngine] Loading FinBERT model...');

                // Use Transformers.js pipeline
                const { pipeline } = window.transformers || window;

                // Load financial sentiment model
                // Options: 'ProsusAI/finbert', 'yiyanghkust/finbert-tone', 'ahmedrachid/FinancialBERT-Sentiment-Analysis'
                this.pipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
                    quantized: true // Use quantized for faster loading
                });

                this.isModelLoaded = true;
                console.log('[AnalysisEngine] FinBERT model loaded successfully!');
            } else {
                console.log('[AnalysisEngine] Transformers.js not found, using keyword analysis');
            }
        } catch (e) {
            console.warn('[AnalysisEngine] Model load failed, using fallback:', e.message);
            this.isModelLoaded = false;
        }
    }

    // ========================================================================
    // MAIN ANALYSIS
    // ========================================================================

    async analyzeTicker(tweets, ticker = null) {
        if (!tweets || tweets.length === 0) {
            return {
                sentiment: 0,
                status: 'NO DATA',
                sampleSize: 0,
                breakdown: { bullish: 0, bearish: 0, neutral: 0 },
                volumeSpike: false
            };
        }

        // Track volume
        if (ticker) {
            this.recordVolume(ticker, tweets.length);
        }

        // Analyze each tweet
        const analyses = await Promise.all(tweets.map(async tweet => {
            const text = typeof tweet === 'string' ? tweet : (tweet.text || tweet.content || '');
            const author = typeof tweet === 'object' ? (tweet.author || tweet.username || '').toLowerCase().replace('@', '') : '';

            // Get sentiment score
            let score;
            if (this.isModelLoaded && this.pipeline) {
                score = await this.analyzeWithModel(text);
            } else {
                score = this.analyzeText(text);
            }

            // Apply influencer weighting
            const tier = this.trustedAccounts.get(author);
            const weight = tier ? this.tierWeights[tier] : this.tierWeights.default;

            return {
                score,
                weight,
                author,
                tier,
                text: text.substring(0, 100) // Store snippet
            };
        }));

        // Calculate weighted average
        let totalWeight = 0;
        let weightedSum = 0;
        let bullishCount = 0;
        let bearishCount = 0;
        let neutralCount = 0;

        analyses.forEach(a => {
            weightedSum += a.score * a.weight;
            totalWeight += a.weight;

            if (a.score > 0.2) bullishCount++;
            else if (a.score < -0.2) bearishCount++;
            else neutralCount++;
        });

        const avgSentiment = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Calculate volatility (standard deviation)
        const scores = analyses.map(a => a.score);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);

        // Check for volume spike
        const volumeSpike = ticker ? this.checkVolumeSpike(ticker, tweets.length) : false;

        // Determine status
        let status;
        if (stdDev > this.HIGH_VOL_THRESHOLD || volumeSpike) {
            status = 'VOLATILE';
        } else if (avgSentiment > 0.3) {
            status = 'VERY BULLISH';
        } else if (avgSentiment > this.BULLISH_THRESHOLD) {
            status = 'BULLISH';
        } else if (avgSentiment < -0.3) {
            status = 'VERY BEARISH';
        } else if (avgSentiment < this.BEARISH_THRESHOLD) {
            status = 'BEARISH';
        } else {
            status = 'NEUTRAL';
        }

        return {
            sentiment: avgSentiment,
            status,
            sampleSize: tweets.length,
            breakdown: {
                bullish: bullishCount,
                bearish: bearishCount,
                neutral: neutralCount
            },
            stdDev,
            volumeSpike,
            influencerCount: analyses.filter(a => a.tier).length,
            topAnalyses: analyses
                .filter(a => a.tier)
                .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
                .slice(0, 5) // Top 5 influencer tweets
        };
    }

    // ========================================================================
    // MODEL-BASED ANALYSIS (FinBERT via Transformers.js)
    // ========================================================================

    async analyzeWithModel(text) {
        if (!this.pipeline || !text) return 0;

        try {
            // Truncate to model max length
            const truncated = text.substring(0, 512);
            const result = await this.pipeline(truncated);

            // Convert to -1 to 1 scale
            // FinBERT returns: positive, negative, neutral
            // DistilBERT returns: POSITIVE, NEGATIVE
            const label = result[0].label.toLowerCase();
            const score = result[0].score;

            if (label.includes('positive')) return score;
            if (label.includes('negative')) return -score;
            return 0; // neutral
        } catch (e) {
            console.warn('[AnalysisEngine] Model inference failed:', e.message);
            return this.analyzeText(text); // Fallback to keywords
        }
    }

    // ========================================================================
    // KEYWORD-BASED ANALYSIS (Fallback)
    // ========================================================================

    analyzeText(text) {
        if (!text) return 0;

        const lowerText = text.toLowerCase();
        let bullishScore = 0;
        let bearishScore = 0;
        let totalWeight = 0;
        let volatilityHits = 0;

        // Count bullish keywords
        for (const [keyword, weight] of Object.entries(this.bullishKeywords)) {
            if (lowerText.includes(keyword)) {
                bullishScore += weight;
                totalWeight += weight;
            }
        }

        // Count bearish keywords
        for (const [keyword, weight] of Object.entries(this.bearishKeywords)) {
            if (lowerText.includes(keyword)) {
                bearishScore += weight;
                totalWeight += weight;
            }
        }

        // Check volatility
        for (const keyword of this.volatilityKeywords) {
            if (lowerText.includes(keyword)) volatilityHits++;
        }

        if (totalWeight === 0) return 0;

        // Normalize to -1 to 1
        const rawScore = (bullishScore - bearishScore) / totalWeight;
        return Math.max(-1, Math.min(1, rawScore));
    }

    // ========================================================================
    // VOLUME TRACKING & SPIKE DETECTION
    // ========================================================================

    recordVolume(ticker, count) {
        if (!this.volumeHistory.has(ticker)) {
            this.volumeHistory.set(ticker, []);
        }

        const history = this.volumeHistory.get(ticker);
        history.push({
            count,
            timestamp: Date.now()
        });

        // Keep only last 24 hours
        const cutoff = Date.now() - (this.volumeWindowHours * 60 * 60 * 1000);
        const filtered = history.filter(h => h.timestamp > cutoff);
        this.volumeHistory.set(ticker, filtered);

        // Save to localStorage
        this.saveVolumeHistory();
    }

    checkVolumeSpike(ticker, currentCount) {
        const history = this.volumeHistory.get(ticker);
        if (!history || history.length < 3) return false;

        // Calculate average
        const avg = history.reduce((sum, h) => sum + h.count, 0) / history.length;

        // Spike if current is 2x+ average
        return currentCount > avg * 2;
    }

    saveVolumeHistory() {
        try {
            const data = {};
            this.volumeHistory.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem('traderx_volume_history', JSON.stringify(data));
        } catch (e) { }
    }

    loadVolumeHistory() {
        try {
            const saved = localStorage.getItem('traderx_volume_history');
            if (saved) {
                const data = JSON.parse(saved);
                Object.entries(data).forEach(([key, value]) => {
                    this.volumeHistory.set(key, value);
                });
            }
        } catch (e) { }
    }

    // ========================================================================
    // UTILITY: Get influencer weight for display
    // ========================================================================

    getInfluencerInfo(author) {
        const normalized = author.toLowerCase().replace('@', '');
        const tier = this.trustedAccounts.get(normalized);
        return tier ? {
            tier,
            weight: this.tierWeights[tier],
            label: tier === 'tier1' ? 'Critical' : tier === 'tier2' ? 'Trusted' : 'Signal'
        } : null;
    }
}

// Initialize
const engine = new EnhancedAnalysisEngine();
window.TraderXAnalysisEngine = engine;

// Auto-init after DOM loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => engine.init());
} else {
    engine.init();
}

console.log('[TraderX] Enhanced Analysis Engine v3.0 loaded');
