/**
 * AccountSettingsScreen.js
 * MuscleHamster Expo
 *
 * Account settings - View and manage account details
 * Ported from Phase 02.3: Account basics with signed-in state and deletion placeholder
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAlert } from '../../context/AlertContext';

export default function AccountSettingsScreen({ navigation }) {
  const { currentUser, deleteAccount, reauthenticate, reauthenticateWithGoogle, reauthenticateWithApple, signOut } = useAuth();
  const { isProfileComplete } = useUserProfile();
  const { showAlert } = useAlert();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Determine if user signed in with email/password or social auth
  // Use currentUser from context as dependency to ensure proper re-renders
  const authProvider = useMemo(() => {
    // Access auth.currentUser directly but depend on context's currentUser for reactivity
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser?.providerData) return 'unknown';
    const providers = firebaseUser.providerData.map(p => p.providerId);
    if (providers.includes('password')) return 'password';
    if (providers.includes('google.com')) return 'google';
    if (providers.includes('apple.com')) return 'apple';
    return 'unknown';
  }, [currentUser]);

  const handleDeleteAccountPress = () => {
    // Simple single confirmation
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure? This is permanent.')) {
        performAccountDeletion();
      }
    } else {
      showAlert(
        'Are you sure?',
        'This is permanent.',
        [
          { text: 'No thanks', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: performAccountDeletion,
          },
        ]
      );
    }
  };

  const performAccountDeletion = async () => {
    console.log('[AccountSettings] performAccountDeletion called, authProvider:', authProvider);
    setIsDeleting(true);

    const result = await deleteAccount();
    console.log('[AccountSettings] deleteAccount result:', result);

    if (result.success) {
      // Account deleted - auth state listener will redirect to sign in
      console.log('[AccountSettings] Account deleted successfully');
    } else {
      setIsDeleting(false);
      console.log('[AccountSettings] Delete failed, error:', result.error);

      if (result.error === 'requires-recent-login') {
        // Handle re-authentication based on auth provider
        console.log('[AccountSettings] Requires recent login, authProvider:', authProvider);
        if (authProvider === 'password') {
          // Show password modal for email/password users
          setPassword('');
          setPasswordError('');
          setShowPasswordModal(true);
        } else if (authProvider === 'google') {
          // For Google users, re-authenticate with Google
          showAlert(
            'Confirm Your Identity',
            'For security, please sign in with Google again to confirm this action.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Continue with Google',
                onPress: handleGoogleReauthAndDelete,
              },
            ]
          );
        } else if (authProvider === 'apple') {
          // For Apple users, re-authenticate with Apple
          showAlert(
            'Confirm Your Identity',
            'For security, please sign in with Apple again to confirm this action.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Continue with Apple',
                onPress: handleAppleReauthAndDelete,
              },
            ]
          );
        } else {
          // For other auth providers, they need to sign out and sign back in
          showAlert(
            'Re-authentication Required',
            'For security, please sign out and sign back in, then try deleting your account again.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                onPress: () => signOut(),
              },
            ]
          );
        }
      } else {
        // Show the actual error for debugging
        const errorMsg = result.error || 'Unknown error';
        showAlert(
          'Something Went Wrong',
          `We couldn't delete your account: ${errorMsg}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleGoogleReauthAndDelete = async () => {
    console.log('[AccountSettings] handleGoogleReauthAndDelete called');
    setIsDeleting(true);

    // Re-authenticate with Google
    const reauthResult = await reauthenticateWithGoogle();
    console.log('[AccountSettings] Google reauth result:', reauthResult);

    if (!reauthResult.success) {
      setIsDeleting(false);
      if (reauthResult.cancelled) {
        // User cancelled, do nothing
        return;
      }
      showAlert(
        'Authentication Failed',
        reauthResult.error || 'We couldn\'t verify your identity. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Now delete the account
    const deleteResult = await deleteAccount();
    console.log('[AccountSettings] Delete result after Google reauth:', deleteResult);

    if (!deleteResult.success) {
      setIsDeleting(false);
      showAlert(
        'Something Went Wrong',
        'We couldn\'t delete your account right now. Please try again later.',
        [{ text: 'OK' }]
      );
    }
    // If successful, auth state listener will redirect
  };

  const handleAppleReauthAndDelete = async () => {
    console.log('[AccountSettings] handleAppleReauthAndDelete called');
    setIsDeleting(true);

    // Re-authenticate with Apple
    const reauthResult = await reauthenticateWithApple();
    console.log('[AccountSettings] Apple reauth result:', reauthResult);

    if (!reauthResult.success) {
      setIsDeleting(false);
      if (reauthResult.cancelled) {
        // User cancelled, do nothing
        return;
      }
      showAlert(
        'Authentication Failed',
        reauthResult.error || 'We couldn\'t verify your identity. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Now delete the account
    const deleteResult = await deleteAccount();
    console.log('[AccountSettings] Delete result after Apple reauth:', deleteResult);

    if (!deleteResult.success) {
      setIsDeleting(false);
      showAlert(
        'Something Went Wrong',
        'We couldn\'t delete your account right now. Please try again later.',
        [{ text: 'OK' }]
      );
    }
    // If successful, auth state listener will redirect
  };

  const handleReauthAndDelete = async () => {
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      return;
    }

    setPasswordError('');
    setShowPasswordModal(false);
    setIsDeleting(true);

    // Re-authenticate
    const reauthResult = await reauthenticate(password);

    if (!reauthResult.success) {
      setIsDeleting(false);
      if (reauthResult.error === 'wrong-password') {
        setPasswordError('Incorrect password. Please try again.');
        setShowPasswordModal(true);
      } else {
        showAlert(
          'Authentication Failed',
          'We couldn\'t verify your identity. Please try signing out and signing back in, then try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', onPress: () => signOut() },
          ]
        );
      }
      return;
    }

    // Now delete the account
    const deleteResult = await deleteAccount();

    if (!deleteResult.success) {
      setIsDeleting(false);
      showAlert(
        'Something Went Wrong',
        'We couldn\'t delete your account right now. Please try again later.',
        [{ text: 'OK' }]
      );
    }
    // If successful, auth state listener will redirect
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

      {/* Delete Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Delete Account</Text>
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

      {/* Password Re-authentication Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Your Password</Text>
            <Text style={styles.modalSubtitle}>
              For security, please enter your password to continue deleting your account.
            </Text>

            <TextInput
              style={[styles.passwordInput, passwordError ? styles.passwordInputError : null]}
              placeholder="Enter your password"
              placeholderTextColor="#A0968E"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              autoFocus
            />

            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleReauthAndDelete}
              >
                <Text style={styles.confirmButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  passwordInput: {
    backgroundColor: '#FFF8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#4A3728',
    borderWidth: 1,
    borderColor: '#E8DDD4',
  },
  passwordInputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B5D52',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
