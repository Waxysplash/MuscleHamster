/**
 * SocialScreen.js
 * MuscleHamster Expo
 *
 * Main social tab - Friends list, streaks, and social features
 * Ported from Phase 09: Social Features (Swift version)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFriends } from '../../context/FriendContext';
import { getHamsterStateColor, getStreakStatusColor, FriendStreakStatus } from '../../models/Friend';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';

export default function SocialScreen() {
  const navigation = useNavigation();
  const {
    friends,
    pendingRequestCount,
    isLoading,
    error,
    loadFriendData,
  } = useFriends();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFriendData();
    }, [loadFriendData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriendData();
    setRefreshing(false);
  };

  // Separate friends by streak status
  const friendsWithStreaks = friends.filter(f => f.streak?.currentStreak > 0);
  const friendsWithoutStreaks = friends.filter(f => !f.streak?.currentStreak);

  if (isLoading && friends.length === 0) {
    return <LoadingView message="Loading friends..." />;
  }

  if (error && friends.length === 0) {
    return (
      <ErrorView
        message="Couldn't load your friends. Let's try again!"
        onRetry={loadFriendData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFriends')}
          accessibilityLabel="Add friends"
          accessibilityHint={pendingRequestCount > 0
            ? `You have ${pendingRequestCount} pending friend requests`
            : 'Search for and add new friends'}
        >
          <Ionicons name="person-add" size={24} color="#007AFF" />
          {pendingRequestCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequestCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <EmptyState
          onAddFriends={() => navigation.navigate('AddFriends')}
          pendingRequestCount={pendingRequestCount}
          onViewRequests={() => navigation.navigate('PendingRequests')}
        />
      ) : (
        <FlatList
          data={[
            // Pending requests section
            ...(pendingRequestCount > 0 ? [{ type: 'pendingRequests' }] : []),
            // Active streaks section
            ...(friendsWithStreaks.length > 0 ? [
              { type: 'sectionHeader', title: 'Active Streaks', icon: 'flame' },
              ...friendsWithStreaks.map(f => ({ type: 'friend', data: f })),
            ] : []),
            // All friends section
            ...(friendsWithoutStreaks.length > 0 ? [
              { type: 'sectionHeader', title: `Friends (${friends.length})` },
              ...friendsWithoutStreaks.map(f => ({ type: 'friend', data: f })),
            ] : []),
          ]}
          keyExtractor={(item, index) => item.type === 'friend' ? item.data.friend.id : `${item.type}-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'pendingRequests') {
              return (
                <PendingRequestsRow
                  count={pendingRequestCount}
                  onPress={() => navigation.navigate('PendingRequests')}
                />
              );
            }
            if (item.type === 'sectionHeader') {
              return <SectionHeader title={item.title} icon={item.icon} />;
            }
            if (item.type === 'friend') {
              return (
                <FriendRow
                  friend={item.data.friend}
                  streak={item.data.streak}
                  onPress={() => navigation.navigate('FriendProfile', {
                    profile: item.data.friend,
                    streak: item.data.streak,
                  })}
                />
              );
            }
            return null;
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

// Empty State Component
function EmptyState({ onAddFriends, pendingRequestCount, onViewRequests }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people" size={50} color="#007AFF" />
      </View>

      <Text style={styles.emptyTitle}>No friends yet!</Text>
      <Text style={styles.emptyMessage}>
        Add friends to share your progress, build streaks together, and cheer each other on!
      </Text>

      <TouchableOpacity style={styles.ctaButton} onPress={onAddFriends}>
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.ctaButtonText}>Find Friends</Text>
      </TouchableOpacity>

      {pendingRequestCount > 0 && (
        <TouchableOpacity style={styles.pendingLink} onPress={onViewRequests}>
          <Ionicons name="mail" size={16} color="#007AFF" />
          <Text style={styles.pendingLinkText}>
            {pendingRequestCount} pending request{pendingRequestCount === 1 ? '' : 's'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Pending Requests Row
function PendingRequestsRow({ count, onPress }) {
  return (
    <TouchableOpacity style={styles.pendingRow} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
        <Ionicons name="mail" size={22} color="#FF9500" />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>Friend Requests</Text>
        <Text style={styles.friendSubtitle}>{count} pending</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

// Section Header
function SectionHeader({ title, icon }) {
  return (
    <View style={styles.sectionHeader}>
      {icon && <Ionicons name={icon} size={14} color="#FF9500" style={styles.sectionIcon} />}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// Friend Row Component
function FriendRow({ friend, streak, onPress }) {
  const stateColor = getHamsterStateColor(friend.hamsterState);

  return (
    <TouchableOpacity style={styles.friendRow} onPress={onPress}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: `${stateColor}33` }]}>
        <Ionicons name="paw" size={22} color={stateColor} />
      </View>

      {/* Info */}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.displayName}</Text>
        <View style={styles.friendBadges}>
          {/* Personal streak */}
          {friend.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={10} color="#FF9500" />
              <Text style={[styles.badgeText2, { color: '#FF9500' }]}>{friend.currentStreak}</Text>
            </View>
          )}

          {/* Friend streak with at-risk indicator */}
          {streak && streak.currentStreak > 0 && (
            <View style={[
              styles.friendStreakBadge,
              { backgroundColor: streak.status === FriendStreakStatus.AT_RISK ? 'rgba(255, 149, 0, 0.15)' : 'rgba(175, 82, 222, 0.1)' }
            ]}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="people" size={10} color={streak.status === FriendStreakStatus.AT_RISK ? '#FF9500' : '#AF52DE'} />
                {streak.status === FriendStreakStatus.AT_RISK && (
                  <Ionicons name="warning" size={6} color="#FFCC00" style={styles.warningIcon} />
                )}
              </View>
              <Text style={[styles.badgeText2, { color: streak.status === FriendStreakStatus.AT_RISK ? '#FF9500' : '#AF52DE' }]}>
                {streak.currentStreak}
              </Text>
            </View>
          )}

          {/* Hamster state */}
          <Text style={styles.stateText}>{friend.hamsterState}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  friendBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  friendStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  streakIconContainer: {
    position: 'relative',
  },
  warningIcon: {
    position: 'absolute',
    top: -3,
    right: -4,
  },
  badgeText2: {
    fontSize: 11,
    fontWeight: '600',
  },
  stateText: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  pendingLinkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
