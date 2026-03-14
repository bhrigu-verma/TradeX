// src/index.js
// ============================================================================
// TRADERX ENTERPRISE SERVER — Main Entry Point
// ============================================================================
// REST API + Telegram Bot + Background Scheduler
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/env');
const logger = require('./config/logger');
const { getDb } = require('./db/setup');
const { createBot, sendAlertToUser } = require('./delivery/telegram.bot');
const { startDiscordBot, sendDiscordAlert } = require('./delivery/discord.bot');
const { startScheduler, injectBot } = require('./jobs/scheduler');

// Routes
const sentimentRoutes = require('./api/routes/sentiment.routes');
const watchlistRoutes = require('./api/routes/watchlist.routes');
const portfolioRoutes = require('./api/routes/portfolio.routes');
const alertsRoutes = require('./api/routes/alerts.routes');
const backtestRoutes = require('./api/routes/backtest.routes');
const syncRoutes = require('./api/routes/sync.routes');
const authRoutes = require('./api/routes/auth.routes');
const subscriptionRoutes = require('./api/routes/subscription.routes');
const webhookRoutes = require('./api/routes/webhook.routes');
const whaleRoutes = require('./api/routes/whale.routes');
const copilotRoutes = require('./api/routes/copilot.routes');

// ============================================================================
// EXPRESS APP
// ============================================================================

const app = express();

// Security & compression
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3001',
    config.FRONTEND_URL
].filter(Boolean));

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser and server-to-server calls.
        if (!origin) return callback(null, true);

        // Allow all extension origins (Chrome generates unique extension IDs).
        if (origin.startsWith('chrome-extension://')) {
            return callback(null, true);
        }

        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

// Logging
if (config.isDev) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) }
    }));
}

// ============================================================================
// WEBHOOK ROUTES (must be before body parsing for raw body access)
// ============================================================================

// Stripe webhooks need raw body — mounted before json parsing
app.use('/webhooks', webhookRoutes);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Serve static web dashboard
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard/dist')));

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/backtest', backtestRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/whale', whaleRoutes);
app.use('/api/copilot', copilotRoutes);

// ============================================================================
// HEALTH & INFO ENDPOINTS
// ============================================================================

app.get('/', (req, res) => {
    const db = getDb();
    const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get()?.n || 0;
    const tickerCount = db.prepare('SELECT COUNT(DISTINCT ticker) as n FROM watchlist').get()?.n || 0;

    res.json({
        name: 'TraderX Enterprise Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        stats: { users: userCount, trackedTickers: tickerCount },
        features: config.features,
        endpoints: {
            sentiment: '/api/sentiment/:ticker',
            history: '/api/sentiment/:ticker/history',
            watchlist: '/api/watchlist',
            portfolio: '/api/portfolio',
            alerts: '/api/alerts',
            backtest: '/api/backtest/:ticker',
            health: '/health',
            dashboard: '/dashboard'
        }
    });
});

app.get('/health', (req, res) => {
    try {
        const db = getDb();
        db.prepare('SELECT 1').get();
        res.json({ status: 'healthy', db: 'ok', timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(503).json({ status: 'unhealthy', db: 'error', error: e.message });
    }
});

// ============================================================================
// TELEGRAM WEBHOOK (for production)
// ============================================================================

let bot = null;

app.post('/webhook/telegram', express.json(), (req, res) => {
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (config.TELEGRAM_WEBHOOK_SECRET && secret !== config.TELEGRAM_WEBHOOK_SECRET) {
        logger.warn('[Webhook] Rejected Telegram update — invalid secret token');
        return res.sendStatus(403);
    }
    if (bot && config.TELEGRAM_WEBHOOK_URL) {
        bot.handleUpdate(req.body);
    }
    res.sendStatus(200);
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path, hint: 'Check /api routes' });
});

app.use((err, req, res, next) => {
    logger.error(`[Server] Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: config.isDev ? err.message : 'An error occurred' });
});

// ============================================================================
// STARTUP
// ============================================================================

async function start() {
    logger.info('='.repeat(60));
    logger.info('  TraderX Enterprise Server v1.0.0 starting...');
    logger.info('='.repeat(60));

    // Initialize DB
    logger.info('[Startup] Initializing database...');
    getDb(); // This calls setup tables
    logger.info('[Startup] Database ready ✓');

    // Start Telegram bot
    logger.info('[Startup] Starting Telegram bot...');
    bot = createBot();

    if (bot) {
        app.locals.telegramBot = bot;
        app.locals.sendAlertFn = sendAlertToUser;
        if (config.TELEGRAM_WEBHOOK_URL) {
            // Webhook mode (production)
            await bot.telegram.setWebhook(`${config.TELEGRAM_WEBHOOK_URL}/webhook/telegram`);
            logger.info(`[Startup] Telegram bot in webhook mode ✓`);
        } else {
            // Long polling mode (development)
            try {
                bot.launch({ dropPendingUpdates: true });
                logger.info('[Startup] Telegram bot polling started ✓');
            } catch (launchErr) {
                logger.error(`[Startup] Telegram bot polling failed: ${launchErr.message}`);
            }
        }
    } else {
        logger.warn('[Startup] Telegram bot not started (no token configured)');
    }

    // Start background scheduler
    logger.info('[Startup] Starting background scheduler...');
    injectBot(bot, sendAlertToUser);
    startScheduler();

    // Start Discord bot
    logger.info('[Startup] Starting Discord bot...');
    let discordClient = null;
    try {
        discordClient = await startDiscordBot();
        if (discordClient) {
            app.locals.discordClient = discordClient;
            app.locals.sendDiscordAlertFn = sendDiscordAlert;
            logger.info('[Startup] Discord bot started ✓');
        } else {
            logger.warn('[Startup] Discord bot not started (no token configured)');
        }
    } catch (err) {
        logger.error('[Startup] Discord bot failed to start:', err.message);
    }

    // Start HTTP server
    const server = app.listen(config.PORT, () => {
        logger.info(`[Startup] HTTP server running on port ${config.PORT} ✓`);
        logger.info('='.repeat(60));
        logger.info(`  API:       http://localhost:${config.PORT}/`);
        logger.info(`  Health:    http://localhost:${config.PORT}/health`);
        logger.info(`  Dashboard: http://localhost:${config.PORT}/dashboard`);
        logger.info('='.repeat(60));
        logger.info(`  Twitter API:  ${config.features.twitterApiEnabled ? '✓ ENABLED (live)' : '✗ disabled (demo mode)'}`);
        logger.info(`  Telegram Bot: ${bot ? '✓ RUNNING' : '✗ not configured'}`);
        logger.info(`  Discord Bot:  ${discordClient ? '✓ RUNNING' : '✗ not configured'}`);
        logger.info(`  OpenAI:       ${config.features.openAiEnabled ? '✓ ENABLED' : '✗ not configured'}`);
        logger.info(`  Stripe:       ${config.features.stripeEnabled ? '✓ ENABLED' : '✗ not configured'}`);
        logger.info('='.repeat(60));
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
        logger.info(`[Shutdown] ${signal} received, shutting down gracefully...`);
        server.close(async () => {
            if (bot) {
                logger.info('[Shutdown] Stopping Telegram bot...');
                bot.stop(signal);
            }
            if (discordClient) {
                logger.info('[Shutdown] Stopping Discord bot...');
                discordClient.destroy();
            }
            logger.info('[Shutdown] Done.');
            process.exit(0);
        });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
    logger.error(`[Startup] Fatal error: ${err.message}`, { stack: err.stack });
    process.exit(1);
});

module.exports = app;
