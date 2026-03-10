// src/api/routes/sentiment.routes.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { analyzeTweets } = require('../../services/sentiment.service');
const twitterService = require('../../services/twitter.service');
const priceService = require('../../services/price.service');
const { apiKeyAuth, optionalAuth } = require('../middleware/auth');

// GET /api/sentiment/:ticker — Get latest snapshot + live fetch
router.get('/:ticker', optionalAuth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase().replace('$', '');
        const db = getDb();

        // Check if we have a fresh snapshot (< 60s old)
        const recent = db.prepare(`
      SELECT * FROM sentiment_snapshots
      WHERE ticker = ? AND created_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).get(ticker, Math.floor(Date.now() / 1000) - 60);

        if (recent && req.query.cached !== 'false') {
            const priceData = db.prepare('SELECT * FROM price_cache WHERE ticker = ?').get(ticker);
            return res.json({
                ticker, cached: true,
                analysis: {
                    sentiment: recent.sentiment, status: recent.status,
                    sampleSize: recent.sample_size, confidence: recent.confidence,
                    breakdown: { bullish: recent.bullish_count, bearish: recent.bearish_count, neutral: recent.neutral_count },
                    volumeSpike: !!recent.volume_spike, spikeIntensity: recent.spike_intensity
                },
                price: priceData ? { price: priceData.price, change24h: priceData.change_24h } : null
            });
        }

        // Live fetch
        const [fetchResult, priceData] = await Promise.all([
            twitterService.fetchTickerTweets(ticker),
            priceService.getPrice(ticker)
        ]);

        const analysis = analyzeTweets(fetchResult.tweets || [], new Map(), []);

        // Save snapshot
        db.prepare(`
      INSERT INTO sentiment_snapshots (ticker, sentiment, status, sample_size, confidence, bullish_count, bearish_count, neutral_count, volume_spike, spike_intensity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ticker, analysis.sentiment, analysis.status, analysis.sampleSize, analysis.confidence,
            analysis.breakdown?.bullish || 0, analysis.breakdown?.bearish || 0, analysis.breakdown?.neutral || 0,
            analysis.volumeSpike ? 1 : 0, analysis.spikeIntensity || 0);

        res.json({ ticker, cached: false, analysis, price: priceData, source: fetchResult.source });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/sentiment/:ticker/history — Historical sentiment snapshots
router.get('/:ticker/history', optionalAuth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase().replace('$', '');
        const hours = Math.min(parseInt(req.query.hours || '24'), 168); // Max 7 days
        const db = getDb();

        const snapshots = db.prepare(`
      SELECT sentiment, status, sample_size, confidence, volume_spike, spike_intensity, created_at
      FROM sentiment_snapshots
      WHERE ticker = ? AND created_at > ?
      ORDER BY created_at ASC
    `).all(ticker, Math.floor(Date.now() / 1000) - hours * 3600);

        res.json({ ticker, hours, snapshots, count: snapshots.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/sentiment/multi — Batch sentiment for multiple tickers
router.post('/multi', optionalAuth, async (req, res) => {
    try {
        const { tickers } = req.body;
        if (!Array.isArray(tickers) || tickers.length === 0) {
            return res.status(400).json({ error: 'tickers array required' });
        }

        const db = getDb();
        const results = {};

        for (const rawTicker of tickers.slice(0, 10)) {
            const ticker = rawTicker.toUpperCase().replace('$', '');
            const recent = db.prepare(`
        SELECT * FROM sentiment_snapshots WHERE ticker = ?
        ORDER BY created_at DESC LIMIT 1
      `).get(ticker);

            if (recent) {
                results[ticker] = {
                    sentiment: recent.sentiment, status: recent.status,
                    sampleSize: recent.sample_size, confidence: recent.confidence,
                    updatedAt: recent.created_at
                };
            } else {
                results[ticker] = { status: 'NO DATA', sentiment: 0, confidence: 'low' };
            }
        }

        res.json({ results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
