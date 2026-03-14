// src/services/alert.service.js
// ============================================================================
// Alert evaluation engine — combo alerts, sentiment flip, divergence, bursts
// Evaluates conditions and routes to Telegram / Discord / webhook
// ============================================================================

const { getDb } = require('../db/setup');
const logger = require('../config/logger');

class AlertService {
    constructor() {
        this.previousStates = new Map(); // ticker -> last sentiment state
        this.recentInfluencerTweets = new Map(); // ticker -> [{author, timestamp}]
        this._loadPreviousStates();
    }

    _loadPreviousStates() {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT key, status, sentiment FROM sentiment_states').all();
            for (const row of rows) {
                this.previousStates.set(row.key, { status: row.status, sentiment: row.sentiment, timestamp: Date.now() });
            }
            logger.info(`[AlertService] Loaded ${rows.length} sentiment states from DB`);
        } catch (e) {
            logger.warn(`[AlertService] Could not load sentiment states: ${e.message}`);
        }
    }

    // ========================================================================
    // EVALUATE — run after each ticker analysis
    // ========================================================================

    async evaluateForUser(userId, ticker, analysis, priceData = null) {
        const db = getDb();
        const triggered = [];

        try {
            // Load user's enabled alerts for this ticker (or global)
            const alerts = db.prepare(`
        SELECT * FROM alerts
        WHERE user_id = ? AND enabled = 1
        AND (ticker = ? OR ticker IS NULL OR ticker = '')
        ORDER BY created_at ASC
      `).all(userId, ticker);

            const now = Math.floor(Date.now() / 1000);

            for (const alert of alerts) {
                // Check cooldown
                const cooldownSec = (alert.cooldown_min || 15) * 60;
                if (alert.last_fired && (now - alert.last_fired) < cooldownSec) continue;

                let conditions;
                try { conditions = JSON.parse(alert.conditions); } catch { conditions = {}; }

                let fired = false;
                let triggerDetails = {};

                switch (alert.type) {
                    case 'divergence':
                        ({ fired, triggerDetails } = this.checkDivergence(ticker, analysis, priceData, conditions));
                        break;
                    case 'influencer_burst':
                        ({ fired, triggerDetails } = this.checkInfluencerBurst(ticker, analysis, conditions));
                        break;
                    case 'sentiment_flip':
                        ({ fired, triggerDetails } = this.checkSentimentFlip(ticker, analysis, conditions));
                        break;
                    case 'volume_sentiment':
                        ({ fired, triggerDetails } = this.checkVolumeSentiment(ticker, analysis, conditions));
                        break;
                    case 'sentiment_threshold':
                        ({ fired, triggerDetails } = this.checkSentimentThreshold(ticker, analysis, conditions));
                        break;
                    case 'price_change':
                        ({ fired, triggerDetails } = this.checkPriceChange(ticker, priceData, conditions));
                        break;
                    default:
                        break;
                }

                if (fired) {
                    // Update last_fired
                    db.prepare('UPDATE alerts SET last_fired = ? WHERE id = ?').run(now, alert.id);

                    // Log to alert_history
                    const historyId = db.prepare(`
            INSERT INTO alert_history (user_id, alert_id, alert_name, ticker, type, payload, delivered)
            VALUES (?, ?, ?, ?, ?, ?, 0)
          `).run(userId, alert.id, alert.name, ticker, alert.type, JSON.stringify({
                        analysis: { sentiment: analysis.sentiment, status: analysis.status, sampleSize: analysis.sampleSize },
                        price: priceData,
                        conditions,
                        triggerDetails
                    }));

                    triggered.push({
                        alertId: alert.id,
                        historyId: historyId.lastInsertRowid,
                        name: alert.name,
                        type: alert.type,
                        ticker,
                        analysis,
                        priceData,
                        conditions,
                        triggerDetails,
                        delivery: JSON.parse(alert.delivery || '["telegram"]'),
                        userId
                    });
                }
            }
        } catch (e) {
            logger.error(`[AlertService] Error evaluating alerts for ${ticker}: ${e.message}`);
        }

        // Update previous state
        const stateKey = `${userId}_${ticker}`;
        const stateVal = { status: analysis.status, sentiment: analysis.sentiment, timestamp: Date.now() };
        this.previousStates.set(stateKey, stateVal);
        try {
            const db = getDb();
            db.prepare('INSERT OR REPLACE INTO sentiment_states (key, status, sentiment, updated_at) VALUES (?, ?, ?, unixepoch())')
              .run(stateKey, analysis.status, analysis.sentiment);
        } catch (e) {
            logger.warn(`[AlertService] Could not persist sentiment state: ${e.message}`);
        }

        return triggered;
    }

    // ========================================================================
    // CONDITION CHECKS
    // ========================================================================

    checkDivergence(ticker, analysis, priceData, conditions) {
        if (!priceData?.change24h || analysis.sampleSize < (conditions.minSampleSize || 10)) {
            return { fired: false };
        }

        // Bullish divergence: sentiment > threshold AND price dropped
        if (conditions.sentimentMin !== undefined && conditions.priceChangeMax !== undefined) {
            const fired = analysis.sentiment >= conditions.sentimentMin && priceData.change24h <= conditions.priceChangeMax;
            return {
                fired,
                triggerDetails: {
                    reason: 'Bullish sentiment while price dropping — possible smart money accumulation',
                    sentiment: analysis.sentiment,
                    priceChange: priceData.change24h
                }
            };
        }

        // Bearish divergence: sentiment < threshold AND price rose
        if (conditions.sentimentMax !== undefined && conditions.priceChangeMin !== undefined) {
            const fired = analysis.sentiment <= conditions.sentimentMax && priceData.change24h >= conditions.priceChangeMin;
            return {
                fired,
                triggerDetails: {
                    reason: 'Bearish sentiment while price rising — possible distribution',
                    sentiment: analysis.sentiment,
                    priceChange: priceData.change24h
                }
            };
        }

        return { fired: false };
    }

    checkInfluencerBurst(ticker, analysis, conditions) {
        const minCount = conditions.minInfluencerCount || 5;
        const fired = (analysis.influencerCount || 0) >= minCount;
        return {
            fired,
            triggerDetails: { influencerCount: analysis.influencerCount, required: minCount }
        };
    }

    checkSentimentFlip(ticker, analysis, conditions) {
        const scopedKey = conditions.userId ? `${conditions.userId}_${ticker}` : null;
        const previous = (scopedKey && this.previousStates.get(scopedKey)) || this.previousStates.get(ticker);
        if (!previous) return { fired: false };

        const prevStatus = (previous.status || '').toUpperCase();
        const currStatus = (analysis.status || '').toUpperCase();

        const fired = prevStatus.includes(conditions.fromStatus || '') && currStatus.includes(conditions.toStatus || '');
        return {
            fired,
            triggerDetails: { from: previous.status, to: analysis.status }
        };
    }

    checkVolumeSentiment(ticker, analysis, conditions) {
        if (!analysis.volumeSpike) return { fired: false };
        const minAbs = conditions.minAbsSentiment || 0.25;
        const fired = Math.abs(analysis.sentiment) >= minAbs && analysis.sampleSize >= (conditions.minSampleSize || 10);
        return {
            fired,
            triggerDetails: { volumeSpike: true, spikeIntensity: analysis.spikeIntensity, sentiment: analysis.sentiment }
        };
    }

    checkSentimentThreshold(ticker, analysis, conditions) {
        let fired = false;
        if (conditions.direction === 'bullish') {
            fired = analysis.sentiment >= (conditions.threshold || 0.3);
        } else if (conditions.direction === 'bearish') {
            fired = analysis.sentiment <= -(conditions.threshold || 0.3);
        }
        return { fired, triggerDetails: { sentiment: analysis.sentiment } };
    }

    checkPriceChange(ticker, priceData, conditions) {
        if (!priceData?.change24h) return { fired: false };
        let fired = false;
        if (conditions.minChange && priceData.change24h >= conditions.minChange) fired = true;
        if (conditions.maxChange && priceData.change24h <= conditions.maxChange) fired = true;
        return { fired, triggerDetails: { priceChange: priceData.change24h } };
    }

    // ========================================================================
    // CRUD for alerts
    // ========================================================================

    createAlert(userId, alertData) {
        const db = getDb();
        const defaultAlerts = this.getDefaultAlerts(userId);

        const result = db.prepare(`
      INSERT INTO alerts (user_id, name, type, ticker, conditions, delivery, enabled, cooldown_min)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
            userId,
            alertData.name,
            alertData.type,
            alertData.ticker || null,
            JSON.stringify(alertData.conditions || {}),
            JSON.stringify(alertData.delivery || ['telegram']),
            alertData.cooldownMin || 15
        );

        return db.prepare('SELECT * FROM alerts WHERE id = last_insert_rowid()').get();
    }

    getDefaultAlerts(userId) {
        return [
            {
                name: 'Bullish Divergence',
                type: 'divergence',
                conditions: { sentimentMin: 0.15, priceChangeMax: -3, minSampleSize: 10 },
            },
            {
                name: 'Bearish Divergence',
                type: 'divergence',
                conditions: { sentimentMax: -0.15, priceChangeMin: 3, minSampleSize: 10 },
            },
            {
                name: 'Influencer Burst',
                type: 'influencer_burst',
                conditions: { minInfluencerCount: 5 },
            },
            {
                name: 'Sentiment Flip → Bullish',
                type: 'sentiment_flip',
                conditions: { fromStatus: 'BEARISH', toStatus: 'BULLISH', userId },
            },
            {
                name: 'Volume + Strong Sentiment',
                type: 'volume_sentiment',
                conditions: { minAbsSentiment: 0.25, minSampleSize: 10 },
            }
        ];
    }

    getUserAlerts(userId) {
        const db = getDb();
        return db.prepare('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    }

    toggleAlert(alertId, userId, enabled) {
        const db = getDb();
        return db.prepare('UPDATE alerts SET enabled = ? WHERE id = ? AND user_id = ?').run(enabled ? 1 : 0, alertId, userId);
    }

    deleteAlert(alertId, userId) {
        const db = getDb();
        return db.prepare('DELETE FROM alerts WHERE id = ? AND user_id = ?').run(alertId, userId);
    }

    getAlertHistory(userId, limit = 50) {
        const db = getDb();
        return db.prepare(`
      SELECT * FROM alert_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit);
    }
}

module.exports = new AlertService();
