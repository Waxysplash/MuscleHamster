// Notification Service
// Ported from Swift NotificationManager.swift
// Phase 08.2: Push Permission UX and Scheduling Rules
// Phase 08.3: Notification Tap Routing and Today Context
//
// Uses expo-notifications for push notification handling

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, AppState } from 'react-native';
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

  const trigger = {
    hour: prefs.reminderHour,
    minute: prefs.reminderMinute,
    repeats: true,
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

    Logger.debug(`NotificationService: Scheduled daily reminder for ${prefs.reminderHour}:${String(prefs.reminderMinute).padStart(2, '0')}`);
  } catch (error) {
    Logger.error('NotificationService: Failed to schedule daily reminder:', error);
  }
};

// Schedule streak at risk reminder
const scheduleStreakAtRiskReminder = async (prefs, streakReminderHour) => {
  const content = NotificationContent.getRandomStreakAtRisk();

  const trigger = {
    hour: streakReminderHour,
    minute: 0,
    repeats: true,
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

    Logger.debug(`NotificationService: Scheduled streak at risk reminder for ${streakReminderHour}:00`);
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
};

export default NotificationService;
