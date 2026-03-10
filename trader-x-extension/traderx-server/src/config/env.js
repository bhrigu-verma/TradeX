// src/config/env.js
// Central config — validates all required environment variables on startup

require('dotenv').config();

const config = {
    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',

    // Telegram
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL || '',

    // Twitter / X API
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN || '',
    TWITTER_API_KEY: process.env.TWITTER_API_KEY || '',
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET || '',

    // Price APIs
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || 'demo',
    YAHOO_FINANCE_PROXY: process.env.YAHOO_FINANCE_PROXY || 'https://query1.finance.yahoo.com',

    // Auth
    JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    API_KEY_SALT: process.env.API_KEY_SALT || 'dev_salt',

    // Database
    DB_PATH: process.env.DB_PATH || './data/traderx.db',

    // Redis
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    USE_REDIS: process.env.USE_REDIS === 'true',

    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

    // Discord
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',

    // Feature flags
    features: {
        twitterApiEnabled: !!(process.env.TWITTER_BEARER_TOKEN),
        openAiEnabled: !!(process.env.OPENAI_API_KEY),
        discordEnabled: !!(process.env.DISCORD_BOT_TOKEN),
        redisEnabled: process.env.USE_REDIS === 'true',
    }
};

module.exports = config;
