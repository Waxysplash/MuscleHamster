/**
 * FriendContext.js
 * MuscleHamster Expo
 *
 * React Context for managing friend state across the app
 * Uses Firebase for real-time updates and invite code system
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import friendService from '../services/FriendService';
import { useAuth } from './AuthContext';
import Logger from '../services/LoggerService';

const FriendContext = createContext(null);

export const FriendProvider = ({ children }) => {
  const { currentUser } = useAuth();
  // Memoize currentUserId to prevent unnecessary re-renders
  const currentUserId = useMemo(() => currentUser?.id || null, [currentUser?.id]);

  // State
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [receivedNudges, setReceivedNudges] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track subscriptions
  const subscriptionsRef = useRef({ requests: null, nudges: null });

  // Initialize and load data
  const loadFriendData = useCallback(async () => {
    if (!currentUserId) {
      // Reset state when logged out
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setBlockedUsers([]);
      setReceivedNudges([]);
      setInviteCode(null);
      setIsLoading(false);
      friendService.cleanup();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize service for this user
      await friendService.initialize(currentUserId);

      // Load each independently so one failure doesn't block others
      const results = await Promise.allSettled([
        friendService.getFriendsWithStreaks(currentUserId),
        friendService.getPendingRequests(currentUserId),
        friendService.getSentRequests(currentUserId),
        friendService.getBlockedUsersWithProfiles(currentUserId),
        friendService.getReceivedNudges(currentUserId),
      ]);

      // Extract successful results, use empty arrays for failures
      const [friendsResult, pendingResult, sentResult, blockedResult, nudgesResult] = results;

      setFriends(friendsResult.status === 'fulfilled' ? friendsResult.value : []);
      setPendingRequests(pendingResult.status === 'fulfilled' ? pendingResult.value : []);
      setSentRequests(sentResult.status === 'fulfilled' ? sentResult.value : []);
      setBlockedUsers(blockedResult.status === 'fulfilled' ? blockedResult.value : []);
      setReceivedNudges(nudgesResult.status === 'fulfilled' ? nudgesResult.value : []);

      // Log any failures but don't block the UI
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['friends', 'pending', 'sent', 'blocked', 'nudges'];
          Logger.warn(`Failed to load ${names[index]}:`, result.reason?.message);
        }
      });
    } catch (err) {
      Logger.error('Error loading friend data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    // Subscribe to pending requests
    subscriptionsRef.current.requests = friendService.subscribeToRequests(
      currentUserId,
      (requests) => {
        setPendingRequests(requests);
      }
    );

    // Subscribe to nudges
    subscriptionsRef.current.nudges = friendService.subscribeToNudges(
      currentUserId,
      (nudges) => {
        setReceivedNudges(nudges);
      }
    );

    // Cleanup on unmount or user change
    return () => {
      if (subscriptionsRef.current.requests) {
        subscriptionsRef.current.requests();
      }
      if (subscriptionsRef.current.nudges) {
        subscriptionsRef.current.nudges();
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    loadFriendData();
  }, [loadFriendData]);

  // ============================================
  // INVITE CODE ACTIONS
  // ============================================

  /**
   * Get or create user's invite code
   */
  const getInviteCode = useCallback(async (hamsterName) => {
    if (!currentUserId) return null;
    try {
      const code = await friendService.getOrCreateInviteCode(currentUserId, hamsterName);
      setInviteCode(code);
      return code;
    } catch (err) {
      Logger.error('Error getting invite code:', err);
      return null;
    }
  }, [currentUserId]);

  /**
   * Look up an invite code
   */
  const lookupInviteCode = useCallback(async (code) => {
    try {
      return await friendService.lookupInviteCode(code);
    } catch (err) {
      Logger.error('Error looking up invite code:', err);
      return null;
    }
  }, []);

  /**
   * Use an invite code to add a friend
   */
  const useInviteCode = useCallback(async (code) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      const request = await friendService.useInviteCode(code, currentUserId);
      setSentRequests(prev => [...prev, request]);
      return { success: true, request };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [currentUserId]);

  // ============================================
  // FRIEND REQUEST ACTIONS
  // ============================================

  const sendFriendRequest = async (receiverId) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      const request = await friendService.sendFriendRequest(currentUserId, receiverId);
      setSentRequests(prev => [...prev, request]);
      return { success: true, request };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const acceptFriendRequest = async (requestId) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      const relationship = await friendService.acceptFriendRequest(requestId, currentUserId);
      await loadFriendData(); // Reload to get updated friends and streaks
      return { success: true, relationship };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const declineFriendRequest = async (requestId) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      await friendService.declineFriendRequest(requestId, currentUserId);
      setPendingRequests(prev => prev.filter(r => r.request.id !== requestId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeFriend = async (friendId) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      await friendService.removeFriend(currentUserId, friendId);
      setFriends(prev => prev.filter(f => f.friend.id !== friendId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const blockUser = async (userId) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      const block = await friendService.blockUser(currentUserId, userId);
      await loadFriendData(); // Reload to update all lists
      return { success: true, block };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const unblockUser = async (userId) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      await friendService.unblockUser(currentUserId, userId);
      setBlockedUsers(prev => prev.filter(b => b.blockedUser.blockedId !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // NUDGE ACTIONS
  // ============================================

  const sendNudge = async (recipientId, senderCheckedInToday = true) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      // Check eligibility first
      const eligibility = await friendService.getNudgeEligibility(
        currentUserId,
        recipientId,
        senderCheckedInToday
      );

      if (eligibility.eligibility !== 'canNudge') {
        return { success: false, eligibility };
      }

      const nudge = await friendService.sendNudge(currentUserId, recipientId);
      return { success: true, nudge };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getNudgeEligibility = async (recipientId, senderCheckedInToday = true) => {
    if (!currentUserId) return { eligibility: 'notLoggedIn', reason: 'Not logged in' };
    return friendService.getNudgeEligibility(currentUserId, recipientId, senderCheckedInToday);
  };

  const dismissNudge = async (nudgeId) => {
    setReceivedNudges(prev => prev.filter(n => n.nudge.id !== nudgeId));
    // Mark as read in Firestore (optimistic UI - nudge removed immediately)
    try {
      await friendService.markNudgeRead(nudgeId);
    } catch (err) {
      Logger.warn('Failed to mark nudge as read:', err.message);
    }
  };

  // ============================================
  // OTHER ACTIONS
  // ============================================

  const searchUsers = async (query) => {
    // With invite code system, search returns empty
    // Users should use invite codes instead
    return [];
  };

  const getLeaderboard = async () => {
    if (!currentUserId) return [];
    try {
      return await friendService.getFriendsLeaderboard(currentUserId);
    } catch (err) {
      Logger.error('Error getting leaderboard:', err);
      return [];
    }
  };

  const restoreStreak = async (friendId, option) => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      const result = await friendService.restoreStreak(currentUserId, friendId, option);
      await loadFriendData(); // Reload to get updated streak
      return { success: true, result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const recordCheckIn = async () => {
    if (!currentUserId) return { success: false, error: 'Not logged in' };
    try {
      await friendService.recordCheckIn(currentUserId);
      await loadFriendData(); // Reload to get updated streaks
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Computed values (memoized)
  const pendingRequestCount = useMemo(() => pendingRequests.length, [pendingRequests]);
  const friendCount = useMemo(() => friends.length, [friends]);
  const activeStreaksCount = useMemo(() => friends.filter(f =>
    f.streak && ['active', 'waiting'].includes(f.streak.status)
  ).length, [friends]);
  const atRiskStreaksCount = useMemo(() => friends.filter(f =>
    f.streak?.status === 'atRisk'
  ).length, [friends]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    friends,
    pendingRequests,
    sentRequests,
    blockedUsers,
    receivedNudges,
    inviteCode,
    isLoading,
    error,

    // Computed
    pendingRequestCount,
    friendCount,
    activeStreaksCount,
    atRiskStreaksCount,

    // Invite Code Actions
    getInviteCode,
    lookupInviteCode,
    useInviteCode,

    // Friend Actions
    loadFriendData,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,

    // Nudge Actions
    sendNudge,
    getNudgeEligibility,
    dismissNudge,

    // Other Actions
    searchUsers,
    getLeaderboard,
    restoreStreak,
    recordCheckIn,
  }), [
    friends,
    pendingRequests,
    sentRequests,
    blockedUsers,
    receivedNudges,
    inviteCode,
    isLoading,
    error,
    pendingRequestCount,
    friendCount,
    activeStreaksCount,
    atRiskStreaksCount,
    getInviteCode,
    lookupInviteCode,
    useInviteCode,
    loadFriendData,
  ]);

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendProvider');
  }
  return context;
};

export default FriendContext;
