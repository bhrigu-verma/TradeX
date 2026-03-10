// src/delivery/telegram.bot.js
// ============================================================================
// TraderX Telegram Bot
// Commands: /start /watch /unwatch /track /untrack /sentiment /alerts
//           /alert /portfolio /buy /sell /heatmap /mute /digest /settings
// ============================================================================

const { Telegraf, Markup } = require('telegraf');
const config = require('../config/env');
const logger = require('../config/logger');
const { getDb } = require('../db/setup');
const { analyzeTweets, extractTickers } = require('../services/sentiment.service');
const twitterService = require('../services/twitter.service');
const priceService = require('../services/price.service');
const alertService = require('../services/alert.service');

// ============================================================================
// USER HELPERS
// ============================================================================

function generateApiKey() {
    const { v4: uuidv4 } = require('uuid');
    return `tx_${uuidv4().replace(/-/g, '').substring(0, 24)}`;
}

function getOrCreateUser(ctx) {
    const db = getDb();
    const telegramId = ctx.from?.id;
    if (!telegramId) throw new Error('No Telegram ID');

    let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);

    if (!user) {
        const apiKey = generateApiKey();
        db.prepare(`
      INSERT INTO users (telegram_id, api_key, username, tier)
      VALUES (?, ?, ?, 'free')
    `).run(telegramId, apiKey, ctx.from.username || ctx.from.first_name || 'user');
        user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
        logger.info(`[TelegramBot] New user registered: @${ctx.from.username} (${telegramId})`);
    } else {
        // Update last seen
        db.prepare('UPDATE users SET last_seen = unixepoch() WHERE telegram_id = ?').run(telegramId);
    }

    return user;
}

function getUserWatchlist(userId) {
    const db = getDb();
    return db.prepare('SELECT ticker FROM watchlist WHERE user_id = ? ORDER BY added_at DESC').all(userId).map(r => r.ticker);
}

function getUserTrackedAccounts(userId) {
    const db = getDb();
    return db.prepare('SELECT handle, tier FROM tracked_accounts WHERE user_id = ? ORDER BY tier ASC, added_at DESC').all(userId);
}

function isMuted(user) {
    if (!user.muted_until) return false;
    return Math.floor(Date.now() / 1000) < user.muted_until;
}

// ============================================================================
// MESSAGE FORMATTERS
// ============================================================================

function formatSentimentEmoji(status) {
    const map = {
        'VERY BULLISH': '🟢🟢', 'BULLISH': '🟢', 'NEUTRAL': '⚪',
        'BEARISH': '🔴', 'VERY BEARISH': '🔴🔴', 'VOLATILE': '⚡',
        'LOW DATA': '⚠️', 'NO DATA': '❓'
    };
    return map[status] || '❓';
}

function formatSentimentBar(sentiment) {
    const val = Math.max(-1, Math.min(1, sentiment));
    const barLen = 10;
    const pos = Math.round((val + 1) / 2 * barLen);
    const bar = '█'.repeat(pos) + '░'.repeat(barLen - pos);
    return `[${bar}] ${(val * 100).toFixed(0) > 0 ? '+' : ''}${(val * 100).toFixed(0)}%`;
}

function formatAlertMessage(alert) {
    const { ticker, type, analysis, priceData, triggerDetails } = alert;
    const emoji = type === 'divergence' ? '🚨' : type === 'influencer_burst' ? '👤' : type === 'sentiment_flip' ? '🔄' : '⚡';
    const sentEmoji = formatSentimentEmoji(analysis.status);

    let header = '';
    let detail = '';

    switch (type) {
        case 'divergence':
            header = `${emoji} <b>DIVERGENCE ALERT</b> — $${ticker}`;
            detail = triggerDetails.reason || 'Price and sentiment are diverging';
            break;
        case 'influencer_burst':
            header = `${emoji} <b>INFLUENCER BURST</b> — $${ticker}`;
            detail = `${triggerDetails.influencerCount} tracked influencers tweeted in a short window`;
            break;
        case 'sentiment_flip':
            header = `${emoji} <b>SENTIMENT FLIP</b> — $${ticker}`;
            detail = `Sentiment changed: ${triggerDetails.from} → ${triggerDetails.to}`;
            break;
        case 'volume_sentiment':
            header = `${emoji} <b>VOLUME + SENTIMENT</b> — $${ticker}`;
            detail = `Volume spike (${(triggerDetails.spikeIntensity || 0).toFixed(1)}σ) with ${analysis.status} sentiment`;
            break;
        default:
            header = `${emoji} <b>${alert.name}</b> — $${ticker}`;
            detail = `Alert condition triggered`;
    }

    const priceStr = priceData?.price ? `$${priceService.formatPrice(priceData.price, priceData.type)} (${priceService.formatChange(priceData.change24h)} 24h)` : '--';

    return `${header}\n\n` +
        `${sentEmoji} <b>Sentiment:</b> ${analysis.status} (${(analysis.sentiment * 100).toFixed(0) > 0 ? '+' : ''}${(analysis.sentiment * 100).toFixed(0)}%)\n` +
        `<b>Price:</b> ${priceStr}\n` +
        `<b>Signal:</b> ${detail}\n\n` +
        `📊 <b>Sample:</b> ${analysis.sampleSize} tweets\n` +
        `   🟢 ${analysis.breakdown?.bullish || 0} bullish  🔴 ${analysis.breakdown?.bearish || 0} bearish  ⚪ ${analysis.breakdown?.neutral || 0} neutral\n\n` +
        `<i>via TraderX Pro</i>`;
}

