// Analytics Service
// Thin wrapper over Firebase Analytics (@react-native-firebase/analytics).
//
// WHY THIS EXISTS: the app had zero product analytics — only Crashlytics.
// Without retention/funnel data we're shipping blind, and no trustworthy public
// retention benchmarks exist for this category (see docs/RESEARCH_2026-06).
//
// *** COMPLIANCE — READ BEFORE ADDING EVENTS ***
// Apple App Review Guideline §5.1.3(i) forbids using health/fitness data
// (HealthKit AND Motion & Fitness / CMPedometer, which is what expo-sensors
// reads) for "advertising, marketing, or other use-based data mining".
// Firebase Analytics inadvertently receiving health-derived values is a
// DOCUMENTED app-removal trigger.
//
// => NEVER pass step counts, calories, heart rate, distance or any health
//    metric as an event parameter. sanitizeParams() below strips them as a
//    backstop, but do not rely on it — just don't log health data.

import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import Logger from './LoggerService';

// Parameter keys that must never reach analytics (health data — see §5.1.3(i))
const BLOCKED_PARAM_PATTERN =
  /step|calorie|kcal|heart|bpm|distance|health|hk_|pedometer|active_minutes|exercise_minutes|weight|bmi/i;

let _analytics = null;
let _enabled = false;

const getClient = () => {
  if (!_analytics) {
    _analytics = getAnalytics();
  }
  return _analytics;
};

// Strip any health-related params as a compliance backstop.
const sanitizeParams = (params) => {
  if (!params) return undefined;
  const clean = {};
  Object.keys(params).forEach((key) => {
    if (BLOCKED_PARAM_PATTERN.test(key)) {
      Logger.warn(
        `Analytics: blocked health-related param "${key}" (App Review §5.1.3(i)). Not sent.`
      );
      return;
    }
    const value = params[key];
    // Firebase accepts string/number/boolean params only
    if (value === null || value === undefined) return;
    clean[key] = typeof value === 'object' ? String(value) : value;
  });
  return Object.keys(clean).length ? clean : undefined;
};

// Initialize. Called once on app start.
// We explicitly enable collection because GoogleService-Info.plist ships with
// IS_ANALYTICS_ENABLED=false — this guarantees collection regardless of that flag.
export const initializeAnalytics = async () => {
  try {
    await setAnalyticsCollectionEnabled(getClient(), true);
    _enabled = true;
    Logger.debug('AnalyticsService: initialized');
  } catch (error) {
    _enabled = false;
    Logger.warn('AnalyticsService: unavailable, analytics disabled:', error?.message);
  }
};

// Core logger. Never throws — analytics must never break the app.
export const track = async (eventName, params) => {
  const safeParams = sanitizeParams(params);
  if (__DEV__) {
    Logger.debug(`Analytics → ${eventName}`, safeParams || '');
  }
  if (!_enabled) return;
  try {
    await logEvent(getClient(), eventName, safeParams);
  } catch (error) {
    Logger.warn(`AnalyticsService: failed to log "${eventName}":`, error?.message);
  }
};

// ---- Named events (the retention-critical moments) ----------------------
// Firebase automatically logs first_open / session_start / app_update, which
// is what powers the D1/D7/D30 retention cohorts. These add the funnel.

export const logOnboardingComplete = () => track('onboarding_complete');

// THE core daily action — the single best retention proxy for this app.
export const logDailyCheckIn = ({ pointsEarned, newStreak } = {}) =>
  track('daily_checkin_complete', {
    points_earned: pointsEarned,
    streak_length: newStreak,
  });

export const logWorkoutComplete = ({ workoutId, exercisesCompleted } = {}) =>
  track('workout_complete', {
    workout_id: workoutId,
    exercises_completed: exercisesCompleted,
  });

export const logRestDay = () => track('rest_day_logged');

export const logShopPurchase = ({ itemId, category, price } = {}) =>
  track('shop_purchase', {
    item_id: itemId,
    item_category: category,
    price_points: price,
  });

export default {
  initializeAnalytics,
  track,
  logOnboardingComplete,
  logDailyCheckIn,
  logWorkoutComplete,
  logRestDay,
  logShopPurchase,
};
