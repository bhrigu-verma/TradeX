// src/delivery/discord.bot.js
// ============================================================================
// TraderX Discord Bot
// Slash commands with full Telegram parity:
//   /start, /watch, /unwatch, /sentiment, /alerts, /portfolio, /help,
//   /price, /rank, /copilot, /whale, /heatmap, /plan
// ============================================================================

const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, Collection } = require('discord.js');
const config = require('../config/env');
const logger = require('../config/logger');
const { getDb } = require('../db/setup');
const priceService = require('../services/price.service');
const { analyzeTweets } = require('../services/sentiment.service');
const twitterService = require('../services/twitter.service');

// ============================================================================
// HELPERS
// ============================================================================

function generateApiKey() {
  const { v4: uuidv4 } = require('uuid');
  return `tx_${uuidv4().replace(/-/g, '').substring(0, 24)}`;
}

function getOrCreateUser(discordId, username) {
  const db = getDb();
  let user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
  if (!user) {
    const apiKey = generateApiKey();
    db.prepare(`INSERT INTO users (discord_id, api_key, username, tier) VALUES (?, ?, ?, 'free')`)
      .run(discordId, apiKey, username || 'discord_user');
    user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
    logger.info(`[DiscordBot] New user registered: ${username} (${discordId})`);
  } else {
    db.prepare('UPDATE users SET last_seen = unixepoch() WHERE discord_id = ?').run(discordId);
  }
  return user;
}

function getUserWatchlist(userId) {
  const db = getDb();
  return db.prepare('SELECT ticker FROM watchlist WHERE user_id = ? ORDER BY added_at DESC').all(userId).map(r => r.ticker);
}

function sentimentColor(status) {
  const map = {
    'VERY BULLISH': 0x00ff00, 'BULLISH': 0x22c55e, 'NEUTRAL': 0x6b7280,
    'BEARISH': 0xef4444, 'VERY BEARISH': 0xdc2626, 'VOLATILE': 0xf59e0b,
  };
  return map[status] || 0x6b7280;
}

function sentimentEmoji(status) {
  const map = {
    'VERY BULLISH': '🟢🟢', 'BULLISH': '🟢', 'NEUTRAL': '⚪',
    'BEARISH': '🔴', 'VERY BEARISH': '🔴🔴', 'VOLATILE': '⚡',
    'LOW DATA': '⚠️', 'NO DATA': '❓',
  };
  return map[status] || '❓';
}

// ============================================================================
// COMMAND DEFINITIONS
// ============================================================================

const commands = [
  new SlashCommandBuilder().setName('start').setDescription('Register your TraderX account and get your API key'),
  new SlashCommandBuilder().setName('help').setDescription('Show all available commands'),
  new SlashCommandBuilder().setName('watch')
    .setDescription('Add a ticker to your watchlist')
    .addStringOption(opt => opt.setName('ticker').setDescription('Ticker symbol (e.g. BTC, AAPL)').setRequired(true)),
  new SlashCommandBuilder().setName('unwatch')
    .setDescription('Remove a ticker from your watchlist')
    .addStringOption(opt => opt.setName('ticker').setDescription('Ticker symbol to remove').setRequired(true)),
  new SlashCommandBuilder().setName('sentiment')
    .setDescription('Get sentiment analysis for a ticker')
    .addStringOption(opt => opt.setName('ticker').setDescription('Ticker symbol').setRequired(true)),
  new SlashCommandBuilder().setName('alerts').setDescription('Show your active alerts'),
  new SlashCommandBuilder().setName('portfolio').setDescription('View your portfolio positions'),
  new SlashCommandBuilder().setName('price')
    .setDescription('Get current price for a ticker')
    .addStringOption(opt => opt.setName('ticker').setDescription('Ticker symbol').setRequired(true)),
  new SlashCommandBuilder().setName('rank').setDescription('See top trending tickers by sentiment'),
  new SlashCommandBuilder().setName('copilot')
    .setDescription('Get an AI trade idea for a ticker')
    .addStringOption(opt => opt.setName('ticker').setDescription('Ticker symbol').setRequired(true)),
  new SlashCommandBuilder().setName('whale')
    .setDescription('Check whale activity for a ticker')
    .addStringOption(opt => opt.setName('ticker').setDescription('Ticker symbol').setRequired(true)),
  new SlashCommandBuilder().setName('heatmap').setDescription('Get sentiment heatmap for your watchlist'),
  new SlashCommandBuilder().setName('plan').setDescription('Check your subscription status'),
];

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

