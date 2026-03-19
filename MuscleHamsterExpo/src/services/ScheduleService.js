// Schedule Service - Weekly Planner Feature
// Manages workout preferences and weekly schedules

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Logger from './LoggerService';

// ============================================
// CONSTANTS
// ============================================

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const DAY_TYPES = {
  EMPTY: 'empty',
  WORKOUT: 'workout',
  REST: 'rest',
};

export const WORKOUT_TYPES = {
  STOCK: 'stock',
  CUSTOM: 'custom',
};

// ============================================
// DATE HELPERS
// ============================================

/**
 * Get the Monday of the current week (week starts on Monday)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const getCurrentWeekStart = () => {
  const now = new Date();
  return getWeekStartForDate(now);
};

/**
 * Get the Monday of the week containing the given date
 * @param {Date} date - Any date
 * @returns {string} ISO date string (YYYY-MM-DD) of that week's Monday
 */
export const getWeekStartForDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday = 0, so adjust: Sunday becomes 6, Monday becomes 0
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

/**
 * Get the day name for today (lowercase)
 * @returns {string} e.g., 'monday', 'tuesday', etc.
 */
export const getTodayName = () => {
  const day = new Date().getDay();
  // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
  const index = day === 0 ? 6 : day - 1;
  return DAYS_OF_WEEK[index];
};

/**
 * Get the date for a specific day of a given week
 * @param {string} weekStart - ISO date string of Monday (YYYY-MM-DD)
 * @param {string} dayName - Day name (e.g., 'wednesday')
 * @returns {Date} The date object for that day
 */
export const getDateForDay = (weekStart, dayName) => {
  const monday = new Date(weekStart + 'T00:00:00');
  const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
  const result = new Date(monday);
  result.setDate(monday.getDate() + dayIndex);
  return result;
};

/**
 * Format a date for display (e.g., "Mar 18")
 * @param {Date} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get the previous week's start date
 * @param {string} weekStart - Current week's Monday (YYYY-MM-DD)
 * @returns {string} Previous week's Monday (YYYY-MM-DD)
 */
export const getPreviousWeekStart = (weekStart) => {
  const monday = new Date(weekStart + 'T00:00:00');
  monday.setDate(monday.getDate() - 7);
  return monday.toISOString().split('T')[0];
};

/**
 * Get the next week's start date
 * @param {string} weekStart - Current week's Monday (YYYY-MM-DD)
 * @returns {string} Next week's Monday (YYYY-MM-DD)
 */
export const getNextWeekStart = (weekStart) => {
  const monday = new Date(weekStart + 'T00:00:00');
  monday.setDate(monday.getDate() + 7);
  return monday.toISOString().split('T')[0];
};

/**
 * Check if a given week is the current week
 * @param {string} weekStart - Week's Monday (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isCurrentWeek = (weekStart) => {
  return weekStart === getCurrentWeekStart();
};

// ============================================
// DEFAULT DATA STRUCTURES
// ============================================

/**
 * Create default workout preferences
 */
const createDefaultPreferences = () => ({
  daysPerWeek: 3,
  preferredDays: ['monday', 'wednesday', 'friday'],
  reminderTime: '07:00',
  setupCompleted: false,
  createdAt: null,
  updatedAt: null,
});

/**
 * Create an empty day schedule
 */
export const createEmptyDay = () => ({
  type: DAY_TYPES.EMPTY,
});

/**
 * Create a workout day schedule
 */
export const createWorkoutDay = (workoutId, workoutType, workoutName) => ({
  type: DAY_TYPES.WORKOUT,
  workoutId: workoutId || null,
  workoutType: workoutType || null, // 'stock' or 'custom'
  workoutName: workoutName || null,
  completed: false,
  completedAt: null,
});

/**
 * Create a rest day schedule
 */
export const createRestDay = () => ({
  type: DAY_TYPES.REST,
  completed: false,
  completedAt: null,
});

/**
 * Create an empty week schedule
 */
const createEmptyWeek = () => {
  const days = {};
  DAYS_OF_WEEK.forEach((day) => {
    days[day] = createEmptyDay();
  });
  return days;
};

// ============================================
// PREFERENCES SERVICE
// ============================================

/**
 * Get user's workout preferences
 * @param {string} userId
 * @returns {Promise<Object>} Preferences object
 */
