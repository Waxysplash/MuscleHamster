// Activity Context - Phase 05-06 (with Firestore)
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ActivityService, setActivityUserId, setActivityWeeklyTarget } from '../services/ActivityService';
import { setJournalUserId } from '../services/JournalService';
import { useAuth } from './AuthContext';
import { useUserProfile } from './UserProfileContext';
import { HamsterState, createDefaultUserStats, getWeeklyTarget, getLocalWeekKey } from '../models/Activity';
import Logger from '../services/LoggerService';

const ActivityContext = createContext(null);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(createDefaultUserStats());
  const [isLoading, setIsLoading] = useState(true);
  const [streakStatus, setStreakStatus] = useState(null);

  // Ref to prevent redundant loads
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const loadStats = useCallback(async (forceReload = false) => {
    // Prevent redundant loads
    if (!forceReload && (isLoadingRef.current || hasLoadedRef.current)) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const userStats = await ActivityService.getUserStats();
      setStats(userStats);

      // Also validate streak
      const streakResult = await ActivityService.validateStreak();
      setStreakStatus(streakResult);

      if (streakResult.stats) {
        setStats(streakResult.stats);
      }
      hasLoadedRef.current = true;
    } catch (e) {
      Logger.warn('Failed to load stats:', e);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Set user ID when user changes
  useEffect(() => {
    const userId = currentUser?.id || null;
    setActivityUserId(userId);
    setJournalUserId(userId);

    if (userId) {
      // Reset hasLoaded when user changes to allow fresh load
      hasLoadedRef.current = false;
      loadStats();
    } else {
      hasLoadedRef.current = false;
      setStats(createDefaultUserStats());
      setStreakStatus(null);
      setIsLoading(false);
    }
  }, [currentUser?.id, loadStats]);

  const recordWorkoutCompletion = useCallback(async (completionData) => {
    try {
      const result = await ActivityService.recordWorkoutCompletion(completionData);
      if (result.stats) {
        setStats(result.stats);
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to record completion:', e);
      throw e;
    }
  }, []);

  const recordDailyCheckIn = useCallback(async (exercise) => {
    try {
      const result = await ActivityService.recordDailyExerciseCheckIn(exercise);
      if (result.stats) {
        setStats(result.stats);
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to record daily check-in:', e);
      throw e;
    }
  }, []);

  const recordRestDayCheckIn = useCallback(async (activity) => {
    try {
      const result = await ActivityService.recordRestDayCheckIn(activity);
      if (result.stats) {
        setStats(result.stats);
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to record rest day:', e);
      throw e;
    }
  }, []);

  // One reward path for every kind of training (planned, journal, custom, player).
  const recordTraining = useCallback(async (training) => {
    try {
      const result = await ActivityService.recordTraining(training);
      if (result.stats && !result.alreadyRecorded) {
        setStats(result.stats);
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to record training:', e);
      throw e;
    }
  }, []);

  const recordStepMilestones = useCallback(async (todaySteps) => {
    try {
      const result = await ActivityService.recordStepMilestones(todaySteps);
      if (result.awarded?.length && result.stats) {
        setStats(result.stats);
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to record step milestones');
      throw e;
    }
  }, []);

  const recordFeedback = useCallback(async (workoutId, feedback) => {
    try {
      const result = await ActivityService.recordFeedback(workoutId, feedback);
      return result;
    } catch (e) {
      Logger.warn('Failed to record feedback:', e);
      throw e;
    }
  }, []);

  const restoreStreak = useCallback(async () => {
    try {
      const result = await ActivityService.restoreStreak();
      if (result.stats) {
        setStats(result.stats);
        setStreakStatus({ status: 'atRisk', days: result.restoredStreak });
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to restore streak:', e);
      throw e;
    }
  }, []);

  const acknowledgeStreakReset = useCallback(async () => {
    try {
      await ActivityService.acknowledgeStreakReset();
      setStreakStatus({ status: 'none', days: 0 });
      setStats((prev) => ({ ...prev, previousBrokenStreak: null }));
    } catch (e) {
      Logger.warn('Failed to acknowledge reset:', e);
    }
  }, []);

  const recordShopPurchase = useCallback(async (itemId, itemName, price) => {
    try {
      const result = await ActivityService.recordShopPurchase(itemId, itemName, price);
      if (result.stats) {
        setStats(result.stats);
      }
      return result;
    } catch (e) {
      Logger.warn('Failed to record purchase:', e);
      throw e;
    }
  }, []);

  // Check if user logged a rest day today (memoized)
  const hasLoggedRestDayToday = useMemo(() => {
    return stats.restDayHistory?.some(
      (entry) => new Date(entry.completedAt).toDateString() === new Date().toDateString()
    ) || false;
  }, [stats.restDayHistory]);

  // Weekly goal: train on N different days this week (N = workout days picked in onboarding)
  const { profile } = useUserProfile();
  const weeklyTarget = getWeeklyTarget(profile);
  useEffect(() => {
    setActivityWeeklyTarget(weeklyTarget);
  }, [weeklyTarget]);

  const weeklyProgress = useMemo(() => {
    const thisWeek = stats.weeklyGoal?.weekKey === getLocalWeekKey();
    return {
      daysDone: thisWeek ? stats.weeklyGoal.activeDays.length : 0,
      target: weeklyTarget,
      reached: thisWeek && !!stats.weeklyGoal.bonusAwarded,
    };
  }, [stats.weeklyGoal, weeklyTarget]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    stats,
    isLoading,
    streakStatus,
    totalPoints: stats.totalPoints,
    currentStreak: stats.currentStreak,
    hamsterState: stats.hamsterState,
    previousBrokenStreak: stats.previousBrokenStreak,
    hasCheckedInToday: stats.lastCheckInDate &&
      new Date(stats.lastCheckInDate).toDateString() === new Date().toDateString(),
    hasLoggedRestDayToday,
    weeklyProgress,
    canRestoreStreak: stats.previousBrokenStreak > 0 &&
      stats.totalPoints >= 100,
    loadStats,
    recordWorkoutCompletion,
    recordDailyCheckIn,
    recordRestDayCheckIn,
    recordStepMilestones,
    recordTraining,
    recordFeedback,
    restoreStreak,
    acknowledgeStreakReset,
    recordShopPurchase,
  }), [
    stats,
    isLoading,
    streakStatus,
    hasLoggedRestDayToday,
    weeklyProgress,
    loadStats,
    recordWorkoutCompletion,
    recordDailyCheckIn,
    recordRestDayCheckIn,
    recordStepMilestones,
    recordTraining,
    recordFeedback,
    restoreStreak,
    acknowledgeStreakReset,
    recordShopPurchase,
  ]);

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
