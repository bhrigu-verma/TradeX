// src/services/price.service.js
// ============================================================================
// Price fetcher service — CoinGecko for crypto, Yahoo Finance for stocks
// Results cached in SQLite price_cache table
// ============================================================================

const axios = require('axios');
const config = require('../config/env');
const logger = require('../config/logger');

const CRYPTO_COIN_IDS = {
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', XRP: 'ripple',
    DOGE: 'dogecoin', ADA: 'cardano', AVAX: 'avalanche-2', MATIC: 'matic-network',
    DOT: 'polkadot', LINK: 'chainlink', MARA: 'marathon-digital-holdings',
    BNB: 'binancecoin', UNI: 'uniswap', ATOM: 'cosmos', LTC: 'litecoin',
    NEAR: 'near', ARB: 'arbitrum', OP: 'optimism'
};

const CACHE_TTL_MS = 30_000; // 30s cache
const memCache = new Map();

class PriceService {
    async getPrice(ticker) {
        const cached = memCache.get(ticker);
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
            return cached.data;
        }

        let data;
        const coinId = CRYPTO_COIN_IDS[ticker.toUpperCase()];

        if (coinId) {
            data = await this._fetchCryptoPrice(ticker, coinId);
        } else {
            data = await this._fetchStockPrice(ticker);
        }

        if (data) {
            memCache.set(ticker, { data, ts: Date.now() });
        }

        return data || { ticker, price: null, change24h: null, type: 'unknown' };
    }

    async getMultiplePrices(tickers) {
        const results = {};
        await Promise.allSettled(
            tickers.map(async t => {
                results[t] = await this.getPrice(t);
            })
        );
        return results;
    }

    async _fetchCryptoPrice(ticker, coinId) {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price`;
            const params = {
                ids: coinId,
                vs_currencies: 'usd',
                include_24hr_change: 'true',
                include_24hr_vol: 'true',
                x_cg_demo_api_key: config.COINGECKO_API_KEY !== 'demo' ? config.COINGECKO_API_KEY : undefined
            };

            const response = await axios.get(url, { params, timeout: 8000 });
            const d = response.data[coinId];
            if (!d) return null;

            return {
                ticker,
                price: d.usd,
                change24h: d.usd_24h_change,
                volume24h: d.usd_24h_vol,
                type: 'crypto'
            };
        } catch (e) {
            logger.warn(`[Price] CoinGecko failed for ${ticker}: ${e.message}`);
            return this._getDemoPrice(ticker, 'crypto');
        }
    }

    async _fetchStockPrice(ticker) {
        try {
            const url = `${config.YAHOO_FINANCE_PROXY}/v8/finance/chart/${ticker}?interval=1d&range=2d`;
            const response = await axios.get(url, { timeout: 8000 });
            const result = response.data?.chart?.result?.[0];
            if (!result) return null;

            const meta = result.meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose || meta.chartPreviousClose || price;
            const change24h = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

            return { ticker, price, change24h, type: 'stock' };
        } catch (e) {
            logger.warn(`[Price] Yahoo failed for ${ticker}: ${e.message}`);
            return this._getDemoPrice(ticker, 'stock');
        }
    }

    _getDemoPrice(ticker, type) {
        // Return plausible demo prices for development
        const demoPrices = {
            BTC: { price: 67500, change24h: -2.3 },
            ETH: { price: 3200, change24h: 1.5 },
            SOL: { price: 142, change24h: 3.8 },
            XRP: { price: 0.52, change24h: -0.8 },
            TSLA: { price: 175, change24h: -3.2 },
            NVDA: { price: 875, change24h: 2.1 },
            AAPL: { price: 182, change24h: 0.5 },
            SPY: { price: 510, change24h: 0.3 },
        };
        const demo = demoPrices[ticker] || { price: 100 + Math.random() * 900, change24h: (Math.random() - 0.5) * 10 };
        return { ticker, ...demo, type, isDemo: true };
    }

    formatPrice(price, type) {
        if (!price) return '--';
        if (type === 'crypto' && price < 1) return `$${price.toFixed(4)}`;
        if (price < 10) return `$${price.toFixed(2)}`;
        return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    formatChange(change) {
        if (change === null || change === undefined) return '';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    }
}

module.exports = new PriceService();
