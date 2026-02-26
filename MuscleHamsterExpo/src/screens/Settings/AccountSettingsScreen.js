/**
 * AccountSettingsScreen.js
 * MuscleHamster Expo
 *
 * Account settings - View and manage account details
 * Ported from Phase 02.3: Account basics with signed-in state and deletion placeholder
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';

export default function AccountSettingsScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { isProfileComplete } = useUserProfile();
  const [showDeleteAccountInfo, setShowDeleteAccountInfo] = useState(false);

  const handleDeleteAccountPress = () => {
    Alert.alert(
      'Account Deletion',
      'Account deletion will be available soon. When ready, you\'ll be able to permanently delete your account and all associated data. Your hamster understands!',
      [{ text: 'Got It', style: 'cancel' }]
    );
  };

  // Signed out content
  if (!currentUser) {
    return (
      <View style={styles.signedOutContainer}>
        <Ionicons
          name="person-circle-outline"
          size={64}
          color="#6B5D52"
        />
        <Text style={styles.signedOutTitle}>Not Signed In</Text>
        <Text style={styles.signedOutMessage}>
          Sign in to view and manage your account settings.
        </Text>
      </View>
    );
  }

  // Signed in content
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Info Section */}
      <View style={styles.section}>
        <View style={styles.accountHeader}>
          <Ionicons
            name="person-circle"
            size={56}
            color="#FF9500"
          />
          <View style={styles.accountInfo}>
            <Text style={styles.emailText}>{currentUser.email}</Text>
            <Text style={styles.emailSubText}>Your account email</Text>
          </View>
        </View>
      </View>

      {/* Account Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Account Status</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusLabel}>
              <Ionicons name="person-outline" size={22} color="#FF9500" />
              <Text style={styles.statusText}>Profile Setup</Text>
            </View>
            {isProfileComplete ? (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.completeText}>Complete</Text>
              </View>
            ) : (
              <Text style={styles.incompleteText}>Incomplete</Text>
            )}
          </View>
        </View>
      </View>

      {/* Danger Zone Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Danger Zone</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleDeleteAccountPress}
            accessibilityLabel="Delete Account"
            accessibilityHint="This feature is coming soon. Tap for more information."
            accessibilityRole="button"
          >
            <View style={styles.dangerLabel}>
              <Ionicons name="trash-outline" size={22} color="#A0968E" />
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerText}>Delete Account</Text>
                <Text style={styles.dangerSubText}>Coming Soon</Text>
              </View>
            </View>
            <Ionicons name="information-circle-outline" size={22} color="#A0968E" />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          Account deletion permanently removes all your data including workout history, points, and customizations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D52',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  accountHeader: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accountInfo: {
    marginLeft: 16,
    flex: 1,
  },
  emailText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
  },
  emailSubText: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#4A3728',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 15,
    color: '#34C759',
    marginLeft: 4,
  },
  incompleteText: {
    fontSize: 15,
    color: '#6B5D52',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  dangerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dangerTextContainer: {
    marginLeft: 12,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A0968E',
  },
  dangerSubText: {
    fontSize: 13,
    color: '#A0968E',
    marginTop: 1,
  },
  footerText: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 18,
  },
  signedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF8F0',
  },
  signedOutTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#4A3728',
  },
  signedOutMessage: {
    fontSize: 15,
    color: '#6B5D52',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
