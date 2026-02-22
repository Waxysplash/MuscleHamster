// Onboarding Screen - Phase 03 (Simplified MVP)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  HAMSTER_NAME_SUGGESTIONS,
  HAMSTER_NAME_MAX_LENGTH,
  createEmptyProfile,
} from '../../models/UserProfile';
import FeatureFlags from '../../config/FeatureFlags';

// Full onboarding steps
const FULL_STEPS = [
  'age',
  'fitnessLevel',
  'goals',
  'frequency',
  'schedule',
  'time',
  'intent',
  'hamsterName',
  'meetHamster',
];

// Simplified MVP steps (just age gate + name hamster)
const SIMPLIFIED_STEPS = [
  'ageGate',
  'hamsterName',
  'meetHamster',
];

// Get active steps based on feature flag
const getActiveSteps = () => {
  return FeatureFlags.simplifiedOnboarding ? SIMPLIFIED_STEPS : FULL_STEPS;
};

const STEPS = getActiveSteps();

const STEP_TITLES = {
  ageGate: 'Before we begin...',
  age: "Let's get to know you!",
  fitnessLevel: 'What\'s your fitness level?',
  goals: 'What are your goals?',
  frequency: 'How often do you want to work out?',
  schedule: 'Fixed or flexible schedule?',
  time: 'When do you prefer to exercise?',
  intent: 'Maintain or improve?',
  hamsterName: 'Name your hamster!',
  meetHamster: 'Meet your hamster!',
};

// Enable skip button for development/testing
const DEV_SKIP_ENABLED = __DEV__;