export const getWorkoutPreferences = async (userId) => {
  if (!userId) {
    Logger.warn('ScheduleService: getWorkoutPreferences called without userId');
    return createDefaultPreferences();
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().workoutPreferences) {
      return userDoc.data().workoutPreferences;
    }

    return createDefaultPreferences();
  } catch (error) {
    Logger.error('ScheduleService: Error getting workout preferences', error);
    return createDefaultPreferences();
  }
};

/**
 * Save user's workout preferences
 * @param {string} userId
 * @param {Object} preferences - { daysPerWeek, preferredDays, reminderTime }
 * @returns {Promise<boolean>} Success status
 */
export const saveWorkoutPreferences = async (userId, preferences) => {
  if (!userId) {
    Logger.warn('ScheduleService: saveWorkoutPreferences called without userId');
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    const prefsToSave = {
      daysPerWeek: preferences.daysPerWeek || 3,
      preferredDays: preferences.preferredDays || ['monday', 'wednesday', 'friday'],
      reminderTime: preferences.reminderTime || '07:00',
      setupCompleted: true,
      updatedAt: serverTimestamp(),
    };

    if (userDoc.exists()) {
      // Check if this is first time setting up
      const existingPrefs = userDoc.data().workoutPreferences;
      if (!existingPrefs?.createdAt) {
        prefsToSave.createdAt = serverTimestamp();
      }

      await updateDoc(userDocRef, {
        workoutPreferences: prefsToSave,
      });
    } else {
      // Create user doc with preferences
      prefsToSave.createdAt = serverTimestamp();
      await setDoc(userDocRef, {
        workoutPreferences: prefsToSave,
      }, { merge: true });
    }

    Logger.info('ScheduleService: Saved workout preferences');
    return true;
  } catch (error) {
    Logger.error('ScheduleService: Error saving workout preferences', error);
    return false;
  }
};

/**
 * Check if user has completed preferences setup
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const hasCompletedSetup = async (userId) => {
  const prefs = await getWorkoutPreferences(userId);
  return prefs.setupCompleted === true;
};

// ============================================
// WEEKLY SCHEDULE SERVICE
// ============================================

/**
 * Generate document ID for a week schedule
 * @param {string} userId
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @returns {string}
 */
const getWeekDocId = (userId, weekStart) => `${userId}_${weekStart}`;

/**
 * Get schedule for a specific week
 * @param {string} userId
 * @param {string} weekStart - Monday date (YYYY-MM-DD), defaults to current week
 * @returns {Promise<Object|null>} Week schedule or null if not found
 */
export const getWeekSchedule = async (userId, weekStart = null) => {
  if (!userId) {
    Logger.warn('ScheduleService: getWeekSchedule called without userId');
    return null;
  }

  const week = weekStart || getCurrentWeekStart();

  try {
    const docId = getWeekDocId(userId, week);
    const scheduleRef = doc(db, 'weeklySchedules', docId);
    const scheduleDoc = await getDoc(scheduleRef);

    if (scheduleDoc.exists()) {
      return scheduleDoc.data();
    }

    return null;
  } catch (error) {
    Logger.error('ScheduleService: Error getting week schedule', error);
    return null;
  }
};

/**
 * Create a new week schedule
 * @param {string} userId
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @param {Object} initialDays - Optional initial days configuration
 * @returns {Promise<Object|null>} Created schedule or null on error
 */
