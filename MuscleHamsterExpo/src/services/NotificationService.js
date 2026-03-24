// Notification Service
// Ported from Swift NotificationManager.swift
// Phase 08.2: Push Permission UX and Scheduling Rules
// Phase 08.3: Notification Tap Routing and Today Context
//
// Uses expo-notifications for push notification handling

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, AppState } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../config/firebase';
import Logger from './LoggerService';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  createDefaultNotificationPreferences,
  getNotificationComputedProperties,
  NotificationContent,
  NotificationType,
  NotificationTypeInfo,
  NotificationPermissionState,
  getHasShownPermissionPrompt,
  setHasShownPermissionPrompt,
  setPermissionPromptDate,
  canShowPermissionPromptAgain,
  getDefaultReminderHourFromWorkoutTime,
} from '../models/NotificationPreferences';
import {
  handleNotificationTap as createRoutingState,
  parseNotificationType,
} from '../models/AppRoutingState';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Singleton state
let _preferences = null;
let _permissionState = NotificationPermissionState.NOT_DETERMINED;
let _listeners = [];
let _notificationTapHandler = null;
let _responseListener = null;
let _receivedListener = null;
let _expoPushToken = null;
let _currentUserId = null;

// Event subscription
const notifyListeners = () => {
  const state = getNotificationState();
  _listeners.forEach(listener => listener(state));
};

export const subscribeToNotificationState = (listener) => {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter(l => l !== listener);
  };
};

// Get current notification state
export const getNotificationState = () => ({
  preferences: _preferences || createDefaultNotificationPreferences(),
  permissionState: _permissionState,
  isEffectivelyEnabled: isEffectivelyEnabled(),
  computed: getNotificationComputedProperties(_preferences || createDefaultNotificationPreferences()),
});

// Check if notifications are effectively enabled
const isEffectivelyEnabled = () => {
  const prefs = _preferences || createDefaultNotificationPreferences();
  const isAuthorized = [
    NotificationPermissionState.AUTHORIZED,
    NotificationPermissionState.PROVISIONAL,
  ].includes(_permissionState);
  return isAuthorized && prefs.userEnabled;
};

// Initialize the notification service
export const initializeNotificationService = async () => {
  try {
    _preferences = await loadNotificationPreferences();
    await refreshPermissionState();
    setupNotificationListeners();
    Logger.debug('NotificationService: Initialized');
    notifyListeners();
    return _preferences;
  } catch (error) {
    Logger.error('NotificationService: Failed to initialize:', error);
    _preferences = createDefaultNotificationPreferences();
    return _preferences;
  }
};

// Setup notification listeners
const setupNotificationListeners = () => {
  // Clean up existing listeners
  if (_responseListener) {
    Notifications.removeNotificationSubscription(_responseListener);
  }
  if (_receivedListener) {
    Notifications.removeNotificationSubscription(_receivedListener);
  }

  // Listen for notification taps (when user taps a notification)
  _responseListener = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );

  // Listen for notifications received while app is foregrounded
  _receivedListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      Logger.debug('NotificationService: Received notification in foreground:', notification);
    }
  );
};

// Handle notification response (tap)
const handleNotificationResponse = async (response) => {
  const identifier = response.notification.request.identifier;
  Logger.debug('NotificationService: Handling notification tap - identifier:', identifier);

  // Parse the notification type
  const notificationType = parseNotificationType(identifier);
  if (!notificationType) {
    Logger.debug('NotificationService: Unknown notification identifier:', identifier);
    return;
  }

  // Clear badge and delivered notifications
  await Notifications.dismissAllNotificationsAsync();
  await clearBadge();

  // Call the tap handler if set
  if (_notificationTapHandler) {
    _notificationTapHandler(notificationType);
  }
};

// Set the notification tap handler
export const setNotificationTapHandler = (handler) => {
  _notificationTapHandler = handler;
};

// Refresh permission state from the system
export const refreshPermissionState = async () => {
  try {
    const settings = await Notifications.getPermissionsAsync();

    switch (settings.status) {
      case 'undetermined':
        _permissionState = NotificationPermissionState.NOT_DETERMINED;
        break;
      case 'denied':
        _permissionState = NotificationPermissionState.DENIED;
        break;
      case 'granted':
        _permissionState = NotificationPermissionState.AUTHORIZED;
        break;
      default:
        _permissionState = NotificationPermissionState.NOT_DETERMINED;
    }

    notifyListeners();
    return _permissionState;
  } catch (error) {
    Logger.error('NotificationService: Failed to get permission status:', error);
    return _permissionState;
  }
};