export default function OnboardingScreen({ navigation }) {
  const { saveOnboardingProgress, onboardingProgress, completeOnboarding } = useUserProfile();

  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(createEmptyProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Get active steps (may change based on feature flag)
  const activeSteps = FeatureFlags.simplifiedOnboarding ? SIMPLIFIED_STEPS : FULL_STEPS;

  // Restore progress on mount
  useEffect(() => {
    if (onboardingProgress) {
      setCurrentStep(onboardingProgress.step || 0);
      setProfile(onboardingProgress.profile || createEmptyProfile());
    }
  }, []);

  // Save progress when profile changes
  useEffect(() => {
    if (currentStep > 0 || Object.values(profile).some(v => v !== null && v !== 0)) {
      saveOnboardingProgress({ step: currentStep, profile });
    }
  }, [currentStep, profile]);

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const step = activeSteps[currentStep];
    switch (step) {
      case 'ageGate':
        return ageConfirmed;
      case 'age':
        return profile.age && profile.age >= 13 && profile.age <= 120;
      case 'fitnessLevel':
        return profile.fitnessLevel !== null;
      case 'goals':
        return profile.fitnessGoals.length > 0;
      case 'frequency':
        return profile.weeklyWorkoutGoal >= 1 && profile.weeklyWorkoutGoal <= 7;
      case 'schedule':
        return profile.schedulePreference !== null;
      case 'time':
        return profile.preferredWorkoutTime !== null;
      case 'intent':
        return profile.fitnessIntent !== null;
      case 'hamsterName':
        const validation = validateHamsterName(profile.hamsterName);
        return validation.valid;
      case 'meetHamster':
        return true;
      default:
        return false;
    }
  };

  const goNext = async () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      setIsSaving(true);
      try {
        // Apply default values for simplified onboarding
        const finalProfile = FeatureFlags.simplifiedOnboarding
          ? applySimplifiedDefaults(profile)
          : profile;
        await completeOnboarding(finalProfile);
        navigation.replace('Main');
      } catch (e) {
        Alert.alert('Oops!', 'Something went wrong. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Apply default values when using simplified onboarding
  const applySimplifiedDefaults = (p) => ({
    ...p,
    age: p.age || 18,
    fitnessLevel: p.fitnessLevel || FitnessLevel.BEGINNER,
    fitnessGoals: p.fitnessGoals.length > 0 ? p.fitnessGoals : [FitnessGoal.GENERAL],
    weeklyWorkoutGoal: p.weeklyWorkoutGoal || 3,
    schedulePreference: p.schedulePreference || SchedulePreference.FLEXIBLE,
    preferredWorkoutTime: p.preferredWorkoutTime || WorkoutTime.NO_PREFERENCE,
    fitnessIntent: p.fitnessIntent || FitnessIntent.MAINTAIN,
  });

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Skip onboarding with default values (dev/testing only)
  const handleSkipOnboarding = async () => {
    if (!DEV_SKIP_ENABLED) return;

    setIsSaving(true);
    try {
      const defaultProfile = {
        ...createEmptyProfile(),
        age: 25,
        fitnessLevel: FitnessLevel.BEGINNER,
        fitnessGoals: [FitnessGoal.GENERAL],
        weeklyWorkoutGoal: 3,
        schedulePreference: SchedulePreference.FLEXIBLE,
        preferredWorkoutTime: WorkoutTime.MORNING,
        fitnessIntent: FitnessIntent.MAINTAIN,
        hamsterName: 'Hammy',
      };
      await completeOnboarding(defaultProfile);
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('Oops!', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    const step = activeSteps[currentStep];

    switch (step) {
      case 'ageGate':
        return <AgeGateStep ageConfirmed={ageConfirmed} setAgeConfirmed={setAgeConfirmed} />;
      case 'age':
        return <AgeStep profile={profile} updateProfile={updateProfile} />;
      case 'fitnessLevel':
        return <FitnessLevelStep profile={profile} updateProfile={updateProfile} />;
      case 'goals':
        return <GoalsStep profile={profile} updateProfile={updateProfile} />;
      case 'frequency':
        return <FrequencyStep profile={profile} updateProfile={updateProfile} />;
      case 'schedule':
        return <ScheduleStep profile={profile} updateProfile={updateProfile} />;
      case 'time':
        return <TimeStep profile={profile} updateProfile={updateProfile} />;
      case 'intent':
        return <IntentStep profile={profile} updateProfile={updateProfile} />;
      case 'hamsterName':
        return (
          <HamsterNameStep
            profile={profile}
            updateProfile={updateProfile}
            nameError={nameError}
            setNameError={setNameError}
          />
        );
      case 'meetHamster':
        return <MeetHamsterStep profile={profile} />;
      default:
        return null;
    }
  };

  const getButtonText = () => {
    const step = activeSteps[currentStep];
    if (step === 'ageGate') return 'Continue';
    if (step === 'hamsterName') return 'Meet Your Hamster';
    if (step === 'meetHamster') return "Let's Get Started!";
    return 'Continue';
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
              { width: `${((currentStep + 1) / activeSteps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {activeSteps.length}
        </Text>
      </View>

      {/* Back Button */}
      {currentStep > 0 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}

      {/* Skip Button (Dev/Testing only) */}
      {DEV_SKIP_ENABLED && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipOnboarding}
          disabled={isSaving}
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.title}>{STEP_TITLES[activeSteps[currentStep]]}</Text>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !canProceed() && styles.continueButtonDisabled]}
          onPress={goNext}
          disabled={!canProceed() || isSaving}
          accessibilityLabel={getButtonText()}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Step Components

// Simplified age gate (just a checkbox confirming 13+)
function AgeGateStep({ ageConfirmed, setAgeConfirmed }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Muscle Hamster is designed for users 13 years and older.
      </Text>
      <TouchableOpacity
        style={[styles.ageGateOption, ageConfirmed && styles.ageGateOptionSelected]}
        onPress={() => setAgeConfirmed(!ageConfirmed)}
        accessibilityLabel="I am 13 years or older"
        accessibilityState={{ checked: ageConfirmed }}
        accessibilityRole="checkbox"
      >
        <View style={[styles.checkbox, ageConfirmed && styles.checkboxSelected]}>
          {ageConfirmed && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
        <Text style={styles.ageGateText}>I am 13 years or older</Text>
      </TouchableOpacity>
    </View>
  );
}

function AgeStep({ profile, updateProfile }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        We'll use this to personalize your workouts.
      </Text>
      <View style={styles.ageInputContainer}>
        <TextInput
          style={styles.ageInput}
          value={profile.age?.toString() || ''}
          onChangeText={(text) => {
            const age = parseInt(text, 10);
            updateProfile('age', isNaN(age) ? null : age);
          }}
          keyboardType="number-pad"
          placeholder="Age"
          maxLength={3}
          accessibilityLabel="Enter your age"
        />
      </View>
      {profile.age && profile.age < 13 && (
        <Text style={styles.errorText}>You must be 13 or older to use this app.</Text>
      )}
    </View>
  );
}

function FitnessLevelStep({ profile, updateProfile }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        No judgment here! This helps us find the right workouts for you.
      </Text>
      {Object.values(FitnessLevel).map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.optionCard,
            profile.fitnessLevel === level && styles.optionCardSelected,
          ]}
          onPress={() => updateProfile('fitnessLevel', level)}
          accessibilityLabel={FitnessLevelInfo[level].displayName}
          accessibilityState={{ selected: profile.fitnessLevel === level }}
        >
          <Ionicons
            name={FitnessLevelInfo[level].icon}
            size={28}
            color={profile.fitnessLevel === level ? '#007AFF' : '#8E8E93'}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{FitnessLevelInfo[level].displayName}</Text>
            <Text style={styles.optionDescription}>{FitnessLevelInfo[level].description}</Text>
          </View>
          {profile.fitnessLevel === level && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function GoalsStep({ profile, updateProfile }) {
  const toggleGoal = (goal) => {
    const goals = profile.fitnessGoals.includes(goal)
      ? profile.fitnessGoals.filter((g) => g !== goal)
      : [...profile.fitnessGoals, goal];
    updateProfile('fitnessGoals', goals);
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Select all that apply. You can change these later!
      </Text>
      <View style={styles.goalsGrid}>
        {Object.values(FitnessGoal).map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalCard,
              profile.fitnessGoals.includes(goal) && styles.goalCardSelected,
            ]}
            onPress={() => toggleGoal(goal)}
            accessibilityLabel={FitnessGoalInfo[goal].displayName}
            accessibilityState={{ selected: profile.fitnessGoals.includes(goal) }}
          >
            <Ionicons
              name={FitnessGoalInfo[goal].icon}
              size={32}
              color={profile.fitnessGoals.includes(goal) ? '#007AFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.goalText,
                profile.fitnessGoals.includes(goal) && styles.goalTextSelected,
              ]}
            >
              {FitnessGoalInfo[goal].displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FrequencyStep({ profile, updateProfile }) {
  const days = [1, 2, 3, 4, 5, 6, 7];

  const getMessage = () => {
    const goal = profile.weeklyWorkoutGoal;
    if (goal <= 2) return 'Starting small is smart! 💪';
    if (goal <= 4) return 'A balanced approach! Nice!';
    if (goal <= 5) return 'You\'re dedicated! 🌟';
    return 'Wow, go you! Remember rest days are important too!';
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        How many days per week do you want to work out?
      </Text>
      <View style={styles.frequencyContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              profile.weeklyWorkoutGoal === day && styles.dayButtonSelected,
            ]}
            onPress={() => updateProfile('weeklyWorkoutGoal', day)}
            accessibilityLabel={`${day} days per week`}
            accessibilityState={{ selected: profile.weeklyWorkoutGoal === day }}
          >
            <Text
              style={[
                styles.dayButtonText,
                profile.weeklyWorkoutGoal === day && styles.dayButtonTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.frequencyMessage}>{getMessage()}</Text>
    </View>
  );
}

function ScheduleStep({ profile, updateProfile }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        How do you like to plan your workout days?
      </Text>
      {Object.values(SchedulePreference).map((pref) => (
        <TouchableOpacity
          key={pref}
          style={[
            styles.optionCard,
            profile.schedulePreference === pref && styles.optionCardSelected,
          ]}
          onPress={() => updateProfile('schedulePreference', pref)}
          accessibilityLabel={SchedulePreferenceInfo[pref].displayName}
          accessibilityState={{ selected: profile.schedulePreference === pref }}
        >
          <Ionicons
            name={SchedulePreferenceInfo[pref].icon}
            size={28}
            color={profile.schedulePreference === pref ? '#007AFF' : '#8E8E93'}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{SchedulePreferenceInfo[pref].displayName}</Text>
            <Text style={styles.optionDescription}>{SchedulePreferenceInfo[pref].description}</Text>
          </View>
          {profile.schedulePreference === pref && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TimeStep({ profile, updateProfile }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        When do you usually prefer to exercise?
      </Text>
      {Object.values(WorkoutTime).map((time) => (
        <TouchableOpacity
          key={time}
          style={[
            styles.optionCard,
            profile.preferredWorkoutTime === time && styles.optionCardSelected,
          ]}
          onPress={() => updateProfile('preferredWorkoutTime', time)}
          accessibilityLabel={WorkoutTimeInfo[time].displayName}
          accessibilityState={{ selected: profile.preferredWorkoutTime === time }}
        >
          <Ionicons
            name={WorkoutTimeInfo[time].icon}
            size={28}
            color={profile.preferredWorkoutTime === time ? '#007AFF' : '#8E8E93'}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{WorkoutTimeInfo[time].displayName}</Text>
            <Text style={styles.optionDescription}>{WorkoutTimeInfo[time].description}</Text>
          </View>
          {profile.preferredWorkoutTime === time && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function IntentStep({ profile, updateProfile }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Both paths are great! There's no wrong answer.
      </Text>
      {Object.values(FitnessIntent).map((intent) => (
        <TouchableOpacity
          key={intent}
          style={[
            styles.optionCard,
            profile.fitnessIntent === intent && styles.optionCardSelected,
          ]}
          onPress={() => updateProfile('fitnessIntent', intent)}
          accessibilityLabel={FitnessIntentInfo[intent].displayName}
          accessibilityState={{ selected: profile.fitnessIntent === intent }}
        >
          <Ionicons
            name={FitnessIntentInfo[intent].icon}
            size={28}
            color={profile.fitnessIntent === intent ? '#007AFF' : '#8E8E93'}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{FitnessIntentInfo[intent].displayName}</Text>
            <Text style={styles.optionDescription}>{FitnessIntentInfo[intent].description}</Text>
          </View>
          {profile.fitnessIntent === intent && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ))}
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
      <Text style={styles.stepDescription}>
        What should we call your new fitness buddy?
      </Text>
      <TextInput
        style={[styles.nameInput, nameError && styles.nameInputError]}
        value={profile.hamsterName || ''}
        onChangeText={handleNameChange}
        placeholder="Enter a name"
        maxLength={HAMSTER_NAME_MAX_LENGTH}
        autoFocus
        accessibilityLabel="Hamster name"
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
            accessibilityLabel={`Use name ${name}`}
          >
            <Text style={styles.suggestionText}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function MeetHamsterStep({ profile }) {
  return (
    <View style={styles.meetHamsterContent}>
      <View style={styles.hamsterEnclosure}>
        <View style={styles.hamsterPlaceholder}>
          <Ionicons name="paw" size={80} color="#FF9500" />
        </View>
      </View>
      <Text style={styles.hamsterName}>{profile.hamsterName}</Text>
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>
          Hi! I'm {profile.hamsterName}! I'm so excited to start this fitness journey with you! 🎉
        </Text>
      </View>
      <View style={styles.hamsterStatus}>
        <Ionicons name="happy" size={20} color="#34C759" />
        <Text style={styles.statusText}>Fed & Happy</Text>
      </View>
      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>What's next:</Text>
        <View style={styles.nextStep}>
          <Ionicons name="fitness" size={20} color="#007AFF" />
          <Text style={styles.nextStepText}>Browse workouts made for you</Text>
        </View>
        <View style={styles.nextStep}>
          <Ionicons name="star" size={20} color="#FF9500" />
          <Text style={styles.nextStepText}>Earn points to customize me!</Text>
        </View>
        <View style={styles.nextStep}>
          <Ionicons name="flame" size={20} color="#FF3B30" />
          <Text style={styles.nextStepText}>Build streaks together</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#8E8E93',
    borderRadius: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContent: {
    paddingTop: 10,
  },
  // Age gate styles
  ageGateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageGateOptionSelected: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ageGateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  stepDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  ageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 120,
    color: '#007AFF',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    aspectRatio: 1.2,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  goalText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  goalTextSelected: {
    color: '#007AFF',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  frequencyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#34C759',
    fontWeight: '500',
  },
  nameInput: {
    fontSize: 24,
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  nameInputError: {
    borderColor: '#FF3B30',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  suggestionsLabel: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 16,
    color: '#8E8E93',
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
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    margin: 4,
  },
  suggestionText: {
    fontSize: 16,
    color: '#007AFF',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  meetHamsterContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  hamsterEnclosure: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF5E6',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFD180',
  },
  hamsterPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#FFE0B2',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamsterName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#FF9500',
  },
  speechBubble: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    marginHorizontal: 20,
  },
  speechText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  hamsterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(52,199,89,0.1)',
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  nextStepsContainer: {
    marginTop: 24,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nextStepText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#3C3C43',
  },
});
