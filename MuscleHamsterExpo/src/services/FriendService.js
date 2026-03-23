/**
 * FriendService.js
 * MuscleHamster Expo
 *
 * Service for managing friend relationships, requests, streaks, nudges, and blocking
 * Uses Firebase Firestore for persistence and real-time updates
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../config/firebase';
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

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  FRIENDS: 'friends',
  NUDGES: 'nudges',
  INVITES: 'invites',
};

// Local cache keys for offline support
const CACHE_KEYS = {
  FRIENDS: 'friends_cache',
  NUDGE_HISTORY: 'nudge_history_cache',
};

/**
 * Generate a unique invite code (MH-XXXXXX format)
 */
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, 1, I)
  let code = 'MH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate document ID for a friend relationship (sorted alphabetically)
 */
const getFriendDocId = (userId1, userId2) => {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

class FriendService {
  constructor() {
    this.unsubscribers = [];
    this.friendsCache = [];
    this.nudgeHistoryCache = {};
    this.initialized = false;
    this.currentUserId = null;
  }

  /**
   * Initialize the service for a user
   */
  async initialize(userId) {
    if (!userId) {
      this.cleanup();
      return;
    }

    if (this.initialized && this.currentUserId === userId) {
      return;
    }

    this.currentUserId = userId;
    this.initialized = true;

    // Load cached data for offline support
    await this._loadCache();
  }

  /**
   * Cleanup subscriptions when user logs out
   */
  cleanup() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.friendsCache = [];
    this.nudgeHistoryCache = {};
    this.initialized = false;
    this.currentUserId = null;
  }

  /**
   * Load cached data from AsyncStorage
   */
  async _loadCache() {
    try {
      const [friendsJson, nudgeJson] = await Promise.all([
        AsyncStorage.getItem(`${CACHE_KEYS.FRIENDS}_${this.currentUserId}`),
        AsyncStorage.getItem(`${CACHE_KEYS.NUDGE_HISTORY}_${this.currentUserId}`),
      ]);
      this.friendsCache = friendsJson ? JSON.parse(friendsJson) : [];
      this.nudgeHistoryCache = nudgeJson ? JSON.parse(nudgeJson) : {};
    } catch (error) {
      Logger.error('Error loading friends cache:', error);
    }
  }

  /**
   * Save data to cache
   */
  async _saveCache() {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          `${CACHE_KEYS.FRIENDS}_${this.currentUserId}`,
          JSON.stringify(this.friendsCache)
        ),
        AsyncStorage.setItem(
          `${CACHE_KEYS.NUDGE_HISTORY}_${this.currentUserId}`,
          JSON.stringify(this.nudgeHistoryCache)
        ),
      ]);
    } catch (error) {
      Logger.error('Error saving friends cache:', error);
    }
  }

  // ============================================
  // INVITE CODE SYSTEM
  // ============================================

  /**
   * Create an invite code for a user
   */
  async createInviteCode(userId, hamsterName) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const inviteCode = generateInviteCode();

    // Store in invites collection
    const inviteRef = doc(db, COLLECTIONS.INVITES, inviteCode);
    await setDoc(inviteRef, {
      ownerId: userId,
      ownerHamsterName: hamsterName || 'A hamster friend',
      createdAt: serverTimestamp(),
      usedBy: [],
      active: true,
    });

    // Update user document with invite code
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      inviteCode: inviteCode,
    });

    return inviteCode;
  }

  /**
   * Get a user's invite code (create if doesn't exist)
   */
  async getOrCreateInviteCode(userId, hamsterName) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    // First check if user already has an invite code
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().inviteCode) {
      return userDoc.data().inviteCode;
    }

    // Create new invite code
    return this.createInviteCode(userId, hamsterName);
  }

  /**
   * Look up an invite code and get the owner's info
   */
  async lookupInviteCode(code) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const normalizedCode = code.toUpperCase().trim();
    const inviteRef = doc(db, COLLECTIONS.INVITES, normalizedCode);
    const inviteDoc = await getDoc(inviteRef);

    if (!inviteDoc.exists() || !inviteDoc.data().active) {
      return null;
    }

    const inviteData = inviteDoc.data();

    // Get owner's profile
    const ownerRef = doc(db, COLLECTIONS.USERS, inviteData.ownerId);
    const ownerDoc = await getDoc(ownerRef);

    if (!ownerDoc.exists()) {
      return null;
    }

    const ownerData = ownerDoc.data();
    return {
      inviteCode: normalizedCode,
      ownerId: inviteData.ownerId,
      ownerHamsterName: ownerData.hamsterName || inviteData.ownerHamsterName,
      ownerProfile: createFriendProfile({
        id: inviteData.ownerId,
        email: ownerData.email || '',
        hamsterName: ownerData.hamsterName,
        currentStreak: ownerData.currentStreak || 0,
        longestStreak: ownerData.longestStreak || 0,
        hamsterState: ownerData.hamsterState || HamsterState.HAPPY,
        growthStage: ownerData.growthStage || GrowthStage.BABY,
        isRestingToday: ownerData.isRestingToday || false,
      }),
    };
  }

  /**
   * Use an invite code to send a friend request
   */
  async useInviteCode(code, currentUserId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const inviteInfo = await this.lookupInviteCode(code);
    if (!inviteInfo) {
      throw new Error('Invalid invite code');
    }

    if (inviteInfo.ownerId === currentUserId) {
      throw new Error("You can't add yourself as a friend!");
    }

    // Check if already friends or has pending request
    const friendDocId = getFriendDocId(currentUserId, inviteInfo.ownerId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);

    try {
      const friendDoc = await getDoc(friendRef);

      if (friendDoc.exists()) {
        const data = friendDoc.data();
        if (data.status === FriendRelationshipStatus.ACCEPTED) {
          throw new Error('You are already friends!');
        }
        if (data.status === FriendRelationshipStatus.PENDING) {
          throw new Error('Friend request already pending');
        }
        if (data.status === FriendRelationshipStatus.BLOCKED) {
          throw new Error('Cannot send request to this user');
        }
      }

      // Record that this code was used (non-blocking - analytics only)
      // Note: With hardened Firestore rules, only the invite owner can update
      // This may fail silently, which is fine - tracking is optional
      try {
        const inviteRef = doc(db, COLLECTIONS.INVITES, code.toUpperCase().trim());
        await updateDoc(inviteRef, {
          usedBy: arrayUnion(currentUserId),
        });
      } catch (trackingError) {
        // Tracking failed - not critical, continue with friend request
        Logger.debug('Invite tracking update failed (expected with hardened rules):', trackingError.code);
      }

      // Send friend request
      return this.sendFriendRequest(currentUserId, inviteInfo.ownerId);
    } catch (error) {
      // Handle Firebase permission errors with a friendly message
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        Logger.error('Friend request permission error:', error);
        throw new Error('Unable to send friend request. Please try signing out and back in.');
      }
      throw error;
    }
  }

  // ============================================
  // FRIENDS LIST
  // ============================================

  /**
   * Get all friends for a user
   */
  async getFriends(userId) {
    await this.initialize(userId);

    if (!isFirebaseInitialized() || !db) {
      return this.friendsCache;
    }

    try {
      // Query friends collection where user is in the users array
      const friendsQuery = query(
        collection(db, COLLECTIONS.FRIENDS),
        where('users', 'array-contains', userId),
        where('status', '==', FriendRelationshipStatus.ACCEPTED)
      );

      const snapshot = await getDocs(friendsQuery);
      const friends = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const friendId = data.users.find(id => id !== userId);

        // Get friend's profile
        const friendProfile = await this._getFriendProfile(friendId);
        if (friendProfile) {
          friends.push(createFriendProfile({
            ...friendProfile,
            friendStreak: data.friendStreak ? createFriendStreak({
              id: docSnap.id,
              userId1: userId,
              userId2: friendId,
              currentStreak: data.friendStreak.currentStreak || 0,
              longestStreak: data.friendStreak.longestStreak || 0,
              lastCheckInUser1: data.friendStreak.lastCheckInUser1?.toDate?.() || null,
              lastCheckInUser2: data.friendStreak.lastCheckInUser2?.toDate?.() || null,
              status: data.friendStreak.status || FriendStreakStatus.NONE,
            }) : null,
          }));
        }
      }

      // Update cache
      this.friendsCache = friends;
      this._saveCache();

      return friends;
    } catch (error) {
      Logger.error('Error fetching friends:', error);
      return this.friendsCache;
    }
  }

  /**
   * Get friend profile by ID
   */
  async _getFriendProfile(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        id: userId,
        email: data.email || '',
        hamsterName: data.hamsterName,
        displayName: data.hamsterName || data.displayName || 'Friend',
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        totalWorkoutsCompleted: data.totalWorkoutsCompleted || 0,
        hamsterState: data.hamsterState || HamsterState.HAPPY,
        growthStage: data.growthStage || GrowthStage.BABY,
        isRestingToday: data.isRestingToday || false,
      };
    } catch (error) {
      Logger.error('Error fetching friend profile:', error);
      return null;
    }
  }

  /**
   * Get friends with their streak data
   */
  async getFriendsWithStreaks(userId) {
    const friends = await this.getFriends(userId);
    return friends.map(friend => ({
      friend,
      streak: friend.friendStreak,
    }));
  }

  // ============================================
  // FRIEND REQUESTS
  // ============================================

  /**
   * Get pending friend requests for user
   */
  async getPendingRequests(userId) {
    await this.initialize(userId);

    if (!isFirebaseInitialized() || !db) {
      return [];
    }

    try {
      // Query friends collection for pending requests where user is the receiver
      const requestsQuery = query(
        collection(db, COLLECTIONS.FRIENDS),
        where('users', 'array-contains', userId),
        where('status', '==', FriendRelationshipStatus.PENDING),
        where('initiatedBy', '!=', userId)
      );

      const snapshot = await getDocs(requestsQuery);
      const requests = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Double check this wasn't initiated by user (Firestore limitation)
        if (data.initiatedBy === userId) continue;

        const senderId = data.initiatedBy;
        const senderProfile = await this._getFriendProfile(senderId);

        requests.push({
          request: createFriendRequest({
            id: docSnap.id,
            senderId: senderId,
            receiverId: userId,
            status: FriendRequestStatus.PENDING,
            sentAt: data.createdAt?.toDate?.() || new Date(),
          }),
          senderProfile: senderProfile ? createFriendProfile(senderProfile) : null,
        });
      }

      return requests;
    } catch (error) {
      Logger.error('Error fetching pending requests:', error);
      return [];
    }
  }

  /**
   * Get sent friend requests
   */
  async getSentRequests(userId) {
    await this.initialize(userId);

    if (!isFirebaseInitialized() || !db) {
      return [];
    }

    try {
      // Must include array-contains for users to satisfy Firestore security rules
      const requestsQuery = query(
        collection(db, COLLECTIONS.FRIENDS),
        where('users', 'array-contains', userId),
        where('initiatedBy', '==', userId),
        where('status', '==', FriendRelationshipStatus.PENDING)
      );

      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const receiverId = data.users.find(id => id !== userId);
        return createFriendRequest({
          id: docSnap.id,
          senderId: userId,
          receiverId: receiverId,
          status: FriendRequestStatus.PENDING,
          sentAt: data.createdAt?.toDate?.() || new Date(),
        });
      });
    } catch (error) {
      Logger.error('Error fetching sent requests:', error);
      return [];
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId, receiverId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendDocId = getFriendDocId(senderId, receiverId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);

    try {
      // Check for existing relationship
      const existingDoc = await getDoc(friendRef);
      if (existingDoc.exists()) {
        const data = existingDoc.data();
        if (data.status === FriendRelationshipStatus.ACCEPTED) {
          throw new Error('Already friends');
        }
        if (data.status === FriendRelationshipStatus.PENDING) {
          throw new Error('Request already pending');
        }
        if (data.status === FriendRelationshipStatus.BLOCKED) {
          throw new Error('Cannot send request to this user');
        }
      }

      // Create friend request
      await setDoc(friendRef, {
        users: [senderId, receiverId].sort(),
        status: FriendRelationshipStatus.PENDING,
        initiatedBy: senderId,
        createdAt: serverTimestamp(),
        acceptedAt: null,
        friendStreak: {
          currentStreak: 0,
          longestStreak: 0,
          lastBothActiveDate: null,
        },
      });

      return createFriendRequest({
        id: friendDocId,
        senderId,
        receiverId,
        status: FriendRequestStatus.PENDING,
        sentAt: new Date(),
      });
    } catch (error) {
      // Handle Firebase permission errors with a friendly message
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        Logger.error('Send friend request permission error:', error);
        throw new Error('Unable to send friend request. Please try signing out and back in.');
      }
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId, userId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendRef = doc(db, COLLECTIONS.FRIENDS, requestId);
    const friendDoc = await getDoc(friendRef);

    if (!friendDoc.exists()) {
      throw new Error('Request not found');
    }

    const data = friendDoc.data();

    // Verify user is the receiver (not the initiator)
    if (data.initiatedBy === userId) {
      throw new Error('Cannot accept your own request');
    }
    if (!data.users.includes(userId)) {
      throw new Error('Not authorized to accept this request');
    }

    // Update to accepted
    await updateDoc(friendRef, {
      status: FriendRelationshipStatus.ACCEPTED,
      acceptedAt: serverTimestamp(),
    });

    // Update friend counts for both users
    const batch = writeBatch(db);
    data.users.forEach(uid => {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      batch.update(userRef, {
        friendCount: increment(1),
      });
    });
    await batch.commit();

    return createFriendRelationship({
      id: requestId,
      userId1: data.users[0],
      userId2: data.users[1],
      status: FriendRelationshipStatus.ACCEPTED,
      acceptedAt: new Date(),
    });
  }

  /**
   * Decline a friend request
   */
  async declineFriendRequest(requestId, userId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendRef = doc(db, COLLECTIONS.FRIENDS, requestId);
    const friendDoc = await getDoc(friendRef);

    if (!friendDoc.exists()) {
      throw new Error('Request not found');
    }

    const data = friendDoc.data();
    if (data.initiatedBy === userId || !data.users.includes(userId)) {
      throw new Error('Not authorized to decline this request');
    }

    // Delete the request
    await deleteDoc(friendRef);
  }

  // ============================================
  // REMOVE & BLOCK
  // ============================================

  /**
   * Remove a friend
   */
  async removeFriend(userId, friendId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendDocId = getFriendDocId(userId, friendId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);

    await deleteDoc(friendRef);

    // Decrement friend counts
    const batch = writeBatch(db);
    [userId, friendId].forEach(uid => {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      batch.update(userRef, {
        friendCount: increment(-1),
      });
    });
    await batch.commit();
  }

  /**
   * Block a user
   */
  async blockUser(blockerId, blockedId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendDocId = getFriendDocId(blockerId, blockedId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);

    // Check for existing relationship
    const existingDoc = await getDoc(friendRef);
    const wasFriends = existingDoc.exists() &&
      existingDoc.data().status === FriendRelationshipStatus.ACCEPTED;

    // Set status to blocked
    await setDoc(friendRef, {
      users: [blockerId, blockedId].sort(),
      status: FriendRelationshipStatus.BLOCKED,
      blockedBy: blockerId,
      blockedAt: serverTimestamp(),
    }, { merge: false });

    // If they were friends, decrement counts
    if (wasFriends) {
      const batch = writeBatch(db);
      [blockerId, blockedId].forEach(uid => {
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        batch.update(userRef, {
          friendCount: increment(-1),
        });
      });
      await batch.commit();
    }

    return createBlockedUser({
      id: friendDocId,
      blockerId,
      blockedId,
      blockedAt: new Date(),
    });
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId, blockedId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendDocId = getFriendDocId(blockerId, blockedId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);

    await deleteDoc(friendRef);
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(userId) {
    if (!isFirebaseInitialized() || !db) {
      return [];
    }

    try {
      // Must include array-contains for users to satisfy Firestore security rules
      const blockedQuery = query(
        collection(db, COLLECTIONS.FRIENDS),
        where('users', 'array-contains', userId),
        where('blockedBy', '==', userId),
        where('status', '==', FriendRelationshipStatus.BLOCKED)
      );

      const snapshot = await getDocs(blockedQuery);
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const blockedId = data.users.find(id => id !== userId);
        return createBlockedUser({
          id: docSnap.id,
          blockerId: userId,
          blockedId,
          blockedAt: data.blockedAt?.toDate?.() || new Date(),
        });
      });
    } catch (error) {
      Logger.error('Error fetching blocked users:', error);
      return [];
    }
  }

  /**
   * Get blocked users with profiles
   */
  async getBlockedUsersWithProfiles(userId) {
    const blocked = await this.getBlockedUsers(userId);
    const result = [];

    for (const block of blocked) {
      const profile = await this._getFriendProfile(block.blockedId);
      result.push({
        blockedUser: block,
        profile: profile ? createFriendProfile(profile) : null,
      });
    }

    return result;
  }

  // ============================================
  // STREAKS
  // ============================================

  /**
   * Get streak with a friend
   */
  async getStreak(userId, friendId) {
    if (!isFirebaseInitialized() || !db) {
      return null;
    }

    const friendDocId = getFriendDocId(userId, friendId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);
    const friendDoc = await getDoc(friendRef);

    if (!friendDoc.exists()) {
      return null;
    }

    const data = friendDoc.data();
    if (!data.friendStreak) {
      return null;
    }

    return createFriendStreak({
      id: friendDocId,
      userId1: userId,
      userId2: friendId,
      currentStreak: data.friendStreak.currentStreak || 0,
      longestStreak: data.friendStreak.longestStreak || 0,
      status: data.friendStreak.status || FriendStreakStatus.NONE,
    });
  }

  /**
   * Record a check-in (updates all friend streaks)
   */
  async recordCheckIn(userId) {
    if (!isFirebaseInitialized() || !db) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all accepted friends
    const friendsQuery = query(
      collection(db, COLLECTIONS.FRIENDS),
      where('users', 'array-contains', userId),
      where('status', '==', FriendRelationshipStatus.ACCEPTED)
    );

    const snapshot = await getDocs(friendsQuery);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const friendId = data.users.find(id => id !== userId);
      const friendRef = doc(db, COLLECTIONS.FRIENDS, docSnap.id);

      // Get current friend streak data
      const streakData = data.friendStreak || {
        currentStreak: 0,
        longestStreak: 0,
        lastBothActiveDate: null,
      };

      // Determine which user position this user is
      const isUser1 = data.users[0] === userId;
      const lastCheckInField = isUser1 ? 'lastCheckInUser1' : 'lastCheckInUser2';
      const otherCheckInField = isUser1 ? 'lastCheckInUser2' : 'lastCheckInUser1';

      // Check if friend also checked in today
      const friendLastCheckIn = streakData[otherCheckInField]?.toDate?.();
      const friendCheckedInToday = friendLastCheckIn && isToday(friendLastCheckIn);

      let newStreak = streakData.currentStreak;
      let newStatus = FriendStreakStatus.WAITING;

      if (friendCheckedInToday) {
        // Both checked in today - increment streak
        newStreak = streakData.currentStreak + 1;
        newStatus = FriendStreakStatus.ACTIVE;
      }

      // Update the friend document
      await updateDoc(friendRef, {
        [`friendStreak.${lastCheckInField}`]: serverTimestamp(),
        'friendStreak.currentStreak': newStreak,
        'friendStreak.longestStreak': Math.max(streakData.longestStreak, newStreak),
        'friendStreak.status': newStatus,
        'friendStreak.lastBothActiveDate': friendCheckedInToday ? serverTimestamp() : streakData.lastBothActiveDate,
      });
    }
  }

  /**
   * Restore a broken streak
   */
  async restoreStreak(userId, friendId, option) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const friendDocId = getFriendDocId(userId, friendId);
    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);
    const friendDoc = await getDoc(friendRef);

    if (!friendDoc.exists()) {
      throw new Error('Friendship not found');
    }

    const data = friendDoc.data();
    const streakData = data.friendStreak || {};
    const previousStreak = streakData.previousBrokenStreak || 0;
    const cost = option === 'forBoth' ? 300 : 150;

    await updateDoc(friendRef, {
      'friendStreak.currentStreak': previousStreak,
      'friendStreak.status': option === 'forBoth' ? FriendStreakStatus.ACTIVE : FriendStreakStatus.WAITING,
      'friendStreak.previousBrokenStreak': 0,
    });

    return {
      success: true,
      restoredStreak: previousStreak,
      option,
      pointsSpent: cost,
      message: 'Streak restored!',
      friendNeedsToRestore: option === 'selfOnly',
    };
  }

  // ============================================
  // NUDGES
  // ============================================

  /**
   * Check if user can send a nudge
   */
  async getNudgeEligibility(senderId, recipientId, senderCheckedInToday) {
    // Check if friends
    const friendDocId = getFriendDocId(senderId, recipientId);

    if (!isFirebaseInitialized() || !db) {
      return { eligibility: NudgeEligibility.NOT_FRIENDS };
    }

    const friendRef = doc(db, COLLECTIONS.FRIENDS, friendDocId);
    const friendDoc = await getDoc(friendRef);

    if (!friendDoc.exists() || friendDoc.data().status !== FriendRelationshipStatus.ACCEPTED) {
      return { eligibility: NudgeEligibility.NOT_FRIENDS };
    }

    if (friendDoc.data().status === FriendRelationshipStatus.BLOCKED) {
      return { eligibility: NudgeEligibility.BLOCKED };
    }

    if (!senderCheckedInToday) {
      return { eligibility: NudgeEligibility.SENDER_NOT_CHECKED_IN };
    }

    // Check nudge history from cache
    const history = this.nudgeHistoryCache[senderId] || { sentNudges: [], receivedNudges: [] };
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

  /**
   * Send a nudge to a friend
   */
  async sendNudge(senderId, recipientId) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const nudge = {
      fromUserId: senderId,
      toUserId: recipientId,
      sentAt: serverTimestamp(),
      message: NudgeMessages.forRecipient[NudgeMessages.randomIndex()],
      read: false,
    };

    // Add to nudges collection
    const nudgeRef = doc(collection(db, COLLECTIONS.NUDGES));
    await setDoc(nudgeRef, nudge);

    // Update local cache
    const now = new Date().toISOString();
    if (!this.nudgeHistoryCache[senderId]) {
      this.nudgeHistoryCache[senderId] = { sentNudges: [], receivedNudges: [] };
    }
    this.nudgeHistoryCache[senderId].sentNudges.push({
      id: nudgeRef.id,
      senderId,
      recipientId,
      sentAt: now,
      messageIndex: NudgeMessages.randomIndex(),
    });
    this._saveCache();

    return createFriendNudge({
      id: nudgeRef.id,
      senderId,
      recipientId,
      sentAt: new Date(),
    });
  }

  /**
   * Get received nudges
   */
  async getReceivedNudges(userId) {
    if (!isFirebaseInitialized() || !db) {
      return [];
    }

    try {
      const nudgesQuery = query(
        collection(db, COLLECTIONS.NUDGES),
        where('toUserId', '==', userId),
        where('read', '==', false),
        orderBy('sentAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(nudgesQuery);
      const nudges = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const senderProfile = await this._getFriendProfile(data.fromUserId);

        nudges.push({
          nudge: createFriendNudge({
            id: docSnap.id,
            senderId: data.fromUserId,
            recipientId: userId,
            sentAt: data.sentAt?.toDate?.() || new Date(),
          }),
          senderName: senderProfile?.hamsterName || 'A friend',
        });
      }

      return nudges;
    } catch (error) {
      Logger.error('Error fetching nudges:', error);
      return [];
    }
  }

  /**
   * Mark nudge as read
   */
  async markNudgeRead(nudgeId) {
    if (!isFirebaseInitialized() || !db) {
      return;
    }

    const nudgeRef = doc(db, COLLECTIONS.NUDGES, nudgeId);
    await updateDoc(nudgeRef, {
      read: true,
    });
  }

  // ============================================
  // PRIVACY SETTINGS
  // ============================================

  async getPrivacySettings(userId) {
    if (!isFirebaseInitialized() || !db) {
      return createPrivacySettings();
    }

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || !userDoc.data().privacySettings) {
      return createPrivacySettings();
    }

    return createPrivacySettings(userDoc.data().privacySettings);
  }

  async updatePrivacySettings(userId, settings) {
    if (!isFirebaseInitialized() || !db) {
      throw new Error('Firebase not initialized');
    }

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      privacySettings: settings,
    });

    return createPrivacySettings(settings);
  }

  // ============================================
  // SEARCH (Legacy - now using invite codes)
  // ============================================

  /**
   * Search users - kept for backwards compatibility but not primary flow
   */
  async searchUsers(query, currentUserId) {
    // With invite code system, search is not the primary way to add friends
    // This returns empty - users should use invite codes
    return [];
  }

  // ============================================
  // LEADERBOARD
  // ============================================

  async getFriendsLeaderboard(userId) {
    const friends = await this.getFriends(userId);
    const sorted = [...friends].sort((a, b) => b.currentStreak - a.currentStreak);

    return sorted.map((friend, index) => ({
      rank: index + 1,
      friend,
      isCurrentUser: friend.id === userId,
    }));
  }

  // ============================================
  // REAL-TIME LISTENERS
  // ============================================

  /**
   * Subscribe to friend requests updates
   */
  subscribeToRequests(userId, callback) {
    if (!isFirebaseInitialized() || !db) {
      return () => {};
    }

    const requestsQuery = query(
      collection(db, COLLECTIONS.FRIENDS),
      where('users', 'array-contains', userId),
      where('status', '==', FriendRelationshipStatus.PENDING)
    );

    const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
      const requests = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Only show requests where user is the receiver
        if (data.initiatedBy !== userId) {
          const senderProfile = await this._getFriendProfile(data.initiatedBy);
          requests.push({
            request: createFriendRequest({
              id: docSnap.id,
              senderId: data.initiatedBy,
              receiverId: userId,
              status: FriendRequestStatus.PENDING,
              sentAt: data.createdAt?.toDate?.() || new Date(),
            }),
            senderProfile: senderProfile ? createFriendProfile(senderProfile) : null,
          });
        }
      }
      callback(requests);
    }, (error) => {
      Logger.error('Error in requests subscription:', error);
    });

    this.unsubscribers.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to nudges
   */
  subscribeToNudges(userId, callback) {
    if (!isFirebaseInitialized() || !db) {
      return () => {};
    }

    const nudgesQuery = query(
      collection(db, COLLECTIONS.NUDGES),
      where('toUserId', '==', userId),
      where('read', '==', false),
      orderBy('sentAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(nudgesQuery, async (snapshot) => {
      const nudges = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const senderProfile = await this._getFriendProfile(data.fromUserId);
        nudges.push({
          nudge: createFriendNudge({
            id: docSnap.id,
            senderId: data.fromUserId,
            recipientId: userId,
            sentAt: data.sentAt?.toDate?.() || new Date(),
          }),
          senderName: senderProfile?.hamsterName || 'A friend',
        });
      }
      callback(nudges);
    }, (error) => {
      Logger.error('Error in nudges subscription:', error);
    });

    this.unsubscribers.push(unsubscribe);
    return unsubscribe;
  }
}

// Singleton instance
export const friendService = new FriendService();
export default friendService;
