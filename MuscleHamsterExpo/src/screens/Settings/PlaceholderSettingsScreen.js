import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREENS = {
  AccountSettings: {
    icon: 'person-circle-outline',
    title: 'Account Setup Coming Soon',
    message: 'Your hamster is getting your account ready. Sign-in, profile editing, and progress saving will be available here.',
  },
  WorkoutScheduleSettings: {
    icon: 'calendar-outline',
    title: 'Schedule Setup Coming Soon',
    message: 'Pick which days you want to work out and which are rest days. Your hamster will plan around your schedule!',
  },
  NotificationSettings: {
    icon: 'notifications-outline',
    title: 'Reminder Settings Coming Soon',
    message: 'Choose when your hamster sends you friendly nudges. Reminder times, frequency, and quiet hours will live here.',
  },
  AudioSettings: {
    icon: 'volume-medium-outline',
    title: 'Audio Settings Coming Soon',
    message: 'Volume controls, workout music preferences, and sound effect options will be available here. Your hamster loves a good tune!',
  },
  PrivacySettings: {
    icon: 'shield-outline',
    title: 'Privacy Controls Coming Soon',
    message: 'Data export, account deletion, profile visibility, and blocking controls will live here. Your privacy matters to your hamster!',
  },
};

export default function PlaceholderSettingsScreen({ route }) {
  const screenKey = route.name;
  const config = SCREENS[screenKey] || SCREENS.AccountSettings;

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={64} color="#007AFF" />
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
});
