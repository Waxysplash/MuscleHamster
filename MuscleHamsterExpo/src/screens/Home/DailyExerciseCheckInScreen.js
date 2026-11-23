// Daily Exercise Check-In Screen
// One-tap: read, do, tap "I Did It!", celebrate
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';

const CompletedWorkoutImage = require('../../../assets/images/completed_workout.png');
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../context/ActivityContext';
import { FINAL_STRETCH_PROMPT } from '../../models/DailyExercise';
import { StatIcons } from '../../config/AssetImages';
import HoldTimer from '../../components/HoldTimer';
import { StoryCard, StoryButton, StoryIcon } from '../../components/ui/Story';
import { Colors, Fonts, T } from '../../config/theme';
import { playSFX } from '../../services/AudioService';
import { SoundEffect } from '../../models/AudioPreferences';
import { logDailyCheckIn } from '../../services/AnalyticsService';

const CheckInState = {
  READY: 'ready',
  CONFIRMING: 'confirming',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function DailyExerciseCheckInScreen({ navigation, route }) {
  const exercise = route.params?.exercise;
  const { recordDailyCheckIn } = useActivity();

  const [state, setState] = useState(CheckInState.READY);

  // Safety check: If no exercise was passed, show error and allow going back
  if (!exercise) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#FF9500" />
          <Text style={styles.errorTitle}>No exercise found</Text>
          <Text style={styles.errorText}>Let's head back and try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckIn = async () => {
    setState(CheckInState.CONFIRMING);
    setError(null);

    try {
      const checkInResult = await recordDailyCheckIn(exercise);
      if (checkInResult.success) {
        // Daily check-in bumps the streak. (When workout_complete / points_earned
        // sounds are sourced, add them here too.)
        playSFX(SoundEffect.STREAK_INCREMENT);
        logDailyCheckIn({
          pointsEarned: checkInResult.pointsEarned,
          newStreak: checkInResult.newStreak,
        });
        setResult(checkInResult);
        setState(CheckInState.SUCCESS);
      } else {
        setError(checkInResult.error || 'Something went wrong');
        setState(CheckInState.ERROR);
      }
    } catch (e) {
      setError(e.message || 'Failed to check in');
      setState(CheckInState.ERROR);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setState(CheckInState.READY);
    setError(null);
  };

  // Confirming state
  if (state === CheckInState.CONFIRMING) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF9500" />
          <Text style={styles.confirmingText}>Recording your exercise...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (state === CheckInState.ERROR) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#C0392B" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <StoryButton title="Try again" onPress={handleRetry} style={{ marginTop: 20, alignSelf: 'stretch' }} />
          <TouchableOpacity style={styles.cancelButton} onPress={handleDone}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success state
  if (state === CheckInState.SUCCESS) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successScroll}>
          {/* Celebration Image */}
          <Image
            source={CompletedWorkoutImage}
            style={styles.completedImage}
            resizeMode="contain"
          />
          <Text style={styles.successTitle}>Exercise Complete!</Text>
          <View style={styles.speechBubble}>
            <Text style={styles.encouragementText}>
              {exercise.encouragement}
            </Text>
          </View>

          {/* Points & Streak */}
          <StoryCard color={Colors.peach} containerStyle={{ alignSelf: 'stretch', marginTop: 16 }}>
            <View style={styles.rewardRow}>
              <Image source={StatIcons.points} style={{ width: 28, height: 28 }} resizeMode="contain" />
              <Text style={T.title}>+{result.pointsEarned} points</Text>
            </View>
            <View style={[styles.rewardRow, { marginTop: 8 }]}>
              <Image source={StatIcons.streak} style={{ width: 28, height: 28 }} resizeMode="contain" />
              <Text style={T.heading}>{result.newStreak} day streak</Text>
            </View>
          </StoryCard>

          {/* The Final Stretch - always shown after check-in */}
          <StoryCard color={Colors.surface} containerStyle={{ alignSelf: 'stretch', marginTop: 16 }}>
            <View style={styles.finalStretchHeader}>
              <StoryIcon name={FINAL_STRETCH_PROMPT.icon} size={36} />
              <Text style={T.heading}>{FINAL_STRETCH_PROMPT.title}</Text>
            </View>
            <Text style={[T.body, { marginTop: 8 }]}>
              {FINAL_STRETCH_PROMPT.instruction}
            </Text>
          </StoryCard>
        </ScrollView>

        <StoryButton title="Done" onPress={handleDone} style={styles.bottomButton} />
      </View>
    );
  }

  // Ready state (default)
  return (
    <View style={styles.container}>
      {/* Close button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={28} color="#8B5A2B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.readyContent}>
        {/* Exercise icon */}
        <StoryIcon name={exercise.icon} art="today_exercise" size={96} color={Colors.peach} />

        {/* Exercise name */}
        <Text style={styles.exerciseName}>
          {exercise.name}
        </Text>

        {/* Suggested amount, in plain words */}
        <Text style={styles.exerciseSuggested}>
          {exercise.repType === 'seconds'
            ? `Aim for ${exercise.repCount} seconds. Stop early whenever you need to.`
            : exercise.repType === 'breath'
            ? 'Take as many slow breaths as you need'
            : /breathing/i.test(exercise.name)
            ? `Aim for ${exercise.repCount} slow rounds`
            : `Aim for ${exercise.repCount} times. Any number counts!`}
        </Text>

        {/* How to do it - first, readable (beginner review) */}
        <Text style={styles.exerciseTip}>
          {exercise.instruction}
        </Text>

        {/* Easier version - nobody should open the app to something they can't do */}
        {exercise.easier && (
          <StoryCard color={Colors.mint} shadow={false} containerStyle={{ alignSelf: 'stretch', marginTop: 16 }}>
            <View style={styles.easierRow} accessible accessibilityLabel={`Easier version: ${exercise.easier}`}>
              <Ionicons name="leaf" size={18} color={Colors.ink} />
              <Text style={styles.easierText}>
                <Text style={styles.easierLabel}>Easier version: </Text>
                {exercise.easier}
              </Text>
            </View>
          </StoryCard>
        )}

        {/* Countdown for timed moves, so nobody has to count in their head */}
        {exercise.repType === 'seconds' && <HoldTimer seconds={exercise.repCount} />}

        {/* Safety line */}
        <Text style={styles.safetyText}>
          Some effort is good. Sharp pain, dizziness or chest tightness: stop and rest.
        </Text>
      </ScrollView>

      {/* I Did It! button */}
      <StoryButton
        title="I did it!"
        icon="checkmark"
        onPress={handleCheckIn}
        accessibilityLabel="I did it! Complete the daily exercise"
        style={styles.bottomButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bottomButton: {
    marginHorizontal: 20,
    marginBottom: 36,
    marginTop: 8,
  },
  easierRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmingText: {
    marginTop: 16,
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#A65000',
  },
  readyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  exerciseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,149,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  exerciseName: {
    fontFamily: Fonts.heading, fontSize: 30,
    textAlign: 'center',
    color: Colors.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  safetyText: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 16,
  },
  easierBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(52,199,89,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    marginHorizontal: 8,
  },
  easierText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular', fontSize: 15,
    color: '#4A3728',
    lineHeight: 21,
  },
  easierLabel: {
    fontFamily: 'Nunito_700Bold',
  },
  exerciseSuggested: {
    fontFamily: Fonts.bodyBold, fontSize: 17,
    color: Colors.brown,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  exerciseTip: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#4A3728',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 23,
    marginTop: 12,
  },
  iDidItButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  iDidItButtonText: {
    fontFamily: 'Quicksand_700Bold', fontSize: 22,
    color: '#fff',
  },
  // Error
  errorTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    marginTop: 16,
    color: '#C0392B',
  },
  errorText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#fff',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
  },
  // Success
  successScroll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 28,
    marginTop: 16,
    marginBottom: 24,
    color: '#4A3728',
  },
  completedImage: {
    width: 220,
    height: 220,
    marginBottom: 8,
  },
  speechBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 2.5,
    borderColor: Colors.ink,
    padding: 16,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '92%',
  },
  encouragementText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#4A3728',
  },
  rewardCard: {
    backgroundColor: 'rgba(139,90,43,0.1)',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    gap: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    fontFamily: 'Quicksand_700Bold', fontSize: 20,
    color: '#A65000',
  },
  streakText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#C0392B',
  },
  doneButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#fff',
  },
  // Final Stretch
  finalStretchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,149,0,0.3)',
    borderStyle: 'dashed',
  },
  finalStretchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  finalStretchTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#4A3728',
  },
  finalStretchInstruction: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    lineHeight: 20,
  },
});
