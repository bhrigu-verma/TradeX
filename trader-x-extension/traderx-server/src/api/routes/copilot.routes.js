// src/api/routes/copilot.routes.js
// ============================================================================
// AI Trading Copilot API — Trade idea generation and feedback
// ============================================================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const logger = require('../../config/logger');
const priceService = require('../../services/price.service');

// ============================================================================
// GET /api/copilot/ideas — Get AI trade ideas
// ============================================================================
router.get('/ideas', optionalAuth, (req, res) => {
    try {
        const { ticker, status = 'active', limit = 20, offset = 0 } = req.query;
        const db = getDb();

        let query = 'SELECT * FROM trade_ideas WHERE 1=1';
        const params = [];

        if (ticker) {
            query += ' AND ticker = ?';
            params.push(ticker.toUpperCase());
        }
        if (status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }
        if (req.userId) {
            query += ' AND (user_id = ? OR user_id IS NULL)';
            params.push(req.userId);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Math.min(parseInt(limit), 100), parseInt(offset));

        const ideas = db.prepare(query).all(...params);

        res.json({ ideas, count: ideas.length });
    } catch (e) {
        logger.error(`[Copilot] Ideas query error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// POST /api/copilot/ideas — Generate/store a new trade idea
// ============================================================================
router.post('/ideas', requireAuth, async (req, res) => {
    try {
        const { ticker, direction, confidence, entryPrice, stopLoss, targetPrice, reasoning } = req.body;

        if (!ticker || !direction || !confidence) {
            return res.status(400).json({ error: 'ticker, direction, and confidence are required' });
        }

        if (!['long', 'short'].includes(direction)) {
            return res.status(400).json({ error: 'direction must be long or short' });
        }

        if (confidence < 0 || confidence > 100) {
            return res.status(400).json({ error: 'confidence must be between 0 and 100' });
        }

        const db = getDb();

        // Calculate risk/reward if prices provided
        let riskReward = null;
        if (entryPrice && stopLoss && targetPrice) {
            const risk = Math.abs(entryPrice - stopLoss);
            const reward = Math.abs(targetPrice - entryPrice);
            riskReward = risk > 0 ? (reward / risk) : null;
        }

        const id = require('crypto').randomBytes(8).toString('hex');

        db.prepare(`
            INSERT INTO trade_ideas (id, user_id, ticker, direction, confidence, entry_price, stop_loss, target_price, risk_reward, reasoning)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, req.userId, ticker.toUpperCase(), direction, confidence,
            entryPrice || null, stopLoss || null, targetPrice || null,
            riskReward, reasoning || null
        );

        const idea = db.prepare('SELECT * FROM trade_ideas WHERE id = ?').get(id);

        logger.info(`[Copilot] New trade idea: ${ticker} ${direction} (conf: ${confidence}%)`);

        res.status(201).json({ success: true, idea });
    } catch (e) {
        logger.error(`[Copilot] Create idea error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// POST /api/copilot/feedback — Submit trade outcome/feedback
// ============================================================================
router.post('/feedback', requireAuth, (req, res) => {
    try {
        const { ideaId, outcome, actualPnl, notes } = req.body;

        if (!ideaId || !outcome) {
            return res.status(400).json({ error: 'ideaId and outcome are required' });
        }

        if (!['win', 'loss', 'breakeven', 'skipped'].includes(outcome)) {
            return res.status(400).json({ error: 'outcome must be win, loss, breakeven, or skipped' });
        }

        const db = getDb();
        const idea = db.prepare('SELECT * FROM trade_ideas WHERE id = ?').get(ideaId);

        if (!idea) {
            return res.status(404).json({ error: 'Trade idea not found' });
        }

        db.prepare(`
            UPDATE trade_ideas SET
                status = 'closed', outcome = ?, actual_pnl = ?, closed_at = unixepoch()
            WHERE id = ?
        `).run(outcome, actualPnl || null, ideaId);

        logger.info(`[Copilot] Feedback recorded: ${ideaId} → ${outcome}`);

        res.json({ success: true, message: 'Feedback recorded' });
    } catch (e) {
        logger.error(`[Copilot] Feedback error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// GET /api/copilot/performance — Performance metrics for trade ideas
// ============================================================================
router.get('/performance', optionalAuth, (req, res) => {
    try {
        const db = getDb();
        const userId = req.userId;

        let whereClause = "WHERE status = 'closed' AND outcome IS NOT NULL";
        const params = [];

        if (userId) {
            whereClause += ' AND user_id = ?';
            params.push(userId);
        }

        const total = db.prepare(`SELECT COUNT(*) as count FROM trade_ideas ${whereClause}`).get(...params);
        const wins = db.prepare(`SELECT COUNT(*) as count FROM trade_ideas ${whereClause} AND outcome = 'win'`).get(...params);
        const losses = db.prepare(`SELECT COUNT(*) as count FROM trade_ideas ${whereClause} AND outcome = 'loss'`).get(...params);
        const avgPnl = db.prepare(`SELECT AVG(actual_pnl) as avg FROM trade_ideas ${whereClause} AND actual_pnl IS NOT NULL`).get(...params);
        const totalPnl = db.prepare(`SELECT SUM(actual_pnl) as total FROM trade_ideas ${whereClause} AND actual_pnl IS NOT NULL`).get(...params);

        const byTicker = db.prepare(`
            SELECT ticker, COUNT(*) as total,
                   SUM(CASE WHEN outcome = 'win' THEN 1 ELSE 0 END) as wins,
                   AVG(actual_pnl) as avg_pnl
            FROM trade_ideas ${whereClause}
            GROUP BY ticker ORDER BY total DESC LIMIT 10
        `).all(...params);

        const winRate = total.count > 0 ? ((wins.count / total.count) * 100).toFixed(1) : 0;
        const profitFactor = losses.count > 0 ? (wins.count / losses.count).toFixed(2) : 'N/A';

        res.json({
            totalTrades: total.count,
            wins: wins.count,
            losses: losses.count,
            winRate: parseFloat(winRate),
            profitFactor,
            avgPnl: avgPnl.avg || 0,
            totalPnl: totalPnl.total || 0,
            byTicker
        });
    } catch (e) {
        logger.error(`[Copilot] Performance error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// GET /api/copilot/generate/:ticker — Auto-generate trade idea from signals
// ============================================================================
router.get('/generate/:ticker', requireAuth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const db = getDb();

        // Get latest sentiment
        const sentiment = db.prepare(`
            SELECT * FROM sentiment_snapshots WHERE ticker = ?
            ORDER BY created_at DESC LIMIT 1
        `).get(ticker);

        // Get current price
        const priceData = await priceService.getPrice(ticker);

        if (!sentiment || !priceData?.price) {
            return res.status(404).json({ error: 'Insufficient data for trade idea generation' });
        }

        // Simple AI scoring logic
        const sentimentScore = sentiment.sentiment;
        const volumeBonus = sentiment.volume_spike ? 10 : 0;
        const confidenceBonus = sentiment.confidence === 'high' ? 15 : sentiment.confidence === 'medium' ? 5 : 0;

        const baseConfidence = Math.min(95, Math.round(
            Math.abs(sentimentScore) * 60 + volumeBonus + confidenceBonus + 20
        ));

        if (baseConfidence < 65) {
            return res.json({ idea: null, reason: 'Confidence below threshold (65%)' });
        }

        const direction = sentimentScore > 0 ? 'long' : 'short';
        const price = priceData.price;

        // Calculate levels
        const riskPercent = 0.03; // 3% stop
        const rewardMultiple = 2.5; // 2.5:1 R:R

        const stopLoss = direction === 'long'
            ? price * (1 - riskPercent)
            : price * (1 + riskPercent);

        const targetPrice = direction === 'long'
            ? price * (1 + riskPercent * rewardMultiple)
            : price * (1 - riskPercent * rewardMultiple);

        const idea = {
            ticker,
            direction,
            confidence: baseConfidence,
            entryPrice: price,
            stopLoss: parseFloat(stopLoss.toFixed(2)),
            targetPrice: parseFloat(targetPrice.toFixed(2)),
            riskReward: rewardMultiple,
            reasoning: `${sentiment.status} sentiment (${(sentimentScore * 100).toFixed(0)}%) with ${sentiment.sample_size} samples. ` +
                `${sentiment.volume_spike ? 'Volume spike detected. ' : ''}` +
                `Price: $${price.toFixed(2)} (${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h?.toFixed(1)}% 24h).`
        };

        res.json({ idea });
    } catch (e) {
        logger.error(`[Copilot] Generate error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
