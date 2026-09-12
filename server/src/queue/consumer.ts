import { redisSubscriber, redisClient, isRedisAvailable, inMemoryBus } from '../config/redis';
import { logger } from '../utils/logger';

export class StreamConsumer {
  private isRunning = false;
  private streamKey = 'logs:incoming';
  private groupName = 'anomaly-processors';
  private consumerName = `consumer-${process.pid}`;

  async init() {
    if (isRedisAvailable) {
      try {
        await redisClient.xgroup('CREATE', this.streamKey, this.groupName, '$', 'MKSTREAM');
        logger.info(`Consumer group ${this.groupName} created for stream ${this.streamKey}`);
      } catch (error: any) {
        if (error.message && error.message.includes('BUSYGROUP')) {
          logger.info(`Consumer group ${this.groupName} already exists`);
        }
      }
    } else {
      logger.info('StreamConsumer initialized in in-memory event bus mode');
    }
  }

  async start(handler: (payload: any) => Promise<void>) {
    this.isRunning = true;
    logger.info(`Started consumer ${this.consumerName} listening on ${this.streamKey}`);

    // Register in-memory bus listener
    inMemoryBus.on(this.streamKey, async (payload) => {
      if (this.isRunning) {
        try {
          await handler(payload);
        } catch (err) {
          logger.error('Error processing in-memory stream message:', err);
        }
      }
    });

    while (this.isRunning) {
      if (!isRedisAvailable) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      try {
        const results = await redisSubscriber.xreadgroup(
          'GROUP', this.groupName, this.consumerName,
          'BLOCK', 2000,
          'COUNT', 10,
          'STREAMS', this.streamKey, '>'
        ) as any;

        if (results && results.length > 0) {
          const stream = results[0];
          const messages = stream[1];

          for (const message of messages) {
            const [messageId, fieldValues] = message;
            const payload: Record<string, any> = {};
            for (let i = 0; i < fieldValues.length; i += 2) {
              const key = fieldValues[i];
              const value = fieldValues[i + 1];
              try {
                payload[key] = JSON.parse(value);
              } catch {
                payload[key] = value;
              }
            }

            try {
              await handler(payload);
              await redisClient.xack(this.streamKey, this.groupName, messageId);
            } catch (err) {
              logger.error(`Error processing Redis message ${messageId}:`, err);
            }
          }
        }
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  stop() {
    logger.info('Stopping stream consumer...');
    this.isRunning = false;
  }
}
