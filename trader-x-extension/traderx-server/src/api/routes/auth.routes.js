// src/api/routes/auth.routes.js
// ============================================================================
// Authentication & Authorization — JWT-based auth with refresh tokens
// ============================================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDb } = require('../../db/setup');
const config = require('../../config/env');
const logger = require('../../config/logger');
const { requireAuth } = require('../middleware/auth');

const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY_DAYS = 30;

// ============================================================================
// Helper: Generate tokens
// ============================================================================
function generateAccessToken(user) {
    return jwt.sign(
        { userId: user.id, email: user.email, tier: user.tier },
        config.JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

function generateApiKey() {
    return 'traderx_' + crypto.randomBytes(20).toString('hex');
}

// ============================================================================
// POST /api/auth/register — User registration
// ============================================================================
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const db = getDb();

        // Check if email already exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const apiKey = generateApiKey();
        const userId = crypto.randomBytes(8).toString('hex');

        db.prepare(`
            INSERT INTO users (id, email, api_key, username, tier, settings)
            VALUES (?, ?, ?, ?, 'free', ?)
        `).run(userId, email.toLowerCase(), apiKey, username || email.split('@')[0], JSON.stringify({ password: hashedPassword }));

        // Create subscription record
        db.prepare(`
            INSERT INTO subscriptions (user_id, tier, status) VALUES (?, 'free', 'active')
        `).run(userId);

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        const refreshExpiry = Math.floor(Date.now() / 1000) + (REFRESH_EXPIRY_DAYS * 86400);

        db.prepare(`
            INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)
        `).run(userId, refreshToken, refreshExpiry);

        logger.info(`[Auth] New user registered: ${email}`);

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                tier: user.tier,
                apiKey
            },
            accessToken,
            refreshToken
        });
    } catch (e) {
        logger.error(`[Auth] Registration error: ${e.message}`);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// ============================================================================
// POST /api/auth/login — User authentication
// ============================================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const settings = JSON.parse(user.settings || '{}');
        if (!settings.password) {
            return res.status(401).json({ error: 'Account was created via Telegram/Discord. Please set a password first.' });
        }

        const passwordValid = await bcrypt.compare(password, settings.password);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        const refreshExpiry = Math.floor(Date.now() / 1000) + (REFRESH_EXPIRY_DAYS * 86400);

        // Store refresh token
        db.prepare(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`).run(user.id, refreshToken, refreshExpiry);

        // Update last seen
        db.prepare('UPDATE users SET last_seen = unixepoch() WHERE id = ?').run(user.id);

        logger.info(`[Auth] User logged in: ${email}`);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                tier: user.tier
            },
            accessToken,
            refreshToken
        });
    } catch (e) {
        logger.error(`[Auth] Login error: ${e.message}`);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ============================================================================
// POST /api/auth/refresh — Refresh access token
// ============================================================================
router.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const db = getDb();
        const tokenRecord = db.prepare(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > ?'
        ).get(refreshToken, Math.floor(Date.now() / 1000));

        if (!tokenRecord) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(tokenRecord.user_id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Rotate refresh token
        const newRefreshToken = generateRefreshToken();
        const newExpiry = Math.floor(Date.now() / 1000) + (REFRESH_EXPIRY_DAYS * 86400);

        db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
        db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, newRefreshToken, newExpiry);

        const accessToken = generateAccessToken(user);

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (e) {
        logger.error(`[Auth] Token refresh error: ${e.message}`);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// ============================================================================
// POST /api/auth/logout — Session termination
// ============================================================================
router.post('/logout', (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            const db = getDb();
            db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// ============================================================================
// GET /api/auth/me — Get current user info
// ============================================================================
router.get('/me', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const user = db.prepare('SELECT id, email, username, tier, created_at, last_seen FROM users WHERE id = ?').get(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id);

        res.json({
            user: {
                ...user,
                subscription: subscription ? {
                    tier: subscription.tier,
                    status: subscription.status,
                    billingPeriod: subscription.billing_period,
                    trialActive: !!subscription.trial_active,
                    trialEndsAt: subscription.trial_ends_at,
                    currentPeriodEnd: subscription.current_period_end,
                    cancelAtPeriodEnd: !!subscription.cancel_at_period_end
                } : null
            }
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

module.exports = router;
