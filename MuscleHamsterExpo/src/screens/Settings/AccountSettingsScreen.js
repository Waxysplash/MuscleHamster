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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';

export default function AccountSettingsScreen({ navigation }) {
  const { currentUser, deleteAccount } = useAuth();
  const { isProfileComplete } = useUserProfile();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccountPress = () => {
    // First confirmation
    if (Platform.OS === 'web') {
      if (window.confirm('Delete your Muscle Hamster account?\n\nThis will permanently delete:\n• Your workout history\n• Your points and streaks\n• Your inventory and customizations\n• Your hamster\n\nThis action cannot be undone.')) {
        // Second confirmation for web
        if (window.confirm('Are you absolutely sure? This is permanent and cannot be undone.')) {
          performAccountDeletion();
        }
      }
    } else {
      Alert.alert(
        'Delete Your Account?',
        'This will permanently delete:\n\n• Your workout history\n• Your points and streaks\n• Your inventory and customizations\n• Your hamster\n\nThis action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: () => {
              // Second confirmation
              Alert.alert(
                'Are You Sure?',
                'This is permanent. Your hamster and all your progress will be gone forever.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes, Delete Everything',
                    style: 'destructive',
                    onPress: performAccountDeletion,
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);

    const result = await deleteAccount();

    if (result.success) {
      // Account deleted - auth state listener will redirect to sign in
      // No need to show alert since the screen will change
    } else {
      setIsDeleting(false);
      if (result.error === 'requires-recent-login') {
        Alert.alert(
          'Security Check Required',
          'For your security, please sign out and sign back in, then try deleting your account again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Something Went Wrong',
          'We couldn\'t delete your account right now. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    }
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
    <View style={styles.wrapper}>
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
            disabled={isDeleting}
            accessibilityLabel="Delete Account"
            accessibilityHint="Permanently delete your account and all data"
            accessibilityRole="button"
          >
            <View style={styles.dangerLabel}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerTextActive}>Delete Account</Text>
                <Text style={styles.dangerSubTextActive}>Permanently remove all data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          Account deletion permanently removes all your data including workout history, points, and customizations. This action cannot be undone.
        </Text>
      </View>

    </ScrollView>

      {/* Deleting Overlay */}
      {isDeleting && (
        <View style={styles.deletingOverlay}>
          <View style={styles.deletingBox}>
            <ActivityIndicator size="large" color="#FF3B30" />
            <Text style={styles.deletingText}>Deleting your account...</Text>
            <Text style={styles.deletingSubText}>This may take a moment</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
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
  dangerTextActive: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  dangerSubTextActive: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 1,
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletingBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  deletingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 16,
  },
  deletingSubText: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 4,
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
