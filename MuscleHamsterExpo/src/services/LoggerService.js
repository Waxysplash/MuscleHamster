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
 * - Sends errors to Firebase Crashlytics in production (when enabled)
 */

// Firebase Crashlytics - temporarily disabled until config files are added
// TODO: Re-enable after adding GoogleService-Info.plist and google-services.json
// import crashlytics from '@react-native-firebase/crashlytics';
const crashlytics = () => null; // Stub until Firebase is configured

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
   * Sends to Firebase Crashlytics in production
   */
  error: (message, error) => {
    const errorInfo = error ? {
      message: error.message,
      code: error.code,
      stack: isDev ? error.stack : undefined,
    } : undefined;

    console.error(`[${getTimestamp()}] [ERROR]`, message, errorInfo);

    // Send to Firebase Crashlytics in production (when enabled)
    if (!isDev && crashlytics()) {
      try {
        // Log the error message as a custom log
        crashlytics().log(message);

        if (error) {
          // Record the actual error/exception
          crashlytics().recordError(error);
        }
      } catch (crashlyticsError) {
        // Silently fail if Crashlytics isn't available
      }
    }
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

  /**
   * Set user ID for crash reports (helps identify which user experienced a crash)
   * Call this after user logs in
   */
  setUserId: (userId) => {
    if (!isDev && userId && crashlytics()) {
      try {
        crashlytics().setUserId(userId);
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Set custom attributes for crash reports
   * Useful for debugging context (e.g., current screen, feature flags)
   */
  setAttribute: (key, value) => {
    if (!isDev && crashlytics()) {
      try {
        crashlytics().setAttribute(key, String(value));
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Log a breadcrumb message (appears in crash reports)
   * Use to track user flow leading up to a crash
   */
  breadcrumb: (message) => {
    if (!isDev && crashlytics()) {
      try {
        crashlytics().log(message);
      } catch (e) {
        // Silently fail
      }
    }
  },
};

export default Logger;
