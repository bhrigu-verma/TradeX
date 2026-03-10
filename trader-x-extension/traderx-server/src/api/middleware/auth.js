// src/api/middleware/auth.js
// API key auth for Chrome extension ↔ server sync

const { getDb } = require('../../db/setup');
const logger = require('../../config/logger');

function apiKeyAuth(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.api_key;

    if (!key) {
        return res.status(401).json({ error: 'API key required', hint: 'Pass X-API-Key header or ?api_key= param' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE api_key = ?').get(key);

    if (!user) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    // Update last seen
    db.prepare('UPDATE users SET last_seen = unixepoch() WHERE id = ?').run(user.id);
    req.user = user;
    next();
}

function optionalAuth(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.api_key;
    if (key) {
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE api_key = ?').get(key);
        if (user) req.user = user;
    }
    next();
}

module.exports = { apiKeyAuth, optionalAuth };
