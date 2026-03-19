/**
 * ProfileSettingsScreen.js - Simplified
 * Settings screen for editing fitness preferences
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAlert } from '../../context/AlertContext';
import Logger from '../../services/LoggerService';
import {
  FitnessLevel,
  FitnessLevelInfo,
  FitnessGoal,
  FitnessGoalInfo,
  WeekDay,
  WeekDayInfo,
  WEEK_DAYS_ORDERED,
  validateHamsterName,
  HAMSTER_NAME_MAX_LENGTH,
} from '../../models/UserProfile';

export default function ProfileSettingsScreen({ navigation }) {
  const { profile, updateProfile } = useUserProfile();
  const { showAlert } = useAlert();

  // Local editing state
  const [hamsterName, setHamsterName] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]);

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
    setWorkoutDays(profile.workoutDays || []);

    setTimeout(() => setHasUnsavedChanges(false), 100);
  };

  const isValidProfile = () => {
    if (!hamsterName || hamsterName.trim().length === 0) return false;
    const validation = validateHamsterName(hamsterName);
    if (!validation.valid) return false;
    if (!fitnessLevel) return false;
    if (fitnessGoals.length === 0) return false;
    if (workoutDays.length === 0) return false;
    return true;
  };

  const checkForChanges = () => {
    if (!profile) {
      setHasUnsavedChanges(true);
      return;
    }

    const changed =
      hamsterName !== (profile.hamsterName || '') ||
      fitnessLevel !== profile.fitnessLevel ||
      JSON.stringify(fitnessGoals.sort()) !== JSON.stringify((profile.fitnessGoals || []).sort()) ||
      JSON.stringify(workoutDays.sort()) !== JSON.stringify((profile.workoutDays || []).sort());

    setHasUnsavedChanges(changed);
  };

  const handleNameChange = (text) => {
    setHamsterName(text);
    const validation = validateHamsterName(text);
    setNameError(text.length > 0 && !validation.valid ? validation.error : null);
    checkForChanges();
  };

  const toggleGoal = (goal) => {
    setFitnessGoals((prev) => {
      const updated = prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal];
      setTimeout(checkForChanges, 0);
      return updated;
    });
  };

  const toggleDay = (day) => {
    setWorkoutDays((prev) => {
      const updated = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      setTimeout(checkForChanges, 0);
      return updated;
    });
  };

  const saveProfile = async () => {
    if (!isValidProfile()) return;

    setIsSaving(true);

    try {
      const updatedProfile = {
        ...profile,
        hamsterName: hamsterName.trim(),
        fitnessLevel,
        fitnessGoals,
        workoutDays,
        profileComplete: true,
        profileVersion: 2,
      };

      await updateProfile(updatedProfile);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setHasUnsavedChanges(false);

      showAlert(
        'Changes Saved!',
        'Your profile has been updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Logger.warn('Failed to save profile:', e);
      showAlert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hamster Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Hamster</Text>
          <View style={styles.card}>
            <View style={styles.hamsterRow}>
              <View style={styles.hamsterIcon}>
                <Ionicons name="paw" size={24} color="#FF9500" />
              </View>
              <View style={styles.hamsterInputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.hamsterInput}
                  value={hamsterName}
                  onChangeText={handleNameChange}
                  placeholder="Hamster name"
                  placeholderTextColor="#A0968E"
                  maxLength={HAMSTER_NAME_MAX_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {nameError && <Text style={styles.errorText}>{nameError}</Text>}
              </View>
            </View>
          </View>
        </View>

        {/* Fitness Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Fitness Level</Text>
          <View style={styles.card}>
            {Object.values(FitnessLevel).map((level, index) => (
              <React.Fragment key={level}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setFitnessLevel(level);
                    setTimeout(checkForChanges, 0);
                  }}
                >
                  <Ionicons
                    name={FitnessLevelInfo[level].icon}
                    size={22}
                    color="#FF9500"
                    style={styles.optionIcon}
                  />
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{FitnessLevelInfo[level].displayName}</Text>
                    <Text style={styles.optionDescription}>{FitnessLevelInfo[level].description}</Text>
                  </View>
                  {fitnessLevel === level && (
                    <Ionicons name="checkmark" size={22} color="#FF9500" />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Fitness Goals</Text>
          <View style={styles.card}>
            {Object.values(FitnessGoal).map((goal, index) => (
              <React.Fragment key={goal}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => toggleGoal(goal)}
                >
                  <Ionicons
                    name={FitnessGoalInfo[goal].icon}
                    size={22}
                    color="#FF9500"
                    style={styles.optionIcon}
                  />
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{FitnessGoalInfo[goal].displayName}</Text>
                    <Text style={styles.optionDescription}>{FitnessGoalInfo[goal].description}</Text>
                  </View>
                  <Ionicons
                    name={fitnessGoals.includes(goal) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={fitnessGoals.includes(goal) ? '#FF9500' : '#C4B8AE'}
                  />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.footerText}>Select all that apply.</Text>
        </View>

        {/* Workout Days Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Workout Days</Text>
          <View style={styles.card}>
            <View style={styles.daysGrid}>
              {WEEK_DAYS_ORDERED.map((day) => {
                const isSelected = workoutDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayLetter, isSelected && styles.dayLetterSelected]}>
                      {WeekDayInfo[day].letter}
                    </Text>
                    <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                      {WeekDayInfo[day].short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.daysCount}>
              {workoutDays.length} day{workoutDays.length !== 1 ? 's' : ''} per week
            </Text>
          </View>
          <Text style={styles.footerText}>
            This helps us plan your weekly schedule and send reminders.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
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
            <ActivityIndicator size="large" color="#FF9500" />
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
    backgroundColor: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5DDD5',
    marginLeft: 16,
  },
  // Hamster
  hamsterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  hamsterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,149,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamsterInputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: '#6B5D52',
    marginBottom: 4,
  },
  hamsterInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 4,
    color: '#4A3728',
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 4,
  },
  // Options
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
    color: '#4A3728',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  footerText: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 8,
    marginHorizontal: 16,
  },
  // Days Grid
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  dayButton: {
    width: 40,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F5EDE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#FF9500',
  },
  dayLetter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  dayLetterSelected: {
    color: '#fff',
  },
  dayName: {
    fontSize: 10,
    color: '#6B5D52',
    marginTop: 2,
  },
  dayNameSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  daysCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B5D52',
    paddingBottom: 14,
  },
  // Save Button
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF8F0',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5DDD5',
  },
  saveButton: {
    backgroundColor: '#8B5A2B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C4B8AE',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  // Saving Overlay
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
    color: '#6B5D52',
    marginTop: 16,
  },
});
