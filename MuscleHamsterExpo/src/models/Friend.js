/**
 * Friend.js
 * MuscleHamster Expo
 *
 * Models for friend relationships, requests, streaks, and blocking
 * Ported from Phase 09: Social Features (Swift version)
 */

import * as Crypto from 'expo-crypto';

// MARK: - Friend Relationship Status
export const FriendRelationshipStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  BLOCKED: 'blocked',
};

export const getRelationshipStatusDisplayName = (status) => {
  switch (status) {
    case FriendRelationshipStatus.PENDING: return 'Pending';
    case FriendRelationshipStatus.ACCEPTED: return 'Friends';
    case FriendRelationshipStatus.BLOCKED: return 'Blocked';
    default: return '';
  }
};

// MARK: - Friend Relationship
export const createFriendRelationship = ({
  id = generateUUID(),
  userId1,
  userId2,
  status = FriendRelationshipStatus.PENDING,
  createdAt = new Date(),
  acceptedAt = null,
  friendStreakId = null,
}) => ({
  id,
  userId1,
  userId2,
  status,
  createdAt,
  acceptedAt,
  friendStreakId,
  involves: (userId) => userId1 === userId || userId2 === userId,
  otherUserId: (userId) => {
    if (userId1 === userId) return userId2;
    if (userId2 === userId) return userId1;
    return null;
  },
  isActive: status === FriendRelationshipStatus.ACCEPTED,
});

// MARK: - Friend Request Status
export const FriendRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const getRequestStatusDisplayName = (status) => {
  switch (status) {
    case FriendRequestStatus.PENDING: return 'Pending';
    case FriendRequestStatus.ACCEPTED: return 'Accepted';
    case FriendRequestStatus.DECLINED: return 'Declined';
    case FriendRequestStatus.CANCELLED: return 'Cancelled';
    case FriendRequestStatus.EXPIRED: return 'Expired';
    default: return '';
  }
};

export const getRequestStatusIcon = (status) => {
  switch (status) {
    case FriendRequestStatus.PENDING: return 'time-outline';
    case FriendRequestStatus.ACCEPTED: return 'checkmark-circle';
    case FriendRequestStatus.DECLINED: return 'close-circle';
    case FriendRequestStatus.CANCELLED: return 'remove-circle';
    case FriendRequestStatus.EXPIRED: return 'timer-outline';
    default: return 'help-circle';
  }
};

// MARK: - Friend Request
export const createFriendRequest = ({
  id = generateUUID(),
  senderId,
  receiverId,
  status = FriendRequestStatus.PENDING,
  sentAt = new Date(),
  respondedAt = null,
}) => ({
  id,
  senderId,
  receiverId,
  status,
  sentAt,
  respondedAt,
  canRespond: status === FriendRequestStatus.PENDING,
  displaySentDate: getRelativeTimeString(sentAt),
});

// MARK: - Friend Streak Status
export const FriendStreakStatus = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  AT_RISK: 'atRisk',
  BROKEN: 'broken',
  NONE: 'none',
};

export const getStreakStatusDisplayName = (status) => {
  switch (status) {
    case FriendStreakStatus.ACTIVE: return 'On Fire';
    case FriendStreakStatus.WAITING: return 'Waiting';
    case FriendStreakStatus.AT_RISK: return 'At Risk';
    case FriendStreakStatus.BROKEN: return 'Broken';
    case FriendStreakStatus.NONE: return 'Not Started';
    default: return '';
  }
};

export const getStreakStatusIcon = (status) => {
  switch (status) {
    case FriendStreakStatus.ACTIVE: return 'flame';
    case FriendStreakStatus.WAITING: return 'time-outline';
    case FriendStreakStatus.AT_RISK: return 'warning';
    case FriendStreakStatus.BROKEN: return 'heart-dislike';
    case FriendStreakStatus.NONE: return 'sparkles';
    default: return 'help-circle';
  }
};

export const getStreakStatusColor = (status) => {
  switch (status) {
    case FriendStreakStatus.ACTIVE: return '#FF9500';
    case FriendStreakStatus.WAITING: return '#007AFF';
    case FriendStreakStatus.AT_RISK: return '#FFCC00';
    case FriendStreakStatus.BROKEN: return '#8E8E93';
    case FriendStreakStatus.NONE: return '#AF52DE';
    default: return '#8E8E93';
  }
};

