import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Custom format for console (colorized and simple)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context
      ? `[${typeof context === 'string' ? context : JSON.stringify(context)}]`
      : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)} ${metaStr}`;
  }),
);

// Custom format for files (JSON for easy parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Transport for error logs (errors only)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '14d', // Keep 14 days of logs
  zippedArchive: true,
});

// Transport for combined logs (all levels)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// Transport for access logs (http requests)
const accessFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '30d', // Keep 30 days of access logs
  zippedArchive: true,
});

// Console transport (for development)
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

export const winstonConfig = {
  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport,
    accessFileTransport,
  ],
  // Default log level (can be overridden by NODE_ENV)
  level: process.env.LOG_LEVEL,
  exitOnError: false,
};
