// Activity Service - Phase 05-06
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HamsterState,
  PointsConfig,
  StreakStatus,
  TransactionType,
  TransactionCategory,
  createDefaultUserStats,
  createWorkoutCompletion,
  createRestDayCheckIn,
  createTransaction,
  RestDayActivityInfo,
} from '../models/Activity';

const STORAGE_KEY = '@MuscleHamster:userStats';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache
let cachedStats = null;
let completionKeys = new Set();

// Helper functions
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

const generateTransactionId = (type, category, entityId, date) => {
  const dateStr = new Date(date).toDateString();
  return `${type}-${category}-${entityId || 'none'}-${dateStr}`;
};

// Load stats from storage
const loadStats = async () => {
  if (cachedStats) return cachedStats;

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedStats = JSON.parse(stored);
      // Rebuild completion keys from history
      cachedStats.workoutHistory?.forEach((c) => {
        completionKeys.add(`${c.workoutId}-${new Date(c.completedAt).toDateString()}`);
      });
      cachedStats.restDayHistory?.forEach((c) => {
        completionKeys.add(`restday-${new Date(c.completedAt).toDateString()}`);
      });
    } else {
      cachedStats = createDefaultUserStats();
    }
  } catch (e) {
    console.warn('Failed to load stats:', e);
    cachedStats = createDefaultUserStats();
  }

  return cachedStats;
};

// Save stats to storage
const saveStats = async (stats) => {
  cachedStats = stats;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save stats:', e);
  }
};

// Calculate hamster state based on activity
const calculateHamsterState = (stats) => {
  const now = new Date();
  const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;

  // Milestone achievements
  if (stats.totalWorkoutsCompleted > 0 && stats.totalWorkoutsCompleted % 10 === 0) {
    return HamsterState.PROUD;
  }

  // On a streak of 3+
  if (stats.currentStreak >= 3) {
    return HamsterState.EXCITED;
  }

  // Active today
  if (lastActivity && isSameDay(lastActivity, now)) {
    return HamsterState.HAPPY;
  }

  // Active yesterday (chillin')
  if (lastActivity && isYesterday(lastActivity)) {
    return HamsterState.CHILLIN;
  }

  // No recent activity
  return HamsterState.HUNGRY;
};

// Calculate streak status
const calculateStreakStatus = (stats) => {
  const now = new Date();
  const lastCheckIn = stats.lastCheckInDate ? new Date(stats.lastCheckInDate) : null;

  if (!lastCheckIn) {
    return { status: StreakStatus.NONE, days: 0 };
  }

  if (isSameDay(lastCheckIn, now)) {
    return { status: StreakStatus.ACTIVE, days: stats.currentStreak };
  }

  if (isYesterday(lastCheckIn)) {
    return { status: StreakStatus.AT_RISK, days: stats.currentStreak };
  }

  // Streak is broken
  if (stats.currentStreak > 0) {
    return { status: StreakStatus.BROKEN, days: stats.currentStreak };
  }

  return { status: StreakStatus.NONE, days: 0 };
};

