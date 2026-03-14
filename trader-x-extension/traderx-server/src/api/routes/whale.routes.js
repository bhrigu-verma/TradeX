// src/api/routes/whale.routes.js
// ============================================================================
// Whale Tracker API — Large crypto transaction monitoring
// ============================================================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const logger = require('../../config/logger');

// ============================================================================
// GET /api/whale/transactions — Get whale transactions
// ============================================================================
router.get('/transactions', optionalAuth, (req, res) => {
    try {
        const { ticker, network, type, minUsd, limit = 50, offset = 0 } = req.query;
        const db = getDb();

        let query = 'SELECT * FROM whale_transactions WHERE 1=1';
        const params = [];

        if (ticker) {
            query += ' AND ticker = ?';
            params.push(ticker.toUpperCase());
        }
        if (network) {
            query += ' AND network = ?';
            params.push(network.toLowerCase());
        }
        if (type) {
            query += ' AND transaction_type = ?';
            params.push(type);
        }
        if (minUsd) {
            query += ' AND amount_usd >= ?';
            params.push(parseFloat(minUsd));
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(Math.min(parseInt(limit), 200), parseInt(offset));

        const transactions = db.prepare(query).all(...params);

        const total = db.prepare(
            'SELECT COUNT(*) as count FROM whale_transactions' +
            (ticker ? ' WHERE ticker = ?' : '')
        ).get(ticker ? ticker.toUpperCase() : undefined)?.count || 0;

        res.json({ transactions, total, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (e) {
        logger.error(`[Whale] Transactions query error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// GET /api/whale/flow — Exchange flow analysis for a ticker
// ============================================================================
router.get('/flow/:ticker', optionalAuth, (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const { timeframe = '24h' } = req.query;
        const db = getDb();

        const hours = timeframe === '1h' ? 1 : timeframe === '4h' ? 4 : timeframe === '7d' ? 168 : 24;
        const since = Math.floor(Date.now() / 1000) - (hours * 3600);

        const inflows = db.prepare(`
            SELECT COALESCE(SUM(amount_usd), 0) as total_usd, COUNT(*) as count
            FROM whale_transactions
            WHERE ticker = ? AND transaction_type = 'exchange_inflow' AND timestamp >= ?
        `).get(ticker, since);

        const outflows = db.prepare(`
            SELECT COALESCE(SUM(amount_usd), 0) as total_usd, COUNT(*) as count
            FROM whale_transactions
            WHERE ticker = ? AND transaction_type = 'exchange_outflow' AND timestamp >= ?
        `).get(ticker, since);

        const netFlow = outflows.total_usd - inflows.total_usd;
        const flowSentiment = netFlow > 0 ? 'bullish' : netFlow < 0 ? 'bearish' : 'neutral';

        const recentLarge = db.prepare(`
            SELECT * FROM whale_transactions
            WHERE ticker = ? AND timestamp >= ? AND amount_usd >= 100000
            ORDER BY amount_usd DESC LIMIT 10
        `).all(ticker, since);

        res.json({
            ticker,
            timeframe,
            inflows: { totalUsd: inflows.total_usd, count: inflows.count },
            outflows: { totalUsd: outflows.total_usd, count: outflows.count },
            netFlow,
            flowSentiment,
            recentLargeTransactions: recentLarge
        });
    } catch (e) {
        logger.error(`[Whale] Flow analysis error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// POST /api/whale/transactions — Ingest whale transactions (from extension/scraper)
// ============================================================================
router.post('/transactions', requireAuth, (req, res) => {
    try {
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ error: 'transactions array required' });
        }

        const db = getDb();
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO whale_transactions
            (hash, network, ticker, amount, amount_usd, from_address, to_address, transaction_type, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let inserted = 0;
        const insertMany = db.transaction((txns) => {
            for (const tx of txns) {
                const result = stmt.run(
                    tx.hash, tx.network || 'unknown', (tx.ticker || 'BTC').toUpperCase(),
                    tx.amount || 0, tx.amountUsd || 0,
                    tx.fromAddress || '', tx.toAddress || '',
                    tx.type || 'transfer',
                    tx.timestamp || Math.floor(Date.now() / 1000)
                );
                if (result.changes > 0) inserted++;
            }
        });

        insertMany(transactions.slice(0, 500)); // Max 500 per batch

        res.json({ success: true, inserted, total: transactions.length });
    } catch (e) {
        logger.error(`[Whale] Ingest error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// ============================================================================
// GET /api/whale/summary — Aggregate whale activity summary
// ============================================================================
router.get('/summary', optionalAuth, (req, res) => {
    try {
        const db = getDb();
        const since24h = Math.floor(Date.now() / 1000) - 86400;

        const summary = db.prepare(`
            SELECT ticker,
                   COUNT(*) as transaction_count,
                   COALESCE(SUM(amount_usd), 0) as total_volume_usd,
                   MAX(amount_usd) as largest_transaction_usd,
                   SUM(CASE WHEN transaction_type = 'exchange_inflow' THEN amount_usd ELSE 0 END) as inflow_usd,
                   SUM(CASE WHEN transaction_type = 'exchange_outflow' THEN amount_usd ELSE 0 END) as outflow_usd
            FROM whale_transactions
            WHERE timestamp >= ?
            GROUP BY ticker
            ORDER BY total_volume_usd DESC
            LIMIT 20
        `).all(since24h);

        res.json({ period: '24h', tickers: summary });
    } catch (e) {
        logger.error(`[Whale] Summary error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
