import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { socketService } from './services/socketService';
import { autoResponseService } from './services/autoResponseService';
import { StreamConsumer } from './queue/consumer';
import { detectionOrchestrator } from './engine/detectionOrchestrator';
import bcrypt from 'bcryptjs';
import User from './models/User';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import logRoutes from './routes/logRoutes';
import alertRoutes from './routes/alertRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import responseRoutes from './routes/responseRoutes';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/response', responseRoutes);

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => res.status(200).json({ status: 'ok' }));

const consumer = new StreamConsumer();

async function startServer() {
  try {
    await connectDB();
    
    // Auto-seed default admin operator
    const adminExists = await User.findOne({ email: 'admin@sentinelsoc.io' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('SentinelSOC@2024', 10);
      await User.create({
        name: 'Admin Operator',
        email: 'admin@sentinelsoc.io',
        password: hashedPassword,
        role: 'admin'
      });
      logger.info('Default admin operator initialized: admin@sentinelsoc.io');
    }

    socketService.init(server);
    await autoResponseService.loadBlockedIPs();
    
    await consumer.init();
    
    // Start consumer in background
    consumer.start(async (payload) => {
      // payload represents log event
      await detectionOrchestrator.analyze(payload as any);
    });

    server.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  consumer.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