function formatSentimentSnapshot(ticker, analysis, priceData) {
    const sentEmoji = formatSentimentEmoji(analysis.status);
    const priceStr = priceData?.price
        ? `${priceService.formatPrice(priceData.price, priceData.type)} <b>${priceService.formatChange(priceData.change24h)}</b> 24h`
        : 'Price unavailable';

    return `${sentEmoji} <b>$${ticker} Sentiment</b>\n\n` +
        `<b>Status:</b> ${analysis.status}\n` +
        `<b>Score:</b> ${formatSentimentBar(analysis.sentiment)}\n` +
        `<b>Price:</b> ${priceStr}\n` +
        `<b>Confidence:</b> ${analysis.confidence.toUpperCase()}\n\n` +
        `📊 <b>Sample:</b> ${analysis.sampleSize} tweets\n` +
        `   🟢 ${analysis.breakdown?.bullish || 0}  🔴 ${analysis.breakdown?.bearish || 0}  ⚪ ${analysis.breakdown?.neutral || 0}\n` +
        (analysis.volumeSpike ? `\n⚡ <b>Volume Spike Detected!</b> (${analysis.spikeLabel}, z=${analysis.spikeIntensity?.toFixed(1)})\n` : '') +
        `\n<i>Updated: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</i>`;
}

// ============================================================================
// BOT SETUP
// ============================================================================

