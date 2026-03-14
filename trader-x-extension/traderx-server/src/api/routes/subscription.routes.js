// src/api/routes/subscription.routes.js
// ============================================================================
// Stripe Subscription Management — Checkout, cancel, validate, webhooks
// ============================================================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const config = require('../../config/env');
const logger = require('../../config/logger');
const { requireAuth } = require('../middleware/auth');

// Lazy-init Stripe (only if key is configured)
let stripe = null;
function getStripe() {
    if (!stripe && config.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(config.STRIPE_SECRET_KEY);
    }
    return stripe;
}

// ============================================================================
// Price ID mapping
// ============================================================================
function getPriceId(tier, period) {
    const map = {
        'pro_monthly': config.STRIPE_PRO_MONTHLY_PRICE_ID,
        'pro_yearly': config.STRIPE_PRO_YEARLY_PRICE_ID,
        'enterprise_monthly': config.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
        'enterprise_yearly': config.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    };
    return map[`${tier}_${period}`] || null;
}

// ============================================================================
// POST /api/subscriptions/create-checkout — Create Stripe checkout session
// ============================================================================
router.post('/create-checkout', requireAuth, async (req, res) => {
    try {
        const stripeClient = getStripe();
        if (!stripeClient) {
            return res.status(503).json({ error: 'Payment system not configured' });
        }

        const { tier, billingPeriod = 'monthly' } = req.body;

        if (!['pro', 'enterprise'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier. Must be pro or enterprise.' });
        }

        const priceId = getPriceId(tier, billingPeriod);
        if (!priceId) {
            return res.status(400).json({ error: 'Invalid billing configuration' });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
        let sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);

        // Create or get Stripe customer
        let customerId = sub?.stripe_customer_id;
        if (!customerId) {
            const customer = await stripeClient.customers.create({
                email: user.email,
                metadata: { userId: user.id, username: user.username || '' }
            });
            customerId = customer.id;

            if (sub) {
                db.prepare('UPDATE subscriptions SET stripe_customer_id = ? WHERE user_id = ?').run(customerId, req.userId);
            } else {
                db.prepare(`
                    INSERT INTO subscriptions (user_id, stripe_customer_id, tier, status)
                    VALUES (?, ?, 'free', 'active')
                `).run(req.userId, customerId);
            }
        }

        const sessionParams = {
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${config.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.FRONTEND_URL}/subscription/cancel`,
            metadata: { userId: req.userId, tier, billingPeriod },
            allow_promotion_codes: true
        };

        // Add trial period for Pro tier (7 days)
        if (tier === 'pro' && !sub?.trial_ends_at) {
            sessionParams.subscription_data = { trial_period_days: 7 };
        }

        const session = await stripeClient.checkout.sessions.create(sessionParams);

        logger.info(`[Stripe] Checkout session created for user ${req.userId}: ${tier}/${billingPeriod}`);

        res.json({ url: session.url, sessionId: session.id });
    } catch (e) {
        logger.error(`[Stripe] Checkout error: ${e.message}`);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// ============================================================================
// POST /api/subscriptions/cancel — Cancel subscription
// ============================================================================
router.post('/cancel', requireAuth, async (req, res) => {
    try {
        const stripeClient = getStripe();
        if (!stripeClient) {
            return res.status(503).json({ error: 'Payment system not configured' });
        }

        const db = getDb();
        const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);

        if (!sub?.stripe_subscription_id) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        // Cancel at period end (user retains access until billing period ends)
        await stripeClient.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: true
        });

        db.prepare('UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = unixepoch() WHERE user_id = ?').run(req.userId);

        logger.info(`[Stripe] Subscription cancellation scheduled for user ${req.userId}`);

        res.json({ success: true, message: 'Subscription will cancel at end of billing period' });
    } catch (e) {
        logger.error(`[Stripe] Cancel error: ${e.message}`);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// ============================================================================
// POST /api/subscriptions/reactivate — Reactivate cancelled subscription
// ============================================================================
router.post('/reactivate', requireAuth, async (req, res) => {
    try {
        const stripeClient = getStripe();
        if (!stripeClient) {
            return res.status(503).json({ error: 'Payment system not configured' });
        }

        const db = getDb();
        const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);

        if (!sub?.stripe_subscription_id) {
            return res.status(400).json({ error: 'No subscription found' });
        }

        await stripeClient.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: false
        });

        db.prepare('UPDATE subscriptions SET cancel_at_period_end = 0, updated_at = unixepoch() WHERE user_id = ?').run(req.userId);

        res.json({ success: true, message: 'Subscription reactivated' });
    } catch (e) {
        logger.error(`[Stripe] Reactivate error: ${e.message}`);
        res.status(500).json({ error: 'Failed to reactivate subscription' });
    }
});

// ============================================================================
// GET /api/subscriptions/validate — Validate current subscription
// ============================================================================
router.get('/validate', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);

        if (!sub) {
            return res.json({ valid: true, tier: 'free', features: getFeaturesForTier('free') });
        }

        const now = Math.floor(Date.now() / 1000);
        let effectiveTier = sub.tier;

        // Check if subscription has expired
        if (sub.current_period_end && sub.current_period_end < now && sub.status !== 'active') {
            effectiveTier = 'free';
        }

        // Check if trial has expired
        if (sub.trial_active && sub.trial_ends_at && sub.trial_ends_at < now) {
            effectiveTier = 'free';
            db.prepare('UPDATE subscriptions SET trial_active = 0, tier = ? WHERE user_id = ?').run('free', req.userId);
            db.prepare('UPDATE users SET tier = ? WHERE id = ?').run('free', req.userId);
        }

        res.json({
            valid: true,
            tier: effectiveTier,
            status: sub.status,
            trialActive: !!sub.trial_active,
            trialEndsAt: sub.trial_ends_at,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: !!sub.cancel_at_period_end,
            features: getFeaturesForTier(effectiveTier)
        });
    } catch (e) {
        logger.error(`[Stripe] Validate error: ${e.message}`);
        res.status(500).json({ error: 'Validation failed' });
    }
});

// ============================================================================
// POST /api/subscriptions/activate — Activate via license key
// ============================================================================
router.post('/activate', requireAuth, (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ error: 'License key required' });
        }

        // Simple license key format: TRADERX-PRO-XXXX-XXXX or TRADERX-ENT-XXXX-XXXX
        const proMatch = licenseKey.match(/^TRADERX-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
        const entMatch = licenseKey.match(/^TRADERX-ENT-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

        let tier = null;
        if (proMatch) tier = 'pro';
        else if (entMatch) tier = 'enterprise';
        else return res.status(400).json({ error: 'Invalid license key format' });

        const db = getDb();

        db.prepare(`
            INSERT INTO subscriptions (user_id, tier, status) VALUES (?, ?, 'active')
            ON CONFLICT(user_id) DO UPDATE SET tier = ?, status = 'active', updated_at = unixepoch()
        `).run(req.userId, tier, tier);

        db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, req.userId);

        logger.info(`[License] Activated ${tier} for user ${req.userId}`);

        res.json({ success: true, tier, features: getFeaturesForTier(tier) });
    } catch (e) {
        logger.error(`[License] Activation error: ${e.message}`);
        res.status(500).json({ error: 'Activation failed' });
    }
});

// ============================================================================
// POST /api/subscriptions/update-payment — Create Stripe billing portal session
// ============================================================================
router.post('/update-payment', requireAuth, async (req, res) => {
    try {
        const stripeClient = getStripe();
        if (!stripeClient) {
            return res.status(503).json({ error: 'Payment system not configured' });
        }

        const db = getDb();
        const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(req.userId);

        if (!sub?.stripe_customer_id) {
            return res.status(400).json({ error: 'No billing account found' });
        }

        const session = await stripeClient.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${config.FRONTEND_URL}/settings`
        });

        res.json({ url: session.url });
    } catch (e) {
        logger.error(`[Stripe] Billing portal error: ${e.message}`);
        res.status(500).json({ error: 'Failed to create billing portal session' });
    }
});

