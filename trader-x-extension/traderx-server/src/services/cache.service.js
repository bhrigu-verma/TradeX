// src/services/cache.service.js
// ============================================================================
// Redis Cache Service — Falls back to in-memory cache when Redis unavailable
// ============================================================================

const config = require('../config/env');
const logger = require('../config/logger');

// ============================================================================
// In-memory cache fallback
// ============================================================================
class MemoryCache {
    constructor() {
        this.store = new Map();
        this.timers = new Map();
    }

    async get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key, value, ttl = 3600) {
        const expiresAt = Date.now() + (ttl * 1000);
        this.store.set(key, { value, expiresAt });

        // Auto-cleanup
        if (this.timers.has(key)) clearTimeout(this.timers.get(key));
        this.timers.set(key, setTimeout(() => {
            this.store.delete(key);
            this.timers.delete(key);
        }, ttl * 1000));
    }

    async del(key) {
        this.store.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }

    async flush() {
        this.store.clear();
        for (const timer of this.timers.values()) clearTimeout(timer);
        this.timers.clear();
    }

    get size() {
        return this.store.size;
    }
}

// ============================================================================
// Redis-backed cache
// ============================================================================
class RedisCache {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    async connect() {
        try {
            const Redis = require('ioredis');
            this.client = new Redis(config.REDIS_URL, {
                retryStrategy: (times) => Math.min(times * 100, 3000),
                maxRetriesPerRequest: 3,
                lazyConnect: true
            });

            this.client.on('connect', () => {
                this.connected = true;
                logger.info('[Cache] Redis connected');
            });

            this.client.on('error', (err) => {
                logger.warn(`[Cache] Redis error: ${err.message}`);
                this.connected = false;
            });

            await this.client.connect();
        } catch (e) {
            logger.warn(`[Cache] Redis connection failed: ${e.message}. Using memory cache.`);
            this.connected = false;
        }
    }

    async get(key) {
        if (!this.connected) return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            logger.warn(`[Cache] Redis GET error: ${e.message}`);
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        if (!this.connected) return;
        try {
            await this.client.setex(key, ttl, JSON.stringify(value));
        } catch (e) {
            logger.warn(`[Cache] Redis SET error: ${e.message}`);
        }
    }

    async del(key) {
        if (!this.connected) return;
        try {
            await this.client.del(key);
        } catch (e) {
            logger.warn(`[Cache] Redis DEL error: ${e.message}`);
        }
    }

    async flush() {
        if (!this.connected) return;
        try {
            await this.client.flushdb();
        } catch (e) {
            logger.warn(`[Cache] Redis FLUSH error: ${e.message}`);
        }
    }
}

// ============================================================================
// Unified Cache Service
// ============================================================================
class CacheService {
    constructor() {
        this.primary = null; // Redis or Memory
        this.memory = new MemoryCache(); // Always available as L2
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        if (config.USE_REDIS) {
            const redis = new RedisCache();
            await redis.connect();
            if (redis.connected) {
                this.primary = redis;
                logger.info('[Cache] Using Redis as primary cache');
            } else {
                this.primary = this.memory;
                logger.info('[Cache] Falling back to memory cache');
            }
        } else {
            this.primary = this.memory;
            logger.info('[Cache] Using memory cache (Redis not configured)');
        }

        this.initialized = true;
    }

    async get(key) {
        if (!this.initialized) await this.init();

        // Try primary (Redis) first
        let value = await this.primary.get(key);
        if (value !== null) return value;

        // Try L2 memory cache
        if (this.primary !== this.memory) {
            value = await this.memory.get(key);
        }

        return value;
    }

    async set(key, value, ttl = 3600) {
        if (!this.initialized) await this.init();
        await this.primary.set(key, value, ttl);

        // Also set in L2 memory for faster access
        if (this.primary !== this.memory) {
            await this.memory.set(key, value, ttl);
        }
    }

    async del(key) {
        if (!this.initialized) await this.init();
        await this.primary.del(key);
        if (this.primary !== this.memory) {
            await this.memory.del(key);
        }
    }

    // Convenience: get or compute
    async getOrSet(key, computeFn, ttl = 3600) {
        let value = await this.get(key);
        if (value !== null) return value;

        value = await computeFn();
        if (value !== null && value !== undefined) {
            await this.set(key, value, ttl);
        }
        return value;
    }

    // Cache keys helpers
    static keys = {
        price: (ticker) => `price:${ticker}`,
        sentiment: (ticker) => `sentiment:${ticker}`,
        intelligence: (ticker) => `intel:${ticker}`,
        userSub: (userId) => `sub:${userId}`,
        whaleFlow: (ticker) => `whale:flow:${ticker}`,
    };
}

// Singleton
const cacheService = new CacheService();

module.exports = cacheService;
