/**
 * AddFriendsScreen.js
 * MuscleHamster Expo
 *
 * Screen for searching and adding friends
 * Ported from Phase 09: Social Features (Swift version)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFriends } from '../../context/FriendContext';
import Logger from '../../services/LoggerService';
import { getHamsterStateColor } from '../../models/Friend';

export default function AddFriendsScreen() {
  const navigation = useNavigation();
  const { searchUsers, sendFriendRequest, pendingRequestCount } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setHasSearched(true);
    const results = await searchUsers(searchQuery.trim());
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSendRequest = async (userId) => {
    setSendingTo(userId);
    const result = await sendFriendRequest(userId);
    setSendingTo(null);

    if (result.success) {
      // Update local results
      setSearchResults(prev =>
        prev.map(r =>
          r.profile.id === userId
            ? { ...r, hasPendingRequest: true, requestSentByMe: true }
            : r
        )
      );
    } else {
      Alert.alert('Oops', result.error || 'Could not send request');
    }
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: "Join me on Muscle Hamster! Let's workout together and keep each other motivated. Download the app: [App Store Link]",
        title: 'Invite to Muscle Hamster',
      });
    } catch (error) {
      Logger.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Pending Requests Link */}
      {pendingRequestCount > 0 && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={() => navigation.navigate('PendingRequests')}
        >
          <View style={styles.pendingIcon}>
            <Ionicons name="mail" size={20} color="#FF9500" />
          </View>
          <View style={styles.pendingInfo}>
            <Text style={styles.pendingTitle}>Friend Requests</Text>
            <Text style={styles.pendingSubtitle}>{pendingRequestCount} waiting for you</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        </TouchableOpacity>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, searchQuery.trim().length < 2 && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={searchQuery.trim().length < 2}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.profile.id}
          renderItem={({ item }) => (
            <SearchResultRow
              result={item}
              isSending={sendingTo === item.profile.id}
              onSendRequest={() => handleSendRequest(item.profile.id)}
            />
          )}
          contentContainerStyle={styles.resultsList}
        />
      ) : hasSearched ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={50} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyMessage}>
            Try a different search or invite your friends to join!
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={50} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Find your friends</Text>
          <Text style={styles.emptyMessage}>
            Search by name or email to connect with friends.
          </Text>
        </View>
      )}

      {/* Invite Button */}
      <View style={styles.inviteContainer}>
        <TouchableOpacity style={styles.inviteButton} onPress={handleShareInvite}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
          <Text style={styles.inviteButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SearchResultRow({ result, isSending, onSendRequest }) {
  const { profile, isFriend, hasPendingRequest, requestSentByMe } = result;
  const stateColor = getHamsterStateColor(profile.hamsterState);

  return (
    <View style={styles.resultRow}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: `${stateColor}33` }]}>
        <Ionicons name="paw" size={22} color={stateColor} />
      </View>

      {/* Info */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{profile.displayName}</Text>
        {profile.hamsterName && (
          <Text style={styles.resultHamster}>{profile.hamsterName}</Text>
        )}
      </View>

      {/* Action */}
      {isFriend ? (
        <View style={styles.friendBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.friendBadgeText}>Friends</Text>
        </View>
      ) : hasPendingRequest ? (
        <View style={styles.pendingBadge}>
          <Ionicons name="time" size={16} color="#FF9500" />
          <Text style={styles.pendingBadgeText}>
            {requestSentByMe ? 'Sent' : 'Pending'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onSendRequest}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </>
          )}
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
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  pendingSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultHamster: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  friendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
  },
  friendBadgeText: {
    color: '#34C759',
    fontSize: 13,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: '#FF9500',
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  inviteContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  inviteButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
