// src/api/routes/webhook.routes.js
// ============================================================================
// Stripe Webhook Handler — Process subscription lifecycle events
// ============================================================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const config = require('../../config/env');
const logger = require('../../config/logger');

// ============================================================================
// POST /webhooks/stripe — Stripe webhook endpoint
// Note: Raw body is needed for signature verification
// ============================================================================
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!config.STRIPE_SECRET_KEY || !config.STRIPE_WEBHOOK_SECRET) {
        return res.status(503).json({ error: 'Stripe not configured' });
    }

    const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        logger.error(`[Webhook] Signature verification failed: ${err.message}`);
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const db = getDb();

    try {
        switch (event.type) {
            // ============================================
            // Checkout completed — new subscription
            // ============================================
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.userId;
                const tier = session.metadata?.tier || 'pro';

                if (userId && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);

                    db.prepare(`
                        UPDATE subscriptions SET
                            stripe_subscription_id = ?,
                            tier = ?,
                            status = 'active',
                            trial_active = ?,
                            trial_ends_at = ?,
                            current_period_start = ?,
                            current_period_end = ?,
                            updated_at = unixepoch()
                        WHERE user_id = ?
                    `).run(
                        session.subscription,
                        tier,
                        subscription.status === 'trialing' ? 1 : 0,
                        subscription.trial_end || null,
                        subscription.current_period_start,
                        subscription.current_period_end,
                        userId
                    );

                    db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, userId);

                    logger.info(`[Webhook] Checkout completed: user ${userId} → ${tier}`);
                }
                break;
            }

            // ============================================
            // Subscription updated
            // ============================================
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?').get(subscription.id);

                if (sub) {
                    const isActive = ['active', 'trialing'].includes(subscription.status);

                    db.prepare(`
                        UPDATE subscriptions SET
                            status = ?,
                            trial_active = ?,
                            trial_ends_at = ?,
                            current_period_start = ?,
                            current_period_end = ?,
                            cancel_at_period_end = ?,
                            updated_at = unixepoch()
                        WHERE stripe_subscription_id = ?
                    `).run(
                        subscription.status,
                        subscription.status === 'trialing' ? 1 : 0,
                        subscription.trial_end || null,
                        subscription.current_period_start,
                        subscription.current_period_end,
                        subscription.cancel_at_period_end ? 1 : 0,
                        subscription.id
                    );

                    if (!isActive) {
                        db.prepare('UPDATE users SET tier = ? WHERE id = ?').run('free', sub.user_id);
                        db.prepare('UPDATE subscriptions SET tier = ? WHERE user_id = ?').run('free', sub.user_id);
                    }

                    logger.info(`[Webhook] Subscription updated: ${subscription.id} → ${subscription.status}`);
                }
                break;
            }

            // ============================================
            // Subscription deleted/cancelled
            // ============================================
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?').get(subscription.id);

                if (sub) {
                    db.prepare(`
                        UPDATE subscriptions SET
                            tier = 'free', status = 'cancelled',
                            cancel_at_period_end = 0, updated_at = unixepoch()
                        WHERE stripe_subscription_id = ?
                    `).run(subscription.id);

                    db.prepare('UPDATE users SET tier = ? WHERE id = ?').run('free', sub.user_id);

                    logger.info(`[Webhook] Subscription deleted: ${subscription.id} → free`);
                }
                break;
            }

            // ============================================
            // Invoice payment succeeded
            // ============================================
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                logger.info(`[Webhook] Payment succeeded: ${invoice.id} — $${(invoice.amount_paid / 100).toFixed(2)}`);
                break;
            }

            // ============================================
            // Invoice payment failed
            // ============================================
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_customer_id = ?').get(invoice.customer);

                if (sub) {
                    db.prepare(`
                        UPDATE subscriptions SET status = 'past_due', updated_at = unixepoch()
                        WHERE user_id = ?
                    `).run(sub.user_id);

                    logger.warn(`[Webhook] Payment failed for user ${sub.user_id}: ${invoice.id}`);
                }
                break;
            }

            // ============================================
            // Customer deleted
            // ============================================
            case 'customer.deleted': {
                const customer = event.data.object;
                const sub = db.prepare('SELECT * FROM subscriptions WHERE stripe_customer_id = ?').get(customer.id);

                if (sub) {
                    db.prepare(`
                        UPDATE subscriptions SET
                            tier = 'free', status = 'cancelled',
                            stripe_customer_id = NULL, stripe_subscription_id = NULL,
                            updated_at = unixepoch()
                        WHERE stripe_customer_id = ?
                    `).run(customer.id);

                    db.prepare('UPDATE users SET tier = ? WHERE id = ?').run('free', sub.user_id);

                    logger.info(`[Webhook] Customer deleted: ${customer.id}`);
                }
                break;
            }

            default:
                logger.debug(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (e) {
        logger.error(`[Webhook] Processing error: ${e.message}`);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
