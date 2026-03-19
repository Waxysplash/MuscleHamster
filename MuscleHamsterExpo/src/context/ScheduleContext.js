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
  const userId = currentUser?.uid;

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
  const loadWeekSchedule = useCallback(async (weekStart = null) => {
    if (!userId) {
      setIsLoadingSchedule(false);
      return;
    }

    const week = weekStart || ScheduleService.getCurrentWeekStart();

    try {
      setIsLoadingSchedule(true);
      const schedule = await ScheduleService.getWeekSchedule(userId, week);
      setCurrentWeekSchedule(schedule);
      setCurrentWeekStart(week);
      setError(null);
    } catch (err) {
      Logger.error('ScheduleContext: Error loading week schedule', err);
      setError('Failed to load schedule');
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [userId]);

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
          await loadCurrentWeek();
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
  }, [userId, loadCurrentWeek]);

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
    if (!userId) return false;

    try {
      setIsSaving(true);

      // Ensure week schedule exists
      if (!currentWeekSchedule) {
        await ScheduleService.createWeekSchedule(userId, currentWeekStart);
      }

      const success = await ScheduleService.updateDaySchedule(
        userId,
        currentWeekStart,
        dayName,
        dayData
      );

      if (success) {
        // Update local state immediately for responsiveness
        setCurrentWeekSchedule((prev) => ({
          ...prev,
          days: {
            ...prev?.days,
            [dayName]: dayData,
          },
        }));
        return true;
      }

      return false;
    } catch (err) {
      Logger.error('ScheduleContext: Error updating day', err);
      setError('Failed to update schedule');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, currentWeekStart, currentWeekSchedule]);

  // Schedule workout(s) for a day
  // Supports both legacy (single workout) and new (array of workouts) formats
  const scheduleWorkout = useCallback(async (dayName, workoutsOrId, workoutType, workoutName) => {
    // Check if first argument is an array (new format)
    if (Array.isArray(workoutsOrId)) {
      const dayData = createWorkoutDay(workoutsOrId);
      return updateDay(dayName, dayData);
    }
    // Legacy single workout format
    const dayData = createWorkoutDay(workoutsOrId, workoutType, workoutName);
    return updateDay(dayName, dayData);
  }, [updateDay]);

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
  useEffect(() => {
    if (!userId || !profile?.workoutDays || profile.workoutDays.length === 0) return;

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
  }, [userId, profile?.workoutDays, preferences.reminderTime, savePreferences]);

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