// Request notification permission
export const requestPermission = async () => {
  try {
    // Check if this is a physical device (required for push notifications)
    if (!Device.isDevice) {
      Logger.debug('NotificationService: Must use physical device for push notifications');
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    await refreshPermissionState();

    if (status === 'granted') {
      // Enable notifications and schedule them
      if (_preferences) {
        _preferences.userEnabled = true;
        await saveNotificationPreferences(_preferences);
        await rescheduleNotifications();
      }
    }

    // Track that we've shown the prompt
    await setHasShownPermissionPrompt(true);
    await setPermissionPromptDate(new Date());

    notifyListeners();
    return status === 'granted';
  } catch (error) {
    Logger.error('NotificationService: Failed to request permission:', error);
    await refreshPermissionState();
    return false;
  }
};

// Enable notifications
export const enableNotifications = async () => {
  if (_permissionState === NotificationPermissionState.NOT_DETERMINED) {
    return await requestPermission();
  } else if ([NotificationPermissionState.AUTHORIZED, NotificationPermissionState.PROVISIONAL].includes(_permissionState)) {
    if (_preferences) {
      _preferences.userEnabled = true;
      await saveNotificationPreferences(_preferences);
      await rescheduleNotifications();
      notifyListeners();
    }
    return true;
  }
  return false;
};

// Disable notifications
export const disableNotifications = async () => {
  if (_preferences) {
    _preferences.userEnabled = false;
    await saveNotificationPreferences(_preferences);
  }
  await cancelAllNotifications();
  notifyListeners();
};

// Update notification preferences
export const updateNotificationPreferences = async (newPreferences) => {
  const oldPreferences = _preferences;
  _preferences = newPreferences;

  try {
    await saveNotificationPreferences(newPreferences);

    // Reschedule if preferences changed
    if (JSON.stringify(oldPreferences) !== JSON.stringify(newPreferences)) {
      await rescheduleNotifications();
    }

    notifyListeners();
  } catch (error) {
    Logger.error('NotificationService: Failed to update preferences:', error);
  }
};

// Check if a given hour is during quiet hours
const isHourDuringQuietHours = (hour, prefs) => {
  if (!prefs.quietHoursEnabled) return false;

  const start = prefs.quietHoursStart;
  const end = prefs.quietHoursEnd;

  if (start < end) {
    // Simple range (e.g., 22:00 to 23:00 - unlikely but possible)
    return hour >= start && hour < end;
  } else {
    // Overnight range (e.g., 22:00 to 07:00)
    return hour >= start || hour < end;
  }
};

// Get adjusted hour that respects quiet hours
// If the hour is during quiet hours, return the first hour after quiet hours end
const getAdjustedHourForQuietHours = (hour, prefs) => {
  if (!isHourDuringQuietHours(hour, prefs)) {
    return hour; // Not during quiet hours, no adjustment needed
  }

  // Return the hour when quiet hours end
  Logger.debug(`NotificationService: Adjusting hour ${hour} to ${prefs.quietHoursEnd} due to quiet hours`);
  return prefs.quietHoursEnd;
};

// Reschedule all notifications based on current preferences
export const rescheduleNotifications = async () => {
  // First, cancel all existing notifications
  await cancelAllNotifications();

  // Only schedule if effectively enabled
  if (!isEffectivelyEnabled()) {
    return;
  }

  const prefs = _preferences || createDefaultNotificationPreferences();
  const computed = getNotificationComputedProperties(prefs);

  // Schedule daily reminder if enabled
  if (prefs.dailyReminderEnabled) {
    await scheduleDailyReminder(prefs);
  }

  // Schedule streak at risk reminder if enabled
  if (prefs.streakReminderEnabled) {
    await scheduleStreakAtRiskReminder(prefs, computed.streakReminderHour);
  }
};

// Schedule daily workout reminder
const scheduleDailyReminder = async (prefs) => {
  const content = NotificationContent.getRandomDailyReminder();

  // Check if reminder time is during quiet hours and adjust if needed
  const adjustedHour = getAdjustedHourForQuietHours(prefs.reminderHour, prefs);
  const wasAdjusted = adjustedHour !== prefs.reminderHour;

  // If adjusted, use 0 minutes (start of the hour)
  const adjustedMinute = wasAdjusted ? 0 : prefs.reminderMinute;

  // SDK 54+ requires 'type: daily' instead of 'repeats: true'
  const trigger = {
    type: 'daily',
    hour: adjustedHour,
    minute: adjustedMinute,
  };

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        badge: 1,
      },
      trigger,
      identifier: `${NotificationTypeInfo[NotificationType.DAILY_REMINDER].identifierPrefix}_daily`,
    });

    if (wasAdjusted) {
      Logger.debug(`NotificationService: Daily reminder adjusted from ${prefs.reminderHour}:${String(prefs.reminderMinute).padStart(2, '0')} to ${adjustedHour}:00 due to quiet hours`);
    } else {
      Logger.debug(`NotificationService: Scheduled daily reminder for ${adjustedHour}:${String(adjustedMinute).padStart(2, '0')}`);
    }
  } catch (error) {
    Logger.error('NotificationService: Failed to schedule daily reminder:', error);
  }
};

