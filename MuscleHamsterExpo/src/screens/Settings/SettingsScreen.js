import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import FeatureFlags from '../../config/FeatureFlags';

export default function SettingsScreen({ navigation }) {
  const { currentUser, signOut } = useAuth();
  const { totalPoints } = useActivity();
  const { profile } = useUserProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [music, setMusic] = useState(true);

  // Format points for display
  const formattedPoints = totalPoints.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of Muscle Hamster?\n\nYour hamster will miss you, but your progress is safe!')) {
        signOut();
      }
    } else {
      Alert.alert(
        'Sign out of Muscle Hamster?',
        'Your hamster will miss you, but your progress is safe!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
        ]
      );
    }
  };

  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('AccountSettings')}
          accessibilityRole="button"
          accessibilityLabel={currentUser ? `Account: ${currentUser.email}` : 'Sign In'}
        >
          <Ionicons name="person-circle" size={40} color="#FF9500" />
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>{currentUser ? currentUser.email : 'Sign In'}</Text>
            <Text style={styles.rowSub}>
              {currentUser ? 'Manage your account' : 'Set up your account to save progress'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
      </View>

      {/* Profile Settings */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('ProfileSettings')}
          accessibilityRole="button"
        >
          <View style={styles.iconBox}>
            <Ionicons name="paw" size={22} color="#8B5A2B" />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>My Profile</Text>
            <Text style={styles.rowSub}>
              {profile?.hamsterName ? `${profile.hamsterName}'s settings` : 'Edit your fitness profile'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
      </View>

      {/* Points History - only show if feature enabled */}
      {FeatureFlags.transactionHistory && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('PointsHistory')}
            accessibilityRole="button"
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
              <Ionicons name="star" size={22} color="#FF9500" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Points History</Text>
              <Text style={styles.rowSub}>
                {formattedPoints} points
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="notifications" size={22} color="#FF3B30" />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Text style={styles.rowSub}>
              {notificationsEnabled
                ? 'Your hamster will send you reminders'
                : 'Enable to get gentle reminders'}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: '#FF9500' }}
            accessibilityLabel="Notifications toggle"
            accessibilityValue={{ text: notificationsEnabled ? 'On' : 'Off' }}
          />
        </View>
        {notificationsEnabled && (
          <TouchableOpacity
            style={[styles.row, { marginTop: 1 }]}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="time" size={22} color="#FF9500" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Reminder Time</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Audio - only show if feature enabled */}
      {FeatureFlags.audioSystem && (
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="volume-high" size={22} color="#34C759" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ true: '#FF9500' }}
              accessibilityLabel="Sound Effects toggle"
              accessibilityValue={{ text: soundEffects ? 'On' : 'Off' }}
            />
          </View>
          <View style={[styles.row, { marginTop: 1 }]}>
            <View style={styles.iconBox}>
              <Ionicons name="musical-note" size={22} color="#AF52DE" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Music</Text>
            </View>
            <Switch
              value={music}
              onValueChange={setMusic}
              trackColor={{ true: '#FF9500' }}
              accessibilityLabel="Music toggle"
              accessibilityValue={{ text: music ? 'On' : 'Off' }}
            />
          </View>
          <TouchableOpacity
            style={[styles.row, { marginTop: 1 }]}
            onPress={() => navigation.navigate('AudioSettings')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="options" size={22} color="#6B5D52" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Audio Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Privacy - only show if social features enabled */}
      {FeatureFlags.socialFeatures && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <View style={styles.iconBox}>
              <Ionicons name="shield-checkmark" size={22} color="#8B5A2B" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Privacy Controls</Text>
              <Text style={styles.rowSub}>Manage your data and visibility</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Support */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="help-circle" size={22} color="#8B5A2B" />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Help</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.row, { marginTop: 1 }]}
          onPress={() => Linking.openURL('https://waxysplash.github.io/MuscleHamster/privacy-policy.html')}
        >
          <View style={styles.iconBox}>
            <Ionicons name="document-text" size={22} color="#6B5D52" />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { marginTop: 1 }]}>
          <View style={styles.iconBox}>
            <Ionicons name="document-text" size={22} color="#6B5D52" />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityLabel="Sign out of your account"
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Muscle Hamster</Text>
        <Text style={styles.versionNumber}>Version 1.0.0</Text>
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
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(139,90,43,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
    marginLeft: 4,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A3728',
  },
  rowSub: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#6B5D52',
  },
  versionNumber: {
    fontSize: 13,
    color: '#8B5A2B',
    marginTop: 2,
  },
});
