import Redis from 'ioredis';
import logger from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let redisReady = false;

// Simple in-memory fallback cache store
const memoryCache = new Map();

// Check if memory cache item is expired
const isExpired = (item) => {
  if (!item) return true;
  if (!item.expiresAt) return false;
  return Date.now() > item.expiresAt;
};

// Initialize ioredis client with safe fallbacks
try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2000, // 2 seconds connect timeout
    retryStrategy(times) {
      // Limit reconnection attempts
      if (times > 3) {
        logger.warn('Redis reconnection limit exceeded. Staying in in-memory fallback mode.');
        redisReady = false;
        return null; // Stop retrying
      }
      return Math.min(times * 100, 1000);
    }
  });

  redisClient.on('connect', () => {
    logger.info('Connecting to Redis server...');
  });

  redisClient.on('ready', () => {
    redisReady = true;
    logger.info('🚀 Real Redis server connected and ready.');
  });

  redisClient.on('error', (err) => {
    if (redisReady) {
      logger.warn(`Redis connection error encountered: ${err.message}. Falling back to in-memory store.`);
    }
    redisReady = false;
  });
} catch (error) {
  logger.warn(`Failed to initialize Redis client: ${error.message}. Operating in in-memory mode.`);
  redisClient = null;
  redisReady = false;
}

/**
 * Retrieve cached value by key
 * @param {string} key 
 * @returns {Promise<any>}
 */
export const get = async (key) => {
  if (redisClient && redisReady) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      logger.warn(`Redis GET failed for key [${key}]: ${err.message}. Fetching from in-memory fallback.`);
    }
  }

  // Fallback to local memory cache
  const cached = memoryCache.get(key);
  if (cached) {
    if (isExpired(cached)) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }
  return null;
};

/**
 * Save value to cache with TTL
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - TTL in seconds
 * @returns {Promise<boolean>}
 */
export const set = async (key, value, ttl = 300) => {
  const jsonString = JSON.stringify(value);

  if (redisClient && redisReady) {
    try {
      await redisClient.set(key, jsonString, 'EX', ttl);
      return true;
    } catch (err) {
      logger.warn(`Redis SET failed for key [${key}]: ${err.message}. Writing to in-memory fallback.`);
    }
  }

  // Fallback to local memory cache
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + (ttl * 1000)
  });
  return true;
};

/**
 * Delete cached key
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
export const del = async (key) => {
  if (redisClient && redisReady) {
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      logger.warn(`Redis DEL failed for key [${key}]: ${err.message}. Clearing in-memory fallback.`);
    }
  }

  // Fallback to local memory cache
  memoryCache.delete(key);
  return true;
};

/**
 * Invalidate all analytics caches
 * @returns {Promise<boolean>}
 */
export const invalidateAnalytics = async () => {
  if (redisClient && redisReady) {
    try {
      const keys = await redisClient.keys('analytics:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Invalidated ${keys.length} Redis analytics keys.`);
      }
    } catch (err) {
      logger.warn(`Redis key search failed during invalidation: ${err.message}`);
    }
  }

  // Always clear matching memory cache keys
  for (const key of memoryCache.keys()) {
    if (key.startsWith('analytics:')) {
      memoryCache.delete(key);
    }
  }
  return true;
};

export default {
  get,
  set,
  del,
  invalidateAnalytics
};
