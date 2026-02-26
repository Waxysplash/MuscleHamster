/**
 * SecureStorageService - Encrypted storage for sensitive data
 *
 * Uses expo-secure-store for encrypted storage on iOS (Keychain) and Android (Keystore).
 * Falls back to AsyncStorage for non-sensitive data or when SecureStore is unavailable.
 *
 * Use this for:
 * - User profiles
 * - Authentication tokens
 * - Stats and activity data
 * - Any PII (personally identifiable information)
 *
 * Do NOT use this for:
 * - Large data (>2KB per key on some platforms)
 * - Cache data that can be regenerated
 * - Non-sensitive app state
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for secure storage
export const SECURE_KEYS = {
  USER_PROFILE: 'secure_user_profile',
  USER_STATS: 'secure_user_stats',
  INVENTORY: 'secure_inventory',
  JOURNAL: 'secure_journal',
  ONBOARDING: 'secure_onboarding',
};

// Check if SecureStore is available (not available on web)
const isSecureStoreAvailable = async () => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

/**
 * Save data securely
 * @param {string} key - Storage key
 * @param {any} value - Data to store (will be JSON stringified)
 * @returns {Promise<boolean>} Success status
 */
export const saveSecure = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);

    // Check if SecureStore is available
    const available = await isSecureStoreAvailable();

    if (available) {
      await SecureStore.setItemAsync(key, jsonValue);
    } else {
      // Fallback to AsyncStorage (web or unsupported platforms)
      await AsyncStorage.setItem(key, jsonValue);
    }

    return true;
  } catch (error) {
    console.error(`SecureStorage save error for key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieve data securely
 * @param {string} key - Storage key
 * @returns {Promise<any|null>} Parsed data or null
 */
export const getSecure = async (key) => {
  try {
    const available = await isSecureStoreAvailable();

    let jsonValue;
    if (available) {
      jsonValue = await SecureStore.getItemAsync(key);
    } else {
      jsonValue = await AsyncStorage.getItem(key);
    }

    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`SecureStorage get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Delete data from secure storage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
export const deleteSecure = async (key) => {
  try {
    const available = await isSecureStoreAvailable();

    if (available) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }

    return true;
  } catch (error) {
    console.error(`SecureStorage delete error for key ${key}:`, error);
    return false;
  }
};

/**
 * Save user-specific data securely
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
 * Retrieve user-specific data securely
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
 * Clear all secure storage for a user (used on logout/account deletion)
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
    console.error('Error clearing user secure data:', error);
    return false;
  }
};

/**
 * Migrate data from AsyncStorage to SecureStore
 * Call this once during app startup to migrate existing users
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const migrateToSecureStorage = async (userId) => {
  try {
    const available = await isSecureStoreAvailable();
    if (!available) {
      return false; // Can't migrate if SecureStore not available
    }

    // Migration keys mapping (old AsyncStorage key -> new dataType)
    const migrations = [
      { oldKey: `profile_${userId}`, dataType: 'profile' },
      { oldKey: `stats_${userId}`, dataType: 'stats' },
      { oldKey: `inventory_${userId}`, dataType: 'inventory' },
    ];

    for (const { oldKey, dataType } of migrations) {
      const oldData = await AsyncStorage.getItem(oldKey);
      if (oldData) {
        // Save to SecureStore
        await saveUserData(userId, dataType, JSON.parse(oldData));
        // Remove from AsyncStorage
        await AsyncStorage.removeItem(oldKey);
      }
    }

    return true;
  } catch (error) {
    console.error('Migration to secure storage failed:', error);
    return false;
  }
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
