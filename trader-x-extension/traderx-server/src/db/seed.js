// src/db/seed.js
const { getDb } = require('./setup');

const db = getDb();

try {
    // Insert a test user with our dummy api key so that Chrome extension sync works
    db.prepare(`
    INSERT OR IGNORE INTO users (id, telegram_id, api_key, username, tier)
    VALUES ('test_user_id', 99999999, 'traderx_dev_key_here', 'test_user', 'free')
  `).run();

    // Add BTC to watchlist so alerts will evaluate for this user
    db.prepare(`
    INSERT OR IGNORE INTO watchlist (user_id, ticker)
    VALUES ('test_user_id', 'BTC')
  `).run();

    console.log('[Seed] Dev user with API key "traderx_dev_key_here" seeded successfully.');
} catch (e) {
    console.error('[Seed] Error:', e.message);
}

db.close();