// MARK: - Friend Streak
export const createFriendStreak = ({
  id = generateUUID(),
  userId1,
  userId2,
  currentStreak = 0,
  longestStreak = 0,
  lastCheckInUser1 = null,
  lastCheckInUser2 = null,
  status = FriendStreakStatus.NONE,
  previousBrokenStreak = 0,
  createdAt = new Date(),
  lastUpdatedAt = new Date(),
}) => {
  const streak = {
    id,
    userId1,
    userId2,
    currentStreak,
    longestStreak,
    lastCheckInUser1,
    lastCheckInUser2,
    status,
    previousBrokenStreak,
    createdAt,
    lastUpdatedAt,
  };

  return {
    ...streak,
    involves: (userId) => userId1 === userId || userId2 === userId,
    otherUserId: (userId) => {
      if (userId1 === userId) return userId2;
      if (userId2 === userId) return userId1;
      return null;
    },
    lastCheckIn: (userId) => {
      if (userId1 === userId) return lastCheckInUser1;
      if (userId2 === userId) return lastCheckInUser2;
      return null;
    },
    hasCheckedInToday: (userId) => {
      const lastCheckIn = userId1 === userId ? lastCheckInUser1 : lastCheckInUser2;
      if (!lastCheckIn) return false;
      return isToday(new Date(lastCheckIn));
    },
    bothCheckedInToday: () => {
      if (!lastCheckInUser1 || !lastCheckInUser2) return false;
      return isToday(new Date(lastCheckInUser1)) && isToday(new Date(lastCheckInUser2));
    },
    statusMessage: getStreakStatusMessage(status, currentStreak, previousBrokenStreak),
  };
};

const getStreakStatusMessage = (status, currentStreak, previousBrokenStreak) => {
  switch (status) {
    case FriendStreakStatus.ACTIVE:
      if (currentStreak >= 7) {
        return `You two are unstoppable! ${currentStreak} days together!`;
      }
      return 'Great teamwork! Both checked in today.';
    case FriendStreakStatus.WAITING:
      return "You're both doing great — one more check-in to go!";
    case FriendStreakStatus.AT_RISK:
      return "Don't let the streak slip! Check in soon.";
    case FriendStreakStatus.BROKEN:
      if (previousBrokenStreak > 0) {
        return `Your ${previousBrokenStreak}-day streak ended. You can restore it!`;
      }
      return 'Streak ended. Ready to start again?';
    case FriendStreakStatus.NONE:
      return 'Start your first streak together!';
    default:
      return '';
  }
};

// MARK: - Blocked User
export const createBlockedUser = ({
  id = generateUUID(),
  blockerId,
  blockedId,
  blockedAt = new Date(),
}) => ({
  id,
  blockerId,
  blockedId,
  blockedAt,
});

// MARK: - Hamster State (needed for FriendProfile)
export const HamsterState = {
  HUNGRY: 'hungry',
  CHILLIN: 'chillin',
  HAPPY: 'happy',
  EXCITED: 'excited',
  PROUD: 'proud',
};

export const getHamsterStateColor = (state) => {
  switch (state) {
    case HamsterState.HUNGRY: return '#FF9500';
    case HamsterState.CHILLIN: return '#007AFF';
    case HamsterState.HAPPY: return '#34C759';
    case HamsterState.EXCITED: return '#FFCC00';
    case HamsterState.PROUD: return '#AF52DE';
    default: return '#8E8E93';
  }
};

// MARK: - Growth Stage
export const GrowthStage = {
  BABY: 'baby',
  TEEN: 'teen',
  ADULT: 'adult',
  BUFF: 'buff',
  LEGENDARY: 'legendary',
};

// MARK: - Friend Profile
export const createFriendProfile = ({
  id,
  email,
  hamsterName = null,
  currentStreak = 0,
  longestStreak = 0,
  totalWorkoutsCompleted = 0,
  hamsterState = HamsterState.CHILLIN,
  growthStage = GrowthStage.BABY,
  equippedOutfitId = null,
  equippedAccessoryId = null,
  friendStreak = null,
  visibilitySettings = null,
  memberSince = null,
}) => {
  const maskedEmail = maskEmail(email);

  return {
    id,
    email,
    hamsterName,
    currentStreak,
    longestStreak,
    totalWorkoutsCompleted,
    hamsterState,
    growthStage,
    equippedOutfitId,
    equippedAccessoryId,
    friendStreak,
    visibilitySettings,
    memberSince,
    displayName: hamsterName && hamsterName.length > 0 ? hamsterName : maskedEmail,
    maskedEmail,
  };
};

const maskEmail = (email) => {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (localPart.length <= 1) return email;

  return `${localPart.charAt(0)}***${domain}`;
};

