// Activity Service - Phase 05-06 (with Firestore + SecureStorage)
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { saveSecure, getSecure, deleteSecure } from './SecureStorageService';
import { db } from '../config/firebase';
import Logger from './LoggerService';
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
  StepMilestones,
  TrainingSource,
  TrainingRewards,
  calculateEffortPoints,
  getLocalWeekKey,
} from '../models/Activity';

const STORAGE_KEY_PREFIX = '@MuscleHamster:userStats';

// Get user-specific storage key
const getStorageKey = () => {
  if (currentUserId) {
    return `${STORAGE_KEY_PREFIX}:${currentUserId}`;
  }
  return STORAGE_KEY_PREFIX;
};

// Current user ID (set by context)
let currentUserId = null;

// In-memory cache
let cachedStats = null;
let completionKeys = new Set();
let hasCleanedOldData = false;

// Clean up old shared storage key (one-time migration)
const cleanupOldSharedData = async () => {
  if (hasCleanedOldData) return;
  hasCleanedOldData = true;
  try {
    // Delete old shared key that had test data
    await deleteSecure(STORAGE_KEY_PREFIX);
    Logger.debug('Cleaned up old shared storage');
  } catch (e) {
    // Ignore errors
  }
};

// Set the current user ID
export const setActivityUserId = (userId) => {
  if (currentUserId !== userId) {
    currentUserId = userId;
    cachedStats = null;
    // Clean up old shared data on first user set
    cleanupOldSharedData();
    completionKeys.clear();
  }
};

// Weekly goal target (days per week), set from the user's profile by ActivityContext
let weeklyTarget = TrainingRewards.defaultWeeklyTarget;
export const setActivityWeeklyTarget = (target) => {
  if (Number.isInteger(target) && target >= 1 && target <= 7) weeklyTarget = target;
};

// Helper functions for date comparison
// Note: These use local timezone intentionally - streak/activity tracking
// should respect the user's local day boundaries, not UTC

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  // toDateString() uses local timezone, which is correct for user-facing dates
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

// Load stats from Firestore or SecureStorage
const loadStats = async () => {
  if (cachedStats) return cachedStats;

  Logger.debug('Loading stats, userId:', currentUserId);

  try {
    // Try Firestore first if user is logged in
    if (currentUserId) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      );

      const docRef = doc(db, 'userStats', currentUserId);
      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);

      if (docSnap.exists()) {
        cachedStats = docSnap.data();
        Logger.debug('Loaded stats from Firestore');
        // Rebuild completion keys
        cachedStats.workoutHistory?.forEach((c) => {
          completionKeys.add(`${c.workoutId}-${new Date(c.completedAt).toDateString()}`);
        });
        cachedStats.restDayHistory?.forEach((c) => {
          completionKeys.add(`restday-${new Date(c.completedAt).toDateString()}`);
        });
        return cachedStats;
      } else {
        Logger.debug('No stats in Firestore');
      }
    }

    // Fallback to SecureStorage
    const stored = await getSecure(getStorageKey());
    if (stored) {
      cachedStats = stored;
      Logger.debug('Loaded stats from SecureStorage');

      // Migrate to Firestore if user is logged in (don't block on this)
      if (currentUserId && cachedStats) {
        const docRef = doc(db, 'userStats', currentUserId);
        setDoc(docRef, cachedStats).catch(e => Logger.warn('Stats migration failed:', e));
      }

      // Rebuild completion keys
      cachedStats.workoutHistory?.forEach((c) => {
        completionKeys.add(`${c.workoutId}-${new Date(c.completedAt).toDateString()}`);
      });
      cachedStats.restDayHistory?.forEach((c) => {
        completionKeys.add(`restday-${new Date(c.completedAt).toDateString()}`);
      });
    } else {
      Logger.debug('No stored stats, using defaults');
      cachedStats = createDefaultUserStats();
    }
  } catch (e) {
    const isTimeout = e.message === 'Firestore timeout';
    if (isTimeout) {
      Logger.warn('Firestore request timed out, using default stats');
    } else {
      Logger.warn('Failed to load stats:', e.message);
    }
    cachedStats = createDefaultUserStats();
  }

  return cachedStats;
};

