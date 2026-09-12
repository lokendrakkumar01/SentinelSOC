import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { config } from './env';
import { logger } from '../utils/logger';

export const inMemoryBus = new EventEmitter();
export let isRedisAvailable = false;

export const redisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) {
      return null; // Stop reconnecting after 2 tries
    }
    return 1000;
  }
});

export const redisSubscriber = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) {
      return null;
    }
    return 1000;
  }
});

redisClient.connect().then(() => {
  isRedisAvailable = true;
  logger.info('Redis general client connected successfully');
}).catch((err) => {
  logger.warn(`Redis client unavailable (${err.message}). Operating in in-memory event bus mode.`);
  isRedisAvailable = false;
});

redisSubscriber.connect().then(() => {
  logger.info('Redis subscriber client connected successfully');
}).catch(() => {
  // Silent fallback
});

redisClient.on('error', () => {
  isRedisAvailable = false;
});