const handlers = {
  async start(interaction) {
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle('🚀 Welcome to TraderX Pro!')
      .setDescription(`Your account is ready, **${interaction.user.username}**!`)
      .addFields(
        { name: '🔑 API Key', value: `\`${user.api_key}\``, inline: false },
        { name: '📊 Tier', value: user.tier?.toUpperCase() || 'FREE', inline: true },
        { name: '📝 Next Steps', value: '• `/watch BTC` — Add a ticker\n• `/sentiment BTC` — Check sentiment\n• `/help` — See all commands', inline: false },
      )
      .setFooter({ text: 'TraderX Pro · Keep your API key secret!' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async help(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle('📚 TraderX Pro Commands')
      .setDescription('All available slash commands:')
      .addFields(
        { name: '🔐 Account', value: '`/start` — Register & get API key\n`/plan` — Check subscription', inline: false },
        { name: '📊 Analysis', value: '`/sentiment <ticker>` — Sentiment analysis\n`/price <ticker>` — Current price\n`/rank` — Trending tickers\n`/heatmap` — Watchlist heatmap', inline: false },
        { name: '🤖 AI & Whale', value: '`/copilot <ticker>` — AI trade idea\n`/whale <ticker>` — Whale activity', inline: false },
        { name: '📋 Management', value: '`/watch <ticker>` — Add to watchlist\n`/unwatch <ticker>` — Remove from watchlist\n`/alerts` — View active alerts\n`/portfolio` — View positions', inline: false },
      )
      .setFooter({ text: 'TraderX Pro · AI-Powered Trading Intelligence' });
    await interaction.reply({ embeds: [embed] });
  },

  async watch(interaction) {
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const ticker = interaction.options.getString('ticker').toUpperCase();
    const db = getDb();

    const existing = db.prepare('SELECT 1 FROM watchlist WHERE user_id = ? AND ticker = ?').get(user.id, ticker);
    if (existing) {
      return interaction.reply({ content: `⚠️ **${ticker}** is already on your watchlist.`, ephemeral: true });
    }

    const watchlist = getUserWatchlist(user.id);
    const limit = user.tier === 'pro' ? 50 : user.tier === 'enterprise' ? 999 : 5;
    if (watchlist.length >= limit) {
      return interaction.reply({ content: `❌ Watchlist full (${limit} max for ${user.tier} tier). Upgrade for more!`, ephemeral: true });
    }

    db.prepare('INSERT INTO watchlist (user_id, ticker) VALUES (?, ?)').run(user.id, ticker);
    await interaction.reply({ content: `✅ **${ticker}** added to your watchlist! (${watchlist.length + 1}/${limit})` });
  },

  async unwatch(interaction) {
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const ticker = interaction.options.getString('ticker').toUpperCase();
    const db = getDb();

    const result = db.prepare('DELETE FROM watchlist WHERE user_id = ? AND ticker = ?').run(user.id, ticker);
    if (result.changes === 0) {
      return interaction.reply({ content: `⚠️ **${ticker}** was not on your watchlist.`, ephemeral: true });
    }
    await interaction.reply({ content: `🗑️ **${ticker}** removed from your watchlist.` });
  },

  async sentiment(interaction) {
    await interaction.deferReply();
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const ticker = interaction.options.getString('ticker').toUpperCase();

    try {
      const tweets = await twitterService.searchTicker(ticker, 50);
      const analysis = analyzeTweets(tweets, ticker);
      let priceData = null;
      try { priceData = await priceService.getPrice(ticker); } catch (_) {}

      const embed = new EmbedBuilder()
        .setColor(sentimentColor(analysis.status))
        .setTitle(`${sentimentEmoji(analysis.status)} ${ticker} Sentiment Analysis`)
        .addFields(
          { name: 'Status', value: analysis.status || 'N/A', inline: true },
          { name: 'Score', value: `${(analysis.sentiment * 100).toFixed(1)}%`, inline: true },
          { name: 'Confidence', value: `${(analysis.confidence * 100).toFixed(0)}%`, inline: true },
          { name: 'Tweets Analyzed', value: `${analysis.totalTweets || 0}`, inline: true },
          { name: 'Bull / Bear Ratio', value: `${analysis.bullCount || 0} / ${analysis.bearCount || 0}`, inline: true },
        );

      if (priceData?.price) {
        embed.addFields(
          { name: '💰 Price', value: `$${priceData.price.toLocaleString()}`, inline: true },
          { name: '24h Change', value: `${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h?.toFixed(2)}%`, inline: true },
        );
      }

      embed.setFooter({ text: 'TraderX Pro · Not financial advice' }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error(`[DiscordBot] Sentiment error for ${ticker}:`, err.message);
      await interaction.editReply({ content: `❌ Could not fetch sentiment for **${ticker}**. Try again later.` });
    }
  },

  async alerts(interaction) {
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const db = getDb();
    const alerts = db.prepare('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(user.id);

    if (!alerts.length) {
      return interaction.reply({ content: '📭 No active alerts. Create alerts from the dashboard or Chrome extension.' });
    }

    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle(`🔔 Your Alerts (${alerts.length})`)
      .setDescription(alerts.map((a, i) => {
        const status = a.enabled ? '🟢' : '🔴';
        return `${status} **${a.ticker}** · ${a.type} · ${a.condition || 'custom'}`;
      }).join('\n'))
      .setFooter({ text: 'Manage alerts from the TraderX dashboard' });

    await interaction.reply({ embeds: [embed] });
  },

  async portfolio(interaction) {
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const db = getDb();
    const positions = db.prepare("SELECT * FROM portfolio WHERE user_id = ? AND status = 'open' ORDER BY opened_at DESC").all(user.id);

    if (!positions.length) {
      return interaction.reply({ content: '📭 No open positions. Open positions from the dashboard.' });
    }

    const lines = positions.map(p => {
      const pnl = p.current_price ? (((p.current_price - p.entry_price) / p.entry_price) * 100).toFixed(2) : '?';
      const emoji = pnl > 0 ? '🟢' : pnl < 0 ? '🔴' : '⚪';
      return `${emoji} **${p.ticker}** · ${p.direction?.toUpperCase()} · Entry: $${p.entry_price} · P&L: ${pnl}%`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle(`📊 Portfolio (${positions.length} open)`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'TraderX Pro · Not financial advice' });

    await interaction.reply({ embeds: [embed] });
  },

  async price(interaction) {
    await interaction.deferReply();
    const ticker = interaction.options.getString('ticker').toUpperCase();

    try {
      const data = await priceService.getPrice(ticker);
      const embed = new EmbedBuilder()
        .setColor(data.change24h >= 0 ? 0x22c55e : 0xef4444)
        .setTitle(`💰 ${ticker} Price`)
        .addFields(
          { name: 'Price', value: `$${data.price?.toLocaleString() || 'N/A'}`, inline: true },
          { name: '24h Change', value: `${data.change24h >= 0 ? '+' : ''}${data.change24h?.toFixed(2) || '?'}%`, inline: true },
          { name: 'Market Cap', value: data.marketCap ? `$${(data.marketCap / 1e9).toFixed(2)}B` : 'N/A', inline: true },
          { name: 'Volume 24h', value: data.volume24h ? `$${(data.volume24h / 1e6).toFixed(1)}M` : 'N/A', inline: true },
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `❌ Could not fetch price for **${ticker}**.` });
    }
  },

  async rank(interaction) {
    await interaction.deferReply();
    const db = getDb();

    try {
      const recent = db.prepare(`
        SELECT ticker, AVG(sentiment_score) as avg_score, COUNT(*) as count
        FROM sentiment_cache
        WHERE cached_at > unixepoch() - 3600
        GROUP BY ticker
        HAVING count >= 2
        ORDER BY avg_score DESC
        LIMIT 10
      `).all();

      if (!recent.length) {
        return interaction.editReply({ content: '📭 No recent sentiment data. Try analyzing some tickers first.' });
      }

      const lines = recent.map((r, i) => {
        const emoji = r.avg_score > 0.3 ? '🟢' : r.avg_score < -0.3 ? '🔴' : '⚪';
        return `${i + 1}. ${emoji} **${r.ticker}** · Score: ${(r.avg_score * 100).toFixed(1)}% · Signals: ${r.count}`;
      });

      const embed = new EmbedBuilder()
        .setColor(0x6366f1)
        .setTitle('🏆 Top Trending Tickers')
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'Based on last 1h of sentiment data' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: '❌ Could not fetch rankings.' });
    }
  },

  async copilot(interaction) {
    await interaction.deferReply();
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const ticker = interaction.options.getString('ticker').toUpperCase();

    if (user.tier === 'free') {
      return interaction.editReply({ content: '🔒 AI Copilot requires a Pro subscription. Upgrade at traderx.app/pricing' });
    }

    const db = getDb();
    try {
      // Get recent sentiment
      const sentimentRow = db.prepare(`
        SELECT * FROM sentiment_cache WHERE ticker = ? ORDER BY cached_at DESC LIMIT 1
      `).get(ticker);

      let priceData = null;
      try { priceData = await priceService.getPrice(ticker); } catch (_) {}

      if (!sentimentRow || !priceData) {
        return interaction.editReply({ content: `⚠️ Insufficient data for **${ticker}**. Try running \`/sentiment ${ticker}\` first.` });
      }

      const sentiment = sentimentRow.sentiment_score || 0;
      const confidence = Math.min(100, Math.abs(sentiment * 100) + 15);

      if (confidence < 65) {
        return interaction.editReply({ content: `⚠️ Confidence for **${ticker}** is too low (${confidence.toFixed(0)}%). Waiting for stronger signals.` });
      }

      const direction = sentiment > 0 ? 'LONG' : 'SHORT';
      const entry = priceData.price;
      const stopPct = 0.03;
      const rrRatio = 2.5;
      const stopLoss = direction === 'LONG' ? entry * (1 - stopPct) : entry * (1 + stopPct);
      const target = direction === 'LONG' ? entry + (entry - stopLoss) * rrRatio : entry - (stopLoss - entry) * rrRatio;

      const embed = new EmbedBuilder()
        .setColor(direction === 'LONG' ? 0x22c55e : 0xef4444)
        .setTitle(`🤖 AI Copilot: ${ticker}`)
        .addFields(
          { name: 'Direction', value: direction === 'LONG' ? '🟢 LONG' : '🔴 SHORT', inline: true },
          { name: 'Confidence', value: `${confidence.toFixed(0)}%`, inline: true },
          { name: 'Entry', value: `$${entry.toLocaleString()}`, inline: true },
          { name: 'Stop Loss', value: `$${stopLoss.toFixed(2)}`, inline: true },
          { name: 'Target', value: `$${target.toFixed(2)}`, inline: true },
          { name: 'R:R', value: `1:${rrRatio}`, inline: true },
        )
        .setDescription(`Sentiment: ${(sentiment * 100).toFixed(1)}% | Status: ${sentimentRow.status || 'N/A'}`)
        .setFooter({ text: '⚠️ Not financial advice — always do your own research' })
        .setTimestamp();

      // Store the idea
      try {
        db.prepare(`INSERT INTO trade_ideas (user_id, ticker, direction, confidence, entry_price, stop_loss, target_price, reasoning)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
          user.id, ticker, direction.toLowerCase(), confidence, entry, stopLoss, target,
          `Auto-generated: sentiment ${(sentiment * 100).toFixed(1)}%`
        );
      } catch (_) {}

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error(`[DiscordBot] Copilot error for ${ticker}:`, err.message);
      await interaction.editReply({ content: `❌ Could not generate idea for **${ticker}**.` });
    }
  },

  async whale(interaction) {
    await interaction.deferReply();
    const ticker = interaction.options.getString('ticker').toUpperCase();
    const db = getDb();

    try {
      const transactions = db.prepare(`
        SELECT * FROM whale_transactions WHERE ticker = ? ORDER BY timestamp DESC LIMIT 10
      `).all(ticker);

      if (!transactions.length) {
        return interaction.editReply({ content: `📭 No whale transactions found for **${ticker}**.` });
      }

      const summary = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN transaction_type = 'exchange_inflow' THEN usd_value ELSE 0 END) as inflow,
          SUM(CASE WHEN transaction_type = 'exchange_outflow' THEN usd_value ELSE 0 END) as outflow
        FROM whale_transactions WHERE ticker = ? AND timestamp > unixepoch() - 86400
      `).get(ticker);

      const netFlow = (summary.outflow || 0) - (summary.inflow || 0);
      const flowEmoji = netFlow > 0 ? '🟢 Accumulation' : netFlow < 0 ? '🔴 Distribution' : '⚪ Neutral';

      const embed = new EmbedBuilder()
        .setColor(netFlow > 0 ? 0x22c55e : netFlow < 0 ? 0xef4444 : 0x6b7280)
        .setTitle(`🐋 ${ticker} Whale Activity`)
        .addFields(
          { name: '24h Transactions', value: `${summary.total || 0}`, inline: true },
          { name: 'Exchange Inflow', value: `$${((summary.inflow || 0) / 1e6).toFixed(2)}M`, inline: true },
          { name: 'Exchange Outflow', value: `$${((summary.outflow || 0) / 1e6).toFixed(2)}M`, inline: true },
          { name: 'Net Flow', value: `$${(netFlow / 1e6).toFixed(2)}M`, inline: true },
          { name: 'Signal', value: flowEmoji, inline: true },
        )
        .setDescription(`Last ${transactions.length} whale transactions:`)
        .setFooter({ text: 'TraderX Pro · Whale Flow Intelligence' })
        .setTimestamp();

      // Show top 5 recent
      const recentLines = transactions.slice(0, 5).map(tx => {
        const typeEmoji = tx.transaction_type === 'exchange_inflow' ? '📥' :
          tx.transaction_type === 'exchange_outflow' ? '📤' : '🔄';
        return `${typeEmoji} $${((tx.usd_value || 0) / 1e3).toFixed(0)}K · ${tx.transaction_type?.replace('_', ' ')}`;
      });
      if (recentLines.length) {
        embed.addFields({ name: 'Recent Movements', value: recentLines.join('\n'), inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error(`[DiscordBot] Whale error for ${ticker}:`, err.message);
      await interaction.editReply({ content: `❌ Could not fetch whale data for **${ticker}**.` });
    }
  },

  async heatmap(interaction) {
    await interaction.deferReply();
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const watchlist = getUserWatchlist(user.id);

    if (!watchlist.length) {
      return interaction.editReply({ content: '📭 Your watchlist is empty. Add tickers with `/watch`.' });
    }

    const db = getDb();
    const rows = watchlist.map(ticker => {
      const row = db.prepare(`SELECT * FROM sentiment_cache WHERE ticker = ? ORDER BY cached_at DESC LIMIT 1`).get(ticker);
      return { ticker, score: row?.sentiment_score || 0, status: row?.status || 'NO DATA' };
    });

    rows.sort((a, b) => b.score - a.score);

    const lines = rows.map(r => {
      const emoji = sentimentEmoji(r.status);
      const bar = r.score > 0 ? '🟩'.repeat(Math.min(5, Math.round(r.score * 5))) : '🟥'.repeat(Math.min(5, Math.round(Math.abs(r.score) * 5)));
      return `${emoji} **${r.ticker}** ${bar} ${(r.score * 100).toFixed(0)}%`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle('🗺️ Sentiment Heatmap')
      .setDescription(lines.join('\n') || 'No data available')
      .setFooter({ text: `${watchlist.length} tickers · Last cached data` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },

  async plan(interaction) {
    const user = getOrCreateUser(interaction.user.id, interaction.user.username);
    const db = getDb();
    const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(user.id);

    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle('📋 Your Subscription')
      .addFields(
        { name: 'Tier', value: (user.tier || 'free').toUpperCase(), inline: true },
        { name: 'Status', value: sub?.status || 'N/A', inline: true },
      );

    if (sub?.current_period_end) {
      const endDate = new Date(sub.current_period_end * 1000).toLocaleDateString();
      embed.addFields({ name: 'Renews', value: endDate, inline: true });
    }

    if (user.tier === 'free') {
      embed.setDescription('Upgrade to Pro for AI Copilot, Whale Tracker, and more!\n🔗 [traderx.app/pricing](https://traderx.app/pricing)');
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

// ============================================================================
// BOT STARTUP
// ============================================================================

let client = null;

async function startDiscordBot() {
  if (!config.DISCORD_BOT_TOKEN) {
    logger.warn('[DiscordBot] No DISCORD_BOT_TOKEN set — bot disabled');
    return null;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(config.DISCORD_BOT_TOKEN);

  try {
    const commandData = commands.map(c => c.toJSON());

    if (config.DISCORD_GUILD_ID) {
      // Register for specific guild (faster for development)
      await rest.put(Routes.applicationGuildCommands(client.application?.id || 'me', config.DISCORD_GUILD_ID), { body: commandData });
      logger.info(`[DiscordBot] Registered ${commandData.length} guild commands`);
    } else {
      // Global registration (takes up to 1h to propagate)
      logger.info('[DiscordBot] No DISCORD_GUILD_ID set — commands will be registered on ready');
    }
  } catch (err) {
    logger.error('[DiscordBot] Failed to register commands:', err.message);
  }

  client.on('ready', async () => {
    logger.info(`[DiscordBot] Logged in as ${client.user.tag}`);

    // Register global commands if no guild specified
    if (!config.DISCORD_GUILD_ID && client.application) {
      try {
        const commandData = commands.map(c => c.toJSON());
        await rest.put(Routes.applicationCommands(client.application.id), { body: commandData });
        logger.info(`[DiscordBot] Registered ${commandData.length} global commands`);
      } catch (err) {
        logger.error('[DiscordBot] Global command registration failed:', err.message);
      }
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const handler = handlers[interaction.commandName];
    if (!handler) {
      return interaction.reply({ content: '❓ Unknown command.', ephemeral: true });
    }

    try {
      await handler(interaction);
    } catch (err) {
      logger.error(`[DiscordBot] Command /${interaction.commandName} error:`, err.message);
      const reply = { content: '❌ An error occurred processing your command.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  });

  await client.login(config.DISCORD_BOT_TOKEN);
  return client;
}

// ============================================================================
// ALERT DELIVERY
// ============================================================================

async function sendDiscordAlert(channelId, alertData) {
  if (!client || !client.isReady()) return;

  try {
    const channel = await client.channels.fetch(channelId || config.DISCORD_ALERT_CHANNEL_ID);
    if (!channel) return;

    const { ticker, type, analysis, priceData } = alertData;
    const emoji = type === 'divergence' ? '🚨' : type === 'influencer_burst' ? '👤' :
      type === 'sentiment_flip' ? '🔄' : '⚡';

    const embed = new EmbedBuilder()
      .setColor(analysis?.sentiment > 0 ? 0x22c55e : 0xef4444)
      .setTitle(`${emoji} ${ticker} Alert: ${type.replace(/_/g, ' ').toUpperCase()}`)
      .addFields(
        { name: 'Ticker', value: ticker, inline: true },
        { name: 'Type', value: type.replace(/_/g, ' '), inline: true },
      );

    if (analysis) {
      embed.addFields(
        { name: 'Sentiment', value: `${(analysis.sentiment * 100).toFixed(1)}%`, inline: true },
        { name: 'Status', value: analysis.status || 'N/A', inline: true },
      );
    }

    if (priceData?.price) {
      embed.addFields({ name: 'Price', value: `$${priceData.price.toLocaleString()}`, inline: true });
    }

    embed.setTimestamp().setFooter({ text: 'TraderX Pro Alert · Not financial advice' });

    await channel.send({ embeds: [embed] });
    logger.info(`[DiscordBot] Alert sent for ${ticker} to channel ${channelId || config.DISCORD_ALERT_CHANNEL_ID}`);
  } catch (err) {
    logger.error('[DiscordBot] Alert delivery failed:', err.message);
  }
}

module.exports = { startDiscordBot, sendDiscordAlert };
