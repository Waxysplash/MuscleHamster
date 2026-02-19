// Notification Preferences Model
// Ported from Swift NotificationPreferences.swift
// Phase 08.2: Push Permission UX and Scheduling Rules

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const NOTIFICATION_STORAGE_KEYS = {
  userEnabled: '@notification_userEnabled',
  dailyReminderEnabled: '@notification_dailyReminderEnabled',
  streakReminderEnabled: '@notification_streakReminderEnabled',
  friendNudgesEnabled: '@notification_friendNudgesEnabled',
  reminderHour: '@notification_reminderHour',
  reminderMinute: '@notification_reminderMinute',
  hasShownPermissionPrompt: '@notification_hasShownPermissionPrompt',
  permissionPromptDate: '@notification_permissionPromptDate',
  quietHoursEnabled: '@notification_quietHoursEnabled',
  quietHoursStart: '@notification_quietHoursStart',
  quietHoursEnd: '@notification_quietHoursEnd',
};

// Default Values
export const NOTIFICATION_DEFAULTS = {
  userEnabled: false,
  dailyReminderEnabled: true,
  streakReminderEnabled: true,
  friendNudgesEnabled: true,
  reminderHour: 8, // 8 AM
  reminderMinute: 0,
  quietHoursEnabled: true,
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 7, // 7 AM
};

// Reminder Time Periods
export const ReminderTimePeriod = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  CUSTOM: 'custom',
};

export const ReminderTimePeriodInfo = {
  [ReminderTimePeriod.MORNING]: {
    displayName: 'Morning',
    description: 'Around 8:00 AM',
    icon: 'sunny-outline',
    defaultHour: 8,
    defaultMinute: 0,
  },
  [ReminderTimePeriod.AFTERNOON]: {
    displayName: 'Afternoon',
    description: 'Around 1:00 PM',
    icon: 'partly-sunny-outline',
    defaultHour: 13,
    defaultMinute: 0,
  },
  [ReminderTimePeriod.EVENING]: {
    displayName: 'Evening',
    description: 'Around 6:00 PM',
    icon: 'moon-outline',
    defaultHour: 18,
    defaultMinute: 0,
  },
  [ReminderTimePeriod.CUSTOM]: {
    displayName: 'Custom',
    description: 'Pick your own time',
    icon: 'time-outline',
    defaultHour: 8,
    defaultMinute: 0,
  },
};

// Notification Types
export const NotificationType = {
  DAILY_REMINDER: 'dailyReminder',
  STREAK_AT_RISK: 'streakAtRisk',
  FRIEND_NUDGE: 'friendNudge',
};

export const NotificationTypeInfo = {
  [NotificationType.DAILY_REMINDER]: {
    displayName: 'Daily Workout Reminder',
    description: 'A gentle nudge at your preferred time',
    icon: 'notifications-outline',
    identifierPrefix: 'daily_reminder',
  },
  [NotificationType.STREAK_AT_RISK]: {
    displayName: 'Streak at Risk',
    description: 'Reminder before your streak resets',
    icon: 'flame-outline',
    identifierPrefix: 'streak_at_risk',
  },
  [NotificationType.FRIEND_NUDGE]: {
    displayName: 'Friend Nudges',
    description: 'Encouragement from your friends',
    icon: 'hand-right-outline',
    identifierPrefix: 'friend_nudge',
  },
};

// Notification Permission States
export const NotificationPermissionState = {
  NOT_DETERMINED: 'notDetermined',
  AUTHORIZED: 'authorized',
  DENIED: 'denied',
  PROVISIONAL: 'provisional',
};

export const NotificationPermissionStateInfo = {
  [NotificationPermissionState.NOT_DETERMINED]: {
    displayName: 'Not Set',
    description: "Notifications haven't been set up yet",
    isAuthorized: false,
  },
  [NotificationPermissionState.AUTHORIZED]: {
    displayName: 'Enabled',
    description: "You'll receive gentle reminders from your hamster",
    isAuthorized: true,
  },
  [NotificationPermissionState.DENIED]: {
    displayName: 'Disabled',
    description: 'Notifications are turned off in Settings',
    isAuthorized: false,
  },
  [NotificationPermissionState.PROVISIONAL]: {
    displayName: 'Provisional',
    description: 'Quiet notifications are enabled',
    isAuthorized: true,
  },
};

