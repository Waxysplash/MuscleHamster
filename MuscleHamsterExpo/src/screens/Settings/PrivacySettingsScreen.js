/**
 * PrivacySettingsScreen.js
 * MuscleHamster Expo
 *
 * Central hub for privacy controls
 * Ported from Phase 09.5: Privacy Controls
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Logger from '../../services/LoggerService';
import friendService from '../../services/FriendService';
import {
  ProfileVisibilityLevel,
  getVisibilityDisplayName,
  getVisibilityDescription,
  getVisibilityIcon,
} from '../../models/Friend';

export default function PrivacySettingsScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: ProfileVisibilityLevel.EVERYONE,
    allowFriendRequests: true,
  });
  const [blockedUsersCount, setBlockedUsersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const currentUserId = currentUser?.id || 'currentUser';

  // Load settings on focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [settings, blocked] = await Promise.all([
        friendService.getPrivacySettings(currentUserId),
        friendService.getBlockedUsers(currentUserId),
      ]);

      setPrivacySettings({
        profileVisibility: settings.profileVisibility,
        allowFriendRequests: settings.allowFriendRequests,
      });
      setBlockedUsersCount(blocked.length);
    } catch (e) {
      Logger.warn('Failed to load privacy settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    setIsSaving(true);
    try {
      await friendService.updatePrivacySettings(currentUserId, newSettings);
      setPrivacySettings(newSettings);
    } catch (e) {
      Logger.warn('Failed to save privacy settings:', e);
      Alert.alert("Couldn't Save", "Your changes couldn't be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFriendRequestsChange = async (value) => {
    const newSettings = { ...privacySettings, allowFriendRequests: value };
    setPrivacySettings(newSettings);
    await saveSettings(newSettings);
  };

  const getFriendRequestsSubtitle = () => {
    if (privacySettings.allowFriendRequests) {
      return 'Others can send you friend requests';
    }
    return 'No one can send you requests';
  };

  const getBlockedUsersSubtitle = () => {
    if (blockedUsersCount === 0) {
      return 'No blocked users';
    } else if (blockedUsersCount === 1) {
      return '1 blocked user';
    }
    return `${blockedUsersCount} blocked users`;
  };

  const canToggleFriendRequests =
    privacySettings.profileVisibility !== ProfileVisibilityLevel.PRIVATE;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Visibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Discoverability</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ProfileVisibility')}
            accessibilityLabel="Profile Visibility"
            accessibilityValue={{ text: getVisibilityDisplayName(privacySettings.profileVisibility) }}
            accessibilityHint="Controls who can find and see your profile. Double tap to change."
          >
            <View style={styles.iconContainer}>
              <Ionicons name="eye" size={22} color="#007AFF" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Profile Visibility</Text>
              <View style={styles.visibilityBadge}>
                <Ionicons
                  name={getVisibilityIcon(privacySettings.profileVisibility)}
                  size={14}
                  color="#8E8E93"
                />
                <Text style={styles.visibilityText}>
                  {getVisibilityDisplayName(privacySettings.profileVisibility)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          {getVisibilityDescription(privacySettings.profileVisibility)}
        </Text>
      </View>

      {/* Friend Requests Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Social</Text>
        <View style={styles.card}>
          <View style={[styles.row, !canToggleFriendRequests && styles.disabledRow]}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={22} color="#34C759" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Allow Friend Requests</Text>
              <Text style={styles.rowSubLabel}>{getFriendRequestsSubtitle()}</Text>
            </View>
            <Switch
              value={privacySettings.allowFriendRequests}
              onValueChange={handleFriendRequestsChange}
              trackColor={{ true: '#007AFF' }}
              disabled={isSaving || !canToggleFriendRequests}
              accessibilityLabel="Allow Friend Requests toggle"
            />
          </View>
        </View>
        {!canToggleFriendRequests && (
          <View style={styles.footerInfo}>
            <Ionicons name="information-circle" size={16} color="#8E8E93" />
            <Text style={styles.footerInfoText}>
              Friend requests are automatically disabled when your profile is set to Private.
            </Text>
          </View>
        )}
      </View>

      {/* Blocked Users Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Blocking</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('BlockedUsers')}
            accessibilityLabel="Blocked Users"
            accessibilityValue={{ text: getBlockedUsersSubtitle() }}
            accessibilityHint="Manage users you've blocked. Double tap to view."
          >
            <View style={styles.iconContainer}>
              <Ionicons name="ban" size={22} color="#FF3B30" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Blocked Users</Text>
              <Text style={styles.rowSubLabel}>{getBlockedUsersSubtitle()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          Blocked users can't see your profile, send requests, or interact with you.
        </Text>
      </View>

      {/* Data & Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Data & Account</Text>
        <View style={styles.card}>
          {/* Download Data */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('mailto:musclehamsterapp@gmail.com?subject=Data%20Export%20Request&body=Please%20send%20me%20a%20copy%20of%20my%20data.%0A%0AAccount%20email:%20' + (currentUser?.email || ''))}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="download" size={22} color="#AF52DE" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Download My Data</Text>
              <Text style={styles.rowSubLabel}>Request a copy of your data</Text>
            </View>
            <Ionicons name="mail-outline" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Delete Account */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'To delete your account and all data, please email us. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Send Email',
                    style: 'destructive',
                    onPress: () => Linking.openURL('mailto:musclehamsterapp@gmail.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data.%0A%0AAccount%20email:%20' + (currentUser?.email || '')),
                  },
                ]
              );
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="trash" size={22} color="#FF3B30" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Delete Account</Text>
              <Text style={styles.rowSubLabel}>Permanently delete your account and data</Text>
            </View>
            <Ionicons name="mail-outline" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          We'll respond to data requests within 30 days.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  disabledRow: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowSubLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  visibilityText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C7C7CC',
    marginLeft: 52,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 18,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginHorizontal: 16,
  },
  footerInfoText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(142,142,147,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
