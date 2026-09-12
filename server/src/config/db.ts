import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    logger.info(`Connecting to MongoDB...`);
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('MongoDB connected successfully');
    return;
  } catch (error: any) {
    logger.warn(`External MongoDB not accessible (${error.message}). Attempting in-memory database fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      logger.info(`In-Memory MongoDB server running & connected successfully at ${uri}`);
      return;
    } catch (memErr: any) {
      logger.error('Failed to start in-memory MongoDB:', memErr.message);
      throw error;
    }
  }
};