export const ActivityService = {
  async getUserStats() {
    await delay(200);
    const stats = await loadStats();
    return { ...stats };
  },

  async recordWorkoutCompletion({
    workoutId,
    workoutName,
    exercisesCompleted,
    totalExercises,
    durationSeconds,
  }) {
    await delay(300);
    const stats = await loadStats();
    const now = new Date();
    const completionKey = `${workoutId}-${now.toDateString()}`;

    // Idempotency check
    if (completionKeys.has(completionKey)) {
      return {
        success: true,
        alreadyRecorded: true,
        stats,
      };
    }

    const wasPartial = exercisesCompleted < totalExercises;
    const points = PointsConfig.calculateWorkoutPoints(
      exercisesCompleted,
      stats.currentStreak,
      wasPartial
    );

    // Update streak
    const lastCheckIn = stats.lastCheckInDate ? new Date(stats.lastCheckInDate) : null;
    let newStreak = stats.currentStreak;

    if (!lastCheckIn || !isSameDay(lastCheckIn, now)) {
      if (!lastCheckIn || isYesterday(lastCheckIn)) {
        newStreak = stats.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    // Create completion record
    const completion = createWorkoutCompletion({
      id: `wc-${Date.now()}`,
      workoutId,
      workoutName,
      completedAt: now.toISOString(),
      exercisesCompleted,
      totalExercises,
      durationSeconds,
      pointsEarned: points,
      wasPartial,
    });

    // Create transaction
    const transaction = createTransaction({
      id: generateTransactionId(TransactionType.EARN, TransactionCategory.WORKOUT, workoutId, now),
      type: TransactionType.EARN,
      category: TransactionCategory.WORKOUT,
      amount: points,
      description: `Completed ${workoutName}`,
      timestamp: now.toISOString(),
      entityId: workoutId,
      balanceAfter: stats.totalPoints + points,
    });

    // Update stats
    const updatedStats = {
      ...stats,
      totalPoints: stats.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      totalWorkoutsCompleted: stats.totalWorkoutsCompleted + 1,
      lastActivityDate: now.toISOString(),
      lastCheckInDate: now.toISOString(),
      previousBrokenStreak: null,
      workoutHistory: [completion, ...stats.workoutHistory].slice(0, 100),
      transactions: [transaction, ...stats.transactions].slice(0, 500),
    };

    updatedStats.hamsterState = calculateHamsterState(updatedStats);
    completionKeys.add(completionKey);
    await saveStats(updatedStats);

    return {
      success: true,
      alreadyRecorded: false,
      pointsEarned: points,
      newStreak,
      previousStreak: stats.currentStreak,
      hamsterState: updatedStats.hamsterState,
      stats: updatedStats,
    };
  },

  async recordRestDayCheckIn(activity) {
    await delay(300);
    const stats = await loadStats();
    const now = new Date();
    const completionKey = `restday-${now.toDateString()}`;

    // Idempotency check
    if (completionKeys.has(completionKey)) {
      return {
        success: false,
        error: "You've already checked in today! Rest up and come back tomorrow.",
      };
    }

    const activityInfo = RestDayActivityInfo[activity];
    const points = PointsConfig.calculateRestDayPoints(
      activityInfo.pointsAwarded,
      stats.currentStreak
    );

    // Update streak
    const lastCheckIn = stats.lastCheckInDate ? new Date(stats.lastCheckInDate) : null;
    let newStreak = stats.currentStreak;

    if (!lastCheckIn || !isSameDay(lastCheckIn, now)) {
      if (!lastCheckIn || isYesterday(lastCheckIn)) {
        newStreak = stats.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    // Create check-in record
    const checkIn = createRestDayCheckIn({
      id: `rd-${Date.now()}`,
      activity,
      completedAt: now.toISOString(),
      pointsEarned: points,
    });

    // Create transaction
    const transaction = createTransaction({
      id: generateTransactionId(TransactionType.EARN, TransactionCategory.REST_DAY, activity, now),
      type: TransactionType.EARN,
      category: TransactionCategory.REST_DAY,
      amount: points,
      description: activityInfo.displayName,
      timestamp: now.toISOString(),
      entityId: activity,
      balanceAfter: stats.totalPoints + points,
    });

    // Update stats
    const updatedStats = {
      ...stats,
      totalPoints: stats.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      totalRestDayCheckIns: stats.totalRestDayCheckIns + 1,
      lastActivityDate: now.toISOString(),
      lastCheckInDate: now.toISOString(),
      previousBrokenStreak: null,
      hamsterState: HamsterState.CHILLIN,
      restDayHistory: [checkIn, ...stats.restDayHistory].slice(0, 100),
      transactions: [transaction, ...stats.transactions].slice(0, 500),
    };

    completionKeys.add(completionKey);
    await saveStats(updatedStats);

    return {
      success: true,
      pointsEarned: points,
      newStreak,
      hamsterReaction: activityInfo.hamsterReaction,
      stats: updatedStats,
    };
  },

  async recordFeedback(workoutId, feedback) {
    await delay(200);
    const stats = await loadStats();

    const updatedStats = {
      ...stats,
      workoutFeedback: {
        ...stats.workoutFeedback,
        [workoutId]: feedback,
      },
    };

    await saveStats(updatedStats);
    return { success: true };
  },

  async validateStreak() {
    await delay(200);
    const stats = await loadStats();
    const streakInfo = calculateStreakStatus(stats);

    if (streakInfo.status === StreakStatus.BROKEN && stats.currentStreak > 0) {
      // Store broken streak for potential restore
      const updatedStats = {
        ...stats,
        previousBrokenStreak: stats.currentStreak,
        currentStreak: 0,
        hamsterState: HamsterState.HUNGRY,
      };
      await saveStats(updatedStats);
      return {
        status: StreakStatus.BROKEN,
        previousStreak: stats.currentStreak,
        stats: updatedStats,
      };
    }

    return {
      status: streakInfo.status,
      days: streakInfo.days,
      stats,
    };
  },

  async getStreakStatus() {
    const stats = await loadStats();
    return calculateStreakStatus(stats);
  },

  async canRestoreStreak() {
    const stats = await loadStats();
    return (
      stats.previousBrokenStreak &&
      stats.previousBrokenStreak > 0 &&
      stats.totalPoints >= PointsConfig.streakFreezeCost
    );
  },

  async restoreStreak() {
    await delay(300);
    const stats = await loadStats();

    if (!stats.previousBrokenStreak || stats.previousBrokenStreak === 0) {
      return { success: false, error: 'No streak to restore!' };
    }

    if (stats.totalPoints < PointsConfig.streakFreezeCost) {
      return {
        success: false,
        error: `Not enough points! You need ${PointsConfig.streakFreezeCost} points.`,
      };
    }

    // Check if user has already started a new streak today
    const now = new Date();
    if (stats.lastCheckInDate && isSameDay(new Date(stats.lastCheckInDate), now)) {
      return {
        success: false,
        error: "You've already started a new streak today!",
      };
    }

    const restoredStreak = stats.previousBrokenStreak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Create transaction
    const transaction = createTransaction({
      id: generateTransactionId(TransactionType.SPEND, TransactionCategory.STREAK_FREEZE, 'restore', now),
      type: TransactionType.SPEND,
      category: TransactionCategory.STREAK_FREEZE,
      amount: PointsConfig.streakFreezeCost,
      description: 'Streak Freeze - Restored streak',
      timestamp: now.toISOString(),
      balanceAfter: stats.totalPoints - PointsConfig.streakFreezeCost,
    });

    const updatedStats = {
      ...stats,
      totalPoints: stats.totalPoints - PointsConfig.streakFreezeCost,
      currentStreak: restoredStreak,
      previousBrokenStreak: null,
      lastCheckInDate: yesterday.toISOString(),
      hamsterState: HamsterState.HAPPY,
      transactions: [transaction, ...stats.transactions].slice(0, 500),
    };

    await saveStats(updatedStats);

    return {
      success: true,
      restoredStreak,
      pointsSpent: PointsConfig.streakFreezeCost,
      message: `Your ${restoredStreak}-day streak has been restored!`,
      hamsterReaction: "Yay! We're back on track! Don't forget to check in today!",
      stats: updatedStats,
    };
  },

  async acknowledgeStreakReset() {
    await delay(100);
    const stats = await loadStats();
    const updatedStats = {
      ...stats,
      previousBrokenStreak: null,
    };
    await saveStats(updatedStats);
    return { success: true };
  },

  async recordShopPurchase(itemId, itemName, price) {
    await delay(200);
    const stats = await loadStats();
    const now = new Date();

    // Check for existing transaction (idempotency)
    const transactionId = generateTransactionId(TransactionType.SPEND, TransactionCategory.SHOP_PURCHASE, itemId, now);
    if (stats.transactions.some((t) => t.id === transactionId)) {
      return { success: true, alreadyRecorded: true };
    }

    const transaction = createTransaction({
      id: transactionId,
      type: TransactionType.SPEND,
      category: TransactionCategory.SHOP_PURCHASE,
      amount: price,
      description: `Purchased ${itemName}`,
      timestamp: now.toISOString(),
      entityId: itemId,
      balanceAfter: stats.totalPoints - price,
    });

    const updatedStats = {
      ...stats,
      totalPoints: stats.totalPoints - price,
      transactions: [transaction, ...stats.transactions].slice(0, 500),
    };

    await saveStats(updatedStats);
    return { success: true, stats: updatedStats };
  },

  async hasCheckedInToday() {
    const stats = await loadStats();
    if (!stats.lastCheckInDate) return false;
    return isSameDay(new Date(stats.lastCheckInDate), new Date());
  },

  async hasCompletedWorkoutToday() {
    const stats = await loadStats();
    const todaysCompletions = stats.workoutHistory.filter((c) =>
      isSameDay(new Date(c.completedAt), new Date())
    );
    return todaysCompletions.length > 0;
  },

  async getRecentWorkoutIds(limit = 5) {
    const stats = await loadStats();
    return stats.workoutHistory.slice(0, limit).map((c) => c.workoutId);
  },

  async getDislikedWorkoutIds() {
    const stats = await loadStats();
    return Object.entries(stats.workoutFeedback)
      .filter(([_, feedback]) => feedback === 'notForMe')
      .map(([id]) => id);
  },

  async getLovedWorkoutIds() {
    const stats = await loadStats();
    return Object.entries(stats.workoutFeedback)
      .filter(([_, feedback]) => feedback === 'loved')
      .map(([id]) => id);
  },

  // Clear all data (for testing)
  async clearAllData() {
    cachedStats = null;
    completionKeys.clear();
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