// ============================================================================
// POST /api/analytics/track — Track events
// ============================================================================
router.post('/track', (req, res) => {
    try {
        const { event, properties, userId } = req.body;

        if (!event) {
            return res.status(400).json({ error: 'Event name required' });
        }

        const db = getDb();
        db.prepare(`
            INSERT INTO analytics_events (user_id, event_name, properties)
            VALUES (?, ?, ?)
        `).run(userId || null, event, JSON.stringify(properties || {}));

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Tracking failed' });
    }
});

// ============================================================================
// Feature definitions per tier
// ============================================================================
function getFeaturesForTier(tier) {
    const features = {
        free: {
            maxTickers: 5,
            searchesPerMonth: 10,
            aiCopilot: false,
            whaleTracker: false,
            portfolioTracker: false,
            sectorHeatmap: false,
            advancedSearch: false,
            exportData: false,
            customAlerts: 3,
            apiAccess: false,
            webhooks: false
        },
        pro: {
            maxTickers: 50,
            searchesPerMonth: -1, // unlimited
            aiCopilot: true,
            whaleTracker: true,
            portfolioTracker: true,
            sectorHeatmap: true,
            advancedSearch: true,
            exportData: true,
            customAlerts: 50,
            apiAccess: false,
            webhooks: false
        },
        enterprise: {
            maxTickers: -1, // unlimited
            searchesPerMonth: -1,
            aiCopilot: true,
            whaleTracker: true,
            portfolioTracker: true,
            sectorHeatmap: true,
            advancedSearch: true,
            exportData: true,
            customAlerts: -1,
            apiAccess: true,
            webhooks: true
        }
    };

    return features[tier] || features.free;
}

module.exports = router;
module.exports.getFeaturesForTier = getFeaturesForTier;
