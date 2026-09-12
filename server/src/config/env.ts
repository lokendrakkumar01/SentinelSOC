import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinelsoc',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-me',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.example.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
