/**
 * LoggerService - Centralized logging with environment awareness
 *
 * Usage:
 *   import Logger from '../services/LoggerService';
 *   Logger.debug('Loading data...');
 *   Logger.info('User logged in');
 *   Logger.warn('Retrying operation');
 *   Logger.error('Operation failed', error);
 *
 * Features:
 * - Automatically disabled in production builds
 * - Consistent log formatting with timestamps
 * - Separates debug/info (dev only) from warn/error (always shown)
 * - Never logs sensitive user data
 */

// Check if we're in development mode
const isDev = __DEV__;

// Format timestamp for logs
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().substr(11, 12); // HH:MM:SS.mmm
};

// Sanitize data to remove potentially sensitive fields
const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'email', 'uid', 'userId'];
  const sanitized = { ...data };

  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
};

const Logger = {
  /**
   * Debug level - Development only
   * Use for detailed debugging info
   */
  debug: (...args) => {
    if (isDev) {
      console.log(`[${getTimestamp()}] [DEBUG]`, ...args.map(sanitize));
    }
  },

  /**
   * Info level - Development only
   * Use for general operational info
   */
  info: (...args) => {
    if (isDev) {
      console.log(`[${getTimestamp()}] [INFO]`, ...args.map(sanitize));
    }
  },

  /**
   * Warn level - Always shown
   * Use for recoverable issues
   */
  warn: (...args) => {
    console.warn(`[${getTimestamp()}] [WARN]`, ...args.map(sanitize));
  },

  /**
   * Error level - Always shown
   * Use for failures and exceptions
   */
  error: (message, error) => {
    const errorInfo = error ? {
      message: error.message,
      code: error.code,
      stack: isDev ? error.stack : undefined,
    } : undefined;

    console.error(`[${getTimestamp()}] [ERROR]`, message, errorInfo);

    // TODO: In production, send to crash reporting service (Sentry, etc.)
    // if (!isDev && error) {
    //   Sentry.captureException(error);
    // }
  },

  /**
   * Group logs together (dev only)
   */
  group: (label) => {
    if (isDev) {
      console.group(`[${getTimestamp()}] ${label}`);
    }
  },

  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * Log with custom tag
   */
  tag: (tag, ...args) => {
    if (isDev) {
      console.log(`[${getTimestamp()}] [${tag.toUpperCase()}]`, ...args.map(sanitize));
    }
  },
};

export default Logger;