function createBot() {
    if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'REPLACE_WITH_YOUR_BOT_TOKEN') {
        logger.warn('[TelegramBot] No token set — bot will not start. Set TELEGRAM_BOT_TOKEN in .env');
        return null;
    }

    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

    // ─────────────────────────────────────
    // /start — Register user
    // ─────────────────────────────────────
    bot.start(async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            await ctx.replyWithHTML(
                `👋 <b>Welcome to TraderX Pro!</b>\n\n` +
                `Your personal trading intelligence assistant 🚀\n\n` +
                `<b>Quick Start:</b>\n` +
                `• <code>/watch BTC ETH TSLA</code> — Track tickers\n` +
                `• <code>/track @elonmusk @zaborofficial</code> — Track accounts\n` +
                `• <code>/sentiment BTC</code> — Get current sentiment\n` +
                `• <code>/help</code> — Full command list\n\n` +
                `🔑 <b>Your API Key:</b> <code>${user.api_key}</code>\n` +
                `<i>Use this in the Chrome extension to sync data</i>`,
                Markup.keyboard([
                    ['📊 Sentiment', '💼 Portfolio'],
                    ['📋 My Watchlist', '🔔 My Alerts'],
                    ['⚙️ Settings', '❓ Help']
                ]).resize()
            );
        } catch (e) {
            logger.error(`[TelegramBot] /start error: ${e.message}`);
            ctx.reply('❌ Error starting. Please try again.');
        }
    });

    // ─────────────────────────────────────
    // /help
    // ─────────────────────────────────────
    bot.help(async (ctx) => {
        await ctx.replyWithHTML(
            `<b>TraderX Pro — Commands</b>\n\n` +
            `<b>📈 Tracking</b>\n` +
            `<code>/watch BTC ETH TSLA</code> — Add tickers to watchlist\n` +
            `<code>/unwatch BTC</code> — Remove ticker\n` +
            `<code>/watchlist</code> — Show your watchlist\n` +
            `<code>/track @handle1 @handle2</code> — Track X accounts\n` +
            `<code>/untrack @handle</code> — Stop tracking\n` +
            `<code>/tracked</code> — Show tracked accounts\n\n` +
            `<b>📊 Analysis</b>\n` +
            `<code>/sentiment BTC</code> — Current sentiment snapshot\n` +
            `<code>/heatmap</code> — Sector sentiment overview\n\n` +
            `<b>💼 Portfolio</b>\n` +
            `<code>/buy BTC 67500 0.5</code> — Log long position\n` +
            `<code>/short TSLA 175 10</code> — Log short position\n` +
            `<code>/sell BTC 71000</code> — Close long position\n` +
            `<code>/portfolio</code> — View P&L\n\n` +
            `<b>🔔 Alerts</b>\n` +
            `<code>/alerts</code> — List your alerts\n` +
            `<code>/alert divergence BTC 3</code> — Bullish + price drop >3%\n` +
            `<code>/alert flip BTC bearish bullish</code> — Sentiment flip\n\n` +
            `<b>⚙️ Settings</b>\n` +
            `<code>/mute 2h</code> — Mute for 2 hours\n` +
            `<code>/unmute</code> — Resume notifications\n` +
            `<code>/settings</code> — Configure preferences\n` +
            `<code>/apikey</code> — Show your API key`
        );
    });

    // ─────────────────────────────────────
    // /watch — Add tickers
    // ─────────────────────────────────────
    bot.command('watch', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const args = ctx.message.text.split(/\s+/).slice(1);

            if (args.length === 0) {
                return ctx.reply('Usage: /watch BTC ETH TSLA\nExample: /watch NVDA SPY');
            }

            const tickers = args.map(t => t.toUpperCase().replace('$', '')).filter(t => t.length >= 1 && t.length <= 10);

            const added = [];
            const alreadyTracking = [];

            for (const ticker of tickers) {
                const existing = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND ticker = ?').get(user.id, ticker);
                if (existing) {
                    alreadyTracking.push(ticker);
                } else {
                    db.prepare('INSERT OR IGNORE INTO watchlist (user_id, ticker) VALUES (?, ?)').run(user.id, ticker);
                    added.push(ticker);
                }
            }

            let reply = '';
            if (added.length > 0) reply += `✅ Now watching: ${added.map(t => `$${t}`).join(', ')}\n`;
            if (alreadyTracking.length > 0) reply += `ℹ️ Already watching: ${alreadyTracking.map(t => `$${t}`).join(', ')}`;

            await ctx.reply(reply.trim() || '❌ No valid tickers provided');
        } catch (e) {
            logger.error(`[Bot] /watch error: ${e.message}`);
            ctx.reply('❌ Error adding to watchlist');
        }
    });

    // ─────────────────────────────────────
    // /unwatch — Remove tickers
    // ─────────────────────────────────────
    bot.command('unwatch', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const args = ctx.message.text.split(/\s+/).slice(1);

            if (args.length === 0) return ctx.reply('Usage: /unwatch BTC');

            const tickers = args.map(t => t.toUpperCase().replace('$', ''));
            const removed = [];

            for (const ticker of tickers) {
                const result = db.prepare('DELETE FROM watchlist WHERE user_id = ? AND ticker = ?').run(user.id, ticker);
                if (result.changes > 0) removed.push(ticker);
            }

            await ctx.reply(removed.length > 0
                ? `✅ Removed: ${removed.map(t => `$${t}`).join(', ')}`
                : '❌ Those tickers were not in your watchlist');
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // /watchlist — Show tickers
    // ─────────────────────────────────────
    bot.command('watchlist', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const watchlist = getUserWatchlist(user.id);
            if (watchlist.length === 0) {
                return ctx.reply('📋 Your watchlist is empty.\nAdd tickers with /watch BTC ETH TSLA');
            }
            await ctx.replyWithHTML(`📋 <b>Your Watchlist</b>\n\n${watchlist.map(t => `• $${t}`).join('\n')}\n\n<i>Use /sentiment BTC to get analysis</i>`);
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // /track — Track X accounts
    // ─────────────────────────────────────
    bot.command('track', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const args = ctx.message.text.split(/\s+/).slice(1);

            if (args.length === 0) {
                return ctx.reply('Usage: /track @handle1 @handle2\nExample: /track @elonmusk @PeterSchiff');
            }

            const handles = args.map(h => h.toLowerCase().replace('@', '').trim()).filter(h => h.length > 0);
            const added = [];

            for (const handle of handles) {
                try {
                    db.prepare('INSERT OR IGNORE INTO tracked_accounts (user_id, handle, tier) VALUES (?, ?, 3)').run(user.id, handle);
                    added.push(handle);
                } catch (e) { /* duplicate */ }
            }

            await ctx.replyWithHTML(
                `👤 Now tracking ${added.length} account(s):\n${added.map(h => `• @${h}`).join('\n')}\n\n` +
                `<i>You'll receive alerts when they tweet about your watchlist tickers</i>`
            );
        } catch (e) {
            logger.error(`[Bot] /track error: ${e.message}`);
            ctx.reply('❌ Error tracking accounts');
        }
    });

    // ─────────────────────────────────────
    // /untrack — Remove tracked accounts
    // ─────────────────────────────────────
    bot.command('untrack', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const args = ctx.message.text.split(/\s+/).slice(1);

            if (args.length === 0) return ctx.reply('Usage: /untrack @handle');

            const handles = args.map(h => h.toLowerCase().replace('@', ''));
            let removed = 0;

            for (const handle of handles) {
                const r = db.prepare('DELETE FROM tracked_accounts WHERE user_id = ? AND handle = ?').run(user.id, handle);
                removed += r.changes;
            }

            await ctx.reply(removed > 0 ? `✅ Removed ${removed} account(s)` : '❌ Accounts not found in your tracking list');
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // /tracked — Show tracked accounts
    // ─────────────────────────────────────
    bot.command('tracked', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const accounts = getUserTrackedAccounts(user.id);

            if (accounts.length === 0) {
                return ctx.reply('👤 No accounts tracked yet.\nAdd with /track @handle');
            }

            const tierLabels = { 1: '⭐⭐ Critical', 2: '⭐ Trusted', 3: 'Signal' };
            await ctx.replyWithHTML(
                `<b>👤 Tracked Accounts (${accounts.length})</b>\n\n` +
                accounts.map(a => `• @${a.handle} — ${tierLabels[a.tier] || 'Signal'}`).join('\n')
            );
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // /sentiment — Get sentiment for a ticker
    // ─────────────────────────────────────
    bot.command('sentiment', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const args = ctx.message.text.split(/\s+/).slice(1);

            if (args.length === 0) {
                const watchlist = getUserWatchlist(user.id);
                if (watchlist.length === 0) {
                    return ctx.reply('Usage: /sentiment BTC\nOr add tickers with /watch BTC ETH');
                }
                args.push(watchlist[0]);
            }

            const ticker = args[0].toUpperCase().replace('$', '');
            const msg = await ctx.reply(`⏳ Fetching analysis for $${ticker}...`);

            // Fetch tweets & analyze
            const fetchResult = await twitterService.fetchTickerTweets(ticker);
            const analysis = analyzeTweets(fetchResult.tweets || [], new Map(), []);

            // Fetch price
            const priceData = await priceService.getPrice(ticker);

            // Save snapshot
            const db = getDb();
            db.prepare(`
        INSERT INTO sentiment_snapshots (ticker, sentiment, status, sample_size, confidence, bullish_count, bearish_count, neutral_count, volume_spike, spike_intensity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(ticker, analysis.sentiment, analysis.status, analysis.sampleSize, analysis.confidence,
                analysis.breakdown?.bullish || 0, analysis.breakdown?.bearish || 0, analysis.breakdown?.neutral || 0,
                analysis.volumeSpike ? 1 : 0, analysis.spikeIntensity || 0);

            const message = formatSentimentSnapshot(ticker, analysis, priceData);

            // Delete loading message and send result
            try { await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id); } catch { }

            await ctx.replyWithHTML(message, Markup.inlineKeyboard([
                [Markup.button.url(`🐦 Search on X`, `https://x.com/search?q=%24${ticker}&f=live`),
                Markup.button.callback('🔄 Refresh', `refresh_${ticker}`)]
            ]));
        } catch (e) {
            logger.error(`[Bot] /sentiment error: ${e.message}`);
            ctx.reply('❌ Error fetching sentiment. Please try again.');
        }
    });

    // ─────────────────────────────────────
    // /heatmap — Sector overview
    // ─────────────────────────────────────
    bot.command('heatmap', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const watchlist = getUserWatchlist(user.id);

            if (watchlist.length === 0) {
                return ctx.reply('Your watchlist is empty. Add tickers with /watch BTC ETH TSLA');
            }

            await ctx.reply('⏳ Generating sector heatmap...');

            const SECTOR_MAP = {
                BTC: 'Crypto', ETH: 'Crypto', SOL: 'Crypto', XRP: 'Crypto', DOGE: 'Crypto',
                TSLA: 'EV/Tech', NVDA: 'AI/Tech', AAPL: 'Tech', MSFT: 'Tech', AMD: 'AI/Tech',
                SPY: 'ETF/Macro', QQQ: 'ETF/Macro', DXY: 'ETF/Macro', GLD: 'Commodities',
                COIN: 'Crypto/Finance', SOFI: 'Fintech', SQ: 'Fintech'
            };

            const sectors = {};

            for (const ticker of watchlist.slice(0, 8)) {
                const fetchResult = await twitterService.fetchTickerTweets(ticker);
                const analysis = analyzeTweets(fetchResult.tweets || [], new Map(), []);
                const sector = SECTOR_MAP[ticker] || 'Other';

                if (!sectors[sector]) sectors[sector] = { tickers: [], totalSent: 0, count: 0 };
                sectors[sector].tickers.push(ticker);
                sectors[sector].totalSent += analysis.sentiment;
                sectors[sector].count++;

                await new Promise(r => setTimeout(r, 300));
            }

            const lines = Object.entries(sectors).map(([name, data]) => {
                const avg = data.count > 0 ? data.totalSent / data.count : 0;
                const pct = (avg * 100).toFixed(0);
                const emoji = avg > 0.15 ? '🟢' : avg < -0.15 ? '🔴' : '⚪';
                const bar = formatSentimentBar(avg);
                return `${emoji} <b>${name}</b>: ${bar}\n   ${data.tickers.map(t => `$${t}`).join(' ')}`;
            }).join('\n\n');

            await ctx.replyWithHTML(`<b>🗺️ Sector Heatmap</b>\n\n${lines}\n\n<i>Based on your watchlist</i>`);
        } catch (e) {
            logger.error(`[Bot] /heatmap error: ${e.message}`);
            ctx.reply('❌ Error generating heatmap');
        }
    });

    // ─────────────────────────────────────
    // /portfolio — View P&L
    // ─────────────────────────────────────
    bot.command('portfolio', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const positions = db.prepare("SELECT * FROM positions WHERE user_id = ? AND closed_at IS NULL ORDER BY opened_at DESC").all(user.id);

            if (positions.length === 0) {
                return ctx.replyWithHTML(
                    `💼 <b>Portfolio</b>\n\nNo open positions.\n\n` +
                    `<b>Add positions:</b>\n` +
                    `<code>/buy BTC 67500 0.5</code> — Long 0.5 BTC at $67,500\n` +
                    `<code>/short TSLA 175 10</code> — Short 10 TSLA at $175`
                );
            }

            let totalPnL = 0, totalCost = 0;
            const lines = [];

            for (const pos of positions) {
                const priceData = await priceService.getPrice(pos.ticker);
                const currentPrice = priceData?.price;

                if (currentPrice) {
                    const cost = pos.entry_price * pos.quantity;
                    let pnl, pnlPct;

                    if (pos.side === 'long') {
                        pnl = (currentPrice - pos.entry_price) * pos.quantity;
                        pnlPct = ((currentPrice - pos.entry_price) / pos.entry_price) * 100;
                    } else {
                        pnl = (pos.entry_price - currentPrice) * pos.quantity;
                        pnlPct = ((pos.entry_price - currentPrice) / pos.entry_price) * 100;
                    }

                    totalPnL += pnl;
                    totalCost += cost;

                    const pnlStr = `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%)`;
                    const pnlEmoji = pnl >= 0 ? '📈' : '📉';
                    const sideLabel = pos.side === 'long' ? 'LONG' : 'SHORT';

                    lines.push(`${pnlEmoji} <b>$${pos.ticker}</b> [${sideLabel}]\n` +
                        `   Entry: $${pos.entry_price} | Current: $${currentPrice.toFixed(2)}\n` +
                        `   Qty: ${pos.quantity} | P&L: ${pnlStr}`);
                } else {
                    lines.push(`❓ <b>$${pos.ticker}</b> — Price unavailable`);
                }

                await new Promise(r => setTimeout(r, 200));
            }

            const totalPnlPct = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : '0.00';
            const header = `💼 <b>Portfolio (${positions.length} positions)</b>\n\n`;
            const footer = `\n━━━━━━━━━━━━━\n` +
                `<b>Total P&L: ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)} (${totalPnL >= 0 ? '+' : ''}${totalPnlPct}%)</b>\n` +
                `<i>Prices auto-updated. Not financial advice.</i>`;

            await ctx.replyWithHTML(header + lines.join('\n\n') + footer,
                Markup.inlineKeyboard([
                    [Markup.button.callback('🔄 Refresh', 'refresh_portfolio')]
                ])
            );
        } catch (e) {
            logger.error(`[Bot] /portfolio error: ${e.message}`);
            ctx.reply('❌ Error fetching portfolio');
        }
    });

    // ─────────────────────────────────────
    // /buy — Log long position
    // ─────────────────────────────────────
    bot.command(['buy', 'long'], async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const parts = ctx.message.text.split(/\s+/).slice(1);

            if (parts.length < 3) {
                return ctx.reply('Usage: /buy TICKER ENTRY_PRICE QUANTITY\nExample: /buy BTC 67500 0.5');
            }

            const [rawTicker, rawPrice, rawQty, ...rest] = parts;
            const ticker = rawTicker.toUpperCase().replace('$', '');
            const entryPrice = parseFloat(rawPrice);
            const quantity = parseFloat(rawQty);
            const notes = rest.join(' ');

            if (isNaN(entryPrice) || isNaN(quantity) || entryPrice <= 0 || quantity <= 0) {
                return ctx.reply('❌ Invalid price or quantity. Both must be positive numbers.');
            }

            db.prepare(`
        INSERT INTO positions (user_id, ticker, side, entry_price, quantity, notes)
        VALUES (?, ?, 'long', ?, ?, ?)
      `).run(user.id, ticker, entryPrice, quantity, notes);

            const costBasis = (entryPrice * quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

            await ctx.replyWithHTML(
                `✅ <b>Long Position Logged</b>\n\n` +
                `<b>Ticker:</b> $${ticker}\n` +
                `<b>Entry:</b> $${entryPrice.toFixed(2)}\n` +
                `<b>Quantity:</b> ${quantity}\n` +
                `<b>Cost Basis:</b> ${costBasis}\n` +
                `${notes ? `<b>Notes:</b> ${notes}\n` : ''}` +
                `\n<i>View with /portfolio</i>`
            );
        } catch (e) {
            logger.error(`[Bot] /buy error: ${e.message}`);
            ctx.reply('❌ Error logging position');
        }
    });

    // ─────────────────────────────────────
    // /short — Log short position
    // ─────────────────────────────────────
    bot.command('short', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const parts = ctx.message.text.split(/\s+/).slice(1);

            if (parts.length < 3) return ctx.reply('Usage: /short TICKER ENTRY_PRICE QUANTITY\nExample: /short TSLA 175 10');

            const [rawTicker, rawPrice, rawQty] = parts;
            const ticker = rawTicker.toUpperCase().replace('$', '');
            const entryPrice = parseFloat(rawPrice);
            const quantity = parseFloat(rawQty);

            if (isNaN(entryPrice) || isNaN(quantity)) return ctx.reply('❌ Invalid price or quantity');

            db.prepare(`
        INSERT INTO positions (user_id, ticker, side, entry_price, quantity)
        VALUES (?, ?, 'short', ?, ?)
      `).run(user.id, ticker, entryPrice, quantity);

            await ctx.replyWithHTML(
                `✅ <b>Short Position Logged</b>\n\n` +
                `<b>Ticker:</b> $${ticker} (SHORT)\n` +
                `<b>Entry:</b> $${entryPrice}\n` +
                `<b>Quantity:</b> ${quantity}\n\n` +
                `<i>View with /portfolio</i>`
            );
        } catch (e) {
            ctx.reply('❌ Error logging short');
        }
    });

    // ─────────────────────────────────────
    // /sell — Close position
    // ─────────────────────────────────────
    bot.command(['sell', 'close'], async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const parts = ctx.message.text.split(/\s+/).slice(1);

            if (parts.length < 2) return ctx.reply('Usage: /sell TICKER CLOSE_PRICE\nExample: /sell BTC 71000');

            const [rawTicker, rawPrice] = parts;
            const ticker = rawTicker.toUpperCase().replace('$', '');
            const closePrice = parseFloat(rawPrice);

            if (isNaN(closePrice)) return ctx.reply('❌ Invalid close price');

            const position = db.prepare("SELECT * FROM positions WHERE user_id = ? AND ticker = ? AND closed_at IS NULL ORDER BY opened_at DESC LIMIT 1").get(user.id, ticker);

            if (!position) return ctx.reply(`❌ No open position found for $${ticker}`);

            const now = Math.floor(Date.now() / 1000);
            db.prepare('UPDATE positions SET closed_at = ?, close_price = ? WHERE id = ?').run(now, closePrice, position.id);

            let pnl, pnlPct;
            if (position.side === 'long') {
                pnl = (closePrice - position.entry_price) * position.quantity;
                pnlPct = ((closePrice - position.entry_price) / position.entry_price) * 100;
            } else {
                pnl = (position.entry_price - closePrice) * position.quantity;
                pnlPct = ((position.entry_price - closePrice) / position.entry_price) * 100;
            }

            const pnlEmoji = pnl >= 0 ? '🎉' : '😔';

            await ctx.replyWithHTML(
                `${pnlEmoji} <b>Position Closed — $${ticker}</b>\n\n` +
                `<b>Side:</b> ${position.side.toUpperCase()}\n` +
                `<b>Entry:</b> $${position.entry_price} → Exit: $${closePrice}\n` +
                `<b>Quantity:</b> ${position.quantity}\n` +
                `<b>P&L:</b> ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`
            );
        } catch (e) {
            logger.error(`[Bot] /sell error: ${e.message}`);
            ctx.reply('❌ Error closing position');
        }
    });

    // ─────────────────────────────────────
    // /alerts — List alerts
    // ─────────────────────────────────────
    bot.command('alerts', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const userAlerts = alertService.getUserAlerts(user.id);

            if (userAlerts.length === 0) {
                return ctx.replyWithHTML(
                    `🔔 <b>No Alerts Set</b>\n\n` +
                    `Create alerts:\n` +
                    `<code>/alert divergence BTC 3</code> — Bullish + price drops >3%\n` +
                    `<code>/alert flip ETH bearish bullish</code> — Sentiment flip`
                );
            }

            const lines = userAlerts.map(a => {
                const statusEmoji = a.enabled ? '✅' : '⏸';
                return `${statusEmoji} <b>${a.name}</b> [${a.type}]\n   Ticker: ${a.ticker || 'Any'} | Cooldown: ${a.cooldown_min}m`;
            }).join('\n\n');

            await ctx.replyWithHTML(`<b>🔔 Your Alerts (${userAlerts.length})</b>\n\n${lines}`);
        } catch (e) {
            ctx.reply('❌ Error fetching alerts');
        }
    });

    // ─────────────────────────────────────
    // /alert — Create alert
    // ─────────────────────────────────────
    bot.command('alert', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const parts = ctx.message.text.split(/\s+/).slice(1);

            if (parts.length < 2) {
                return ctx.replyWithHTML(
                    `<b>Create Alert</b>\n\n` +
                    `<code>/alert divergence BTC 3</code> — Alert when $BTC sentiment bullish + price drops >3%\n` +
                    `<code>/alert flip BTC bearish bullish</code> — Alert on sentiment flip\n` +
                    `<code>/alert threshold BTC bullish 0.3</code> — Alert when sentiment reaches 0.3`
                );
            }

            const [type, ticker, ...params] = parts;
            const normalizedTicker = ticker.toUpperCase().replace('$', '');

            let alertData = { type, ticker: normalizedTicker, delivery: ['telegram'] };

            switch (type) {
                case 'divergence':
                    const pctDrop = parseFloat(params[0]) || 3;
                    alertData.name = `Bullish Divergence — $${normalizedTicker}`;
                    alertData.conditions = { sentimentMin: 0.15, priceChangeMax: -pctDrop, minSampleSize: 8 };
                    break;
                case 'flip':
                    const [fromStatus, toStatus] = params;
                    alertData.name = `Sentiment Flip ${fromStatus}→${toStatus} — $${normalizedTicker}`;
                    alertData.conditions = {
                        fromStatus: (fromStatus || 'bearish').toUpperCase(),
                        toStatus: (toStatus || 'bullish').toUpperCase(),
                        userId: user.id
                    };
                    break;
                case 'threshold':
                    const direction = params[0] || 'bullish';
                    const threshold = parseFloat(params[1]) || 0.3;
                    alertData.name = `${direction} Threshold — $${normalizedTicker}`;
                    alertData.conditions = { direction, threshold };
                    break;
                default:
                    return ctx.reply(`❌ Unknown alert type: ${type}\nTypes: divergence, flip, threshold`);
            }

            const created = alertService.createAlert(user.id, alertData);
            await ctx.replyWithHTML(
                `✅ <b>Alert Created</b>\n\n` +
                `<b>Name:</b> ${alertData.name}\n` +
                `<b>Ticker:</b> $${normalizedTicker}\n` +
                `<b>Type:</b> ${type}\n\n` +
                `<i>You'll be notified here on Telegram when conditions are met</i>`
            );
        } catch (e) {
            logger.error(`[Bot] /alert error: ${e.message}`);
            ctx.reply('❌ Error creating alert');
        }
    });

    // ─────────────────────────────────────
    // /mute — Mute notifications
    // ─────────────────────────────────────
    bot.command('mute', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            const args = ctx.message.text.split(/\s+/).slice(1);
            const durationStr = args[0] || '1h';

            let ms = 0;
            if (durationStr.endsWith('m')) ms = parseFloat(durationStr) * 60 * 1000;
            else if (durationStr.endsWith('h')) ms = parseFloat(durationStr) * 60 * 60 * 1000;
            else if (durationStr.endsWith('d')) ms = parseFloat(durationStr) * 24 * 60 * 60 * 1000;
            else ms = 60 * 60 * 1000; // Default 1 hour

            const mutedUntil = Math.floor((Date.now() + ms) / 1000);
            db.prepare('UPDATE users SET muted_until = ? WHERE id = ?').run(mutedUntil, user.id);

            const until = new Date(Date.now() + ms).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
            await ctx.reply(`🔕 Notifications muted until ${until} IST\nUse /unmute to resume early`);
        } catch (e) {
            ctx.reply('❌ Error muting');
        }
    });

    // ─────────────────────────────────────
    // /unmute — Resume notifications
    // ─────────────────────────────────────
    bot.command('unmute', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const db = getDb();
            db.prepare('UPDATE users SET muted_until = NULL WHERE id = ?').run(user.id);
            await ctx.reply('🔔 Notifications resumed!');
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // /apikey — Show API key
    // ─────────────────────────────────────
    bot.command('apikey', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            await ctx.replyWithHTML(`🔑 <b>Your API Key</b>\n\n<code>${user.api_key}</code>\n\n<i>Use this in the Chrome extension Settings to sync your watchlist and alerts</i>`);
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // /settings — User settings
    // ─────────────────────────────────────
    bot.command('settings', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const watchlist = getUserWatchlist(user.id);
            const tracked = getUserTrackedAccounts(user.id);

            await ctx.replyWithHTML(
                `⚙️ <b>Your Settings</b>\n\n` +
                `👤 <b>Username:</b> @${user.username || 'unknown'}\n` +
                `🏷️ <b>Tier:</b> ${user.tier.toUpperCase()}\n` +
                `📋 <b>Watchlist:</b> ${watchlist.length} tickers\n` +
                `👥 <b>Tracked Accounts:</b> ${tracked.length}\n` +
                `🔔 <b>Status:</b> ${isMuted(user) ? '🔕 Muted' : '✅ Active'}\n\n` +
                `<b>Commands:</b>\n` +
                `/mute 2h — Pause alerts\n` +
                `/watch BTC — Add ticker\n` +
                `/track @handle — Track account`
            );
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    // ─────────────────────────────────────
    // Keyboard button handlers
    // ─────────────────────────────────────
    bot.hears('📊 Sentiment', async (ctx) => {
        try {
            const user = getOrCreateUser(ctx);
            const watchlist = getUserWatchlist(user.id);
            if (watchlist.length === 0) {
                return ctx.reply('Add tickers first: /watch BTC ETH TSLA');
            }
            // Simulate /sentiment for first watchlist item
            ctx.message.text = `/sentiment ${watchlist[0]}`;
            // Trigger sentiment command
            const ticker = watchlist[0];
            const fetchResult = await twitterService.fetchTickerTweets(ticker);
            const analysis = analyzeTweets(fetchResult.tweets || [], new Map(), []);
            const priceData = await priceService.getPrice(ticker);
            const message = formatSentimentSnapshot(ticker, analysis, priceData);
            await ctx.replyWithHTML(message);
        } catch (e) {
            ctx.reply('❌ Error');
        }
    });

    bot.hears('💼 Portfolio', (ctx) => { ctx.message.text = '/portfolio'; bot.handleUpdate({ message: ctx.message, update_id: 0 }); });
    bot.hears('📋 My Watchlist', (ctx) => { ctx.message.text = '/watchlist'; });
    bot.hears('🔔 My Alerts', (ctx) => { ctx.message.text = '/alerts'; });
    bot.hears('⚙️ Settings', (ctx) => { ctx.message.text = '/settings'; });
    bot.hears('❓ Help', (ctx) => ctx.reply('/help'));

    // ─────────────────────────────────────
    // Callback queries (inline buttons)
    // ─────────────────────────────────────
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery?.data || '';

        if (data.startsWith('refresh_')) {
            const ticker = data.replace('refresh_', '');
            if (ticker === 'portfolio') {
                ctx.message = ctx.callbackQuery.message;
                ctx.message.text = '/portfolio';
            } else {
                await ctx.answerCbQuery(`Refreshing $${ticker}...`);
                const fetchResult = await twitterService.fetchTickerTweets(ticker);
                const analysis = analyzeTweets(fetchResult.tweets || [], new Map(), []);
                const priceData = await priceService.getPrice(ticker);
                const message = formatSentimentSnapshot(ticker, analysis, priceData);
                try {
                    await ctx.editMessageText(message, { parse_mode: 'HTML' });
                } catch {
                    await ctx.replyWithHTML(message);
                }
            }
        }

        if (data.startsWith('dismiss_')) {
            await ctx.answerCbQuery('Alert dismissed');
            try { await ctx.deleteMessage(); } catch { }
        }

        try { await ctx.answerCbQuery(); } catch { }
    });

    // Error handling
    bot.catch((err, ctx) => {
        logger.error(`[TelegramBot] Error for ${ctx.updateType}: ${err.message}`);
    });

    return bot;
}

