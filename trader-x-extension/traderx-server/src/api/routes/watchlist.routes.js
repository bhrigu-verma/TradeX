// src/api/routes/watchlist.routes.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { apiKeyAuth } = require('../middleware/auth');

// GET /api/watchlist — Get user's watchlist
router.get('/', apiKeyAuth, (req, res) => {
    const db = getDb();
    const tickers = db.prepare('SELECT ticker, added_at FROM watchlist WHERE user_id = ? ORDER BY added_at DESC').all(req.user.id);
    res.json({ tickers, count: tickers.length });
});

// POST /api/watchlist — Add tickers
router.post('/', apiKeyAuth, (req, res) => {
    const db = getDb();
    const { tickers } = req.body;
    if (!Array.isArray(tickers)) return res.status(400).json({ error: 'tickers array required' });

    const added = [];
    for (const t of tickers.slice(0, 20)) {
        const ticker = t.toUpperCase().replace('$', '').trim();
        if (ticker.length < 1) continue;
        try {
            db.prepare('INSERT OR IGNORE INTO watchlist (user_id, ticker) VALUES (?, ?)').run(req.user.id, ticker);
            added.push(ticker);
        } catch { }
    }
    res.json({ added, count: added.length });
});

// DELETE /api/watchlist/:ticker — Remove ticker
router.delete('/:ticker', apiKeyAuth, (req, res) => {
    const db = getDb();
    const ticker = req.params.ticker.toUpperCase().replace('$', '');
    const result = db.prepare('DELETE FROM watchlist WHERE user_id = ? AND ticker = ?').run(req.user.id, ticker);
    res.json({ removed: result.changes > 0, ticker });
});

module.exports = router;
