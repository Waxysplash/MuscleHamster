/**
 * FriendContext.js
 * MuscleHamster Expo
 *
 * React Context for managing friend state across the app
 * Ported from Phase 09: Social Features (Swift version)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import friendService from '../services/FriendService';
import { useAuth } from './AuthContext';

const FriendContext = createContext(null);

export const FriendProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'currentUser';

  // State
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [receivedNudges, setReceivedNudges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and load data
  const loadFriendData = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [
        friendsData,
        pendingData,
        sentData,
        blockedData,
        nudgesData,
      ] = await Promise.all([
        friendService.getFriendsWithStreaks(currentUserId),
        friendService.getPendingRequests(currentUserId),
        friendService.getSentRequests(currentUserId),
        friendService.getBlockedUsersWithProfiles(currentUserId),
        friendService.getReceivedNudges(currentUserId),
      ]);

      setFriends(friendsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
      setBlockedUsers(blockedData);
      setReceivedNudges(nudgesData);
    } catch (err) {
      console.error('Error loading friend data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadFriendData();
  }, [loadFriendData]);

  // Actions
  const sendFriendRequest = async (receiverId) => {
    try {
      const request = await friendService.sendFriendRequest(currentUserId, receiverId);
      setSentRequests(prev => [...prev, request]);
      return { success: true, request };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const relationship = await friendService.acceptFriendRequest(requestId, currentUserId);
      await loadFriendData(); // Reload to get updated friends and streaks
      return { success: true, relationship };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await friendService.declineFriendRequest(requestId, currentUserId);
      setPendingRequests(prev => prev.filter(r => r.request.id !== requestId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await friendService.removeFriend(currentUserId, friendId);
      setFriends(prev => prev.filter(f => f.friend.id !== friendId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const blockUser = async (userId) => {
    try {
      const block = await friendService.blockUser(currentUserId, userId);
      await loadFriendData(); // Reload to update all lists
      return { success: true, block };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const unblockUser = async (userId) => {
    try {
      await friendService.unblockUser(currentUserId, userId);
      setBlockedUsers(prev => prev.filter(b => b.blockedUser.blockedId !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const sendNudge = async (recipientId, senderCheckedInToday = true) => {
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
    return friendService.getNudgeEligibility(currentUserId, recipientId, senderCheckedInToday);
  };

  const dismissNudge = (nudgeId) => {
    setReceivedNudges(prev => prev.filter(n => n.nudge.id !== nudgeId));
  };

  const searchUsers = async (query) => {
    try {
      return await friendService.searchUsers(query, currentUserId);
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  const getLeaderboard = async () => {
    try {
      return await friendService.getFriendsLeaderboard(currentUserId);
    } catch (err) {
      console.error('Error getting leaderboard:', err);
      return [];
    }
  };

  const restoreStreak = async (friendId, option) => {
    try {
      const result = await friendService.restoreStreak(currentUserId, friendId, option);
      await loadFriendData(); // Reload to get updated streak
      return { success: true, result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const recordCheckIn = async () => {
    try {
      await friendService.recordCheckIn(currentUserId);
      await loadFriendData(); // Reload to get updated streaks
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Computed values
  const pendingRequestCount = pendingRequests.length;
  const friendCount = friends.length;
  const activeStreaksCount = friends.filter(f =>
    f.streak && ['active', 'waiting'].includes(f.streak.status)
  ).length;
  const atRiskStreaksCount = friends.filter(f =>
    f.streak?.status === 'atRisk'
  ).length;

  const value = {
    // State
    friends,
    pendingRequests,
    sentRequests,
    blockedUsers,
    receivedNudges,
    isLoading,
    error,

    // Computed
    pendingRequestCount,
    friendCount,
    activeStreaksCount,
    atRiskStreaksCount,

    // Actions
    loadFriendData,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sendNudge,
    getNudgeEligibility,
    dismissNudge,
    searchUsers,
    getLeaderboard,
    restoreStreak,
    recordCheckIn,
  };

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