// Hamster-voiced notification messages
export const NotificationContent = {
  dailyReminderMessages: [
    {
      title: 'Hey there!',
      body: "Ready for a little movement today? I'll be cheering you on!",
    },
    {
      title: 'Workout time?',
      body: "Just a friendly nudge - how about we do a workout together?",
    },
    {
      title: 'Your hamster is excited!',
      body: "I've been waiting for you! Want to get moving?",
    },
    {
      title: 'Hi friend!',
      body: "It's a great day for some exercise. I believe in you!",
    },
    {
      title: "Let's go!",
      body: 'Your workout buddy is ready when you are!',
    },
  ],
  streakAtRiskMessages: [
    {
      title: 'Quick check-in!',
      body: "We haven't worked out together today! There's still time to keep our streak going.",
    },
    {
      title: 'Hey!',
      body: "I'm getting a little antsy... want to do a quick workout before the day ends?",
    },
    {
      title: 'Streak reminder',
      body: "Just a gentle nudge - your streak is waiting! Even a short workout counts.",
    },
  ],
  getRandomDailyReminder: () => {
    const messages = NotificationContent.dailyReminderMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  },
  getRandomStreakAtRisk: () => {
    const messages = NotificationContent.streakAtRiskMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  },
};

// Create default notification preferences
export const createDefaultNotificationPreferences = () => ({
  userEnabled: NOTIFICATION_DEFAULTS.userEnabled,
  dailyReminderEnabled: NOTIFICATION_DEFAULTS.dailyReminderEnabled,
  streakReminderEnabled: NOTIFICATION_DEFAULTS.streakReminderEnabled,
  friendNudgesEnabled: NOTIFICATION_DEFAULTS.friendNudgesEnabled,
  reminderHour: NOTIFICATION_DEFAULTS.reminderHour,
  reminderMinute: NOTIFICATION_DEFAULTS.reminderMinute,
  quietHoursEnabled: NOTIFICATION_DEFAULTS.quietHoursEnabled,
  quietHoursStart: NOTIFICATION_DEFAULTS.quietHoursStart,
  quietHoursEnd: NOTIFICATION_DEFAULTS.quietHoursEnd,
});

// Computed properties helper
export const getNotificationComputedProperties = (preferences) => {
  // Format reminder time
  const hour12 = preferences.reminderHour === 0
    ? 12
    : preferences.reminderHour > 12
      ? preferences.reminderHour - 12
      : preferences.reminderHour;
  const period = preferences.reminderHour < 12 ? 'AM' : 'PM';
  const formattedReminderTime = `${hour12}:${String(preferences.reminderMinute).padStart(2, '0')} ${period}`;

  // Determine reminder time period
  let reminderTimePeriod;
  if (preferences.reminderHour >= 5 && preferences.reminderHour < 12) {
    reminderTimePeriod = ReminderTimePeriod.MORNING;
  } else if (preferences.reminderHour >= 12 && preferences.reminderHour < 17) {
    reminderTimePeriod = ReminderTimePeriod.AFTERNOON;
  } else if (preferences.reminderHour >= 17 && preferences.reminderHour < 22) {
    reminderTimePeriod = ReminderTimePeriod.EVENING;
  } else {
    reminderTimePeriod = ReminderTimePeriod.CUSTOM;
  }

  // Check if reminder is during quiet hours
  let isReminderDuringQuietHours = false;
  if (preferences.quietHoursEnabled) {
    if (preferences.quietHoursStart < preferences.quietHoursEnd) {
      isReminderDuringQuietHours =
        preferences.reminderHour >= preferences.quietHoursStart &&
        preferences.reminderHour < preferences.quietHoursEnd;
    } else {
      // Overnight range
      isReminderDuringQuietHours =
        preferences.reminderHour >= preferences.quietHoursStart ||
        preferences.reminderHour < preferences.quietHoursEnd;
    }
  }

  // Get streak reminder hour
  let streakReminderHour = 18; // Default 6 PM
  if (preferences.quietHoursEnabled && preferences.quietHoursStart > 2) {
    streakReminderHour = preferences.quietHoursStart - 2;
  }

  return {
    formattedReminderTime,
    reminderTimePeriod,
    isReminderDuringQuietHours,
    streakReminderHour,
  };
};

