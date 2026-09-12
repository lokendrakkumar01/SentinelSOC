import { redisClient, isRedisAvailable, inMemoryBus } from '../config/redis';
import { logger } from '../utils/logger';

export class StreamProducer {
  /**
   * Publishes a message to a Redis Stream or in-memory bus if Redis is unavailable.
   */
  static async publish(streamKey: string, payload: Record<string, any>) {
    try {
      if (isRedisAvailable) {
        const flatPayload: string[] = [];
        for (const [key, value] of Object.entries(payload)) {
          flatPayload.push(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
        const id = await redisClient.xadd(streamKey, 'MAXLEN', '~', 50000, '*', ...flatPayload);
        logger.debug(`Published message to Redis stream ${streamKey} with ID ${id}`);
        return id;
      } else {
        inMemoryBus.emit(streamKey, payload);
        logger.debug(`Published message to in-memory event bus: ${streamKey}`);
        return `mem-${Date.now()}`;
      }
    } catch (error) {
      logger.warn(`Redis publish failed, using in-memory bus fallback`);
      inMemoryBus.emit(streamKey, payload);
      return `mem-${Date.now()}`;
    }
  }
}
