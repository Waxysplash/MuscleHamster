// App Routing State Model
// Ported from Swift AppRoutingState.swift
// Phase 08.3: Notification Tap Routing and Today Context

import { NotificationType } from './NotificationPreferences';
import * as Crypto from 'expo-crypto';
import Logger from '../services/LoggerService';

// Deep Link Destinations
export const DeepLinkDestination = {
  HOME: 'home',
  HOME_WITH_CONTEXT: 'homeWithNotificationContext',
  WORKOUTS: 'workouts',
  REST_DAY_CHECK_IN: 'restDayCheckIn',
};

// Notification Banner Types
export const NotificationBannerType = {
  STREAK_SAFE: 'streakSafe',      // User already checked in
  ACTION_NEEDED: 'actionNeeded',   // Streak at risk, no check-in
  GENTLE_NUDGE: 'gentleNudge',     // Daily reminder, no check-in
};

export const NotificationBannerTypeInfo = {
  [NotificationBannerType.STREAK_SAFE]: {
    icon: 'checkmark-circle',
    backgroundColor: 'rgba(76, 175, 80, 0.15)', // green
    iconColor: '#4CAF50',
    accessibilityLabel: 'Streak safe notification',
  },
  [NotificationBannerType.ACTION_NEEDED]: {
    icon: 'flame',
    backgroundColor: 'rgba(255, 152, 0, 0.15)', // orange
    iconColor: '#FF9800',
    accessibilityLabel: 'Action needed notification',
  },
  [NotificationBannerType.GENTLE_NUDGE]: {
    icon: 'paw',
    backgroundColor: 'rgba(156, 39, 176, 0.15)', // purple
    iconColor: '#9C27B0',
    accessibilityLabel: 'Workout reminder notification',
  },
};

// Create a notification context
export const createNotificationContext = ({
  notificationType,
  tappedAt = new Date(),
  hasCheckedInToday = false,
  currentStreak = 0,
}) => {
  const id = `ctx_${Date.now()}_${Crypto.randomUUID().substring(0, 8)}`;

  // Determine banner type based on context
  let bannerType;
  if (hasCheckedInToday) {
    bannerType = NotificationBannerType.STREAK_SAFE;
  } else if (notificationType === NotificationType.STREAK_AT_RISK) {
    bannerType = NotificationBannerType.ACTION_NEEDED;
  } else {
    bannerType = NotificationBannerType.GENTLE_NUDGE;
  }

  // Generate banner message
  let bannerMessage;
  switch (bannerType) {
    case NotificationBannerType.STREAK_SAFE:
      if (currentStreak > 0) {
        bannerMessage = `You're all set! Your streak is safe at ${currentStreak} day${currentStreak === 1 ? '' : 's'}.`;
      } else {
        bannerMessage = 'Great job checking in today! Keep it up!';
      }
      break;
    case NotificationBannerType.ACTION_NEEDED:
      bannerMessage = "There's still time! Check in to keep your streak going.";
      break;
    case NotificationBannerType.GENTLE_NUDGE:
    default:
      bannerMessage = 'Ready when you are! Your hamster is excited to work out.';
      break;
  }

  const hasActionButton = bannerType === NotificationBannerType.ACTION_NEEDED;
  const actionButtonTitle = 'Quick Check-in';
  const shouldAutoDismiss = bannerType !== NotificationBannerType.ACTION_NEEDED;
  const autoDismissDelay = 8000; // 8 seconds in milliseconds

  return {
    id,
    notificationType,
    tappedAt,
    hasCheckedInToday,
    currentStreak,
    bannerType,
    bannerMessage,
    hasActionButton,
    actionButtonTitle,
    shouldAutoDismiss,
    autoDismissDelay,
  };
};

// Create initial routing state
export const createInitialRoutingState = () => ({
  pendingDestination: null,
  notificationContext: null,
  shouldNavigateToHome: false,
});

// Handle a notification tap and generate routing state updates
export const handleNotificationTap = ({
  notificationType,
  hasCheckedInToday = false,
  currentStreak = 0,
}) => {
  const context = createNotificationContext({
    notificationType,
    tappedAt: new Date(),
    hasCheckedInToday,
    currentStreak,
  });

  Logger.debug(`AppRoutingState: Handling notification tap - type: ${notificationType}, checkedIn: ${hasCheckedInToday}`);

  return {
    pendingDestination: {
      type: DeepLinkDestination.HOME_WITH_CONTEXT,
      context,
    },
    notificationContext: context,
    shouldNavigateToHome: true,
  };
};

// Parse notification identifier to determine type
export const parseNotificationType = (identifier) => {
  if (identifier.startsWith('daily_reminder')) {
    return NotificationType.DAILY_REMINDER;
  } else if (identifier.startsWith('streak_at_risk')) {
    return NotificationType.STREAK_AT_RISK;
  } else if (identifier.startsWith('friend_nudge')) {
    return NotificationType.FRIEND_NUDGE;
  }
  return null;
};

// Compare notification contexts
export const areContextsEqual = (ctx1, ctx2) => {
  if (!ctx1 && !ctx2) return true;
  if (!ctx1 || !ctx2) return false;
  return ctx1.id === ctx2.id;
};

// Compare deep link destinations
export const areDestinationsEqual = (dest1, dest2) => {
  if (!dest1 && !dest2) return true;
  if (!dest1 || !dest2) return false;
  if (dest1.type !== dest2.type) return false;

  if (dest1.type === DeepLinkDestination.HOME_WITH_CONTEXT) {
    return areContextsEqual(dest1.context, dest2.context);
  }

  return true;
};
