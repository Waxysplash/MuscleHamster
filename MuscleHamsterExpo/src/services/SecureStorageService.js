/**
 * SecureStorageService - Storage wrapper
 *
 * Uses AsyncStorage for all storage (SecureStore removed for Expo Go compatibility)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from './LoggerService';

// Keys for storage
export const SECURE_KEYS = {
  USER_PROFILE: 'secure_user_profile',
  USER_STATS: 'secure_user_stats',
  INVENTORY: 'secure_inventory',
  JOURNAL: 'secure_journal',
  ONBOARDING: 'secure_onboarding',
};

/**
 * Save data
 * @param {string} key - Storage key
 * @param {any} value - Data to store (will be JSON stringified)
 * @returns {Promise<boolean>} Success status
 */
export const saveSecure = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    Logger.error(`Storage save error for key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieve data
 * @param {string} key - Storage key
 * @returns {Promise<any|null>} Parsed data or null
 */
export const getSecure = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    Logger.error(`Storage get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Delete data from storage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
export const deleteSecure = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    Logger.error(`Storage delete error for key ${key}:`, error);
    return false;
  }
};

/**
 * Save user-specific data
 * @param {string} userId - User ID
 * @param {string} dataType - Type of data (profile, stats, etc.)
 * @param {any} value - Data to store
 * @returns {Promise<boolean>} Success status
 */
export const saveUserData = async (userId, dataType, value) => {
  const key = `${dataType}_${userId}`;
  return saveSecure(key, value);
};

/**
 * Retrieve user-specific data
 * @param {string} userId - User ID
 * @param {string} dataType - Type of data (profile, stats, etc.)
 * @returns {Promise<any|null>} Parsed data or null
 */
export const getUserData = async (userId, dataType) => {
  const key = `${dataType}_${userId}`;
  return getSecure(key);
};

/**
 * Delete user-specific data
 * @param {string} userId - User ID
 * @param {string} dataType - Type of data (profile, stats, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const deleteUserData = async (userId, dataType) => {
  const key = `${dataType}_${userId}`;
  return deleteSecure(key);
};

/**
 * Clear all storage for a user (used on logout/account deletion)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const clearUserSecureData = async (userId) => {
  try {
    const dataTypes = ['profile', 'stats', 'inventory', 'journal', 'onboarding'];
    await Promise.all(
      dataTypes.map((type) => deleteUserData(userId, type))
    );
    return true;
  } catch (error) {
    Logger.error('Error clearing user data:', error);
    return false;
  }
};

/**
 * Migration stub (no-op since we're using AsyncStorage only)
 */
export const migrateToSecureStorage = async (userId) => {
  return true;
};

export default {
  saveSecure,
  getSecure,
  deleteSecure,
  saveUserData,
  getUserData,
  deleteUserData,
  clearUserSecureData,
  migrateToSecureStorage,
  SECURE_KEYS,
};