// MARK: - Friend Visibility Settings
export const createFriendVisibilitySettings = ({
  showStreak = true,
  showWorkoutCount = true,
  showHamsterState = true,
  showGrowthStage = true,
  showCustomizations = true,
} = {}) => ({
  showStreak,
  showWorkoutCount,
  showHamsterState,
  showGrowthStage,
  showCustomizations,
});

export const FriendVisibilitySettingsDefault = createFriendVisibilitySettings();
export const FriendVisibilitySettingsPrivate = createFriendVisibilitySettings({
  showStreak: false,
  showWorkoutCount: false,
  showHamsterState: true,
  showGrowthStage: false,
  showCustomizations: true,
});

// MARK: - Profile Visibility Level
export const ProfileVisibilityLevel = {
  EVERYONE: 'everyone',
  FRIENDS_ONLY: 'friendsOnly',
  PRIVATE: 'private',
};

export const getVisibilityDisplayName = (level) => {
  switch (level) {
    case ProfileVisibilityLevel.EVERYONE: return 'Everyone';
    case ProfileVisibilityLevel.FRIENDS_ONLY: return 'Friends Only';
    case ProfileVisibilityLevel.PRIVATE: return 'Private';
    default: return '';
  }
};

export const getVisibilityDescription = (level) => {
  switch (level) {
    case ProfileVisibilityLevel.EVERYONE:
      return 'Anyone can find you and see your hamster';
    case ProfileVisibilityLevel.FRIENDS_ONLY:
      return 'Only friends can see your profile. Others see a limited view.';
    case ProfileVisibilityLevel.PRIVATE:
      return "You're hidden from search. Only existing friends can see you.";
    default: return '';
  }
};

export const getVisibilityIcon = (level) => {
  switch (level) {
    case ProfileVisibilityLevel.EVERYONE: return 'globe-outline';
    case ProfileVisibilityLevel.FRIENDS_ONLY: return 'people';
    case ProfileVisibilityLevel.PRIVATE: return 'lock-closed';
    default: return 'help-circle';
  }
};

export const getVisibilityColor = (level) => {
  switch (level) {
    case ProfileVisibilityLevel.EVERYONE: return '#34C759';
    case ProfileVisibilityLevel.FRIENDS_ONLY: return '#007AFF';
    case ProfileVisibilityLevel.PRIVATE: return '#FF9500';
    default: return '#8E8E93';
  }
};

// MARK: - Privacy Settings
export const createPrivacySettings = ({
  profileVisibility = ProfileVisibilityLevel.EVERYONE,
  allowFriendRequests = true,
} = {}) => ({
  profileVisibility,
  allowFriendRequests,
  canReceiveFriendRequests: allowFriendRequests && profileVisibility !== ProfileVisibilityLevel.PRIVATE,
});

export const PrivacySettingsDefault = createPrivacySettings();

// MARK: - Friend Nudge
export const createFriendNudge = ({
  id = generateUUID(),
  senderId,
  recipientId,
  sentAt = new Date(),
  messageIndex = 0,
}) => ({
  id,
  senderId,
  recipientId,
  sentAt,
  messageIndex,
  message: NudgeMessages.forRecipient[messageIndex % NudgeMessages.forRecipient.length],
  messageWithName: (name) =>
    NudgeMessages.forRecipient[messageIndex % NudgeMessages.forRecipient.length]
      .replace('[Name]', name),
});

// MARK: - Nudge Messages
export const NudgeMessages = {
  forRecipient: [
    "[Name] gave your hamster a little cheer!",
    "[Name]'s hamster is waving at yours!",
    "Your friend [Name] is thinking of you today!",
    "[Name] sent some encouragement your way!",
    "[Name]'s hamster and yours want to see each other happy!",
    "[Name] believes in you!",
    "A little encouragement from [Name]!",
    "Your hamster has a cheerleader — it's [Name]!",
  ],
  notificationBody: [
    "[Name]'s hamster is cheering for you! Time to check in?",
    "Your friend [Name] is rooting for you today!",
    "[Name] sent some encouragement — your hamster noticed!",
    "[Name] believes in you! Ready to check in?",
    "A friendly nudge from [Name]'s hamster!",
  ],
  confirmations: [
    "Your hamster gave [Name]'s hamster a cheer!",
    "[Name]'s hamster got your message!",
    "Encouragement sent!",
    "[Name] will get a friendly nudge from your hamster!",
    "Sent! [Name]'s hamster will let them know.",
  ],
  randomIndex: () => Math.floor(Math.random() * NudgeMessages.forRecipient.length),
};