// Save stats to Firestore and cache
const saveStats = async (stats) => {
  cachedStats = stats;

  try {
    if (currentUserId) {
      const docRef = doc(db, 'userStats', currentUserId);
      await setDoc(docRef, stats);

      // Sync key fields to users collection so friends can see current state
      try {
        // Check if user logged a rest day today
        const today = new Date().toDateString();
        const lastRestDay = stats.restDayHistory?.[0]?.completedAt;
        const isRestingToday = lastRestDay && new Date(lastRestDay).toDateString() === today;

        const userRef = doc(db, 'users', currentUserId);
        await updateDoc(userRef, {
          hamsterState: stats.hamsterState || HamsterState.HAPPY,
          currentStreak: stats.currentStreak || 0,
          longestStreak: stats.longestStreak || 0,
          totalWorkoutsCompleted: stats.totalWorkoutsCompleted || 0,
          lastActivityDate: stats.lastActivityDate || null,
          isRestingToday: isRestingToday || false,
        });
      } catch (syncError) {
        // Don't fail the main save if sync fails (user doc might not exist yet)
        Logger.debug('Failed to sync stats to users collection:', syncError.message);
      }
    } else {
      // Fallback to SecureStorage if not logged in
      await saveSecure(getStorageKey(), stats);
    }
  } catch (e) {
    Logger.warn('Failed to save stats:', e);
    // Fallback to SecureStorage
    try {
      await saveSecure(getStorageKey(), stats);
    } catch (localError) {
      Logger.warn('Local save also failed:', localError);
    }
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

  // Active yesterday - still feeling good
  if (lastActivity && isYesterday(lastActivity)) {
    return HamsterState.HAPPY;
  }

  // Brand-new friend: nothing to be hungry about yet
  if (!lastActivity && !stats.totalWorkoutsCompleted) {
    return HamsterState.HAPPY;
  }

  // No recent activity
  return HamsterState.HUNGRY;
};

// Shared bookkeeping for any training day: streak and weekly goal.
// Returns the new streak, the updated weekly-goal record, and any weekly bonus earned.
const applyTrainingDay = (stats, now) => {
  const lastCheckIn = stats.lastCheckInDate ? new Date(stats.lastCheckInDate) : null;
  let newStreak = stats.currentStreak || 0;
  if (!lastCheckIn || !isSameDay(lastCheckIn, now)) {
    newStreak = !lastCheckIn || isYesterday(lastCheckIn) ? newStreak + 1 : 1;
  }

  const weekKey = getLocalWeekKey(now);
  const dayKey = now.toDateString();
  const current = stats.weeklyGoal?.weekKey === weekKey
    ? stats.weeklyGoal
    : { weekKey, activeDays: [], bonusAwarded: false };
  const activeDays = current.activeDays.includes(dayKey)
    ? current.activeDays
    : [...current.activeDays, dayKey];
  const target = weeklyTarget;
  const earnsBonus = !current.bonusAwarded && activeDays.length >= target;

  return {
    newStreak,
    weeklyGoal: { weekKey, activeDays, target, bonusAwarded: current.bonusAwarded || earnsBonus },
    weeklyBonus: earnsBonus ? TrainingRewards.weeklyGoalBonus : 0,
  };
};

const weeklyBonusTransaction = (now, balanceAfter) =>
  createTransaction({
    id: generateTransactionId(TransactionType.EARN, 'weeklyGoal', getLocalWeekKey(now), now),
    type: TransactionType.EARN,
    category: TransactionCategory.WORKOUT,
    amount: TrainingRewards.weeklyGoalBonus,
    description: 'Weekly goal reached!',
    timestamp: now.toISOString(),
    entityId: getLocalWeekKey(now),
    balanceAfter,
  });

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
    const stats = await loadStats();
    return { ...stats };
  },

  // ONE reward path for every kind of training (see TrainingRewards in models/Activity.js).
  // source: TrainingSource.*; sourceId: workout/exercise id; effort: exercises, sets or minutes.
  async recordTraining({
    source,
    sourceId,
    name,
    exercises = 0,
    sets = 0,
    minutes = 0,
    flatPoints = null,
  }) {
    const stats = await loadStats();
    const now = new Date();
    const today = now.toDateString();
    const sourceKey = `${source}:${sourceId || 'none'}`;

    const ledger = stats.trainingToday?.date === today
      ? stats.trainingToday
      : { date: today, points: 0, sessions: 0, perSource: {} };
    const earnedFromSource = ledger.perSource[sourceKey];

    // A workout / custom workout / planned item pays once per day.
    // Journal entries can add up for the same exercise until its per-day limit.
    if (source !== TrainingSource.JOURNAL && earnedFromSource !== undefined) {
      return {
        success: true,
        alreadyRecorded: true,
        pointsEarned: 0,
        sessionPoints: 0,
        weeklyBonus: 0,
        newStreak: stats.currentStreak,
        previousStreak: stats.currentStreak,
        hamsterState: stats.hamsterState,
        weeklyGoal: stats.weeklyGoal,
        stats,
      };
    }

    const effort = flatPoints ?? calculateEffortPoints({ exercises, sets, minutes });
    const bonus = ledger.sessions === 0 ? TrainingRewards.firstSessionBonus : 0;
    let sessionPoints = effort + bonus;
    if (source === TrainingSource.JOURNAL) {
      const exerciseRoom = Math.max(0, TrainingRewards.maxPointsPerExercisePerDay - (earnedFromSource || 0));
      sessionPoints = Math.min(effort, exerciseRoom) + bonus;
    }
    const dayRoom = Math.max(0, TrainingRewards.dailyTrainingCap - ledger.points);
    sessionPoints = Math.min(sessionPoints, dayRoom);
    const capReached = ledger.points + sessionPoints >= TrainingRewards.dailyTrainingCap;

    const { newStreak, weeklyGoal, weeklyBonus } = applyTrainingDay(stats, now);

    const newTransactions = [];
    let balance = stats.totalPoints;
    if (sessionPoints > 0) {
      balance += sessionPoints;
      newTransactions.push(createTransaction({
        id: `${generateTransactionId(TransactionType.EARN, TransactionCategory.WORKOUT, sourceKey, now)}-${Date.now()}`,
        type: TransactionType.EARN,
        category: TransactionCategory.WORKOUT,
        amount: sessionPoints,
        description: source === TrainingSource.JOURNAL ? `Logged ${name}` : `Completed ${name}`,
        timestamp: now.toISOString(),
        entityId: sourceId || null,
        balanceAfter: balance,
      }));
    }
    if (weeklyBonus > 0) {
      balance += weeklyBonus;
      newTransactions.push(weeklyBonusTransaction(now, balance));
    }

    // "Workouts" count: every workout/custom/planned item; journal logging counts once per day.
    const journalCountedToday = Object.keys(ledger.perSource)
      .some((k) => k.startsWith(`${TrainingSource.JOURNAL}:`));
    const countsAsWorkout = source !== TrainingSource.JOURNAL || !journalCountedToday;

    const history = [...(stats.workoutHistory || [])];
    if (source === TrainingSource.WORKOUT || source === TrainingSource.CUSTOM) {
      history.unshift(createWorkoutCompletion({
        id: `wc-${Date.now()}`,
        workoutId: sourceId,
        workoutName: name,
        completedAt: now.toISOString(),
        exercisesCompleted: exercises,
        totalExercises: exercises,
        durationSeconds: Math.round(minutes * 60),
        pointsEarned: sessionPoints,
        wasPartial: false,
      }));
    }

    const updatedStats = {
      ...stats,
      totalPoints: balance,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak || 0, newStreak),
      totalWorkoutsCompleted: (stats.totalWorkoutsCompleted || 0) + (countsAsWorkout ? 1 : 0),
      lastActivityDate: now.toISOString(),
      lastCheckInDate: now.toISOString(),
      previousBrokenStreak: null,
      weeklyGoal,
      trainingToday: {
        date: today,
        points: ledger.points + sessionPoints,
        sessions: ledger.sessions + 1,
        perSource: { ...ledger.perSource, [sourceKey]: (earnedFromSource || 0) + sessionPoints },
      },
      workoutHistory: history.slice(0, 100),
      transactions: [...newTransactions.reverse(), ...(stats.transactions || [])].slice(0, 500),
    };
    updatedStats.hamsterState = calculateHamsterState(updatedStats);
    if (source === TrainingSource.WORKOUT || source === TrainingSource.CUSTOM) {
      completionKeys.add(`${sourceId}-${today}`);
    }
    await saveStats(updatedStats);

    return {
      success: true,
      alreadyRecorded: false,
      pointsEarned: sessionPoints + weeklyBonus,
      sessionPoints,
      weeklyBonus,
      capReached,
      newStreak,
      previousStreak: stats.currentStreak,
      hamsterState: updatedStats.hamsterState,
      weeklyGoal,
      stats: updatedStats,
    };
  },

  // Guided workout player. Earns for the exercises actually done — no early-stop penalty.
  async recordWorkoutCompletion({
    workoutId,
    workoutName,
    exercisesCompleted,
    durationSeconds,
  }) {
    return this.recordTraining({
      source: TrainingSource.WORKOUT,
      sourceId: workoutId,
      name: workoutName,
      exercises: exercisesCompleted,
      minutes: (durationSeconds || 0) / 60,
    });
  },

  // Record daily exercise check-in (simplified MVP)
  async recordDailyExerciseCheckIn(exercise) {
    const stats = await loadStats();
    const now = new Date();
    const completionKey = `dailyexercise-${now.toDateString()}`;

    // Idempotency check
    if (completionKeys.has(completionKey)) {
      return {
        success: false,
        error: "You've already completed today's exercise! Come back tomorrow.",
      };
    }

    const points = PointsConfig.dailyExercisePoints;
    const { newStreak, weeklyGoal, weeklyBonus } = applyTrainingDay(stats, now);

    const newTransactions = [createTransaction({
      id: generateTransactionId(TransactionType.EARN, 'dailyExercise', exercise.id, now),
      type: TransactionType.EARN,
      category: 'dailyExercise',
      amount: points,
      description: `Daily Exercise: ${exercise.name}`,
      timestamp: now.toISOString(),
      entityId: exercise.id,
      balanceAfter: stats.totalPoints + points,
    })];
    if (weeklyBonus > 0) {
      newTransactions.push(weeklyBonusTransaction(now, stats.totalPoints + points + weeklyBonus));
    }

    const updatedStats = {
      ...stats,
      totalPoints: stats.totalPoints + points + weeklyBonus,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak || 0, newStreak),
      totalWorkoutsCompleted: (stats.totalWorkoutsCompleted || 0) + 1,
      lastActivityDate: now.toISOString(),
      lastCheckInDate: now.toISOString(),
      previousBrokenStreak: null,
      hamsterState: HamsterState.HAPPY,
      weeklyGoal,
      transactions: [...newTransactions.reverse(), ...(stats.transactions || [])].slice(0, 500),
    };

    completionKeys.add(completionKey);
    await saveStats(updatedStats);

    return {
      success: true,
      pointsEarned: points + weeklyBonus,
      weeklyBonus,
      newStreak,
      weeklyGoal,
      hamsterReaction: exercise.encouragement,
      stats: updatedStats,
    };
  },

  // Award bonus points for today's step milestones (each pays once per day).
  // Steps add points and make the hamster happy, but do NOT count toward the streak —
  // the daily check-in stays the streak action.
  // Only the milestone IDs are saved; the raw step count never leaves the device.
  async recordStepMilestones(todaySteps) {
    const stats = await loadStats();
    const now = new Date();
    const today = now.toDateString();

    const alreadyAwarded =
      stats.stepMilestones?.date === today ? stats.stepMilestones.awarded || [] : [];

    const newlyReached = StepMilestones.filter(
      (m) => todaySteps >= m.steps && !alreadyAwarded.includes(m.id)
    );

    if (newlyReached.length === 0) {
      return { success: true, awarded: [], pointsEarned: 0, stats };
    }

    let balance = stats.totalPoints;
    const newTransactions = newlyReached.map((m) => {
      balance += m.points;
      return createTransaction({
        id: generateTransactionId(TransactionType.EARN, TransactionCategory.STEPS, m.id, now),
        type: TransactionType.EARN,
        category: TransactionCategory.STEPS,
        amount: m.points,
        description: `Steps: ${m.label}`,
        timestamp: now.toISOString(),
        entityId: m.id,
        balanceAfter: balance,
      });
    });
    const pointsEarned = balance - stats.totalPoints;

    const updatedStats = {
      ...stats,
      totalPoints: balance,
      lastActivityDate: now.toISOString(),
      stepMilestones: {
        date: today,
        awarded: [...alreadyAwarded, ...newlyReached.map((m) => m.id)],
      },
      transactions: [...newTransactions.reverse(), ...stats.transactions].slice(0, 500),
    };
    updatedStats.hamsterState = calculateHamsterState(updatedStats);

    await saveStats(updatedStats);

    return { success: true, awarded: newlyReached, pointsEarned, stats: updatedStats };
  },

  async recordRestDayCheckIn(activity) {
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
      hamsterState: HamsterState.RESTED,  // Rest day = Rested state
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
    const stats = await loadStats();
    const updatedStats = {
      ...stats,
      previousBrokenStreak: null,
    };
    await saveStats(updatedStats);
    return { success: true };
  },

  async recordShopPurchase(itemId, itemName, price) {
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
    await deleteSecure(getStorageKey());
  },
};
