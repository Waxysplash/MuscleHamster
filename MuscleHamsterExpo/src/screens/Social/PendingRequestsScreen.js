/**
 * PendingRequestsScreen.js
 * MuscleHamster Expo
 *
 * Screen for managing friend requests (incoming and outgoing)
 * Ported from Phase 09: Social Features (Swift version)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFriends } from '../../context/FriendContext';
import { getHamsterStateColor, getRelativeTimeString } from '../../models/Friend';
import LoadingView from '../../components/LoadingView';

export default function PendingRequestsScreen() {
  const navigation = useNavigation();
  const {
    pendingRequests,
    sentRequests,
    acceptFriendRequest,
    declineFriendRequest,
    isLoading,
  } = useFriends();

  const [selectedTab, setSelectedTab] = useState('incoming');
  const [processingIds, setProcessingIds] = useState(new Set());

  const handleAccept = async (requestId) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    const result = await acceptFriendRequest(requestId);
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });

    if (!result.success) {
      Alert.alert('Oops', result.error || 'Could not accept request');
    }
  };

  const handleDecline = async (requestId) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    const result = await declineFriendRequest(requestId);
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });

    if (!result.success) {
      Alert.alert('Oops', result.error || 'Could not decline request');
    }
  };

  if (isLoading) {
    return <LoadingView message="Loading requests..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Friend Requests</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Picker */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'incoming' && styles.tabActive]}
          onPress={() => setSelectedTab('incoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'incoming' && styles.tabTextActive]}>
            Incoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'outgoing' && styles.tabActive]}
          onPress={() => setSelectedTab('outgoing')}
        >
          <Text style={[styles.tabText, selectedTab === 'outgoing' && styles.tabTextActive]}>
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'incoming' ? (
        pendingRequests.length === 0 ? (
          <EmptyState
            icon="mail-open"
            title="No pending requests"
            message="Your hamster is patient!"
          />
        ) : (
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.request.id}
            renderItem={({ item }) => (
              <IncomingRequestRow
                request={item.request}
                senderProfile={item.senderProfile}
                isProcessing={processingIds.has(item.request.id)}
                onAccept={() => handleAccept(item.request.id)}
                onDecline={() => handleDecline(item.request.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        sentRequests.length === 0 ? (
          <EmptyState
            icon="paper-plane"
            title="No sent requests"
            message="Friend requests you send will appear here."
          />
        ) : (
          <FlatList
            data={sentRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OutgoingRequestRow request={item} />
            )}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
    </View>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={50} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

function IncomingRequestRow({ request, senderProfile, isProcessing, onAccept, onDecline }) {
  const stateColor = senderProfile
    ? getHamsterStateColor(senderProfile.hamsterState)
    : '#8E8E93';

  return (
    <View style={styles.requestRow}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: `${stateColor}33` }]}>
        <Ionicons name="paw" size={22} color={stateColor} />
      </View>

      {/* Info */}
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {senderProfile?.displayName || 'Someone'}
        </Text>
        {senderProfile?.hamsterName && (
          <Text style={styles.requestHamster}>{senderProfile.hamsterName}</Text>
        )}
        <Text style={styles.requestTime}>{request.displaySentDate}</Text>
      </View>

      {/* Actions */}
      {isProcessing ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={onDecline}
            accessibilityLabel="Decline request"
          >
            <Ionicons name="close" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            accessibilityLabel="Accept request"
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function OutgoingRequestRow({ request }) {
  return (
    <View style={styles.requestRow}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
        <Ionicons name="person" size={22} color="#007AFF" />
      </View>

      {/* Info */}
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>Pending</Text>
        <Text style={styles.requestTime}>Sent {request.displaySentDate}</Text>
      </View>

      {/* Status */}
      <View style={styles.pendingBadge}>
        <Ionicons name="time" size={14} color="#FF9500" />
        <Text style={styles.pendingBadgeText}>Waiting</Text>
      </View>
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
  doneButton: {
    padding: 8,
  },
  doneText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '500',
  },
  requestHamster: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  requestTime: {
    fontSize: 11,
    color: '#C7C7CC',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 12,
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
  },
});
