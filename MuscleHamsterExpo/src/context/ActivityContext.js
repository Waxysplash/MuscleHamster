// Activity Context - Phase 05-06 (with Firestore)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActivityService, setActivityUserId } from '../services/ActivityService';
import { useAuth } from './AuthContext';
import { HamsterState, createDefaultUserStats } from '../models/Activity';

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

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading activity stats...');
    try {
      const userStats = await ActivityService.getUserStats();
      setStats(userStats);
      console.log('Stats loaded, validating streak...');

      // Also validate streak
      const streakResult = await ActivityService.validateStreak();
      setStreakStatus(streakResult);

      if (streakResult.stats) {
        setStats(streakResult.stats);
      }
      console.log('Activity loading complete');
    } catch (e) {
      console.warn('Failed to load stats:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set user ID when user changes
  useEffect(() => {
    const userId = currentUser?.id || null;
    setActivityUserId(userId);

    if (userId) {
      loadStats();
    } else {
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
      console.warn('Failed to record completion:', e);
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
      console.warn('Failed to record rest day:', e);
      throw e;
    }
  }, []);

  const recordFeedback = useCallback(async (workoutId, feedback) => {
    try {
      const result = await ActivityService.recordFeedback(workoutId, feedback);
      return result;
    } catch (e) {
      console.warn('Failed to record feedback:', e);
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
      console.warn('Failed to restore streak:', e);
      throw e;
    }
  }, []);

  const acknowledgeStreakReset = useCallback(async () => {
    try {
      await ActivityService.acknowledgeStreakReset();
      setStreakStatus({ status: 'none', days: 0 });
      setStats((prev) => ({ ...prev, previousBrokenStreak: null }));
    } catch (e) {
      console.warn('Failed to acknowledge reset:', e);
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
      console.warn('Failed to record purchase:', e);
      throw e;
    }
  }, []);

  const value = {
    stats,
    isLoading,
    streakStatus,
    totalPoints: stats.totalPoints,
    currentStreak: stats.currentStreak,
    hamsterState: stats.hamsterState,
    previousBrokenStreak: stats.previousBrokenStreak,
    hasCheckedInToday: stats.lastCheckInDate &&
      new Date(stats.lastCheckInDate).toDateString() === new Date().toDateString(),
    canRestoreStreak: stats.previousBrokenStreak > 0 &&
      stats.totalPoints >= 100,
    loadStats,
    recordWorkoutCompletion,
    recordRestDayCheckIn,
    recordFeedback,
    restoreStreak,
    acknowledgeStreakReset,
    recordShopPurchase,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
