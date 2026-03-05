/**
 * FriendService.js
 * MuscleHamster Expo
 *
 * Service for managing friend relationships, requests, streaks, nudges, and blocking
 * Ported from Phase 09: Social Features (Swift version)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from './LoggerService';
import {
  createFriendRelationship,
  createFriendRequest,
  createFriendStreak,
  createBlockedUser,
  createFriendProfile,
  createFriendNudge,
  createNudgeHistory,
  createPrivacySettings,
  FriendRelationshipStatus,
  FriendRequestStatus,
  FriendStreakStatus,
  HamsterState,
  GrowthStage,
  NudgeConfig,
  NudgeMessages,
  NudgeEligibility,
  generateUUID,
  isToday,
} from '../models/Friend';

// Storage keys
const STORAGE_KEYS = {
  RELATIONSHIPS: 'friend_relationships',
  REQUESTS: 'friend_requests',
  STREAKS: 'friend_streaks',
  BLOCKED: 'blocked_users',
  NUDGE_HISTORY: 'nudge_history',
  PRIVACY_SETTINGS: 'privacy_settings',
};

// Mock user profiles for demo
const MOCK_PROFILES = [
  {
    id: 'friend1',
    email: 'alex@example.com',
    hamsterName: 'Nutkin',
    currentStreak: 12,
    longestStreak: 24,
    totalWorkoutsCompleted: 87,
    hamsterState: HamsterState.HAPPY,
    growthStage: GrowthStage.ADULT,
  },
  {
    id: 'friend2',
    email: 'jordan@example.com',
    hamsterName: 'Whiskers',
    currentStreak: 5,
    longestStreak: 18,
    totalWorkoutsCompleted: 45,
    hamsterState: HamsterState.EXCITED,
    growthStage: GrowthStage.TEEN,
  },
  {
    id: 'friend3',
    email: 'sam@example.com',
    hamsterName: 'Peanut',
    currentStreak: 0,
    longestStreak: 7,
    totalWorkoutsCompleted: 23,
    hamsterState: HamsterState.CHILLIN,
    growthStage: GrowthStage.BABY,
  },
  {
    id: 'friend4',
    email: 'taylor@example.com',
    hamsterName: 'Cheeks',
    currentStreak: 30,
    longestStreak: 45,
    totalWorkoutsCompleted: 156,
    hamsterState: HamsterState.PROUD,
    growthStage: GrowthStage.BUFF,
  },
  {
    id: 'friend5',
    email: 'casey@example.com',
    hamsterName: 'Nibbles',
    currentStreak: 3,
    longestStreak: 10,
    totalWorkoutsCompleted: 34,
    hamsterState: HamsterState.HUNGRY,
    growthStage: GrowthStage.TEEN,
  },
];

class FriendService {
  constructor() {
    this.relationships = [];
    this.requests = [];
    this.streaks = [];
    this.blockedUsers = [];
    this.nudgeHistory = {};
    this.privacySettings = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Load persisted data
      const [relationships, requests, streaks, blocked, nudgeHistory, privacySettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RELATIONSHIPS),
        AsyncStorage.getItem(STORAGE_KEYS.REQUESTS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAKS),
        AsyncStorage.getItem(STORAGE_KEYS.BLOCKED),
        AsyncStorage.getItem(STORAGE_KEYS.NUDGE_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS),
      ]);

      this.relationships = relationships ? JSON.parse(relationships) : this._createMockRelationships();
      this.requests = requests ? JSON.parse(requests) : this._createMockRequests();
      this.streaks = streaks ? JSON.parse(streaks) : this._createMockStreaks();
      this.blockedUsers = blocked ? JSON.parse(blocked) : [];
      this.nudgeHistory = nudgeHistory ? JSON.parse(nudgeHistory) : {};
      this.privacySettings = privacySettings ? JSON.parse(privacySettings) : {};

      this.initialized = true;
    } catch (error) {
      Logger.error('Error initializing FriendService:', error);
      // Initialize with mock data on error
      this.relationships = this._createMockRelationships();
      this.requests = this._createMockRequests();
      this.streaks = this._createMockStreaks();
      this.initialized = true;
    }
  }

  async _persist() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(this.relationships)),
        AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(this.requests)),
        AsyncStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(this.streaks)),
        AsyncStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(this.blockedUsers)),
        AsyncStorage.setItem(STORAGE_KEYS.NUDGE_HISTORY, JSON.stringify(this.nudgeHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(this.privacySettings)),
      ]);
    } catch (error) {
      Logger.error('Error persisting FriendService data:', error);
    }
  }

  _createMockRelationships() {
    return [
      {
        id: 'rel1',
        userId1: 'currentUser',
        userId2: 'friend1',
        status: FriendRelationshipStatus.ACCEPTED,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        friendStreakId: 'streak1',
      },
      {
        id: 'rel2',
        userId1: 'currentUser',
        userId2: 'friend2',
        status: FriendRelationshipStatus.ACCEPTED,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        friendStreakId: 'streak2',
      },
      {
        id: 'rel3',
        userId1: 'currentUser',
        userId2: 'friend4',
        status: FriendRelationshipStatus.ACCEPTED,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        friendStreakId: 'streak3',
      },
    ];
  }

  _createMockRequests() {
    return [
      {
        id: 'req1',
        senderId: 'friend3',
        receiverId: 'currentUser',
        status: FriendRequestStatus.PENDING,
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        respondedAt: null,
      },
      {
        id: 'req2',
        senderId: 'friend5',
        receiverId: 'currentUser',
        status: FriendRequestStatus.PENDING,
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        respondedAt: null,
      },
    ];
  }

  _createMockStreaks() {
    return [
      {
        id: 'streak1',
        userId1: 'currentUser',
        userId2: 'friend1',
        currentStreak: 7,
        longestStreak: 14,
        lastCheckInUser1: new Date().toISOString(),
        lastCheckInUser2: new Date().toISOString(),
        status: FriendStreakStatus.ACTIVE,
        previousBrokenStreak: 0,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      },
      {
        id: 'streak2',
        userId1: 'currentUser',
        userId2: 'friend2',
        currentStreak: 3,
        longestStreak: 5,
        lastCheckInUser1: new Date().toISOString(),
        lastCheckInUser2: null,
        status: FriendStreakStatus.WAITING,
        previousBrokenStreak: 0,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      },
      {
        id: 'streak3',
        userId1: 'currentUser',
        userId2: 'friend4',
        currentStreak: 21,
        longestStreak: 21,
        lastCheckInUser1: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        lastCheckInUser2: new Date().toISOString(),
        status: FriendStreakStatus.AT_RISK,
        previousBrokenStreak: 0,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      },
    ];
  }

  // MARK: - Friends List

  async getFriends(userId) {
    await this.initialize();

    const friendRelationships = this.relationships.filter(
      r => r.status === FriendRelationshipStatus.ACCEPTED &&
        (r.userId1 === userId || r.userId2 === userId)
    );

    return friendRelationships.map(rel => {
      const friendId = rel.userId1 === userId ? rel.userId2 : rel.userId1;
      const profile = MOCK_PROFILES.find(p => p.id === friendId);
      const streak = this.streaks.find(s =>
        (s.userId1 === userId && s.userId2 === friendId) ||
        (s.userId1 === friendId && s.userId2 === userId)
      );

      return createFriendProfile({
        ...profile,
        friendStreak: streak ? createFriendStreak(streak) : null,
      });
    });
  }

  async getFriendsWithStreaks(userId) {
    const friends = await this.getFriends(userId);
    return friends.map(friend => ({
      friend,
      streak: friend.friendStreak,
    }));
  }

  // MARK: - Friend Requests

  async getPendingRequests(userId) {
    await this.initialize();

    return this.requests
      .filter(r => r.receiverId === userId && r.status === FriendRequestStatus.PENDING)
      .map(r => {
        const sender = MOCK_PROFILES.find(p => p.id === r.senderId);
        return {
          request: createFriendRequest(r),
          senderProfile: sender ? createFriendProfile(sender) : null,
        };
      });
  }

  async getSentRequests(userId) {
    await this.initialize();

    return this.requests
      .filter(r => r.senderId === userId && r.status === FriendRequestStatus.PENDING)
      .map(r => createFriendRequest(r));
  }

  async sendFriendRequest(senderId, receiverId) {
    await this.initialize();

    // Check if already friends
    const existingRelationship = this.relationships.find(
      r => (r.userId1 === senderId && r.userId2 === receiverId) ||
        (r.userId1 === receiverId && r.userId2 === senderId)
    );

    if (existingRelationship) {
      throw new Error('Already friends or request pending');
    }

    // Check if blocked
    const isBlocked = this.blockedUsers.some(
      b => (b.blockerId === senderId && b.blockedId === receiverId) ||
        (b.blockerId === receiverId && b.blockedId === senderId)
    );

    if (isBlocked) {
      throw new Error('Cannot send request to this user');
    }

    const request = {
      id: generateUUID(),
      senderId,
      receiverId,
      status: FriendRequestStatus.PENDING,
      sentAt: new Date().toISOString(),
      respondedAt: null,
    };

    this.requests.push(request);
    await this._persist();

    return createFriendRequest(request);
  }

  async acceptFriendRequest(requestId, userId) {
    await this.initialize();

    const requestIndex = this.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    const request = this.requests[requestIndex];
    if (request.receiverId !== userId) {
      throw new Error('Not authorized to accept this request');
    }

    // Update request
    this.requests[requestIndex] = {
      ...request,
      status: FriendRequestStatus.ACCEPTED,
      respondedAt: new Date().toISOString(),
    };

    // Create relationship
    const relationship = {
      id: generateUUID(),
      userId1: request.senderId,
      userId2: request.receiverId,
      status: FriendRelationshipStatus.ACCEPTED,
      createdAt: request.sentAt,
      acceptedAt: new Date().toISOString(),
      friendStreakId: null,
    };

    this.relationships.push(relationship);

    // Create streak
    const streak = {
      id: generateUUID(),
      userId1: request.senderId,
      userId2: request.receiverId,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInUser1: null,
      lastCheckInUser2: null,
      status: FriendStreakStatus.NONE,
      previousBrokenStreak: 0,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    this.streaks.push(streak);

    // Update relationship with streak ID
    const relIndex = this.relationships.length - 1;
    this.relationships[relIndex].friendStreakId = streak.id;

    await this._persist();

    return createFriendRelationship(relationship);
  }

  async declineFriendRequest(requestId, userId) {
    await this.initialize();

    const requestIndex = this.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    const request = this.requests[requestIndex];
    if (request.receiverId !== userId) {
      throw new Error('Not authorized to decline this request');
    }

    this.requests[requestIndex] = {
      ...request,
      status: FriendRequestStatus.DECLINED,
      respondedAt: new Date().toISOString(),
    };

    await this._persist();
  }

  // MARK: - Remove Friend

  async removeFriend(userId, friendId) {
    await this.initialize();

    // Remove relationship
    this.relationships = this.relationships.filter(
      r => !((r.userId1 === userId && r.userId2 === friendId) ||
        (r.userId1 === friendId && r.userId2 === userId))
    );

    // Remove streak
    this.streaks = this.streaks.filter(
      s => !((s.userId1 === userId && s.userId2 === friendId) ||
        (s.userId1 === friendId && s.userId2 === userId))
    );

    await this._persist();
  }

  // MARK: - Blocking

  async blockUser(blockerId, blockedId) {
    await this.initialize();

    // Remove any existing friendship
    await this.removeFriend(blockerId, blockedId);

    // Remove any pending requests
    this.requests = this.requests.filter(
      r => !((r.senderId === blockerId && r.receiverId === blockedId) ||
        (r.senderId === blockedId && r.receiverId === blockerId))
    );

    // Add block
    const block = {
      id: generateUUID(),
      blockerId,
      blockedId,
      blockedAt: new Date().toISOString(),
    };

    this.blockedUsers.push(block);
    await this._persist();

    return createBlockedUser(block);
  }

  async unblockUser(blockerId, blockedId) {
    await this.initialize();

    this.blockedUsers = this.blockedUsers.filter(
      b => !(b.blockerId === blockerId && b.blockedId === blockedId)
    );

    await this._persist();
  }

  async getBlockedUsers(userId) {
    await this.initialize();

    return this.blockedUsers
      .filter(b => b.blockerId === userId)
      .map(b => createBlockedUser(b));
  }

  async getBlockedUsersWithProfiles(userId) {
    await this.initialize();

    const blocked = this.blockedUsers.filter(b => b.blockerId === userId);

    return blocked.map(b => {
      const profile = MOCK_PROFILES.find(p => p.id === b.blockedId);
      return {
        blockedUser: createBlockedUser(b),
        profile: profile ? createFriendProfile(profile) : null,
      };
    });
  }

  // MARK: - Streaks

  async getStreak(userId, friendId) {
    await this.initialize();

    const streak = this.streaks.find(
      s => (s.userId1 === userId && s.userId2 === friendId) ||
        (s.userId1 === friendId && s.userId2 === userId)
    );

    return streak ? createFriendStreak(streak) : null;
  }

  async recordCheckIn(userId) {
    await this.initialize();

    const now = new Date();

    // Update all streaks involving this user
    this.streaks = this.streaks.map(streak => {
      if (streak.userId1 === userId) {
        const updated = { ...streak, lastCheckInUser1: now.toISOString(), lastUpdatedAt: now.toISOString() };
        return this._updateStreakStatus(updated);
      } else if (streak.userId2 === userId) {
        const updated = { ...streak, lastCheckInUser2: now.toISOString(), lastUpdatedAt: now.toISOString() };
        return this._updateStreakStatus(updated);
      }
      return streak;
    });

    await this._persist();
  }

  _updateStreakStatus(streak) {
    const now = new Date();
    const check1 = streak.lastCheckInUser1 ? new Date(streak.lastCheckInUser1) : null;
    const check2 = streak.lastCheckInUser2 ? new Date(streak.lastCheckInUser2) : null;

    const user1Today = check1 && isToday(check1);
    const user2Today = check2 && isToday(check2);

    if (user1Today && user2Today) {
      // Both checked in today
      return {
        ...streak,
        currentStreak: streak.currentStreak + 1,
        longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
        status: FriendStreakStatus.ACTIVE,
      };
    } else if (user1Today || user2Today) {
      // One checked in, waiting for other
      return {
        ...streak,
        status: FriendStreakStatus.WAITING,
      };
    }

    return streak;
  }

  async restoreStreak(userId, friendId, option) {
    await this.initialize();

    const streakIndex = this.streaks.findIndex(
      s => (s.userId1 === userId && s.userId2 === friendId) ||
        (s.userId1 === friendId && s.userId2 === userId)
    );

    if (streakIndex === -1) {
      throw new Error('Streak not found');
    }

    const streak = this.streaks[streakIndex];
    const cost = option === 'forBoth' ? 300 : 150;

    // Restore the streak
    this.streaks[streakIndex] = {
      ...streak,
      currentStreak: streak.previousBrokenStreak,
      status: option === 'forBoth' ? FriendStreakStatus.ACTIVE : FriendStreakStatus.WAITING,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this._persist();

    return {
      success: true,
      restoredStreak: streak.previousBrokenStreak,
      option,
      pointsSpent: cost,
      message: 'Streak restored!',
      friendNeedsToRestore: option === 'selfOnly',
    };
  }

  // MARK: - Nudges

  async getNudgeEligibility(senderId, recipientId, senderCheckedInToday) {
    await this.initialize();

    // Check if friends
    const areFriends = this.relationships.some(
      r => r.status === FriendRelationshipStatus.ACCEPTED &&
        ((r.userId1 === senderId && r.userId2 === recipientId) ||
          (r.userId1 === recipientId && r.userId2 === senderId))
    );

    if (!areFriends) {
      return { eligibility: NudgeEligibility.NOT_FRIENDS };
    }

    // Check if blocked
    const isBlocked = this.blockedUsers.some(
      b => (b.blockerId === senderId && b.blockedId === recipientId) ||
        (b.blockerId === recipientId && b.blockedId === senderId)
    );

    if (isBlocked) {
      return { eligibility: NudgeEligibility.BLOCKED };
    }

    // Check if sender checked in
    if (!senderCheckedInToday) {
      return { eligibility: NudgeEligibility.SENDER_NOT_CHECKED_IN };
    }

    // Check nudge history
    const history = this.nudgeHistory[senderId] || { sentNudges: [], receivedNudges: [] };
    const nudgeHistoryObj = createNudgeHistory(history);

    // Check daily limit
    if (nudgeHistoryObj.isDailyLimitReached) {
      return { eligibility: NudgeEligibility.DAILY_LIMIT_REACHED };
    }

    // Check cooldown
    const cooldown = nudgeHistoryObj.cooldownRemaining(recipientId);
    if (cooldown) {
      return { eligibility: NudgeEligibility.COOLDOWN_ACTIVE, remainingSeconds: cooldown };
    }

    return { eligibility: NudgeEligibility.CAN_NUDGE };
  }

  async sendNudge(senderId, recipientId) {
    await this.initialize();

    const nudge = {
      id: generateUUID(),
      senderId,
      recipientId,
      sentAt: new Date().toISOString(),
      messageIndex: NudgeMessages.randomIndex(),
    };

    // Update sender's history
    if (!this.nudgeHistory[senderId]) {
      this.nudgeHistory[senderId] = { sentNudges: [], receivedNudges: [] };
    }
    this.nudgeHistory[senderId].sentNudges.push(nudge);

    // Update recipient's history
    if (!this.nudgeHistory[recipientId]) {
      this.nudgeHistory[recipientId] = { sentNudges: [], receivedNudges: [] };
    }
    this.nudgeHistory[recipientId].receivedNudges.push(nudge);

    await this._persist();

    return createFriendNudge(nudge);
  }

  async getReceivedNudges(userId) {
    await this.initialize();

    const history = this.nudgeHistory[userId] || { sentNudges: [], receivedNudges: [] };
    const nudgeHistoryObj = createNudgeHistory(history);

    return nudgeHistoryObj.recentReceivedNudges.map(n => {
      const sender = MOCK_PROFILES.find(p => p.id === n.senderId);
      return {
        nudge: createFriendNudge(n),
        senderName: sender?.hamsterName || 'A friend',
      };
    });
  }

  // MARK: - Privacy Settings

  async getPrivacySettings(userId) {
    await this.initialize();

    const settings = this.privacySettings[userId];
    return settings ? createPrivacySettings(settings) : createPrivacySettings();
  }

  async updatePrivacySettings(userId, settings) {
    await this.initialize();

    this.privacySettings[userId] = settings;
    await this._persist();

    return createPrivacySettings(settings);
  }

  // MARK: - Search Users

  async searchUsers(query, currentUserId) {
    await this.initialize();

    const lowerQuery = query.toLowerCase();

    // Search mock profiles (excluding current user and blocked users)
    const blockedIds = this.blockedUsers
      .filter(b => b.blockerId === currentUserId || b.blockedId === currentUserId)
      .map(b => b.blockerId === currentUserId ? b.blockedId : b.blockerId);

    const results = MOCK_PROFILES.filter(p => {
      if (p.id === currentUserId) return false;
      if (blockedIds.includes(p.id)) return false;

      return p.hamsterName?.toLowerCase().includes(lowerQuery) ||
        p.email.toLowerCase().includes(lowerQuery);
    });

    return results.map(p => {
      const relationship = this.relationships.find(
        r => (r.userId1 === currentUserId && r.userId2 === p.id) ||
          (r.userId1 === p.id && r.userId2 === currentUserId)
      );

      const pendingRequest = this.requests.find(
        r => r.status === FriendRequestStatus.PENDING &&
          ((r.senderId === currentUserId && r.receiverId === p.id) ||
            (r.senderId === p.id && r.receiverId === currentUserId))
      );

      return {
        profile: createFriendProfile(p),
        isFriend: relationship?.status === FriendRelationshipStatus.ACCEPTED,
        hasPendingRequest: !!pendingRequest,
        requestSentByMe: pendingRequest?.senderId === currentUserId,
      };
    });
  }

  // MARK: - Leaderboard

  async getFriendsLeaderboard(userId) {
    const friends = await this.getFriends(userId);

    // Sort by current streak descending
    const sorted = [...friends].sort((a, b) => b.currentStreak - a.currentStreak);

    return sorted.map((friend, index) => ({
      rank: index + 1,
      friend,
      isCurrentUser: friend.id === userId,
    }));
  }
}

// Singleton instance
export const friendService = new FriendService();
export default friendService;