// Schedule streak at risk reminder
const scheduleStreakAtRiskReminder = async (prefs, streakReminderHour) => {
  const content = NotificationContent.getRandomStreakAtRisk();

  // Safety check: ensure streak reminder is not during quiet hours
  // The computed streakReminderHour should already account for this, but double-check
  const adjustedHour = getAdjustedHourForQuietHours(streakReminderHour, prefs);

  // If the adjusted hour is in the morning (after quiet hours end),
  // it's too late for a "streak at risk" reminder, so use the hour before quiet hours start
  let finalHour = adjustedHour;
  if (adjustedHour !== streakReminderHour && prefs.quietHoursEnabled) {
    // The original hour was during quiet hours, try 1 hour before quiet hours start
    const beforeQuietHours = (prefs.quietHoursStart - 1 + 24) % 24;
    if (!isHourDuringQuietHours(beforeQuietHours, prefs)) {
      finalHour = beforeQuietHours;
      Logger.debug(`NotificationService: Streak reminder moved to ${finalHour}:00 (1 hour before quiet hours)`);
    }
  }

  // SDK 54+ requires 'type: daily' instead of 'repeats: true'
  const trigger = {
    type: 'daily',
    hour: finalHour,
    minute: 0,
  };

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        badge: 1,
      },
      trigger,
      identifier: `${NotificationTypeInfo[NotificationType.STREAK_AT_RISK].identifierPrefix}_daily`,
    });

    Logger.debug(`NotificationService: Scheduled streak at risk reminder for ${finalHour}:00`);
  } catch (error) {
    Logger.error('NotificationService: Failed to schedule streak at risk reminder:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    await clearBadge();
    Logger.debug('NotificationService: Cancelled all notifications');
  } catch (error) {
    Logger.error('NotificationService: Failed to cancel notifications:', error);
  }
};

// Cancel a specific notification type
export const cancelNotification = async (type) => {
  const identifier = `${NotificationTypeInfo[type].identifierPrefix}_daily`;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    Logger.error(`NotificationService: Failed to cancel notification ${type}:`, error);
  }
};

// Clear the app badge
export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    Logger.error('NotificationService: Failed to clear badge:', error);
  }
};

// Update reminder time
export const updateReminderTime = async (hour, minute) => {
  if (_preferences) {
    _preferences.reminderHour = hour;
    _preferences.reminderMinute = minute;
    await saveNotificationPreferences(_preferences);
    await rescheduleNotifications();
    notifyListeners();
  }
};

// Toggle daily reminder
export const toggleDailyReminder = async (enabled) => {
  if (_preferences) {
    _preferences.dailyReminderEnabled = enabled;
    await saveNotificationPreferences(_preferences);
    await rescheduleNotifications();
    notifyListeners();
  }
};

// Toggle streak reminder
export const toggleStreakReminder = async (enabled) => {
  if (_preferences) {
    _preferences.streakReminderEnabled = enabled;
    await saveNotificationPreferences(_preferences);
    await rescheduleNotifications();
    notifyListeners();
  }
};

// Toggle friend nudges
export const toggleFriendNudges = async (enabled) => {
  if (_preferences) {
    _preferences.friendNudgesEnabled = enabled;
    await saveNotificationPreferences(_preferences);
    notifyListeners();
  }
};

// Initialize from onboarding workout time preference
export const initializeFromOnboarding = async (workoutTime) => {
  if (!workoutTime) return;

  const hasShown = await getHasShownPermissionPrompt();
  if (!hasShown && _preferences) {
    _preferences.reminderHour = getDefaultReminderHourFromWorkoutTime(workoutTime);
    _preferences.reminderMinute = 0;
    await saveNotificationPreferences(_preferences);
    notifyListeners();
  }
};

// Handle check-in (clear delivered notifications)
export const handleCheckIn = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await clearBadge();
  } catch (error) {
    Logger.error('NotificationService: Failed to handle check-in:', error);
  }
};

