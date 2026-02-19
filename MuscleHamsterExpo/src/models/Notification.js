// Notification Model - Phase 08
// Notification types and context for routing

export const NotificationType = {
  DAILY_REMINDER: 'dailyReminder',
  STREAK_AT_RISK: 'streakAtRisk',
  STREAK_BROKEN: 'streakBroken',
  FRIEND_NUDGE: 'friendNudge',
  ACHIEVEMENT: 'achievement',
  GENERAL: 'general',
};

export const NotificationTypeInfo = {
  [NotificationType.DAILY_REMINDER]: {
    displayName: 'Daily Reminder',
    description: 'A gentle nudge to work out',
    icon: 'notifications',
  },
  [NotificationType.STREAK_AT_RISK]: {
    displayName: 'Streak at Risk',
    description: 'Your streak needs attention!',
    icon: 'flame',
  },
  [NotificationType.STREAK_BROKEN]: {
    displayName: 'Streak Broken',
    description: 'Your streak was reset',
    icon: 'snow',
  },
  [NotificationType.FRIEND_NUDGE]: {
    displayName: 'Friend Nudge',
    description: 'A friend sent you a nudge',
    icon: 'hand-left',
  },
  [NotificationType.ACHIEVEMENT]: {
    displayName: 'Achievement',
    description: 'You unlocked something!',
    icon: 'trophy',
  },
  [NotificationType.GENERAL]: {
    displayName: 'Notification',
    description: 'General update',
    icon: 'information-circle',
  },
};

export const BannerType = {
  STREAK_SAFE: 'streakSafe',
  ACTION_NEEDED: 'actionNeeded',
  GENTLE_NUDGE: 'gentleNudge',
  CELEBRATION: 'celebration',
};

export const BannerTypeInfo = {
  [BannerType.STREAK_SAFE]: {
    icon: 'checkmark-circle',
    iconColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    accessibilityLabel: 'Streak is safe',
  },
  [BannerType.ACTION_NEEDED]: {
    icon: 'warning',
    iconColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    accessibilityLabel: 'Action needed',
  },
  [BannerType.GENTLE_NUDGE]: {
    icon: 'happy',
    iconColor: '#5AC8FA',
    backgroundColor: 'rgba(90, 200, 250, 0.12)',
    accessibilityLabel: 'Reminder',
  },
  [BannerType.CELEBRATION]: {
    icon: 'star',
    iconColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    accessibilityLabel: 'Celebration',
  },
};

// Create notification context for banner display
export const createNotificationContext = ({
  notificationType,
  tappedAt,
  hasCheckedInToday = false,
  currentStreak = 0,
}) => {
  // Determine banner type based on state
  let bannerType;
  let bannerMessage;
  let hasActionButton = false;
  let actionButtonTitle = '';
  let shouldAutoDismiss = true;
  let autoDismissDelay = 5;

  if (hasCheckedInToday) {
    // Already checked in - streak is safe
    bannerType = BannerType.STREAK_SAFE;
    bannerMessage = currentStreak > 1
      ? `Awesome! Your ${currentStreak}-day streak is safe. Keep it up!`
      : "You're all set for today! Great work!";
    autoDismissDelay = 3;
  } else if (notificationType === NotificationType.STREAK_AT_RISK && currentStreak > 0) {
    // At risk notification
    bannerType = BannerType.ACTION_NEEDED;
    bannerMessage = `Your ${currentStreak}-day streak needs you! Quick check-in?`;
    hasActionButton = true;
    actionButtonTitle = 'Rest Day Check-in';
    shouldAutoDismiss = false;
  } else if (notificationType === NotificationType.DAILY_REMINDER) {
    // Regular reminder
    bannerType = BannerType.GENTLE_NUDGE;
    bannerMessage = currentStreak > 0
      ? `Ready for day ${currentStreak + 1}? I'm here when you are!`
      : "Ready to start your fitness journey today?";
    autoDismissDelay = 5;
  } else {
    // Default
    bannerType = BannerType.GENTLE_NUDGE;
    bannerMessage = "Your hamster is happy to see you!";
    autoDismissDelay = 4;
  }

  return {
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

// Notification preferences defaults
export const NotificationPreferencesDefaults = {
  dailyRemindersEnabled: true,
  streakRemindersEnabled: true,
  friendNudgesEnabled: true,
  preferredReminderTime: '09:00',
  hasShownPermissionPrompt: false,
  permissionPromptDate: null,
};
