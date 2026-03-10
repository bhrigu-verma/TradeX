// src/api/routes/portfolio.routes.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { apiKeyAuth } = require('../middleware/auth');
const priceService = require('../../services/price.service');

// GET /api/portfolio — Get all positions with live P&L
router.get('/', apiKeyAuth, async (req, res) => {
    try {
        const db = getDb();
        const positions = db.prepare("SELECT * FROM positions WHERE user_id = ? ORDER BY opened_at DESC").all(req.user.id);
        const open = positions.filter(p => !p.closed_at);

        let totalPnL = 0, totalCost = 0;
        const enriched = [];

        for (const pos of open) {
            const priceData = await priceService.getPrice(pos.ticker);
            const currentPrice = priceData?.price;

            let pnl = 0, pnlPct = 0;
            if (currentPrice) {
                if (pos.side === 'long') {
                    pnl = (currentPrice - pos.entry_price) * pos.quantity;
                    pnlPct = ((currentPrice - pos.entry_price) / pos.entry_price) * 100;
                } else {
                    pnl = (pos.entry_price - currentPrice) * pos.quantity;
                    pnlPct = ((pos.entry_price - currentPrice) / pos.entry_price) * 100;
                }
            }

            const cost = pos.entry_price * pos.quantity;
            totalPnL += pnl;
            totalCost += cost;

            enriched.push({ ...pos, currentPrice, cost, pnl, pnlPct, priceData });
        }

        res.json({
            positions: enriched,
            closed: positions.filter(p => p.closed_at),
            summary: {
                totalPositions: open.length,
                totalCost,
                totalPnL,
                totalPnLPct: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/portfolio — Add position
router.post('/', apiKeyAuth, (req, res) => {
    try {
        const db = getDb();
        const { ticker, entryPrice, quantity, side = 'long', notes = '' } = req.body;

        if (!ticker || !entryPrice || !quantity) return res.status(400).json({ error: 'ticker, entryPrice, quantity required' });

        const result = db.prepare(`
      INSERT INTO positions (user_id, ticker, side, entry_price, quantity, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, ticker.toUpperCase(), side, parseFloat(entryPrice), parseFloat(quantity), notes);

        const position = db.prepare('SELECT * FROM positions WHERE rowid = ?').get(result.lastInsertRowid);
        res.status(201).json({ position });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /api/portfolio/:id/close — Close position
router.patch('/:id/close', apiKeyAuth, (req, res) => {
    try {
        const db = getDb();
        const { closePrice } = req.body;
        if (!closePrice) return res.status(400).json({ error: 'closePrice required' });

        const result = db.prepare(`
      UPDATE positions SET closed_at = unixepoch(), close_price = ?
      WHERE id = ? AND user_id = ?
    `).run(parseFloat(closePrice), req.params.id, req.user.id);

        res.json({ updated: result.changes > 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/portfolio/:id — Remove position
router.delete('/:id', apiKeyAuth, (req, res) => {
    const db = getDb();
    const result = db.prepare('DELETE FROM positions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ deleted: result.changes > 0 });
});

module.exports = router;
