const redis = require('redis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Create Redis client
const client = redis.createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        logger.error('Redis reconnection attempts exceeded limit');
        return new Error('Redis reconnection failed');
      }
      const delay = Math.min(retries * 50, 2000);
      logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    }
  },
  password: redisConfig.password,
  database: redisConfig.db,
});

// Redis event handlers
client.on('connect', () => {
  logger.info('🔗 Redis client connecting...');
});

client.on('ready', () => {
  logger.info(`✅ Redis connected: ${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`);
});

client.on('error', (err) => {
  logger.error('Redis client error:', err);
});

client.on('end', () => {
  logger.warn('Redis client disconnected');
});

client.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
})();

// Redis utility functions
const redisUtils = {
  // Set key with expiration
  async setex(key, seconds, value) {
    try {
      return await client.setEx(key, seconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis SETEX error:', error);
      throw error;
    }
  },

  // Get key
  async get(key) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  },

  // Delete key
  async del(key) {
    try {
      return await client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  },

  // Increment counter
  async incr(key) {
    try {
      return await client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      throw error;
    }
  },

  // Set key if not exists
  async setnx(key, value) {
    try {
      return await client.setNX(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis SETNX error:', error);
      throw error;
    }
  },

  // Get multiple keys
  async mget(keys) {
    try {
      const values = await client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Redis MGET error:', error);
      throw error;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      return await client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      throw error;
    }
  },

  // Set expiration for key
  async expire(key, seconds) {
    try {
      return await client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      throw error;
    }
  }
};

module.exports = client;
module.exports.utils = redisUtils;