// Check if we should show permission prompt
export const shouldShowPermissionPrompt = async (totalWorkouts) => {
  // Only show after first workout
  if (totalWorkouts < 1) return false;

  // Don't show if already authorized
  if ([NotificationPermissionState.AUTHORIZED, NotificationPermissionState.PROVISIONAL].includes(_permissionState)) {
    return false;
  }

  // Don't show if denied (user made their choice)
  if (_permissionState === NotificationPermissionState.DENIED) {
    return false;
  }

  // Check cooldown
  return await canShowPermissionPromptAgain();
};

// Get pending notification requests (for debugging)
export const getPendingNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// ============================================
// PUSH TOKEN MANAGEMENT (for social nudges)
// ============================================

/**
 * Register for push notifications and get Expo push token
 * Requests permission if not already granted, then saves token to Firestore
 */
export const registerForPushNotifications = async (userId) => {
  if (!Device.isDevice) {
    Logger.debug('NotificationService: Push notifications only work on physical devices');
    return null;
  }

  _currentUserId = userId;

  try {
    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    // If permission was denied, we can't get a push token
    if (finalStatus !== 'granted') {
      Logger.debug('NotificationService: Push notification permission not granted');
      return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      Logger.error('NotificationService: No EAS project ID found');
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    _expoPushToken = tokenResponse.data;

    Logger.debug('NotificationService: Got push token:', _expoPushToken);

    // Save token to Firestore for this user
    if (userId && isFirebaseInitialized() && db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pushToken: _expoPushToken,
        pushTokenUpdatedAt: new Date(),
      });
      Logger.debug('NotificationService: Saved push token to Firestore');
    }

    // Set up Android notification channel (required for Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9500',
      });
    }

    return _expoPushToken;
  } catch (error) {
    Logger.error('NotificationService: Failed to get push token:', error);
    return null;
  }
};

/**
 * Get the current push token
 */
export const getExpoPushToken = () => _expoPushToken;

/**
 * Clear push token on logout
 */
export const clearPushToken = async (userId) => {
  _expoPushToken = null;
  _currentUserId = null;

  if (userId && isFirebaseInitialized() && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pushToken: null,
      });
    } catch (error) {
      // Ignore "not-found" errors - document may have been deleted during account deletion
      if (error?.code === 'not-found') {
        Logger.debug('NotificationService: User document already deleted, skipping push token clear');
        return;
      }
      Logger.error('NotificationService: Failed to clear push token:', error);
    }
  }
};

/**
 * Send a push notification to a user (via server/cloud function)
 * In a production app, this would call a Cloud Function
 * For now, we'll just log - actual push delivery happens via Expo's servers
 */
export const sendPushNotification = async (toToken, title, body, data = {}) => {
  // In production, this would call a Firebase Cloud Function
  // The Cloud Function would use Expo's push notification service
  // For now, we just prepare the message format

  const message = {
    to: toToken,
    sound: 'default',
    title,
    body,
    data,
  };

  Logger.debug('NotificationService: Would send push notification:', message);

  // TODO: Call Cloud Function to send this notification
  // Example: await functions.httpsCallable('sendPushNotification')(message);

  return message;
};

// Cleanup - call when unmounting
export const cleanupNotificationService = () => {
  if (_responseListener) {
    Notifications.removeNotificationSubscription(_responseListener);
    _responseListener = null;
  }
  if (_receivedListener) {
    Notifications.removeNotificationSubscription(_receivedListener);
    _receivedListener = null;
  }
  _preferences = null;
  _listeners = [];
  _notificationTapHandler = null;
};

// Check if a time is during quiet hours (exported for use in Settings)
export const checkIsTimeDuringQuietHours = (hour) => {
  const prefs = _preferences || createDefaultNotificationPreferences();
  return isHourDuringQuietHours(hour, prefs);
};

// Export NotificationService object for consistent API
export const NotificationService = {
  initialize: initializeNotificationService,
  updatePreferences: updateNotificationPreferences,
  requestPermission,
  enableNotifications,
  disableNotifications,
  refreshPermissionState,
  rescheduleNotifications,
  cancelAllNotifications,
  cancelNotification,
  clearBadge,
  updateReminderTime,
  toggleDailyReminder,
  toggleStreakReminder,
  toggleFriendNudges,
  initializeFromOnboarding,
  handleCheckIn,
  shouldShowPermissionPrompt,
  getPendingNotifications,
  setNotificationTapHandler,
  cleanup: cleanupNotificationService,
  subscribe: subscribeToNotificationState,
  getState: getNotificationState,
  // Push token management
  registerForPushNotifications,
  getExpoPushToken,
  clearPushToken,
  sendPushNotification,
  // Quiet hours
  checkIsTimeDuringQuietHours,
};

export default NotificationService;
