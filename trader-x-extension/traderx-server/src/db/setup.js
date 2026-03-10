// src/db/setup.js
// SQLite database setup — creates all tables, no external DB needed

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const DB_PATH = path.resolve(config.DB_PATH);

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Ensure logs directory exists
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs', { recursive: true });

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');  // Better concurrent read performance
        db.pragma('foreign_keys = ON');
        setupTables(db);
    }
    return db;
}

function setupTables(db_instance) {
    db_instance.exec(`
    -- ============================================================
    -- USERS TABLE
    -- ============================================================
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      email       TEXT UNIQUE,
      telegram_id INTEGER UNIQUE,
      discord_id  TEXT UNIQUE,
      api_key     TEXT UNIQUE NOT NULL,
      tier        TEXT NOT NULL DEFAULT 'free',
      username    TEXT,
      settings    TEXT NOT NULL DEFAULT '{}',
      muted_until INTEGER DEFAULT NULL,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      last_seen   INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- ============================================================
    -- WATCHLIST (user's tracked tickers)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS watchlist (
      id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(6)))),
      user_id    TEXT NOT NULL,
      ticker     TEXT NOT NULL,
      added_at   INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, ticker)
    );

    -- ============================================================
    -- TRACKED ACCOUNTS (influencers user wants alerts from)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS tracked_accounts (
      id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(6)))),
      user_id    TEXT NOT NULL,
      handle     TEXT NOT NULL,
      tier       INTEGER NOT NULL DEFAULT 3,
      added_at   INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, handle)
    );

    -- ============================================================
    -- TWEETS (analyzed tweet cache)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS tweets (
      id             TEXT PRIMARY KEY,
      text           TEXT NOT NULL,
      author_handle  TEXT NOT NULL,
      author_id      TEXT,
      ticker         TEXT,
      tickers        TEXT DEFAULT '[]',
      sentiment      REAL DEFAULT 0,
      confidence     TEXT DEFAULT 'low',
      likes          INTEGER DEFAULT 0,
      retweets       INTEGER DEFAULT 0,
      replies        INTEGER DEFAULT 0,
      source         TEXT DEFAULT 'api',
      tweet_created_at INTEGER,
      analyzed_at    INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_tweets_ticker ON tweets(ticker, tweet_created_at);
    CREATE INDEX IF NOT EXISTS idx_tweets_author ON tweets(author_handle);

    -- ============================================================
    -- SENTIMENT SNAPSHOTS (historical per ticker)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS sentiment_snapshots (
      id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      ticker          TEXT NOT NULL,
      sentiment       REAL NOT NULL,
      status          TEXT NOT NULL,
      sample_size     INTEGER NOT NULL DEFAULT 0,
      confidence      TEXT NOT NULL DEFAULT 'low',
      bullish_count   INTEGER DEFAULT 0,
      bearish_count   INTEGER DEFAULT 0,
      neutral_count   INTEGER DEFAULT 0,
      volume_spike    INTEGER DEFAULT 0,
      spike_intensity REAL DEFAULT 0,
      created_at      INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_snapshots_ticker ON sentiment_snapshots(ticker, created_at);

    -- ============================================================
    -- ALERTS (user-defined alert rules)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS alerts (
      id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      user_id      TEXT NOT NULL,
      name         TEXT NOT NULL,
      type         TEXT NOT NULL,
      ticker       TEXT,
      conditions   TEXT NOT NULL DEFAULT '{}',
      delivery     TEXT NOT NULL DEFAULT '["telegram"]',
      enabled      INTEGER NOT NULL DEFAULT 1,
      cooldown_min INTEGER NOT NULL DEFAULT 15,
      last_fired   INTEGER DEFAULT NULL,
      created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ============================================================
    -- ALERT HISTORY (fired alerts log)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS alert_history (
      id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      user_id      TEXT NOT NULL,
      alert_id     TEXT,
      alert_name   TEXT NOT NULL,
      ticker       TEXT,
      type         TEXT NOT NULL,
      payload      TEXT NOT NULL DEFAULT '{}',
      delivered    INTEGER DEFAULT 0,
      created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_alert_history_user ON alert_history(user_id, created_at);

    -- ============================================================
    -- POSITIONS (portfolio tracker)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS positions (
      id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      user_id      TEXT NOT NULL,
      ticker       TEXT NOT NULL,
      side         TEXT NOT NULL DEFAULT 'long',
      entry_price  REAL NOT NULL,
      quantity     REAL NOT NULL,
      notes        TEXT DEFAULT '',
      opened_at    INTEGER NOT NULL DEFAULT (unixepoch()),
      closed_at    INTEGER DEFAULT NULL,
      close_price  REAL DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_positions_user ON positions(user_id, ticker);

    -- ============================================================
    -- PRICE CACHE
    -- ============================================================
    CREATE TABLE IF NOT EXISTS price_cache (
      ticker     TEXT PRIMARY KEY,
      price      REAL,
      change_24h REAL,
      type       TEXT DEFAULT 'stock',
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- ============================================================
    -- BACKTEST RESULTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS backtest_results (
      id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
      ticker           TEXT NOT NULL,
      signal_type      TEXT NOT NULL,
      signal_time      INTEGER NOT NULL,
      signal_sentiment REAL NOT NULL,
      price_at_signal  REAL,
      price_after_1h   REAL DEFAULT NULL,
      price_after_4h   REAL DEFAULT NULL,
      price_after_24h  REAL DEFAULT NULL,
      correct_1h       INTEGER DEFAULT NULL,
      correct_4h       INTEGER DEFAULT NULL,
      correct_24h      INTEGER DEFAULT NULL,
      created_at       INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_backtest_ticker ON backtest_results(ticker, signal_type);
  `);

    console.log(`[DB] Tables ready at ${DB_PATH}`);
}

// Run setup if called directly
if (require.main === module) {
    const database = getDb();
    console.log('[DB] Setup complete!');
    database.close();
}

module.exports = { getDb };
