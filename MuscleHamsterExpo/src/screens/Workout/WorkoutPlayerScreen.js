// Workout Player Screen - Phase 05
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Animated,
  Image,
  ScrollView,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatIcons } from '../../config/AssetImages';
import { useActivity } from '../../context/ActivityContext';
import { useAlert } from '../../context/AlertContext';
import Logger from '../../services/LoggerService';
import { Colors, Fonts, Outline } from '../../config/theme';
import { StoryButton, StoryIcon } from '../../components/ui/Story';
import { ExerciseTypeInfo, ExerciseType } from '../../models/Workout';
import { WorkoutFeedback, WorkoutFeedbackInfo, HamsterStateInfo } from '../../models/Activity';
import { useResponsive, getTimerSize, getActionButtonSize } from '../../utils/responsive';
import { playSFX } from '../../services/AudioService';
import { SoundEffect } from '../../models/AudioPreferences';
import { logWorkoutComplete } from '../../services/AnalyticsService';

const PlayerState = {
  LOADING: 'loading',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
};

export default function WorkoutPlayerScreen({ route, navigation }) {
  const workout = route.params?.workout;
  const { recordWorkoutCompletion, recordFeedback } = useActivity();
  const { showAlert } = useAlert();

  // Safety check: If no workout was passed, show error and allow going back
  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF9500" />
          <Text style={styles.errorTitle}>Workout not found</Text>
          <Text style={styles.errorText}>Let's head back and try again.</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Responsive sizing
  const { isTablet, contentMaxWidth } = useResponsive();
  const timerSize = getTimerSize();
  const buttonSizes = getActionButtonSize();

  const [playerState, setPlayerState] = useState(PlayerState.LOADING);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  // Completion state
  const [completionResult, setCompletionResult] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const pausedAtRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // The 1-second timer reads these refs, not state: a setInterval callback keeps the values
  // from when it was created, which made the player loop on the 2nd exercise forever.
  const indexRef = useRef(0);
  const remainingRef = useRef(0);
  const completedRef = useRef(0); // WORK moves finished (not warm-up/rest/cool-down, not skipped)
  const elapsedRef = useRef(0);

  const currentExercise = workout.exercises?.[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  // Safety check: If currentExercise is undefined (shouldn't happen, but defensive)
  if (!currentExercise && playerState !== PlayerState.COMPLETED && playerState !== PlayerState.LOADING) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF9500" />
          <Text style={styles.errorTitle}>Exercise not found</Text>
          <Text style={styles.errorText}>Something went wrong. Let's head back.</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Start workout on mount
  useEffect(() => {
    startWorkout();
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [playerState]);

  const handleAppStateChange = (nextAppState) => {
    if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App going to background
      if (playerState === PlayerState.ACTIVE) {
        pausedAtRef.current = Date.now();
        pauseWorkout();
      }
    } else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App coming to foreground - timer continues automatically when resumed
    }
    appStateRef.current = nextAppState;
  };

  const startWorkout = () => {
    if (workout.exercises.length === 0) {
      setPlayerState(PlayerState.ERROR);
      return;
    }
    indexRef.current = 0;
    remainingRef.current = workout.exercises[0].duration;
    setCurrentExerciseIndex(0);
    setTimeRemaining(remainingRef.current);
    setPlayerState(PlayerState.ACTIVE);
    startTimer();
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setTotalTimeElapsed(elapsedRef.current);
      remainingRef.current -= 1;
      // 3-2-1 cue so nobody has to watch the screen: short buzz each second, longer at the switch
      if (remainingRef.current > 0 && remainingRef.current <= 3) {
        Vibration.vibrate(60);
      }
      if (remainingRef.current <= 0) {
        Vibration.vibrate(300);
        setTimeRemaining(0);
        advanceToNextExercise({ finished: true });
      } else {
        setTimeRemaining(remainingRef.current);
      }
    }, 1000);
  };

  // finished: true when the timer ran out (counts as done); false when skipped
  const advanceToNextExercise = ({ finished } = { finished: false }) => {
    const index = indexRef.current;
    if (finished && workout.exercises[index]?.type === ExerciseType.WORK) {
      completedRef.current += 1;
      setExercisesCompleted(completedRef.current);
    }

    if (index >= workout.exercises.length - 1) {
      completeWorkout(completedRef.current);
      return;
    }
    playSFX(SoundEffect.EXERCISE_TRANSITION);
    const nextIndex = index + 1;
    indexRef.current = nextIndex;
    remainingRef.current = workout.exercises[nextIndex].duration;
    setCurrentExerciseIndex(nextIndex);
    setTimeRemaining(remainingRef.current);
    progressAnim.setValue(0);
  };

  const pauseWorkout = () => {
    clearInterval(timerRef.current);
    setPlayerState(PlayerState.PAUSED);
  };

  const resumeWorkout = () => {
    setPlayerState(PlayerState.ACTIVE);
    startTimer();
  };

  const skipExercise = () => {
    showAlert(
      'Skip exercise?',
      "No worries if you need to! Your hamster won't judge.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            advanceToNextExercise({ finished: false });
          },
        },
      ]
    );
  };

  const endWorkoutEarly = () => {
    showAlert(
      'End workout?',
      "You've made progress! Ending now will save what you've done.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => completeWorkout(completedRef.current, true),
        },
      ]
    );
  };

  const completeWorkout = async (completed, wasEarly = false) => {
    clearInterval(timerRef.current);
    setPlayerState(PlayerState.COMPLETED);

    try {
      const result = await recordWorkoutCompletion({
        workoutId: workout.id,
        workoutName: workout.name,
        exercisesCompleted: completed,
        totalExercises: workout.exercises.filter((e) => e.type === ExerciseType.WORK).length,
        durationSeconds: elapsedRef.current,
      });
      setCompletionResult(result);
      logWorkoutComplete({ workoutId: workout.id, exercisesCompleted: completed });
    } catch (e) {
      Logger.error('Failed to record completion:', e);
      setCompletionResult({
        success: false,
        pointsEarned: 0,
        newStreak: null,
        hamsterState: 'happy',
      });
    }
  };

  const submitFeedback = async (feedback) => {
    setIsSubmittingFeedback(true);
    try {
      await recordFeedback(workout.id, feedback);
      setFeedbackSubmitted(true);
    } catch (e) {
      Logger.warn('Failed to submit feedback:', e);
      setFeedbackSubmitted(true); // Don't block user
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const skipFeedback = () => {
    setFeedbackSubmitted(true);
  };

  const finishAndExit = () => {
    navigation.goBack();
  };

  // Progress animation
  useEffect(() => {
    if (currentExercise && playerState === PlayerState.ACTIVE) {
      const progress = 1 - (timeRemaining / currentExercise.duration);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, currentExercise, playerState]);

  const getExerciseTypeColor = (type) => {
    return ExerciseTypeInfo[type]?.color || '#8B5A2B';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (playerState === PlayerState.LOADING) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Your hamster is cheering you on!</Text>
        <Ionicons name="paw" size={60} color="#FF9500" style={styles.loadingIcon} />
      </View>
    );
  }

  if (playerState === PlayerState.ERROR) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={60} color="#C0392B" />
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (playerState === PlayerState.COMPLETED) {
    return (
      <View style={[styles.container, styles.completedContainer]}>
        <View style={styles.completedContent}>
          <View style={styles.celebrationIcon}>
            <StoryIcon name="trophy" size={110} color={Colors.brand} />
          </View>
          <Text style={styles.completedTitle}>Amazing Work!</Text>
          <Text style={styles.completedSubtitle}>
            You completed {exercisesCompleted} of {workout.exercises.filter((e) => e.type === ExerciseType.WORK).length} moves
          </Text>

          {completionResult && (
            <View style={styles.rewardsContainer}>
              {completionResult.pointsEarned > 0 && (
                <View style={styles.rewardItem}>
                  <Image source={StatIcons.points} style={{ width: 28, height: 28 }} resizeMode="contain" />
                  <Text style={styles.rewardText}>+{completionResult.pointsEarned} points</Text>
                </View>
              )}
              {completionResult.newStreak > 0 && (
                <View style={styles.rewardItem}>
                  <Image source={StatIcons.streak} style={{ width: 28, height: 28 }} resizeMode="contain" />
                  <Text style={styles.rewardText}>{completionResult.newStreak} day streak</Text>
                </View>
              )}
            </View>
          )}

          {!feedbackSubmitted && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackTitle}>How was this workout?</Text>
              <View style={styles.feedbackButtons}>
                {Object.values(WorkoutFeedback).map((fb) => (
                  <TouchableOpacity
                    key={fb}
                    style={styles.feedbackButton}
                    onPress={() => submitFeedback(fb)}
                    disabled={isSubmittingFeedback}
                  >
                    <Ionicons
                      name={WorkoutFeedbackInfo[fb].icon}
                      size={32}
                      color={WorkoutFeedbackInfo[fb].isPositive ? '#2E7D32' : '#6B5D52'}
                    />
                    <Text style={styles.feedbackButtonText}>
                      {WorkoutFeedbackInfo[fb].displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={skipFeedback}>
                <Text style={styles.skipFeedbackText}>Skip feedback</Text>
              </TouchableOpacity>
            </View>
          )}

          {feedbackSubmitted && (
            <Text style={styles.hamsterReaction}>
              {HamsterStateInfo[completionResult?.hamsterState || 'happy']?.greeting ||
                "Great job! I'm so proud of you!"}
            </Text>
          )}
        </View>

        <StoryButton title="Done" onPress={finishAndExit} style={{ alignSelf: 'stretch', marginHorizontal: 20, marginBottom: 20 }} />
      </View>
    );
  }

  // Active or Paused state
  const isPaused = playerState === PlayerState.PAUSED;
  const exerciseTypeInfo = ExerciseTypeInfo[currentExercise.type];
  const nextMove = workout.exercises
    .slice(currentExerciseIndex + 1)
    .find((e) => e.type !== 'rest');
  const exerciseColor = getExerciseTypeColor(currentExercise.type);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={endWorkoutEarly}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="End workout"
        >
          <Ionicons name="close" size={28} color="#C0392B" />
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentExercise.totalRounds > 1 && currentExercise.round
              ? `Round ${currentExercise.round} of ${currentExercise.totalRounds}`
              : `${currentExerciseIndex + 1} / ${workout.exercises.length}`}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: Colors.brand,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Exercise Content */}
      <View style={styles.exerciseContent}>
        <View style={styles.typeBadge}>
          <Ionicons name={exerciseTypeInfo?.icon || 'flash'} size={16} color={Colors.ink} />
          <Text style={styles.typeBadgeText}>
            {exerciseTypeInfo?.displayName || 'Exercise'}
          </Text>
        </View>

        <Text style={styles.exerciseName} accessibilityRole="header">{currentExercise.name}</Text>
        {currentExercise.type === 'rest' ? (
          <Text style={styles.exerciseInstructions}>
            {nextMove ? `Next up: ${nextMove.name}` : currentExercise.instructions}
          </Text>
        ) : (
          <ScrollView style={styles.howScroll} contentContainerStyle={{ alignItems: 'center' }}>
            <Text style={styles.exerciseInstructions}>{currentExercise.how || currentExercise.instructions}</Text>
            {currentExercise.easier && (
              <Text style={styles.easierText}>
                <Text style={{ fontFamily: 'Nunito_700Bold' }}>Easier: </Text>{currentExercise.easier}
              </Text>
            )}
          </ScrollView>
        )}

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={[
            styles.timerCircle,
            { width: timerSize, height: timerSize, borderRadius: timerSize / 2 }
          ]}>
            <Text style={[styles.timerText, isTablet && { fontSize: 56 }]}>{formatTime(timeRemaining)}</Text>
            <Text style={[styles.timerLabel, isTablet && { fontSize: 18 }]}>remaining</Text>
          </View>
        </View>

        {isPaused && (
          <View style={styles.pausedOverlay}>
            <Ionicons name="pause-circle" size={40} color="#6B5D52" />
            <Text style={styles.pausedText}>Paused</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipExercise}
          accessibilityLabel="Skip exercise"
        >
          <Ionicons name="play-skip-forward" size={28} color="#6B5D52" />
          <Text style={styles.controlLabel}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mainControlButton,
            { width: buttonSizes.primary, height: buttonSizes.primary, borderRadius: buttonSizes.primary / 2 }
          ]}
          onPress={isPaused ? resumeWorkout : pauseWorkout}
          accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={isTablet ? 48 : 40}
            color={Colors.ink}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            // "Next" means the user finished this move early: it counts as done
            advanceToNextExercise({ finished: true });
          }}
          accessibilityLabel={isLastExercise ? 'Finish' : 'Next exercise'}
        >
          <Ionicons
            name={isLastExercise ? 'checkmark-circle' : 'play-forward'}
            size={28}
            color="#6B5D52"
          />
          <Text style={styles.controlLabel}>{isLastExercise ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  howScroll: {
    maxHeight: 150,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  easierText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#4A3728',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#6B5D52',
    marginBottom: 20,
  },
  loadingIcon: {
    marginTop: 10,
  },
  errorText: {
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#C0392B',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    color: '#4A3728',
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    borderRadius: 12,
  },
  errorButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#fff',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5A2B',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  progressInfo: {
    padding: 8,
  },
  progressText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#4A3728',
  },
  progressBar: {
    height: 14,
    marginHorizontal: 20,
    borderRadius: 7,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  exerciseContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    backgroundColor: Colors.peach,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontFamily: Fonts.bodyBold, fontSize: 14,
    color: Colors.ink,
  },
  exerciseName: {
    fontFamily: 'Quicksand_700Bold', fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
    color: '#4A3728',
  },
  exerciseInstructions: {
    fontFamily: 'Nunito_400Regular', fontSize: 17,
    color: '#4A3728',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  timerContainer: {
    marginTop: 20,
  },
  timerCircle: {
    borderWidth: 6,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: Fonts.heading, fontSize: 48,
    color: Colors.ink,
  },
  timerLabel: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    marginTop: 4,
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pausedText: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    color: '#6B5D52',
    marginTop: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 32,
    paddingBottom: 50,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlLabel: {
    marginTop: 4,
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
  },
  mainControlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand,
    borderWidth: 3,
    borderColor: Colors.ink,
  },
  completedContainer: {
    backgroundColor: '#FFF4E6',
    padding: 24,
  },
  completedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 32,
    marginBottom: 8,
    color: '#4A3728',
  },
  completedSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#6B5D52',
    textAlign: 'center',
    marginBottom: 24,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rewardText: {
    marginLeft: 8,
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#4A3728',
  },
  feedbackSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  feedbackTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    marginBottom: 16,
    color: '#4A3728',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    minWidth: 90,
  },
  feedbackButtonText: {
    marginTop: 8,
    fontFamily: 'Nunito_400Regular', fontSize: 12,
    color: '#6B5D52',
  },
  skipFeedbackText: {
    marginTop: 16,
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#8B5A2B',
  },
  hamsterReaction: {
    marginTop: 24,
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    fontStyle: 'italic',
    color: '#A65000',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  doneButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#fff',
  },
});
