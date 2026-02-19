/**
 * BlockedUsersScreen.js
 * MuscleHamster Expo
 *
 * Screen for managing blocked users
 * Ported from Phase 09: Social Features (Swift version)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFriends } from '../../context/FriendContext';
import { getHamsterStateColor, getRelativeTimeString } from '../../models/Friend';
import LoadingView from '../../components/LoadingView';

export default function BlockedUsersScreen() {
  const navigation = useNavigation();
  const { blockedUsers, unblockUser, loadFriendData, isLoading } = useFriends();

  const [unblockingId, setUnblockingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriendData();
    setRefreshing(false);
  };

  const handleUnblock = (blockedUser, profile) => {
    const name = profile?.displayName || 'this user';
    Alert.alert(
      `Unblock ${name}?`,
      "They'll be able to find you and send friend requests again.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblockingId(blockedUser.blockedId);
            const result = await unblockUser(blockedUser.blockedId);
            setUnblockingId(null);
            if (!result.success) {
              Alert.alert('Oops', result.error || 'Could not unblock user');
            }
          },
        },
      ]
    );
  };

  if (isLoading && blockedUsers.length === 0) {
    return <LoadingView message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={styles.placeholder} />
      </View>

      {blockedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="checkmark-shield" size={64} color="#34C759" />
          </View>
          <Text style={styles.emptyTitle}>No Blocked Users</Text>
          <Text style={styles.emptyMessage}>
            You haven't blocked anyone. That's good news!
          </Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.blockedUser.id}
          ListHeaderComponent={() => (
            <Text style={styles.listHeader}>
              Blocked users can't see your profile, send requests, or appear in your searches.
            </Text>
          )}
          renderItem={({ item }) => (
            <BlockedUserRow
              blockedUser={item.blockedUser}
              profile={item.profile}
              isUnblocking={unblockingId === item.blockedUser.blockedId}
              onUnblock={() => handleUnblock(item.blockedUser, item.profile)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

function BlockedUserRow({ blockedUser, profile, isUnblocking, onUnblock }) {
  const stateColor = profile ? getHamsterStateColor(profile.hamsterState) : '#8E8E93';

  const blockedDate = new Date(blockedUser.blockedAt);
  const now = new Date();
  const diffDays = Math.floor((now - blockedDate) / (1000 * 60 * 60 * 24));
  const blockedDateText = diffDays === 0 ? 'Today' :
    diffDays === 1 ? 'Yesterday' :
    diffDays < 7 ? `${diffDays} days ago` :
    diffDays < 30 ? `${Math.floor(diffDays / 7)} weeks ago` :
    `${Math.floor(diffDays / 30)} months ago`;

  return (
    <View style={styles.blockedRow}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: `${stateColor}33` }]}>
        <Ionicons name="paw" size={22} color={stateColor} />
      </View>

      {/* Info */}
      <View style={styles.blockedInfo}>
        <Text style={styles.blockedName}>{profile?.displayName || 'Unknown User'}</Text>
        <Text style={styles.blockedDate}>Blocked {blockedDateText}</Text>
      </View>

      {/* Unblock button */}
      {isUnblocking ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <TouchableOpacity onPress={onUnblock}>
          <Text style={styles.unblockButton}>Unblock</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  listHeader: {
    fontSize: 13,
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  blockedName: {
    fontSize: 16,
    fontWeight: '500',
  },
  blockedDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  unblockButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
