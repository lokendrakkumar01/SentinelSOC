import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50000, // High limit for SOC real-time streaming and dashboards
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.baseUrl === '/api/logs' || req.originalUrl?.startsWith('/api/logs'),
  message: { error: 'Too many requests, please try again later.' }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Generous limit for development and operator access
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' }
});
