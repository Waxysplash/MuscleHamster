// Onboarding Screen - Simplified Flow
// Steps: Age Gate → Fitness Level → Goals → Workout Days → Hamster Name
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StoryButton } from '../../components/ui/Story';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAlert } from '../../context/AlertContext';
import { useResponsive } from '../../utils/responsive';
import { logOnboardingComplete } from '../../services/AnalyticsService';
import {
  FitnessLevel,
  FitnessLevelInfo,
  FitnessGoal,
  FitnessGoalInfo,
  WeekDay,
  WeekDayInfo,
  WEEK_DAYS_ORDERED,
  validateHamsterName,
  HAMSTER_NAME_SUGGESTIONS,
  HAMSTER_NAME_MAX_LENGTH,
  createEmptyProfile,
} from '../../models/UserProfile';

// Onboarding steps
const STEPS = ['ageGate', 'fitnessLevel', 'goals', 'workoutDays', 'hamsterName'];

const STEP_TITLES = {
  ageGate: 'Before we begin...',
  fitnessLevel: "What's your fitness level?",
  goals: 'What are your goals?',
  workoutDays: 'Which days could you try?',
  hamsterName: 'Name your hamster!',
};

const STEP_DESCRIPTIONS = {
  ageGate: 'Muscle Hamster is designed for users 9 years and older.',
  fitnessLevel: "No judgment! This helps us find the right workouts for you.",
  goals: 'Select all that apply. You can change these anytime.',
  workoutDays: 'Pick the days you might move. Any number is fine, and you can change them later.',
  hamsterName: 'What should we call your new fitness buddy?',
};

