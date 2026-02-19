/**
 * NotificationSettingsScreen.js
 * MuscleHamster Expo
 *
 * Full notification settings screen
 * Ported from Phase 08.2: Push Permission UX and Scheduling Rules
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Linking,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Storage keys
const NOTIFICATION_STORAGE_KEYS = {
  USER_ENABLED: '@MuscleHamster:notifications_userEnabled',
  REMINDER_HOUR: '@MuscleHamster:notifications_reminderHour',
  REMINDER_MINUTE: '@MuscleHamster:notifications_reminderMinute',
  REMINDER_PERIOD: '@MuscleHamster:notifications_reminderPeriod',
  DAILY_REMINDER: '@MuscleHamster:notifications_dailyReminder',
  STREAK_REMINDER: '@MuscleHamster:notifications_streakReminder',
  FRIEND_NUDGES: '@MuscleHamster:notifications_friendNudges',
};

// Permission states
const PermissionState = {
  NOT_DETERMINED: 'notDetermined',
  AUTHORIZED: 'authorized',
  DENIED: 'denied',
};

// Reminder time periods
const ReminderTimePeriod = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  CUSTOM: 'custom',
};

const PERIOD_INFO = {
  [ReminderTimePeriod.MORNING]: {
    displayName: 'Morning',
    description: '8:00 AM',
    icon: 'sunny-outline',
    hour: 8,
    minute: 0,
  },
  [ReminderTimePeriod.AFTERNOON]: {
    displayName: 'Afternoon',
    description: '12:00 PM',
    icon: 'partly-sunny-outline',
    hour: 12,
    minute: 0,
  },
  [ReminderTimePeriod.EVENING]: {
    displayName: 'Evening',
    description: '6:00 PM',
    icon: 'moon-outline',
    hour: 18,
    minute: 0,
  },
  [ReminderTimePeriod.CUSTOM]: {
    displayName: 'Custom Time',
    description: 'Choose your own time',
    icon: 'time-outline',
    hour: 8,
    minute: 0,
  },
};

// Default preferences
const DEFAULT_PREFERENCES = {
  userEnabled: true,
  reminderHour: 8,
  reminderMinute: 0,
  reminderPeriod: ReminderTimePeriod.MORNING,
  dailyReminderEnabled: true,
  streakReminderEnabled: true,
  friendNudgesEnabled: true,
};

export default function NotificationSettingsScreen({ navigation }) {
  const [permissionState, setPermissionState] = useState(PermissionState.AUTHORIZED);
  const [userEnabled, setUserEnabled] = useState(DEFAULT_PREFERENCES.userEnabled);
  const [reminderHour, setReminderHour] = useState(DEFAULT_PREFERENCES.reminderHour);
  const [reminderMinute, setReminderMinute] = useState(DEFAULT_PREFERENCES.reminderMinute);
  const [reminderPeriod, setReminderPeriod] = useState(DEFAULT_PREFERENCES.reminderPeriod);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(DEFAULT_PREFERENCES.dailyReminderEnabled);
  const [streakReminderEnabled, setStreakReminderEnabled] = useState(DEFAULT_PREFERENCES.streakReminderEnabled);
  const [friendNudgesEnabled, setFriendNudgesEnabled] = useState(DEFAULT_PREFERENCES.friendNudgesEnabled);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Load preferences on mount
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  const loadPreferences = async () => {
    try {
      const [enabled, hour, minute, period, daily, streak, nudges] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.USER_ENABLED),
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.REMINDER_HOUR),
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.REMINDER_MINUTE),
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.REMINDER_PERIOD),
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.DAILY_REMINDER),
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.STREAK_REMINDER),
        AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.FRIEND_NUDGES),
      ]);

      if (enabled !== null) setUserEnabled(JSON.parse(enabled));
      if (hour !== null) setReminderHour(parseInt(hour, 10));
      if (minute !== null) setReminderMinute(parseInt(minute, 10));
      if (period !== null) setReminderPeriod(period);
      if (daily !== null) setDailyReminderEnabled(JSON.parse(daily));
      if (streak !== null) setStreakReminderEnabled(JSON.parse(streak));
      if (nudges !== null) setFriendNudgesEnabled(JSON.parse(nudges));

      // Update selected time for picker
      const h = hour !== null ? parseInt(hour, 10) : DEFAULT_PREFERENCES.reminderHour;
      const m = minute !== null ? parseInt(minute, 10) : DEFAULT_PREFERENCES.reminderMinute;
      const date = new Date();
      date.setHours(h, m, 0, 0);
      setSelectedTime(date);
    } catch (e) {
      console.warn('Failed to load notification preferences:', e);
    }
  };

  const savePreference = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save notification preference:', e);
    }
  };

  // Format time for display
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Notification status text
  const getNotificationStatusText = () => {
    if (permissionState === PermissionState.DENIED) {
      return 'Enable in device Settings to receive reminders';
    }
    if (permissionState === PermissionState.NOT_DETERMINED) {
      return 'Get gentle workout reminders';
    }
    return userEnabled
      ? 'Your hamster will send you reminders'
      : 'Reminders are currently off';
  };

  // Open system settings
  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Handle user enabled toggle
  const handleUserEnabledChange = (value) => {
    setUserEnabled(value);
    savePreference(NOTIFICATION_STORAGE_KEYS.USER_ENABLED, value);
  };

  // Handle reminder period selection
  const handlePeriodSelect = (period) => {
    setReminderPeriod(period);
    savePreference(NOTIFICATION_STORAGE_KEYS.REMINDER_PERIOD, period);

    if (period !== ReminderTimePeriod.CUSTOM) {
      const info = PERIOD_INFO[period];
      setReminderHour(info.hour);
      setReminderMinute(info.minute);
      savePreference(NOTIFICATION_STORAGE_KEYS.REMINDER_HOUR, info.hour);
      savePreference(NOTIFICATION_STORAGE_KEYS.REMINDER_MINUTE, info.minute);
    }
  };

  // Handle custom time press
  const handleCustomTimePress = () => {
    const date = new Date();
    date.setHours(reminderHour, reminderMinute, 0, 0);
    setSelectedTime(date);
    setShowTimePicker(true);
  };

  // Handle time picker change
  const handleTimeChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  // Save custom time
  const handleTimeSave = () => {
    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();

    setReminderHour(hour);
    setReminderMinute(minute);
    setReminderPeriod(ReminderTimePeriod.CUSTOM);

    savePreference(NOTIFICATION_STORAGE_KEYS.REMINDER_HOUR, hour);
    savePreference(NOTIFICATION_STORAGE_KEYS.REMINDER_MINUTE, minute);
    savePreference(NOTIFICATION_STORAGE_KEYS.REMINDER_PERIOD, ReminderTimePeriod.CUSTOM);

    setShowTimePicker(false);
  };

  // Handle toggle changes for reminder types
  const handleDailyReminderChange = (value) => {
    setDailyReminderEnabled(value);
    savePreference(NOTIFICATION_STORAGE_KEYS.DAILY_REMINDER, value);
  };

  const handleStreakReminderChange = (value) => {
    setStreakReminderEnabled(value);
    savePreference(NOTIFICATION_STORAGE_KEYS.STREAK_REMINDER, value);
  };

  const handleFriendNudgesChange = (value) => {
    setFriendNudgesEnabled(value);
    savePreference(NOTIFICATION_STORAGE_KEYS.FRIEND_NUDGES, value);
  };

  const isAuthorized = permissionState === PermissionState.AUTHORIZED;
  const showSettings = isAuthorized && userEnabled;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Permission Denied Banner */}
      {permissionState === PermissionState.DENIED && (
        <View style={styles.section}>
          <View style={styles.deniedBanner}>
            <Ionicons name="notifications-off" size={28} color="#FF9500" />
            <View style={styles.deniedTextContainer}>
              <Text style={styles.deniedTitle}>Notifications Disabled</Text>
              <Text style={styles.deniedSubtitle}>
                Notifications are turned off in your device settings.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.openSettingsButton} onPress={openSystemSettings}>
            <Text style={styles.openSettingsText}>Open Settings</Text>
            <Ionicons name="open-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Master Toggle Section */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.masterToggleRow}>
            <Ionicons
              name={userEnabled ? 'notifications' : 'notifications-off'}
              size={28}
              color={userEnabled ? '#007AFF' : '#8E8E93'}
            />
            <View style={styles.masterToggleInfo}>
              <Text style={styles.masterToggleLabel}>Notifications</Text>
              <Text style={styles.masterToggleSubLabel}>{getNotificationStatusText()}</Text>
            </View>
            <Switch
              value={userEnabled}
              onValueChange={handleUserEnabledChange}
              trackColor={{ true: '#007AFF' }}
              disabled={permissionState === PermissionState.DENIED}
              accessibilityLabel="Notifications toggle"
            />
          </View>
        </View>
        {showSettings && (
          <Text style={styles.footerText}>
            Your hamster will send you gentle reminders to help you stay on track.
          </Text>
        )}
      </View>

      {/* Reminder Time Section */}
      {showSettings && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Reminder Time</Text>
          <View style={styles.card}>
            {[ReminderTimePeriod.MORNING, ReminderTimePeriod.AFTERNOON, ReminderTimePeriod.EVENING].map((period, index) => (
              <React.Fragment key={period}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.periodRow}
                  onPress={() => handlePeriodSelect(period)}
                  accessibilityLabel={`${PERIOD_INFO[period].displayName}: ${PERIOD_INFO[period].description}`}
                >
                  <Ionicons
                    name={PERIOD_INFO[period].icon}
                    size={22}
                    color="#007AFF"
                  />
                  <View style={styles.periodInfo}>
                    <Text style={styles.periodLabel}>{PERIOD_INFO[period].displayName}</Text>
                    <Text style={styles.periodDescription}>{PERIOD_INFO[period].description}</Text>
                  </View>
                  {reminderPeriod === period && (
                    <Ionicons name="checkmark" size={22} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}

            <View style={styles.separator} />

            {/* Custom Time */}
            <TouchableOpacity
              style={styles.periodRow}
              onPress={handleCustomTimePress}
              accessibilityLabel={`Custom time: ${formatTime(reminderHour, reminderMinute)}`}
            >
              <Ionicons name="time-outline" size={22} color="#007AFF" />
              <View style={styles.periodInfo}>
                <Text style={styles.periodLabel}>Custom Time</Text>
                {reminderPeriod === ReminderTimePeriod.CUSTOM && (
                  <Text style={styles.periodDescription}>
                    {formatTime(reminderHour, reminderMinute)}
                  </Text>
                )}
              </View>
              {reminderPeriod === ReminderTimePeriod.CUSTOM && (
                <Ionicons name="checkmark" size={22} color="#007AFF" />
              )}
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>
            We'll remind you at this time each day. You can always change it later.
          </Text>
        </View>
      )}

      {/* Reminder Types Section */}
      {showSettings && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Reminder Types</Text>
          <View style={styles.card}>
            {/* Daily Reminder */}
            <View style={styles.reminderTypeRow}>
              <Ionicons name="notifications" size={22} color="#007AFF" />
              <View style={styles.reminderTypeInfo}>
                <Text style={styles.reminderTypeLabel}>Daily Workout Reminder</Text>
                <Text style={styles.reminderTypeDescription}>
                  A gentle nudge at your preferred time
                </Text>
              </View>
              <Switch
                value={dailyReminderEnabled}
                onValueChange={handleDailyReminderChange}
                trackColor={{ true: '#007AFF' }}
                accessibilityLabel="Daily Workout Reminder toggle"
              />
            </View>

            <View style={styles.separator} />

            {/* Streak at Risk */}
            <View style={styles.reminderTypeRow}>
              <Ionicons name="flame" size={22} color="#FF9500" />
              <View style={styles.reminderTypeInfo}>
                <Text style={styles.reminderTypeLabel}>Streak at Risk</Text>
                <Text style={styles.reminderTypeDescription}>
                  Reminder before your streak resets
                </Text>
              </View>
              <Switch
                value={streakReminderEnabled}
                onValueChange={handleStreakReminderChange}
                trackColor={{ true: '#007AFF' }}
                accessibilityLabel="Streak at Risk Reminder toggle"
              />
            </View>

            <View style={styles.separator} />

            {/* Friend Nudges */}
            <View style={styles.reminderTypeRow}>
              <Ionicons name="hand-left" size={22} color="#AF52DE" />
              <View style={styles.reminderTypeInfo}>
                <Text style={styles.reminderTypeLabel}>Friend Nudges</Text>
                <Text style={styles.reminderTypeDescription}>
                  Encouragement from your friends
                </Text>
              </View>
              <Switch
                value={friendNudgesEnabled}
                onValueChange={handleFriendNudgesChange}
                trackColor={{ true: '#007AFF' }}
                accessibilityLabel="Friend Nudges toggle"
              />
            </View>
          </View>
          <Text style={styles.footerText}>
            All reminders are friendly and judgment-free. Your hamster just wants to help!
          </Text>
        </View>
      )}

      {/* Time Picker Modal - Simple hour/minute picker */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Custom Time</Text>
              <TouchableOpacity onPress={handleTimeSave}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Simple time selection */}
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Hour</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timePickerItem,
                        selectedTime.getHours() === i && styles.timePickerItemSelected,
                      ]}
                      onPress={() => {
                        const newTime = new Date(selectedTime);
                        newTime.setHours(i);
                        setSelectedTime(newTime);
                      }}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        selectedTime.getHours() === i && styles.timePickerItemTextSelected,
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={styles.timePickerColon}>:</Text>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Minute</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {[0, 15, 30, 45].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.timePickerItem,
                        selectedTime.getMinutes() === m && styles.timePickerItemSelected,
                      ]}
                      onPress={() => {
                        const newTime = new Date(selectedTime);
                        newTime.setMinutes(m);
                        setSelectedTime(newTime);
                      }}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        selectedTime.getMinutes() === m && styles.timePickerItemTextSelected,
                      ]}>
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={styles.modalFooter}>
              We'll remind you at this time each day.
            </Text>
          </View>
        </View>
      </Modal>
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C7C7CC',
    marginLeft: 48,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 18,
  },
  deniedBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deniedTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  deniedTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  deniedSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  openSettingsButton: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  openSettingsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 6,
  },
  masterToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  masterToggleInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  masterToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  masterToggleSubLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  periodInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  periodDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  reminderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  reminderTypeInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  reminderTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  reminderTypeDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalSave: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timePickerColumn: {
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  timePickerScroll: {
    height: 160,
    width: 80,
  },
  timePickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  timePickerItemSelected: {
    backgroundColor: '#007AFF',
  },
  timePickerItemText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  timePickerItemTextSelected: {
    color: '#fff',
  },
  timePickerColon: {
    fontSize: 32,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 24,
  },
  modalFooter: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
});
