// Schedule Context - Weekly Planner State Management
// Provides schedule state and actions throughout the app

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useUserProfile } from './UserProfileContext';
import {
  ScheduleService,
  DAYS_OF_WEEK,
  DAY_TYPES,
  createEmptyDay,
  createWorkoutDay,
  createRestDay,
} from '../services/ScheduleService';
import Logger from '../services/LoggerService';
import { rescheduleNotifications } from '../services/NotificationService';

// AsyncStorage keys
const SCHEDULE_STORAGE_KEY = '@muscle_hamster_schedule';
const PREFERENCES_STORAGE_KEY = '@muscle_hamster_preferences';

// ============================================
// ASYNC STORAGE HELPERS
// ============================================

/**
 * Save schedule to AsyncStorage for local persistence
 */
const saveScheduleToStorage = async (userId, weekStart, schedule) => {
  try {
    const key = `${SCHEDULE_STORAGE_KEY}_${userId}_${weekStart}`;
    await AsyncStorage.setItem(key, JSON.stringify(schedule));
  } catch (err) {
    Logger.warn('[ScheduleContext] Failed to save to AsyncStorage:', err);
  }
};

/**
 * Load schedule from AsyncStorage
 */
const loadScheduleFromStorage = async (userId, weekStart) => {
  try {
    const key = `${SCHEDULE_STORAGE_KEY}_${userId}_${weekStart}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    Logger.warn('[ScheduleContext] Failed to load from AsyncStorage:', err);
    return null;
  }
};

/**
 * Save preferences to AsyncStorage
 */
const savePreferencesToStorage = async (userId, preferences) => {
  try {
    const key = `${PREFERENCES_STORAGE_KEY}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(preferences));
  } catch (err) {
    console.warn('[AsyncStorage] Failed to save preferences:', err);
  }
};

/**
 * Load preferences from AsyncStorage
 */