export default function OnboardingScreen({ navigation }) {
  const { saveOnboardingProgress, onboardingProgress, completeOnboarding } = useUserProfile();
  const { showAlert } = useAlert();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(createEmptyProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Restore progress on mount
  useEffect(() => {
    if (onboardingProgress) {
      setCurrentStep(onboardingProgress.step || 0);
      // Ensure restored profile has all required fields with proper defaults
      const restoredProfile = onboardingProgress.profile || {};
      setProfile({
        ...createEmptyProfile(),
        ...restoredProfile,
        // Ensure arrays are always arrays (not undefined/null)
        fitnessGoals: Array.isArray(restoredProfile.fitnessGoals) ? restoredProfile.fitnessGoals : [],
        workoutDays: Array.isArray(restoredProfile.workoutDays) ? restoredProfile.workoutDays : [],
      });
      setAgeConfirmed(onboardingProgress.ageConfirmed || false);
    }
  }, []);

  // Save progress when profile changes
  useEffect(() => {
    if (currentStep > 0 || ageConfirmed) {
      saveOnboardingProgress({ step: currentStep, profile, ageConfirmed });
    }
  }, [currentStep, profile, ageConfirmed]);

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const step = STEPS[currentStep];
    switch (step) {
      case 'ageGate':
        return ageConfirmed;
      case 'fitnessLevel':
        return profile.fitnessLevel !== null;
      case 'goals':
        return (profile.fitnessGoals || []).length > 0;
      case 'workoutDays':
        return (profile.workoutDays || []).length > 0;
      case 'hamsterName':
        return validateHamsterName(profile.hamsterName || '').valid;
      default:
        return false;
    }
  };

  const goNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      setIsSaving(true);
      try {
        const finalProfile = {
          ...profile,
          profileComplete: true,
          profileVersion: 2,
        };
        await completeOnboarding(finalProfile);
        logOnboardingComplete();
        // Navigation is handled automatically by RootNavigator
      } catch (e) {
        showAlert('Oops!', 'Something went wrong. Please try again.');
        setIsSaving(false);
      }
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getButtonText = () => {
    if (currentStep === STEPS.length - 1) return "Let's Get Started!";
    return 'Continue';
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    switch (step) {
      case 'ageGate':
        return <AgeGateStep ageConfirmed={ageConfirmed} setAgeConfirmed={setAgeConfirmed} />;
      case 'fitnessLevel':
        return <FitnessLevelStep profile={profile} updateProfile={updateProfile} />;
      case 'goals':
        return <GoalsStep profile={profile} updateProfile={updateProfile} />;
      case 'workoutDays':
        return <WorkoutDaysStep profile={profile} updateProfile={updateProfile} />;
      case 'hamsterName':
        return (
          <HamsterNameStep
            profile={profile}
            updateProfile={updateProfile}
            nameError={nameError}
            setNameError={setNameError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {STEPS.length}
        </Text>
      </View>

      {/* Back Button */}
      {currentStep > 0 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#8B5A2B" />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.title}>{STEP_TITLES[STEPS[currentStep]]}</Text>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isTablet && { alignItems: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.stepContentWrapper,
            isTablet && { maxWidth: contentMaxWidth, width: '100%' },
          ]}
        >
          <Text style={styles.stepDescription}>
            {STEP_DESCRIPTIONS[STEPS[currentStep]]}
          </Text>
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View
        style={[
          styles.footer,
          isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
      >
        {isSaving ? (
          <ActivityIndicator color="#4A3728" style={{ minHeight: 54 }} />
        ) : (
          <StoryButton
            title={getButtonText()}
            onPress={goNext}
            disabled={!canProceed()}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================

function AgeGateStep({ ageConfirmed, setAgeConfirmed }) {
  return (
    <View style={styles.stepContent}>
      <TouchableOpacity
        style={[styles.ageGateOption, ageConfirmed && styles.ageGateOptionSelected]}
        onPress={() => setAgeConfirmed(!ageConfirmed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: ageConfirmed }}
      >
        <View style={[styles.checkbox, ageConfirmed && styles.checkboxSelected]}>
          {ageConfirmed && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
        <Text style={styles.ageGateText}>I am 9 years or older</Text>
      </TouchableOpacity>
    </View>
  );
}

function FitnessLevelStep({ profile, updateProfile }) {
  return (
    <View style={styles.stepContent}>
      {Object.values(FitnessLevel).map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.optionCard,
            profile.fitnessLevel === level && styles.optionCardSelected,
          ]}
          onPress={() => updateProfile('fitnessLevel', level)}
          accessibilityState={{ selected: profile.fitnessLevel === level }}
        >
          <Ionicons
            name={FitnessLevelInfo[level].icon}
            size={28}
            color={profile.fitnessLevel === level ? '#FF9500' : '#8B5A2B'}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{FitnessLevelInfo[level].displayName}</Text>
            <Text style={styles.optionDescription}>{FitnessLevelInfo[level].description}</Text>
          </View>
          {profile.fitnessLevel === level && (
            <Ionicons name="checkmark-circle" size={24} color="#FF9500" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function GoalsStep({ profile, updateProfile }) {
  // Ensure fitnessGoals is always an array
  const currentGoals = profile?.fitnessGoals || [];

  const toggleGoal = (goal) => {
    const goals = currentGoals.includes(goal)
      ? currentGoals.filter((g) => g !== goal)
      : [...currentGoals, goal];
    updateProfile('fitnessGoals', goals);
  };

  const isSelected = (goal) => currentGoals.includes(goal);

  return (
    <View style={styles.stepContent}>
      <View style={styles.goalsGrid}>
        {Object.values(FitnessGoal).map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalCard,
              isSelected(goal) && styles.goalCardSelected,
            ]}
            onPress={() => toggleGoal(goal)}
            accessibilityState={{ selected: isSelected(goal) }}
          >
            <Ionicons
              name={FitnessGoalInfo[goal].icon}
              size={32}
              color={isSelected(goal) ? '#FF9500' : '#8B5A2B'}
            />
            <Text
              style={[
                styles.goalText,
                isSelected(goal) && styles.goalTextSelected,
              ]}
            >
              {FitnessGoalInfo[goal].displayName}
            </Text>
            <Text style={styles.goalDescription}>
              {FitnessGoalInfo[goal].description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function WorkoutDaysStep({ profile, updateProfile }) {
  // Ensure workoutDays is always an array
  const currentDays = profile?.workoutDays || [];

  const toggleDay = (day) => {
    const days = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    updateProfile('workoutDays', days);
  };

  const getMessage = () => {
    const count = currentDays.length;
    if (count === 0) return 'Select at least one day';
    if (count <= 2) return 'Starting small is smart!';
    if (count <= 4) return 'A balanced approach!';
    if (count <= 5) return "You're dedicated!";
    return 'Remember rest days are important too!';
  };

  return (
    <View style={styles.stepContent}>
      <View style={styles.daysContainer}>
        {WEEK_DAYS_ORDERED.map((day) => {
          const isSelected = currentDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => toggleDay(day)}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.dayLetter, isSelected && styles.dayLetterSelected]}>
                {WeekDayInfo[day].letter}
              </Text>
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {WeekDayInfo[day].short}
              </Text>
              {isSelected && (
                <View style={styles.dayCheck}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.daysMessage}>{getMessage()}</Text>
      <Text style={styles.daysCount}>
        {currentDays.length} day{currentDays.length !== 1 ? 's' : ''} selected
      </Text>
    </View>
  );
}

function HamsterNameStep({ profile, updateProfile, nameError, setNameError }) {
  const handleNameChange = (text) => {
    updateProfile('hamsterName', text);
    const validation = validateHamsterName(text);
    setNameError(validation.valid ? null : validation.error);
  };

  return (
    <View style={styles.stepContent}>
      <TextInput
        style={[styles.nameInput, nameError && styles.nameInputError]}
        value={profile.hamsterName || ''}
        onChangeText={handleNameChange}
        placeholder="Enter a name"
        placeholderTextColor="#A89585"
        maxLength={HAMSTER_NAME_MAX_LENGTH}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
      />
      <Text style={styles.characterCount}>
        {(profile.hamsterName || '').length}/{HAMSTER_NAME_MAX_LENGTH}
      </Text>
      {nameError && <Text style={styles.errorText}>{nameError}</Text>}

      <Text style={styles.suggestionsLabel}>Need inspiration?</Text>
      <View style={styles.suggestionsContainer}>
        {HAMSTER_NAME_SUGGESTIONS.map((name) => (
          <TouchableOpacity
            key={name}
            style={styles.suggestionChip}
            onPress={() => handleNameChange(name)}
          >
            <Text style={styles.suggestionText}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4E6',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  progressBar: {
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#4A3728',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontFamily: 'Quicksand_700Bold', fontSize: 28,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    color: '#4A3728',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContentWrapper: {
    width: '100%',
  },
  stepContent: {
    paddingTop: 10,
  },
  stepDescription: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Age Gate
  ageGateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF2E5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageGateOptionSelected: {
    backgroundColor: 'rgba(255,149,0,0.1)',
    borderColor: '#FF9500',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D4C4B0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxSelected: {
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    borderColor: '#FF9500',
  },
  ageGateText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#4A3728',
  },
  // Options
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: '#4A3728',
  },
  optionCardSelected: {
    backgroundColor: '#FFE3B8',
    shadowColor: '#4A3728',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#4A3728',
  },
  optionDescription: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Goals Grid
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: '#4A3728',
  },
  goalCardSelected: {
    backgroundColor: '#FFE3B8',
    shadowColor: '#4A3728',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  goalText: {
    marginTop: 8,
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#4A3728',
    textAlign: 'center',
  },
  goalTextSelected: {
    color: '#A65000',
  },
  goalDescription: {
    fontFamily: 'Nunito_400Regular', fontSize: 12,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 4,
  },
  // Workout Days
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCard: {
    width: 44,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#4A3728',
  },
  dayCardSelected: {
    backgroundColor: '#FF9500',
  },
  dayLetter: {
    fontFamily: 'Quicksand_700Bold', fontSize: 20,
    color: '#8B5A2B',
  },
  dayLetterSelected: {
    color: '#4A3728',
  },
  dayName: {
    fontFamily: 'Nunito_400Regular', fontSize: 11,
    color: '#6B5D52',
    marginTop: 2,
  },
  dayNameSelected: {
    color: '#4A3728',
  },
  dayCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysMessage: {
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
  },
  daysCount: {
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
  },
  // Name Input
  nameInput: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#4A3728',
    color: '#4A3728',
  },
  nameInputError: {
    borderColor: '#C0392B',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
  },
  suggestionsLabel: {
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: '#4A3728',
    margin: 4,
  },
  suggestionText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#8B5A2B',
  },
  errorText: {
    color: '#C0392B',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Nunito_400Regular', fontSize: 14,
  },
  // Footer
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D4C4B0',
  },
  continueButtonText: {
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
  },
});