// MARK: - Nudge Config
export const NudgeConfig = {
  perFriendCooldownSeconds: 8 * 60 * 60, // 8 hours
  dailyLimit: 5,
  historyRetentionDays: 7,
};

// MARK: - Nudge Eligibility
export const NudgeEligibility = {
  CAN_NUDGE: 'canNudge',
  SENDER_NOT_CHECKED_IN: 'senderNotCheckedIn',
  RECIPIENT_ALREADY_CHECKED_IN: 'recipientAlreadyCheckedIn',
  COOLDOWN_ACTIVE: 'cooldownActive',
  DAILY_LIMIT_REACHED: 'dailyLimitReached',
  NOT_FRIENDS: 'notFriends',
  BLOCKED: 'blocked',
};

export const getNudgeEligibilityMessage = (eligibility, remainingSeconds = 0) => {
  switch (eligibility) {
    case NudgeEligibility.CAN_NUDGE:
      return 'Send encouragement';
    case NudgeEligibility.SENDER_NOT_CHECKED_IN:
      return 'Check in first to send encouragement';
    case NudgeEligibility.RECIPIENT_ALREADY_CHECKED_IN:
      return 'Already checked in today';
    case NudgeEligibility.COOLDOWN_ACTIVE:
      return `Nudge again in ${formatTimeRemaining(remainingSeconds)}`;
    case NudgeEligibility.DAILY_LIMIT_REACHED:
      return "You've encouraged lots of friends today!";
    case NudgeEligibility.NOT_FRIENDS:
      return 'Add as friend first';
    case NudgeEligibility.BLOCKED:
      return 'Cannot send';
    default:
      return '';
  }
};

export const getNudgeEligibilityIcon = (eligibility) => {
  switch (eligibility) {
    case NudgeEligibility.CAN_NUDGE: return 'hand-left';
    case NudgeEligibility.SENDER_NOT_CHECKED_IN: return 'arrow-up-circle';
    case NudgeEligibility.RECIPIENT_ALREADY_CHECKED_IN: return 'checkmark-circle';
    case NudgeEligibility.COOLDOWN_ACTIVE: return 'time-outline';
    case NudgeEligibility.DAILY_LIMIT_REACHED: return 'heart';
    case NudgeEligibility.NOT_FRIENDS:
    case NudgeEligibility.BLOCKED:
      return 'close-circle';
    default: return 'help-circle';
  }
};

// MARK: - Nudge History
export const createNudgeHistory = ({
  sentNudges = [],
  receivedNudges = [],
} = {}) => {
  const sentToday = sentNudges.filter(n => isToday(new Date(n.sentAt)));

  return {
    sentNudges,
    receivedNudges,
    sentToday,
    isDailyLimitReached: sentToday.length >= NudgeConfig.dailyLimit,
    cooldownRemaining: (friendId) => {
      const lastNudge = sentNudges
        .filter(n => n.recipientId === friendId)
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];

      if (!lastNudge) return null;

      const elapsed = (Date.now() - new Date(lastNudge.sentAt).getTime()) / 1000;
      const remaining = NudgeConfig.perFriendCooldownSeconds - elapsed;

      return remaining > 0 ? remaining : null;
    },
    recentReceivedNudges: receivedNudges.filter(n => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return new Date(n.sentAt).getTime() > oneDayAgo;
    }),
  };
};

// MARK: - Friend Streak Restore
export const FriendStreakRestoreOption = {
  SELF_ONLY: 'selfOnly',
  FOR_BOTH: 'forBoth',
};

export const getRestoreOptionDisplayName = (option) => {
  switch (option) {
    case FriendStreakRestoreOption.SELF_ONLY: return 'Restore My Side';
    case FriendStreakRestoreOption.FOR_BOTH: return 'Restore for Both';
    default: return '';
  }
};

export const getRestoreOptionCost = (option) => {
  switch (option) {
    case FriendStreakRestoreOption.SELF_ONLY: return 150;
    case FriendStreakRestoreOption.FOR_BOTH: return 300;
    default: return 0;
  }
};

export const FriendStreakConfig = {
  selfRestoreCost: 150,
  bothRestoreCost: 300,
};

// MARK: - Utility Functions
const generateUUID = () => {
  return Crypto.randomUUID();
};

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
};

const formatTimeRemaining = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return 'a moment';
};

export { generateUUID, isToday, isYesterday, getRelativeTimeString, formatTimeRemaining };