const loadPreferencesFromStorage = async (userId) => {
  try {
    const key = `${PREFERENCES_STORAGE_KEY}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    console.warn('[AsyncStorage] Failed to load preferences:', err);
    return null;
  }
};

// ============================================
// CONTEXT CREATION
// ============================================

const ScheduleContext = createContext(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function ScheduleProvider({ children }) {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();
  const userId = currentUser?.id;

  // ----------------------------------------
  // STATE
  // ----------------------------------------

  // Preferences state
  const [preferences, setPreferences] = useState({
    daysPerWeek: 3,
    preferredDays: ['monday', 'wednesday', 'friday'],
    reminderTime: '07:00',
    setupCompleted: false,
    setupSkipped: false,
  });

  // Current week schedule state
  const [currentWeekStart, setCurrentWeekStart] = useState(
    ScheduleService.getCurrentWeekStart()
  );
  const [currentWeekSchedule, setCurrentWeekSchedule] = useState(null);

  // Loading states
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Ref to track last synced workout days from profile
  const lastSyncedWorkoutDays = useRef(null);

  // Ref to prevent redundant loads
  const isLoadingRef = useRef(false);
  const lastLoadedWeek = useRef(null);

  // ----------------------------------------
  // DERIVED STATE
  // ----------------------------------------

  // Get today's schedule from current week
  const todaySchedule = useMemo(() => {
    if (!currentWeekSchedule?.days) return null;

    const todayName = ScheduleService.getTodayName();
    const dayData = currentWeekSchedule.days[todayName];

    if (!dayData || dayData.type === DAY_TYPES.EMPTY) return null;

    return {
      ...dayData,
      dayName: todayName,
      weekStart: currentWeekStart,
    };
  }, [currentWeekSchedule, currentWeekStart]);

  // Check if user has any scheduled days this week
  const hasScheduleThisWeek = useMemo(() => {
    if (!currentWeekSchedule?.days) return false;

    return DAYS_OF_WEEK.some((day) => {
      const dayData = currentWeekSchedule.days[day];
      return dayData && dayData.type !== DAY_TYPES.EMPTY;
    });
  }, [currentWeekSchedule]);

  // Count of scheduled workout days this week
  const scheduledWorkoutCount = useMemo(() => {
    if (!currentWeekSchedule?.days) return 0;

    return DAYS_OF_WEEK.filter((day) => {
      const dayData = currentWeekSchedule.days[day];
      return dayData && dayData.type === DAY_TYPES.WORKOUT;
    }).length;
  }, [currentWeekSchedule]);

  // Count of completed days this week
  const completedCount = useMemo(() => {
    if (!currentWeekSchedule?.days) return 0;

    return DAYS_OF_WEEK.filter((day) => {
      const dayData = currentWeekSchedule.days[day];
      return dayData && dayData.completed === true;
    }).length;
  }, [currentWeekSchedule]);

  // Check if viewing current week
  const isCurrentWeek = useMemo(() => {
    return ScheduleService.isCurrentWeek(currentWeekStart);
  }, [currentWeekStart]);

  // Has completed setup
  const hasCompletedSetup = preferences.setupCompleted === true;

  // Has skipped setup (user dismissed the modal)
  const hasSkippedSetup = preferences.setupSkipped === true;

  // Combined loading state
  const isLoading = isLoadingPreferences || isLoadingSchedule;

  // ----------------------------------------
  // LOAD DATA
  // ----------------------------------------

  // Load preferences
  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setIsLoadingPreferences(false);
      return;
    }

    try {
      setIsLoadingPreferences(true);
      const prefs = await ScheduleService.getWorkoutPreferences(userId);
      setPreferences(prefs);
      setError(null);
    } catch (err) {
      Logger.error('ScheduleContext: Error loading preferences', err);
      setError('Failed to load workout preferences');
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [userId]);

  // Load schedule for a specific week
  const loadWeekSchedule = useCallback(async (weekStart = null, forceReload = false) => {
    if (!userId) {
      setIsLoadingSchedule(false);
      return;
    }

    const week = weekStart || ScheduleService.getCurrentWeekStart();

    // Prevent redundant loads for the same week
    if (!forceReload && isLoadingRef.current && lastLoadedWeek.current === week) {
      return;
    }

    // Skip if we already loaded this week and aren't forcing a reload
    if (!forceReload && lastLoadedWeek.current === week && currentWeekSchedule) {
      return;
    }

    isLoadingRef.current = true;
    lastLoadedWeek.current = week;

    try {
      setIsLoadingSchedule(true);

      // First, try to load from AsyncStorage for immediate display
      const localSchedule = await loadScheduleFromStorage(userId, week);
      if (localSchedule) {
        setCurrentWeekSchedule(localSchedule);
        setCurrentWeekStart(week);
      }

      // Then try Firebase for the latest data
      try {
        const schedule = await ScheduleService.getWeekSchedule(userId, week);
        if (schedule) {
          setCurrentWeekSchedule(schedule);
          // Sync back to AsyncStorage
          saveScheduleToStorage(userId, week, schedule);
        } else if (!localSchedule) {
          // No data from Firebase or local storage
          setCurrentWeekSchedule(null);
        }
      } catch (firebaseErr) {
        Logger.warn('[ScheduleContext] Firebase load failed, using local data:', firebaseErr);
        // If Firebase fails but we have local data, that's okay
        if (!localSchedule) {
          Logger.error('ScheduleContext: Error loading week schedule', firebaseErr);
        }
      }

      setCurrentWeekStart(week);
      setError(null);
    } catch (err) {
      Logger.error('ScheduleContext: Error loading week schedule', err);
      setError('Failed to load schedule');
    } finally {
      setIsLoadingSchedule(false);
      isLoadingRef.current = false;
    }
  }, [userId, currentWeekSchedule]);

  // Load current week
  const loadCurrentWeek = useCallback(() => {
    const currentWeek = ScheduleService.getCurrentWeekStart();
    return loadWeekSchedule(currentWeek);
  }, [loadWeekSchedule]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadPreferences(), loadCurrentWeek()]);
  }, [loadPreferences, loadCurrentWeek]);

  // ----------------------------------------
  // PREFERENCES ACTIONS
  // ----------------------------------------

  // Save preferences and optionally apply to current week
  const savePreferences = useCallback(async (newPrefs, applyToCurrentWeek = false) => {
    if (!userId) return false;

    try {
      setIsSaving(true);
      const success = await ScheduleService.saveWorkoutPreferences(userId, newPrefs);

      if (success) {
        setPreferences({
          ...newPrefs,
          setupCompleted: true,
        });

        // Optionally pre-fill current week with preferences
        if (applyToCurrentWeek) {
          await ScheduleService.applyPreferencesToWeek(userId);
          // Force reload to pick up the new schedule data
          const currentWeek = ScheduleService.getCurrentWeekStart();
          await loadWeekSchedule(currentWeek, true);
        }

        Logger.info('ScheduleContext: Saved preferences');
        return true;
      }

      return false;
    } catch (err) {
      Logger.error('ScheduleContext: Error saving preferences', err);
      setError('Failed to save preferences');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, loadWeekSchedule]);

  // Complete initial setup
  const completeSetup = useCallback(async (setupPrefs) => {
    return savePreferences(setupPrefs, true);
  }, [savePreferences]);

  // Skip setup (user dismissed the modal)
  const skipSetup = useCallback(async () => {
    if (!userId) return false;

    try {
      // Save that user skipped setup
      const skippedPrefs = {
        ...preferences,
        setupSkipped: true,
      };
      await ScheduleService.saveWorkoutPreferences(userId, skippedPrefs);
      setPreferences(skippedPrefs);
      Logger.info('ScheduleContext: User skipped setup');
      return true;
    } catch (err) {
      Logger.error('ScheduleContext: Error skipping setup', err);
      return false;
    }
  }, [userId, preferences]);

  // ----------------------------------------
  // SCHEDULE ACTIONS
  // ----------------------------------------

  // Navigate to previous week
  const goToPreviousWeek = useCallback(() => {
    const prevWeek = ScheduleService.getPreviousWeekStart(currentWeekStart);
    loadWeekSchedule(prevWeek);
  }, [currentWeekStart, loadWeekSchedule]);

  // Navigate to next week
  const goToNextWeek = useCallback(() => {
    const nextWeek = ScheduleService.getNextWeekStart(currentWeekStart);
    loadWeekSchedule(nextWeek);
  }, [currentWeekStart, loadWeekSchedule]);

  // Go back to current week
  const goToCurrentWeek = useCallback(() => {
    loadCurrentWeek();
  }, [loadCurrentWeek]);

  // Update a specific day
  const updateDay = useCallback(async (dayName, dayData) => {
    if (!userId) {
      Logger.warn('ScheduleContext: updateDay called without userId');
      return false;
    }

    // Get the week start, defaulting to current week if not set
    const weekStart = currentWeekStart || ScheduleService.getCurrentWeekStart();

    if (!weekStart) {
      Logger.warn('ScheduleContext: updateDay could not determine weekStart');
      return false;
    }

    try {
      setIsSaving(true);

      // STEP 1: Save to Firebase FIRST (source of truth)
      const firebaseSuccess = await ScheduleService.updateDaySchedule(
        userId,
        weekStart,
        dayName,
        dayData
      );

      if (!firebaseSuccess) {
        Logger.warn('ScheduleContext: Firebase updateDaySchedule returned false');
        return false;
      }

      // STEP 2: Update local state to match what we saved
      setCurrentWeekSchedule((prev) => {
        const base = prev || {
          userId,
          weekStart,
          days: {},
        };

        const newSchedule = {
          ...base,
          weekStart,
          days: {
            ...base.days,
            [dayName]: dayData,
          },
        };

        // Also save to AsyncStorage
        saveScheduleToStorage(userId, weekStart, newSchedule);

        return newSchedule;
      });

      // Update currentWeekStart if it wasn't set
      if (!currentWeekStart) {
        setCurrentWeekStart(weekStart);
      }

      return true;
    } catch (err) {
      Logger.error('ScheduleContext: Error in updateDay', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, currentWeekStart]);

  // Schedule workout(s) for a day
  // Supports both legacy (single workout) and new (array of workouts) formats
  const scheduleWorkout = useCallback(async (dayName, workoutsOrId, workoutType, workoutName) => {
    // Check if first argument is an array (new format)
    let dayData;
    if (Array.isArray(workoutsOrId)) {
      dayData = createWorkoutDay(workoutsOrId);
    } else {
      // Legacy single workout format
      dayData = createWorkoutDay(workoutsOrId, workoutType, workoutName);
    }

    const success = await updateDay(dayName, dayData);

    // Force reload schedule after save to ensure UI sync
    if (success) {
      lastLoadedWeek.current = null; // Reset to allow reload
      await loadCurrentWeek();
    }

    return success;
  }, [updateDay, loadCurrentWeek]);

  // Set a day as rest day
  const setRestDay = useCallback(async (dayName) => {
    const dayData = createRestDay();
    return updateDay(dayName, dayData);
  }, [updateDay]);

  // Clear a day (set to empty)
  const clearDay = useCallback(async (dayName) => {
    const dayData = createEmptyDay();
    return updateDay(dayName, dayData);
  }, [updateDay]);

  // Mark a day as completed
  const markDayCompleted = useCallback(async (dayName) => {
    if (!userId || !currentWeekSchedule?.days?.[dayName]) return false;

    try {
      setIsSaving(true);

      const success = await ScheduleService.markDayCompleted(
        userId,
        currentWeekStart,
        dayName
      );

      if (success) {
        // Update local state
        setCurrentWeekSchedule((prev) => ({
          ...prev,
          days: {
            ...prev?.days,
            [dayName]: {
              ...prev?.days?.[dayName],
              completed: true,
              completedAt: new Date().toISOString(),
            },
          },
        }));
        return true;
      }

      return false;
    } catch (err) {
      Logger.error('ScheduleContext: Error marking day completed', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, currentWeekStart, currentWeekSchedule]);

  // Mark today as completed
  const markTodayCompleted = useCallback(async () => {
    const todayName = ScheduleService.getTodayName();
    return markDayCompleted(todayName);
  }, [markDayCompleted]);

  // Mark a specific workout as complete (or toggle it)
  const markWorkoutComplete = useCallback(async (dayName, workoutId) => {
    if (!userId || !currentWeekSchedule?.days?.[dayName]) return false;

    try {
      setIsSaving(true);

      const dayData = currentWeekSchedule.days[dayName];
      const workouts = dayData.workouts || [];

      // Toggle the completed state for this specific workout
      const updatedWorkouts = workouts.map(w => {
        if (w.workoutId === workoutId) {
          return { ...w, completed: !w.completed };
        }
        return w;
      });

      const updatedDayData = {
        ...dayData,
        workouts: updatedWorkouts,
      };

      // Save to Firebase
      const firebaseSuccess = await ScheduleService.updateDaySchedule(
        userId,
        currentWeekStart,
        dayName,
        updatedDayData
      );

      if (firebaseSuccess) {
        // Update local state
        setCurrentWeekSchedule((prev) => ({
          ...prev,
          days: {
            ...prev?.days,
            [dayName]: updatedDayData,
          },
        }));

        // Save to AsyncStorage
        const newSchedule = {
          ...currentWeekSchedule,
          days: {
            ...currentWeekSchedule.days,
            [dayName]: updatedDayData,
          },
        };
        saveScheduleToStorage(userId, currentWeekStart, newSchedule);

        return true;
      }

      return false;
    } catch (err) {
      Logger.error('ScheduleContext: Error marking workout completed', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, currentWeekStart, currentWeekSchedule]);

  // ----------------------------------------
  // COPY/REPEAT ACTIONS
  // ----------------------------------------

  // Copy previous week's schedule to current week
  const copyLastWeek = useCallback(async () => {
    if (!userId) return false;

    try {
      setIsSaving(true);
      const success = await ScheduleService.copyPreviousWeek(userId);

      if (success) {
        await loadCurrentWeek();
        return true;
      }

      return false;
    } catch (err) {
      Logger.error('ScheduleContext: Error copying last week', err);
      setError('Failed to copy last week');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, loadCurrentWeek]);

  // Apply preferences to current week (pre-fill workout days)
  const applyPreferencesToCurrentWeek = useCallback(async () => {
    if (!userId) return false;

    try {
      setIsSaving(true);
      const success = await ScheduleService.applyPreferencesToWeek(userId);

      if (success) {
        await loadCurrentWeek();
        return true;
      }

      return false;
    } catch (err) {
      Logger.error('ScheduleContext: Error applying preferences', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, loadCurrentWeek]);

  // ----------------------------------------
  // EFFECTS
  // ----------------------------------------

  // Load data when user changes
  useEffect(() => {
    if (userId) {
      loadPreferences();
      loadCurrentWeek();
    } else {
      // Reset state when logged out
      setPreferences({
        daysPerWeek: 3,
        preferredDays: ['monday', 'wednesday', 'friday'],
        reminderTime: '07:00',
        setupCompleted: false,
        setupSkipped: false,
      });
      setCurrentWeekSchedule(null);
      setIsLoadingPreferences(false);
      setIsLoadingSchedule(false);
    }
  }, [userId, loadPreferences, loadCurrentWeek]);

  // Update current week start at midnight (in case app stays open)
  useEffect(() => {
    const checkDate = () => {
      const newWeekStart = ScheduleService.getCurrentWeekStart();
      if (newWeekStart !== currentWeekStart && isCurrentWeek) {
        setCurrentWeekStart(newWeekStart);
        loadWeekSchedule(newWeekStart);
      }
    };

    // Check every minute
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [currentWeekStart, isCurrentWeek, loadWeekSchedule]);

  // Sync profile.workoutDays to schedule when they change
  // Note: We intentionally exclude savePreferences from deps since we use the ref guard
  useEffect(() => {
    if (!userId || !profile?.workoutDays) return;

    const workoutDays = profile.workoutDays;
    const daysKey = [...workoutDays].sort().join(',');

    // Skip if already synced these exact days
    if (lastSyncedWorkoutDays.current === daysKey) return;
    lastSyncedWorkoutDays.current = daysKey;

    Logger.info('ScheduleContext: Syncing workoutDays from profile', workoutDays);

    // Build new preferences from profile workout days
    const newPrefs = {
      daysPerWeek: workoutDays.length,
      preferredDays: workoutDays,
      reminderTime: preferences.reminderTime || '07:00',
      setupCompleted: true,
    };

    // Save preferences and apply to current week
    savePreferences(newPrefs, true);

    // Reschedule notifications so workout day reminders match the new days
    rescheduleNotifications(workoutDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, profile?.workoutDays]);

  // ----------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------

  const value = useMemo(() => ({
    // Preferences
    preferences,
    hasCompletedSetup,
    hasSkippedSetup,
    savePreferences,
    completeSetup,
    skipSetup,

    // Current week schedule
    currentWeekStart,
    currentWeekSchedule,
    todaySchedule,

    // Derived state
    hasScheduleThisWeek,
    scheduledWorkoutCount,
    completedCount,
    isCurrentWeek,

    // Loading states
    isLoading,
    isLoadingPreferences,
    isLoadingSchedule,
    isSaving,
    error,

    // Data loading
    loadPreferences,
    loadCurrentWeek,
    loadWeekSchedule,
    refreshData,

    // Week navigation
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,

    // Day actions
    updateDay,
    scheduleWorkout,
    setRestDay,
    clearDay,
    markDayCompleted,
    markTodayCompleted,
    markWorkoutComplete,

    // Copy/repeat
    copyLastWeek,
    applyPreferencesToCurrentWeek,

    // Constants (for convenience)
    DAYS_OF_WEEK,
    DAY_TYPES,
  }), [
    preferences,
    hasCompletedSetup,
    hasSkippedSetup,
    savePreferences,
    completeSetup,
    skipSetup,
    currentWeekStart,
    currentWeekSchedule,
    todaySchedule,
    hasScheduleThisWeek,
    scheduledWorkoutCount,
    completedCount,
    isCurrentWeek,
    isLoading,
    isLoadingPreferences,
    isLoadingSchedule,
    isSaving,
    error,
    loadPreferences,
    loadCurrentWeek,
    loadWeekSchedule,
    refreshData,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    updateDay,
    scheduleWorkout,
    setRestDay,
    clearDay,
    markDayCompleted,
    markTodayCompleted,
    markWorkoutComplete,
    copyLastWeek,
    applyPreferencesToCurrentWeek,
  ]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useSchedule() {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }

  return context;
}

export default ScheduleContext;
