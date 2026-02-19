// Notification Context - Phase 08
// Manages notification state, permission, and routing

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  NotificationType,
  createNotificationContext,
  NotificationPreferencesDefaults,
} from '../models/Notification';

const NotificationContext = createContext(null);

const PREFERENCES_STORAGE_KEY = '@MuscleHamster:notificationPrefs';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function NotificationProvider({ children }) {
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [preferences, setPreferences] = useState(NotificationPreferencesDefaults);
  const [notificationContext, setNotificationContext] = useState(null);
  const [lastNotificationResponse, setLastNotificationResponse] = useState(null);

  // Define all helper functions before useEffects that use them
  const checkPermissionStatus = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        setPreferences({ ...NotificationPreferencesDefaults, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.warn('Error loading notification preferences:', error);
    }
  }, []);

  const savePreferences = useCallback(async (prefs) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn('Error saving notification preferences:', error);
    }
  }, []);

  const handleNotificationResponse = useCallback((response) => {
    const { notification } = response;
    const data = notification.request.content.data || {};

    // Create context for the notification
    const context = createNotificationContext({
      notificationType: data.type || NotificationType.GENERAL,
      tappedAt: new Date(),
      hasCheckedInToday: data.hasCheckedInToday || false,
      currentStreak: data.currentStreak || 0,
    });

    setNotificationContext(context);
    setLastNotificationResponse(response);
  }, []);

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
    loadPreferences();
  }, [checkPermissionStatus, loadPreferences]);

  // Listen for notification interactions
  useEffect(() => {
    let subscription = null;
    try {
      subscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );
    } catch (error) {
      console.warn('Failed to add notification listener:', error);
    }

    return () => {
      if (subscription) {
        try {
          subscription.remove();
        } catch (error) {
          console.warn('Failed to remove notification listener:', error);
        }
      }
    };
  }, [handleNotificationResponse]);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);

    // Update preferences to mark that we've shown the prompt
    const updatedPrefs = {
      ...preferences,
      hasShownPermissionPrompt: true,
      permissionPromptDate: new Date().toISOString(),
    };
    setPreferences(updatedPrefs);
    await savePreferences(updatedPrefs);

    return status === 'granted';
  };

  const updatePreferences = useCallback(async (updates) => {
    const updatedPrefs = { ...preferences, ...updates };
    setPreferences(updatedPrefs);
    await savePreferences(updatedPrefs);
  }, [preferences, savePreferences]);

  const clearNotificationContext = useCallback(() => {
    setNotificationContext(null);
  }, []);

  // Schedule a local notification
  const scheduleNotification = useCallback(async ({
    title,
    body,
    data = {},
    trigger,
  }) => {
    if (permissionStatus !== 'granted') {
      console.warn('Cannot schedule notification - permission not granted');
      return null;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });
      return id;
    } catch (error) {
      console.warn('Error scheduling notification:', error);
      return null;
    }
  }, [permissionStatus]);

  // Cancel a scheduled notification
  const cancelNotification = useCallback(async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('Error canceling notification:', error);
    }
  }, []);

  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Error canceling all notifications:', error);
    }
  }, []);

  // Schedule daily reminder
  const scheduleDailyReminder = useCallback(async (hour, minute, currentStreak = 0) => {
    // Cancel existing daily reminders first
    await cancelAllNotifications();

    const messages = [
      "Ready for today's workout? I'm cheering for you!",
      "Hey! Your hamster is ready to exercise with you!",
      "Time to get moving! Let's do this together!",
      "Your fitness buddy is waiting! Ready when you are!",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    return scheduleNotification({
      title: "Time to Work Out!",
      body: message,
      data: {
        type: NotificationType.DAILY_REMINDER,
        currentStreak,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }, [scheduleNotification, cancelAllNotifications]);

  // Schedule streak at risk notification
  const scheduleStreakAtRiskNotification = useCallback(async (currentStreak) => {
    const now = new Date();
    const notificationTime = new Date(now);
    notificationTime.setHours(20, 0, 0, 0); // 8 PM

    // If it's already past 8 PM, don't schedule for today
    if (now >= notificationTime) {
      return null;
    }

    return scheduleNotification({
      title: "Streak Alert!",
      body: `Your ${currentStreak}-day streak is at risk! Quick check-in?`,
      data: {
        type: NotificationType.STREAK_AT_RISK,
        currentStreak,
      },
      trigger: notificationTime,
    });
  }, [scheduleNotification]);

  const value = {
    permissionStatus,
    preferences,
    notificationContext,
    lastNotificationResponse,
    checkPermissionStatus,
    requestPermission,
    updatePreferences,
    clearNotificationContext,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    scheduleDailyReminder,
    scheduleStreakAtRiskNotification,
    isPermissionGranted: permissionStatus === 'granted',
    shouldShowPermissionPrompt: !preferences.hasShownPermissionPrompt,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
