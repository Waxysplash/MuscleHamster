/**
 * TestDataService.js
 * Sets up realistic test data for App Store screenshots
 *
 * USAGE: Import and call setupScreenshotData() from SettingsScreen
 * REMOVE BEFORE PRODUCTION RELEASE
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { saveSecure } from './SecureStorageService';
import { HamsterState, TransactionType, TransactionCategory } from '../models/Activity';
import { ShopItemCategory } from '../models/ShopItem';

// Storage keys (must match other services)
const STATS_STORAGE_KEY = '@MuscleHamster:userStats';
const INVENTORY_STORAGE_KEY = '@MuscleHamster:inventory';
const JOURNAL_STORAGE_KEY = '@MuscleHamster:exerciseJournal';

/**
 * Creates screenshot-ready test data
 * - 185 points (can afford items but shows realistic balance)
 * - 7-day streak (nice round number)
 * - 12 total workouts completed
 * - Happy hamster state
 * - Owns 3 items, 1 equipped (sunglasses)
 * - Journal entries for several exercises
 */
export const setupScreenshotData = async (userId) => {
  if (!userId) {
    throw new Error('User ID required to set up test data');
  }

  console.log('Setting up screenshot test data for user:', userId);

  const now = new Date();

  // Generate dates for past 7 days (for streak)
  const getDateDaysAgo = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  // ============================================
  // 1. USER STATS (Points, Streaks, History)
  // ============================================

  const transactions = [
    // Recent workout earnings
    { id: 'tx-1', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 65, description: 'Completed Morning Stretch', timestamp: getDateDaysAgo(0), balanceAfter: 185 },
    { id: 'tx-2', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 60, description: 'Completed Core Workout', timestamp: getDateDaysAgo(1), balanceAfter: 120 },
    { id: 'tx-3', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 55, description: 'Completed Leg Day', timestamp: getDateDaysAgo(2), balanceAfter: 60 },
    // Shop purchase
    { id: 'tx-4', type: TransactionType.SPEND, category: TransactionCategory.SHOP_PURCHASE, amount: 50, description: 'Purchased Cool Sunglasses', timestamp: getDateDaysAgo(3), balanceAfter: 155 },
    { id: 'tx-5', type: TransactionType.SPEND, category: TransactionCategory.SHOP_PURCHASE, amount: 50, description: 'Purchased Cozy Sweater', timestamp: getDateDaysAgo(4), balanceAfter: 205 },
    { id: 'tx-6', type: TransactionType.SPEND, category: TransactionCategory.SHOP_PURCHASE, amount: 50, description: 'Purchased Golden Crown', timestamp: getDateDaysAgo(5), balanceAfter: 255 },
    // Earlier earnings
    { id: 'tx-7', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 55, description: 'Completed Upper Body', timestamp: getDateDaysAgo(3), balanceAfter: 305 },
    { id: 'tx-8', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 50, description: 'Completed Cardio Blast', timestamp: getDateDaysAgo(4), balanceAfter: 250 },
    { id: 'tx-9', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 55, description: 'Completed Full Body', timestamp: getDateDaysAgo(5), balanceAfter: 200 },
    { id: 'tx-10', type: TransactionType.EARN, category: TransactionCategory.WORKOUT, amount: 50, description: 'Completed Quick Stretch', timestamp: getDateDaysAgo(6), balanceAfter: 145 },
  ];

  const workoutHistory = [
    { id: 'wc-1', workoutId: 'daily-1', workoutName: 'Jumping Jacks', completedAt: getDateDaysAgo(0), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 60, pointsEarned: 10, wasPartial: false },
    { id: 'wc-2', workoutId: 'daily-2', workoutName: 'Wall Push-ups', completedAt: getDateDaysAgo(1), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 45, pointsEarned: 10, wasPartial: false },
    { id: 'wc-3', workoutId: 'daily-3', workoutName: 'Air Squats', completedAt: getDateDaysAgo(2), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 60, pointsEarned: 10, wasPartial: false },
    { id: 'wc-4', workoutId: 'daily-4', workoutName: 'Forearm Plank', completedAt: getDateDaysAgo(3), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 30, pointsEarned: 10, wasPartial: false },
    { id: 'wc-5', workoutId: 'daily-5', workoutName: 'High Knees', completedAt: getDateDaysAgo(4), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 45, pointsEarned: 10, wasPartial: false },
    { id: 'wc-6', workoutId: 'daily-6', workoutName: 'Glute Bridges', completedAt: getDateDaysAgo(5), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 60, pointsEarned: 10, wasPartial: false },
    { id: 'wc-7', workoutId: 'daily-7', workoutName: 'Arm Circles', completedAt: getDateDaysAgo(6), exercisesCompleted: 1, totalExercises: 1, durationSeconds: 30, pointsEarned: 10, wasPartial: false },
  ];

  const userStats = {
    totalPoints: 185,
    currentStreak: 7,
    longestStreak: 7,
    totalWorkoutsCompleted: 12,
    totalRestDayCheckIns: 2,
    lastActivityDate: getDateDaysAgo(0),
    lastCheckInDate: getDateDaysAgo(0),
    previousBrokenStreak: null,
    hamsterState: HamsterState.HAPPY,
    workoutHistory,
    restDayHistory: [],
    workoutFeedback: {
      'daily-1': 'loved',
      'daily-3': 'loved',
      'daily-5': 'liked',
    },
    transactions,
  };

  // ============================================
  // 2. INVENTORY (Owned items + Equipped)
  // ============================================

  const inventory = {
    ownedItems: [
      { itemId: 'outfit-1', purchasedAt: getDateDaysAgo(4), pointsSpent: 50 },  // Cozy Sweater
      { itemId: 'acc-1', purchasedAt: getDateDaysAgo(3), pointsSpent: 50 },     // Cool Sunglasses
      { itemId: 'acc-3', purchasedAt: getDateDaysAgo(5), pointsSpent: 50 },     // Golden Crown
    ],
    equippedOutfit: null,
    equippedAccessory: 'acc-1',  // Sunglasses equipped!
  };

  // ============================================
  // 3. EXERCISE JOURNAL (Progress entries)
  // ============================================

  const journal = {
    exercises: {
      // Bench Press entries showing progression
      'gym_bench_press': {
        name: 'Bench Press',
        category: 'Chest',
        entries: [
          {
            id: '1',
            date: getDateDaysAgo(0),
            sets: [
              { weight: 135, reps: 10 },
              { weight: 135, reps: 8 },
              { weight: 135, reps: 8 },
            ],
            notes: 'Felt strong today!',
          },
          {
            id: '2',
            date: getDateDaysAgo(3),
            sets: [
              { weight: 125, reps: 10 },
              { weight: 125, reps: 10 },
              { weight: 125, reps: 8 },
            ],
            notes: '',
          },
          {
            id: '3',
            date: getDateDaysAgo(7),
            sets: [
              { weight: 115, reps: 10 },
              { weight: 115, reps: 10 },
              { weight: 115, reps: 10 },
            ],
            notes: 'First time back in a while',
          },
        ],
      },
      // Squats
      'gym_barbell_squats': {
        name: 'Barbell Squats',
        category: 'Legs',
        entries: [
          {
            id: '1',
            date: getDateDaysAgo(1),
            sets: [
              { weight: 185, reps: 8 },
              { weight: 185, reps: 8 },
              { weight: 185, reps: 6 },
            ],
            notes: 'New PR!',
          },
        ],
      },
      // Deadlifts
      'gym_deadlifts': {
        name: 'Deadlifts',
        category: 'Back',
        entries: [
          {
            id: '1',
            date: getDateDaysAgo(2),
            sets: [
              { weight: 225, reps: 5 },
              { weight: 225, reps: 5 },
              { weight: 205, reps: 8 },
            ],
            notes: '',
          },
        ],
      },
    },
  };

  // ============================================
  // SAVE ALL DATA
  // ============================================

  try {
    // Save to Firestore
    const statsRef = doc(db, 'userStats', userId);
    const inventoryRef = doc(db, 'inventory', userId);
    const journalRef = doc(db, 'exerciseJournals', userId);

    await Promise.all([
      setDoc(statsRef, userStats),
      setDoc(inventoryRef, inventory),
      setDoc(journalRef, journal),
    ]);

    // Also save to SecureStorage for offline access
    await Promise.all([
      saveSecure(STATS_STORAGE_KEY, userStats),
      saveSecure(`${INVENTORY_STORAGE_KEY}:${userId}`, inventory),
      saveSecure(JOURNAL_STORAGE_KEY, journal),
    ]);

    console.log('Screenshot test data setup complete!');

    return {
      success: true,
      message: 'Test data created! Restart the app to see changes.',
      data: {
        points: userStats.totalPoints,
        streak: userStats.currentStreak,
        workouts: userStats.totalWorkoutsCompleted,
        itemsOwned: inventory.ownedItems.length,
        equipped: inventory.equippedAccessory,
      },
    };
  } catch (error) {
    console.error('Failed to set up test data:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Clears all test data (resets to fresh state)
 */
export const clearAllTestData = async (userId) => {
  if (!userId) {
    throw new Error('User ID required to clear test data');
  }

  try {
    const emptyStats = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalWorkoutsCompleted: 0,
      totalRestDayCheckIns: 0,
      lastActivityDate: null,
      lastCheckInDate: null,
      previousBrokenStreak: null,
      hamsterState: HamsterState.HUNGRY,
      workoutHistory: [],
      restDayHistory: [],
      workoutFeedback: {},
      transactions: [],
    };

    const emptyInventory = {
      ownedItems: [],
      equippedOutfit: null,
      equippedAccessory: null,
    };

    const emptyJournal = {
      exercises: {},
    };

    // Save empty data
    const statsRef = doc(db, 'userStats', userId);
    const inventoryRef = doc(db, 'inventory', userId);
    const journalRef = doc(db, 'exerciseJournals', userId);

    await Promise.all([
      setDoc(statsRef, emptyStats),
      setDoc(inventoryRef, emptyInventory),
      setDoc(journalRef, emptyJournal),
      saveSecure(STATS_STORAGE_KEY, emptyStats),
      saveSecure(`${INVENTORY_STORAGE_KEY}:${userId}`, emptyInventory),
      saveSecure(JOURNAL_STORAGE_KEY, emptyJournal),
    ]);

    console.log('Test data cleared!');
    return { success: true, message: 'All data cleared. Restart the app.' };
  } catch (error) {
    console.error('Failed to clear test data:', error);
    return { success: false, message: error.message };
  }
};
