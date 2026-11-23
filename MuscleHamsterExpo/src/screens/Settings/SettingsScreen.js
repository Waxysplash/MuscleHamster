// Settings - Storybook redesign (proposal on the design canvas, Nov 2026)
// Grouped rows: You, Reminders, Sound, Help and legal; then Sign out and the version.
// Sound switches now really change the app's sound preferences (they used to do nothing).
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAlert } from '../../context/AlertContext';
import FeatureFlags from '../../config/FeatureFlags';
import {
  getAudioState,
  subscribeToAudioState,
  updateAudioPreferences,
} from '../../services/AudioService';
import { StoryButton, StoryIcon } from '../../components/ui/Story';
import { Colors, Fonts, Outline } from '../../config/theme';

const APP_VERSION = Constants.expoConfig?.version || '';

const Row = ({ icon, art, label, sub, onPress, right, last = false, accessibilityLabel }) => {
  const content = (
    <>
      <StoryIcon name={icon} art={art} size={40} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right || (onPress ? <Ionicons name="chevron-forward" size={22} color={Colors.ink} /> : null)}
    </>
  );
  const style = [styles.row, last && { borderBottomWidth: 0 }];
  return onPress ? (
    <Pressable style={style} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel || (sub ? `${label}. ${sub}` : label)}>
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
};

const Group = ({ title, children }) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupBox}>{children}</View>
  </View>
);

export default function SettingsScreen({ navigation }) {
  const { currentUser, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { showAlert } = useAlert();

  // Sound preferences come from the audio service, so the switches really work
  const [audio, setAudio] = useState(getAudioState().preferences);
  useEffect(() => subscribeToAudioState((state) => setAudio(state.preferences)), []);
  const setPref = (key, value) => updateAudioPreferences({ ...audio, [key]: value });

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of Muscle Hamster?\n\nYour hamster will miss you, but your progress is safe!')) {
        signOut();
      }
      return;
    }
    showAlert(
      'Sign out of Muscle Hamster?',
      'Your hamster will miss you, but your progress is safe!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const toggle = (value, onChange, label) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: Colors.brand, false: Colors.sand }}
      thumbColor={Colors.surface}
      ios_backgroundColor={Colors.sand}
      accessibilityLabel={label}
    />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Group title="You">
        <Row
          icon="person-circle"
          art="me_profile"
          label={currentUser ? currentUser.email : 'Sign in'}
          sub={currentUser ? 'Email, password and account' : 'Set up your account to save progress'}
          onPress={() => navigation.navigate('AccountSettings')}
        />
        <Row
          icon="paw"
          art="tab_hamster"
          label="Profile and goals"
          sub={profile?.hamsterName ? `${profile.hamsterName}, fitness level, workout days` : 'Fitness level, goals, workout days'}
          onPress={() => navigation.navigate('ProfileSettings')}
          last
        />
      </Group>

      <Group title="Reminders">
        <Row
          icon="notifications"
          art="me_reminders"
          label="Reminders"
          sub="Daily nudge from your hamster"
          onPress={() => navigation.navigate('NotificationSettings')}
          last
        />
      </Group>

      {FeatureFlags.audioSystem && (
        <Group title="Sound">
          <Row
            icon="volume-high"
            label="Sound effects"
            right={toggle(!!audio.soundEffectsEnabled, (v) => setPref('soundEffectsEnabled', v), 'Sound effects')}
          />
          <Row
            icon="musical-notes"
            label="Music"
            right={toggle(!!audio.musicEnabled, (v) => setPref('musicEnabled', v), 'Music')}
          />
          <Row
            icon="options"
            label="More sound settings"
            sub="Volume and mixing with other apps"
            onPress={() => navigation.navigate('AudioSettings')}
            last
          />
        </Group>
      )}

      {FeatureFlags.socialFeatures && (
        <Group title="Privacy">
          <Row
            icon="shield-checkmark"
            label="Privacy controls"
            sub="Your data and who can see you"
            onPress={() => navigation.navigate('PrivacySettings')}
            last
          />
        </Group>
      )}

      <Group title="Help and legal">
        <Row
          icon="help-circle"
          label="Help and feedback"
          sub="Email the Muscle Hamster team"
          onPress={() => Linking.openURL('mailto:support@musclehamster.app?subject=Help%20Request')}
        />
        <Row
          icon="document-text"
          label="Privacy policy"
          onPress={() => Linking.openURL('https://waxysplash.github.io/MuscleHamster/privacy-policy.html')}
        />
        <Row
          icon="document-text"
          label="Terms of service"
          onPress={() => Linking.openURL('https://waxysplash.github.io/MuscleHamster/terms-of-service.html')}
          last
        />
      </Group>

      <StoryButton
        title="Sign out"
        variant="secondary"
        onPress={handleSignOut}
        accessibilityLabel="Sign out of your account"
        style={{ marginTop: 4 }}
      />

      <Text style={styles.version}>Muscle Hamster {APP_VERSION}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 40 },
  group: { marginBottom: 18 },
  groupTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.brown, marginBottom: 8, marginLeft: 4 },
  groupBox: {
    backgroundColor: Colors.surface,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
    borderBottomWidth: Outline.width,
    borderBottomColor: Colors.ink,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  rowSub: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  version: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 18 },
});