export const createWeekSchedule = async (userId, weekStart, initialDays = null) => {
  if (!userId) {
    Logger.warn('ScheduleService: createWeekSchedule called without userId');
    return null;
  }

  try {
    const docId = getWeekDocId(userId, weekStart);
    const scheduleRef = doc(db, 'weeklySchedules', docId);

    const scheduleData = {
      userId,
      weekStart,
      days: initialDays || createEmptyWeek(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(scheduleRef, scheduleData);
    Logger.info(`ScheduleService: Created week schedule for ${weekStart}`);
    return scheduleData;
  } catch (error) {
    Logger.error('ScheduleService: Error creating week schedule', error);
    return null;
  }
};

/**
 * Get or create schedule for a specific week
 * @param {string} userId
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @returns {Promise<Object>} Week schedule (existing or newly created)
 */
export const getOrCreateWeekSchedule = async (userId, weekStart = null) => {
  const week = weekStart || getCurrentWeekStart();

  let schedule = await getWeekSchedule(userId, week);

  if (!schedule) {
    schedule = await createWeekSchedule(userId, week);
  }

  return schedule;
};

/**
 * Update a specific day in the week schedule
 * @param {string} userId
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @param {string} dayName - Day to update (e.g., 'monday')
 * @param {Object} dayData - Day configuration
 * @returns {Promise<boolean>} Success status
 */
export const updateDaySchedule = async (userId, weekStart, dayName, dayData) => {
  if (!userId || !DAYS_OF_WEEK.includes(dayName)) {
    Logger.warn('ScheduleService: updateDaySchedule called with invalid params');
    return false;
  }

  try {
    const docId = getWeekDocId(userId, weekStart);
    const scheduleRef = doc(db, 'weeklySchedules', docId);
    const scheduleDoc = await getDoc(scheduleRef);

    if (!scheduleDoc.exists()) {
      // Create the schedule first
      await createWeekSchedule(userId, weekStart);
    }

    await updateDoc(scheduleRef, {
      [`days.${dayName}`]: dayData,
      updatedAt: serverTimestamp(),
    });

    Logger.info(`ScheduleService: Updated ${dayName} for week ${weekStart}`);
    return true;
  } catch (error) {
    Logger.error('ScheduleService: Error updating day schedule', error);
    return false;
  }
};

/**
 * Mark a day as completed
 * @param {string} userId
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @param {string} dayName - Day to mark complete
 * @returns {Promise<boolean>} Success status
 */
export const markDayCompleted = async (userId, weekStart, dayName) => {
  if (!userId || !DAYS_OF_WEEK.includes(dayName)) {
    return false;
  }

  try {
    const docId = getWeekDocId(userId, weekStart);
    const scheduleRef = doc(db, 'weeklySchedules', docId);

    await updateDoc(scheduleRef, {
      [`days.${dayName}.completed`]: true,
      [`days.${dayName}.completedAt`]: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    Logger.info(`ScheduleService: Marked ${dayName} as completed`);
    return true;
  } catch (error) {
    Logger.error('ScheduleService: Error marking day completed', error);
    return false;
  }
};

/**
 * Clear a day (set to empty)
 * @param {string} userId
 * @param {string} weekStart
 * @param {string} dayName
 * @returns {Promise<boolean>}
 */
export const clearDay = async (userId, weekStart, dayName) => {
  return updateDaySchedule(userId, weekStart, dayName, createEmptyDay());
};

/**
 * Set a day as rest day
 * @param {string} userId
 * @param {string} weekStart
 * @param {string} dayName
 * @returns {Promise<boolean>}
 */
export const setRestDay = async (userId, weekStart, dayName) => {
  return updateDaySchedule(userId, weekStart, dayName, createRestDay());
};

/**
 * Schedule a workout for a day
 * @param {string} userId
 * @param {string} weekStart
 * @param {string} dayName
 * @param {string} workoutId
 * @param {string} workoutType - 'stock' or 'custom'
 * @param {string} workoutName
 * @returns {Promise<boolean>}
 */
export const scheduleWorkout = async (userId, weekStart, dayName, workoutId, workoutType, workoutName) => {
  return updateDaySchedule(
    userId,
    weekStart,
    dayName,
    createWorkoutDay(workoutId, workoutType, workoutName)
  );
};

// ============================================
// QUICK ACCESS METHODS
// ============================================

/**
 * Get today's schedule
 * @param {string} userId
 * @returns {Promise<Object|null>} Today's day data or null
 */
export const getTodaySchedule = async (userId) => {
  if (!userId) return null;

  const weekStart = getCurrentWeekStart();
  const todayName = getTodayName();
  const schedule = await getWeekSchedule(userId, weekStart);

  if (schedule && schedule.days && schedule.days[todayName]) {
    return {
      ...schedule.days[todayName],
      dayName: todayName,
      weekStart,
    };
  }

  return null;
};

/**
 * Check if user has any scheduled days this week
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const hasAnyScheduleThisWeek = async (userId) => {
  if (!userId) return false;

  const schedule = await getWeekSchedule(userId);

  if (!schedule || !schedule.days) return false;

  return DAYS_OF_WEEK.some((day) => {
    const dayData = schedule.days[day];
    return dayData && dayData.type !== DAY_TYPES.EMPTY;
  });
};

/**
 * Get count of scheduled workout days this week
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getScheduledWorkoutCount = async (userId) => {
  if (!userId) return 0;

  const schedule = await getWeekSchedule(userId);

  if (!schedule || !schedule.days) return 0;

  return DAYS_OF_WEEK.filter((day) => {
    const dayData = schedule.days[day];
    return dayData && dayData.type === DAY_TYPES.WORKOUT;
  }).length;
};

/**
 * Get count of completed days this week
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const getCompletedCount = async (userId) => {
  if (!userId) return 0;

  const schedule = await getWeekSchedule(userId);

  if (!schedule || !schedule.days) return 0;

  return DAYS_OF_WEEK.filter((day) => {
    const dayData = schedule.days[day];
    return dayData && dayData.completed === true;
  }).length;
};

// ============================================
// COPY/REPEAT FEATURES
// ============================================

/**
 * Copy previous week's schedule to current week
 * @param {string} userId
 * @returns {Promise<boolean>} Success status
 */
export const copyPreviousWeek = async (userId) => {
  if (!userId) return false;

  try {
    const currentWeek = getCurrentWeekStart();
    const previousWeek = getPreviousWeekStart(currentWeek);

    const previousSchedule = await getWeekSchedule(userId, previousWeek);

    if (!previousSchedule || !previousSchedule.days) {
      Logger.info('ScheduleService: No previous week schedule to copy');
      return false;
    }

    // Copy days but reset completed status
    const newDays = {};
    DAYS_OF_WEEK.forEach((day) => {
      const prevDay = previousSchedule.days[day];
      if (prevDay && prevDay.type !== DAY_TYPES.EMPTY) {
        newDays[day] = {
          ...prevDay,
          completed: false,
          completedAt: null,
        };
      } else {
        newDays[day] = createEmptyDay();
      }
    });

    await createWeekSchedule(userId, currentWeek, newDays);
    Logger.info('ScheduleService: Copied previous week schedule');
    return true;
  } catch (error) {
    Logger.error('ScheduleService: Error copying previous week', error);
    return false;
  }
};

/**
 * Apply user preferences to create a week template
 * Pre-fills workout days based on preferences (without specific workouts)
 * @param {string} userId
 * @param {string} weekStart
 * @returns {Promise<boolean>}
 */
export const applyPreferencesToWeek = async (userId, weekStart = null) => {
  if (!userId) return false;

  try {
    const week = weekStart || getCurrentWeekStart();
    const prefs = await getWorkoutPreferences(userId);

    if (!prefs.setupCompleted || !prefs.preferredDays) {
      Logger.info('ScheduleService: No preferences to apply');
      return false;
    }

    const days = {};
    DAYS_OF_WEEK.forEach((day) => {
      if (prefs.preferredDays.includes(day)) {
        // Workout day without specific workout chosen yet
        days[day] = createWorkoutDay(null, null, null);
      } else {
        days[day] = createEmptyDay();
      }
    });

    await createWeekSchedule(userId, week, days);
    Logger.info('ScheduleService: Applied preferences to week');
    return true;
  } catch (error) {
    Logger.error('ScheduleService: Error applying preferences', error);
    return false;
  }
};

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const ScheduleService = {
  // Date helpers
  getCurrentWeekStart,
  getWeekStartForDate,
  getTodayName,
  getDateForDay,
  formatDateShort,
  getPreviousWeekStart,
  getNextWeekStart,
  isCurrentWeek,

  // Data creators
  createEmptyDay,
  createWorkoutDay,
  createRestDay,

  // Preferences
  getWorkoutPreferences,
  saveWorkoutPreferences,
  hasCompletedSetup,

  // Weekly schedule
  getWeekSchedule,
  createWeekSchedule,
  getOrCreateWeekSchedule,
  updateDaySchedule,
  markDayCompleted,
  clearDay,
  setRestDay,
  scheduleWorkout,

  // Quick access
  getTodaySchedule,
  hasAnyScheduleThisWeek,
  getScheduledWorkoutCount,
  getCompletedCount,

  // Copy/repeat
  copyPreviousWeek,
  applyPreferencesToWeek,

  // Constants
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_TYPES,
  WORKOUT_TYPES,
};

export default ScheduleService;