// Load notification preferences from AsyncStorage
export const loadNotificationPreferences = async () => {
  try {
    const keys = [
      NOTIFICATION_STORAGE_KEYS.userEnabled,
      NOTIFICATION_STORAGE_KEYS.dailyReminderEnabled,
      NOTIFICATION_STORAGE_KEYS.streakReminderEnabled,
      NOTIFICATION_STORAGE_KEYS.friendNudgesEnabled,
      NOTIFICATION_STORAGE_KEYS.reminderHour,
      NOTIFICATION_STORAGE_KEYS.reminderMinute,
      NOTIFICATION_STORAGE_KEYS.quietHoursEnabled,
      NOTIFICATION_STORAGE_KEYS.quietHoursStart,
      NOTIFICATION_STORAGE_KEYS.quietHoursEnd,
    ];

    const pairs = await AsyncStorage.multiGet(keys);
    const stored = {};

    pairs.forEach(([key, value]) => {
      if (value !== null) {
        const shortKey = Object.keys(NOTIFICATION_STORAGE_KEYS).find(
          k => NOTIFICATION_STORAGE_KEYS[k] === key
        );
        if (shortKey) {
          // Parse integers for hour/minute
          if (['reminderHour', 'reminderMinute', 'quietHoursStart', 'quietHoursEnd'].includes(shortKey)) {
            stored[shortKey] = parseInt(value, 10);
          } else {
            stored[shortKey] = JSON.parse(value);
          }
        }
      }
    });

    return {
      userEnabled: stored.userEnabled ?? NOTIFICATION_DEFAULTS.userEnabled,
      dailyReminderEnabled: stored.dailyReminderEnabled ?? NOTIFICATION_DEFAULTS.dailyReminderEnabled,
      streakReminderEnabled: stored.streakReminderEnabled ?? NOTIFICATION_DEFAULTS.streakReminderEnabled,
      friendNudgesEnabled: stored.friendNudgesEnabled ?? NOTIFICATION_DEFAULTS.friendNudgesEnabled,
      reminderHour: stored.reminderHour ?? NOTIFICATION_DEFAULTS.reminderHour,
      reminderMinute: stored.reminderMinute ?? NOTIFICATION_DEFAULTS.reminderMinute,
      quietHoursEnabled: stored.quietHoursEnabled ?? NOTIFICATION_DEFAULTS.quietHoursEnabled,
      quietHoursStart: stored.quietHoursStart ?? NOTIFICATION_DEFAULTS.quietHoursStart,
      quietHoursEnd: stored.quietHoursEnd ?? NOTIFICATION_DEFAULTS.quietHoursEnd,
    };
  } catch (error) {
    console.error('NotificationPreferences: Failed to load preferences:', error);
    return createDefaultNotificationPreferences();
  }
};

// Save notification preferences to AsyncStorage
export const saveNotificationPreferences = async (preferences) => {
  try {
    const pairs = [
      [NOTIFICATION_STORAGE_KEYS.userEnabled, JSON.stringify(preferences.userEnabled)],
      [NOTIFICATION_STORAGE_KEYS.dailyReminderEnabled, JSON.stringify(preferences.dailyReminderEnabled)],
      [NOTIFICATION_STORAGE_KEYS.streakReminderEnabled, JSON.stringify(preferences.streakReminderEnabled)],
      [NOTIFICATION_STORAGE_KEYS.friendNudgesEnabled, JSON.stringify(preferences.friendNudgesEnabled)],
      [NOTIFICATION_STORAGE_KEYS.reminderHour, String(preferences.reminderHour)],
      [NOTIFICATION_STORAGE_KEYS.reminderMinute, String(preferences.reminderMinute)],
      [NOTIFICATION_STORAGE_KEYS.quietHoursEnabled, JSON.stringify(preferences.quietHoursEnabled)],
      [NOTIFICATION_STORAGE_KEYS.quietHoursStart, String(preferences.quietHoursStart)],
      [NOTIFICATION_STORAGE_KEYS.quietHoursEnd, String(preferences.quietHoursEnd)],
    ];

    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('NotificationPreferences: Failed to save preferences:', error);
  }
};

// Permission prompt tracking
export const getHasShownPermissionPrompt = async () => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.hasShownPermissionPrompt);
    return value === 'true';
  } catch {
    return false;
  }
};

export const setHasShownPermissionPrompt = async (value) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.hasShownPermissionPrompt, String(value));
  } catch (error) {
    console.error('Failed to save hasShownPermissionPrompt:', error);
  }
};

export const getPermissionPromptDate = async () => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.permissionPromptDate);
    return value ? new Date(value) : null;
  } catch {
    return null;
  }
};

export const setPermissionPromptDate = async (date) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.permissionPromptDate, date.toISOString());
  } catch (error) {
    console.error('Failed to save permissionPromptDate:', error);
  }
};

export const canShowPermissionPromptAgain = async () => {
  const hasShown = await getHasShownPermissionPrompt();
  if (!hasShown) return true;

  const lastDate = await getPermissionPromptDate();
  if (!lastDate) return true;

  // Check if 7 days have passed
  const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSince >= 7;
};

// Get default reminder hour from workout time preference
export const getDefaultReminderHourFromWorkoutTime = (workoutTime) => {
  switch (workoutTime) {
    case 'morning':
      return 8;
    case 'afternoon':
      return 13;
    case 'evening':
      return 18;
    default:
      return 8;
  }
};
