import winston from 'winston';
import { config } from '../config/env';

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: config.NODE_ENV === 'production' ? combine(timestamp(), json()) : combine(colorize(), timestamp(), logFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