// ============================================================================
// DELIVERY FUNCTION — called by alert pipeline
// ============================================================================

async function sendAlertToUser(bot, userId, alert) {
    if (!bot) return false;

    try {
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        if (!user?.telegram_id) return false;
        if (isMuted(user)) {
            logger.debug(`[TelegramBot] User ${user.telegram_id} is muted, skipping alert`);
            return false;
        }

        const message = formatAlertMessage(alert);

        await bot.telegram.sendMessage(user.telegram_id, message, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🐦 View on X', url: `https://x.com/search?q=%24${alert.ticker}&f=live` },
                    { text: '📊 Refresh', callback_data: `refresh_${alert.ticker}` }],
                    [{ text: '✕ Dismiss', callback_data: `dismiss_${alert.historyId}` }]
                ]
            }
        });

        // Mark as delivered
        db.prepare('UPDATE alert_history SET delivered = 1 WHERE id = ?').run(alert.historyId);

        logger.info(`[TelegramBot] Alert sent to ${user.telegram_id}: ${alert.name} — $${alert.ticker}`);
        return true;
    } catch (e) {
        logger.error(`[TelegramBot] Send failed: ${e.message}`);
        return false;
    }
}

module.exports = { createBot, sendAlertToUser, formatSentimentSnapshot, formatAlertMessage };
