/**
 * ProfileSettingsScreen.js
 * MuscleHamster Expo
 *
 * Settings screen for editing user profile and fitness preferences
 * Ported from Phase 03.3: Persist and edit profile in settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '../../context/UserProfileContext';
import {
  FitnessLevel,
  FitnessLevelInfo,
  FitnessGoal,
  FitnessGoalInfo,
  SchedulePreference,
  SchedulePreferenceInfo,
  WorkoutTime,
  WorkoutTimeInfo,
  FitnessIntent,
  FitnessIntentInfo,
  validateHamsterName,
  HAMSTER_NAME_MAX_LENGTH,
} from '../../models/UserProfile';

export default function ProfileSettingsScreen({ navigation }) {
  const { profile, updateProfile, isProfileComplete } = useUserProfile();

  // Local editing state
  const [hamsterName, setHamsterName] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [weeklyWorkoutGoal, setWeeklyWorkoutGoal] = useState(3);
  const [schedulePreference, setSchedulePreference] = useState(null);
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState(null);
  const [fitnessIntent, setFitnessIntent] = useState(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [nameError, setNameError] = useState(null);

  // Load profile on mount
  useFocusEffect(
    useCallback(() => {
      loadCurrentProfile();
    }, [profile])
  );

  const loadCurrentProfile = () => {
    if (!profile) return;

    setHamsterName(profile.hamsterName || '');
    setFitnessLevel(profile.fitnessLevel);
    setFitnessGoals(profile.fitnessGoals || []);
    setWeeklyWorkoutGoal(profile.weeklyWorkoutGoal || 3);
    setSchedulePreference(profile.schedulePreference);
    setPreferredWorkoutTime(profile.preferredWorkoutTime);
    setFitnessIntent(profile.fitnessIntent);

    // Reset change tracking after loading
    setTimeout(() => setHasUnsavedChanges(false), 100);
  };

  // Validate profile
  const isValidProfile = () => {
    if (!hamsterName || hamsterName.trim().length === 0) return false;
    const validation = validateHamsterName(hamsterName);
    if (!validation.valid) return false;
    if (!fitnessLevel) return false;
    if (fitnessGoals.length === 0) return false;
    if (weeklyWorkoutGoal < 1 || weeklyWorkoutGoal > 7) return false;
    if (!schedulePreference) return false;
    if (!preferredWorkoutTime) return false;
    if (!fitnessIntent) return false;
    return true;
  };

  // Check for changes
  const checkForChanges = () => {
    if (!profile) {
      setHasUnsavedChanges(true);
      return;
    }

    const changed =
      hamsterName !== (profile.hamsterName || '') ||
      fitnessLevel !== profile.fitnessLevel ||
      JSON.stringify(fitnessGoals.sort()) !== JSON.stringify((profile.fitnessGoals || []).sort()) ||
      weeklyWorkoutGoal !== (profile.weeklyWorkoutGoal || 3) ||
      schedulePreference !== profile.schedulePreference ||
      preferredWorkoutTime !== profile.preferredWorkoutTime ||
      fitnessIntent !== profile.fitnessIntent;

    setHasUnsavedChanges(changed);
  };

  // Handle name change
  const handleNameChange = (text) => {
    setHamsterName(text);
    const validation = validateHamsterName(text);
    setNameError(text.length > 0 && !validation.valid ? validation.error : null);
    checkForChanges();
  };

  // Toggle goal selection
  const toggleGoal = (goal) => {
    setFitnessGoals((prev) => {
      if (prev.includes(goal)) {
        return prev.filter((g) => g !== goal);
      }
      return [...prev, goal];
    });
    setTimeout(checkForChanges, 0);
  };

  // Save profile
  const saveProfile = async () => {
    if (!isValidProfile()) return;

    setIsSaving(true);

    try {
      const updatedProfile = {
        ...profile,
        hamsterName: hamsterName.trim(),
        fitnessLevel,
        fitnessGoals,
        weeklyWorkoutGoal,
        schedulePreference,
        preferredWorkoutTime,
        fitnessIntent,
        profileComplete: true,
      };

      await updateProfile(updatedProfile);

      // Brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      setHasUnsavedChanges(false);

      Alert.alert(
        'Changes Saved!',
        'Your profile has been updated. Your workout recommendations will reflect these changes.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.warn('Failed to save profile:', e);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fitness level options
  const fitnessLevelOptions = Object.values(FitnessLevel);
  const fitnessGoalOptions = Object.values(FitnessGoal);
  const scheduleOptions = Object.values(SchedulePreference);
  const workoutTimeOptions = Object.values(WorkoutTime);
  const intentOptions = Object.values(FitnessIntent);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoBannerText}>
            Changes to your profile will update your workout recommendations and reminders.
          </Text>
        </View>

        {/* Hamster Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Hamster</Text>
          <View style={styles.card}>
            <View style={styles.hamsterRow}>
              <View style={styles.hamsterIcon}>
                <Ionicons name="paw" size={24} color="#007AFF" />
              </View>
              <View style={styles.hamsterInputContainer}>
                <Text style={styles.inputLabel}>Your Hamster</Text>
                <TextInput
                  style={styles.hamsterInput}
                  value={hamsterName}
                  onChangeText={handleNameChange}
                  placeholder="Hamster name"
                  maxLength={HAMSTER_NAME_MAX_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {nameError && <Text style={styles.errorText}>{nameError}</Text>}
                <Text style={styles.charCount}>
                  {hamsterName.length}/{HAMSTER_NAME_MAX_LENGTH} characters
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fitness Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Fitness Level</Text>
          <View style={styles.card}>
            {fitnessLevelOptions.map((level, index) => (
              <React.Fragment key={level}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setFitnessLevel(level);
                    setTimeout(checkForChanges, 0);
                  }}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{FitnessLevelInfo[level].displayName}</Text>
                    <Text style={styles.optionDescription}>{FitnessLevelInfo[level].description}</Text>
                  </View>
                  {fitnessLevel === level && (
                    <Ionicons name="checkmark" size={22} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.footerText}>
            This helps us pick workouts that match your experience.
          </Text>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Fitness Goals</Text>
          <View style={styles.card}>
            {fitnessGoalOptions.map((goal, index) => (
              <React.Fragment key={goal}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => toggleGoal(goal)}
                >
                  <Ionicons
                    name={FitnessGoalInfo[goal].icon}
                    size={22}
                    color="#007AFF"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionLabel}>{FitnessGoalInfo[goal].displayName}</Text>
                  <View style={styles.checkboxContainer}>
                    <Ionicons
                      name={fitnessGoals.includes(goal) ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={fitnessGoals.includes(goal) ? '#007AFF' : '#C7C7CC'}
                    />
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.footerText}>
            Select all that apply. We'll recommend workouts that help you reach these goals.
          </Text>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Schedule</Text>
          <View style={styles.card}>
            {/* Weekly Goal */}
            <View style={styles.weeklyGoalRow}>
              <Text style={styles.weeklyGoalLabel}>Weekly Workout Goal</Text>
              <View style={styles.dayButtons}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      weeklyWorkoutGoal === day && styles.dayButtonSelected,
                    ]}
                    onPress={() => {
                      setWeeklyWorkoutGoal(day);
                      setTimeout(checkForChanges, 0);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        weeklyWorkoutGoal === day && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.weeklyGoalSubtext}>
                {weeklyWorkoutGoal} workout{weeklyWorkoutGoal === 1 ? '' : 's'} per week
              </Text>
            </View>

            <View style={styles.separator} />

            {/* Schedule Preference */}
            {scheduleOptions.map((pref, index) => (
              <React.Fragment key={pref}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setSchedulePreference(pref);
                    setTimeout(checkForChanges, 0);
                  }}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{SchedulePreferenceInfo[pref].displayName}</Text>
                    <Text style={styles.optionDescription}>{SchedulePreferenceInfo[pref].description}</Text>
                  </View>
                  {schedulePreference === pref && (
                    <Ionicons name="checkmark" size={22} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}

            <View style={[styles.separator, { marginTop: 8 }]} />

            {/* Preferred Workout Time */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Preferred Workout Time</Text>
              {workoutTimeOptions.map((time, index) => (
                <React.Fragment key={time}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={styles.timeRow}
                    onPress={() => {
                      setPreferredWorkoutTime(time);
                      setTimeout(checkForChanges, 0);
                    }}
                  >
                    <Ionicons
                      name={WorkoutTimeInfo[time].icon}
                      size={22}
                      color="#007AFF"
                      style={styles.optionIcon}
                    />
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionLabel}>{WorkoutTimeInfo[time].displayName}</Text>
                      <Text style={styles.optionDescription}>{WorkoutTimeInfo[time].description}</Text>
                    </View>
                    {preferredWorkoutTime === time && (
                      <Ionicons name="checkmark" size={22} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
          <Text style={styles.footerText}>
            We'll use this to plan your workout days and send reminders at the right time.
          </Text>
        </View>

        {/* Focus Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Focus</Text>
          <View style={styles.card}>
            {intentOptions.map((intent, index) => (
              <React.Fragment key={intent}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setFitnessIntent(intent);
                    setTimeout(checkForChanges, 0);
                  }}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{FitnessIntentInfo[intent].displayName}</Text>
                    <Text style={styles.optionDescription}>{FitnessIntentInfo[intent].description}</Text>
                  </View>
                  {fitnessIntent === intent && (
                    <Ionicons name="checkmark" size={22} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.footerText}>
            Maintain keeps things steady. Improve gradually increases intensity over time.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button (Fixed at bottom) */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isValidProfile() || !hasUnsavedChanges || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={saveProfile}
          disabled={!isValidProfile() || !hasUnsavedChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Saving Overlay */}
      <Modal visible={isSaving} transparent animationType="fade">
        <View style={styles.savingOverlay}>
          <View style={styles.savingModal}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoBannerText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
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
    marginLeft: 16,
  },
  hamsterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  hamsterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamsterInputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  hamsterInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  weeklyGoalRow: {
    padding: 14,
  },
  weeklyGoalLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  dayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  weeklyGoalSubtext: {
    fontSize: 13,
    color: '#8E8E93',
  },
  subSection: {
    paddingTop: 8,
  },
  subSectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 18,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C7C7CC',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  savingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  savingText: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 16,
  },
});
