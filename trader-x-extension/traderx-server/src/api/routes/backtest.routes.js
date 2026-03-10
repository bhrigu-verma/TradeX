// src/api/routes/backtest.routes.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { optionalAuth } = require('../middleware/auth');

// GET /api/backtest/:ticker — Accuracy stats for a ticker
router.get('/:ticker', optionalAuth, (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase().replace('$', '');
        const db = getDb();

        const results = db.prepare(`
      SELECT signal_type,
             COUNT(*) as total,
             SUM(correct_1h) as correct_1h,
             SUM(correct_4h) as correct_4h,
             AVG(CASE WHEN correct_1h IS NOT NULL THEN correct_1h END) as acc_1h,
             AVG(CASE WHEN correct_4h IS NOT NULL THEN correct_4h END) as acc_4h
      FROM backtest_results
      WHERE ticker = ? AND price_at_signal IS NOT NULL
      GROUP BY signal_type
    `).all(ticker);

        const overall = db.prepare(`
      SELECT COUNT(*) as total,
             AVG(CASE WHEN correct_1h IS NOT NULL THEN correct_1h END) as overall_acc_1h,
             AVG(CASE WHEN correct_4h IS NOT NULL THEN correct_4h END) as overall_acc_4h
      FROM backtest_results WHERE ticker = ?
    `).get(ticker);

        res.json({ ticker, signalBreakdown: results, overall });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/backtest/leaderboard — Top performing signal types across all tickers
router.get('/leaderboard', optionalAuth, (req, res) => {
    try {
        const db = getDb();
        const results = db.prepare(`
      SELECT ticker, signal_type, COUNT(*) as total,
             AVG(CASE WHEN correct_1h IS NOT NULL THEN correct_1h END) as acc_1h,
             AVG(CASE WHEN correct_4h IS NOT NULL THEN correct_4h END) as acc_4h
      FROM backtest_results
      WHERE price_at_signal IS NOT NULL
      GROUP BY ticker, signal_type
      HAVING total >= 5
      ORDER BY acc_4h DESC
      LIMIT 20
    `).all();

        res.json({ leaderboard: results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
