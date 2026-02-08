// Workout Player Screen - Phase 05
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../context/ActivityContext';
import { ExerciseTypeInfo, ExerciseType } from '../../models/Workout';
import { WorkoutFeedback, WorkoutFeedbackInfo, HamsterStateInfo } from '../../models/Activity';

const PlayerState = {
  LOADING: 'loading',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
};

export default function WorkoutPlayerScreen({ route, navigation }) {
  const { workout } = route.params;
  const { recordWorkoutCompletion, recordFeedback } = useActivity();

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

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

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
    setTimeRemaining(workout.exercises[0].duration);
    setPlayerState(PlayerState.ACTIVE);
    startTimer();
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Exercise complete
          advanceToNextExercise();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeElapsed((prev) => prev + 1);
    }, 1000);
  };

  const advanceToNextExercise = useCallback(() => {
    const completed = exercisesCompleted + 1;
    setExercisesCompleted(completed);

    if (currentExerciseIndex >= workout.exercises.length - 1) {
      // Workout complete
      completeWorkout(completed);
    } else {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setTimeRemaining(workout.exercises[nextIndex].duration);
      progressAnim.setValue(0);
    }
  }, [currentExerciseIndex, exercisesCompleted, workout.exercises]);

  const pauseWorkout = () => {
    clearInterval(timerRef.current);
    setPlayerState(PlayerState.PAUSED);
  };

  const resumeWorkout = () => {
    setPlayerState(PlayerState.ACTIVE);
    startTimer();
  };

  const skipExercise = () => {
    Alert.alert(
      'Skip exercise?',
      "No worries if you need to! Your hamster won't judge.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            advanceToNextExercise();
          },
        },
      ]
    );
  };

  const endWorkoutEarly = () => {
    Alert.alert(
      'End workout?',
      "You've made progress! Ending now will save what you've done.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => completeWorkout(exercisesCompleted, true),
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
        totalExercises: workout.exercises.length,
        durationSeconds: totalTimeElapsed,
      });
      setCompletionResult(result);
    } catch (e) {
      console.error('Failed to record completion:', e);
      setCompletionResult({
        success: true,
        pointsEarned: 50,
        newStreak: 1,
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
      console.warn('Failed to submit feedback:', e);
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
    return ExerciseTypeInfo[type]?.color || '#007AFF';
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
        <Ionicons name="alert-circle" size={60} color="#FF3B30" />
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
            <Ionicons name="trophy" size={60} color="#FFD700" />
          </View>
          <Text style={styles.completedTitle}>Amazing Work!</Text>
          <Text style={styles.completedSubtitle}>
            You completed {exercisesCompleted} of {workout.exercises.length} exercises
          </Text>

          {completionResult && (
            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <Ionicons name="star" size={24} color="#FF9500" />
                <Text style={styles.rewardText}>+{completionResult.pointsEarned} points</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="flame" size={24} color="#FF3B30" />
                <Text style={styles.rewardText}>{completionResult.newStreak} day streak</Text>
              </View>
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
                      color={WorkoutFeedbackInfo[fb].isPositive ? '#34C759' : '#8E8E93'}
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

        <TouchableOpacity style={styles.doneButton} onPress={finishAndExit}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Active or Paused state
  const isPaused = playerState === PlayerState.PAUSED;
  const exerciseTypeInfo = ExerciseTypeInfo[currentExercise.type];
  const exerciseColor = getExerciseTypeColor(currentExercise.type);

  return (
    <View style={[styles.container, { backgroundColor: exerciseColor + '15' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={endWorkoutEarly} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FF3B30" />
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1} / {workout.exercises.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: exerciseColor,
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
        <View style={[styles.typeBadge, { backgroundColor: exerciseColor + '30' }]}>
          <Ionicons name={exerciseTypeInfo?.icon || 'flash'} size={16} color={exerciseColor} />
          <Text style={[styles.typeBadgeText, { color: exerciseColor }]}>
            {exerciseTypeInfo?.displayName || 'Exercise'}
          </Text>
        </View>

        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.exerciseInstructions}>{currentExercise.instructions}</Text>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, { borderColor: exerciseColor }]}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
        </View>

        {isPaused && (
          <View style={styles.pausedOverlay}>
            <Ionicons name="pause-circle" size={40} color="#8E8E93" />
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
          <Ionicons name="play-skip-forward" size={28} color="#8E8E93" />
          <Text style={styles.controlLabel}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainControlButton, { backgroundColor: exerciseColor }]}
          onPress={isPaused ? resumeWorkout : pauseWorkout}
          accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={40}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (isLastExercise) {
              completeWorkout(exercisesCompleted + 1);
            } else {
              advanceToNextExercise();
            }
          }}
          accessibilityLabel={isLastExercise ? 'Finish' : 'Next exercise'}
        >
          <Ionicons
            name={isLastExercise ? 'checkmark-circle' : 'play-forward'}
            size={28}
            color="#8E8E93"
          />
          <Text style={styles.controlLabel}>{isLastExercise ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 20,
  },
  loadingIcon: {
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#3C3C43',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
    borderRadius: 2,
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
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  typeBadgeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  exerciseInstructions: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  timerContainer: {
    marginTop: 20,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  timerLabel: {
    fontSize: 16,
    color: '#8E8E93',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#8E8E93',
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
    fontSize: 12,
    color: '#8E8E93',
  },
  mainControlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedContainer: {
    backgroundColor: '#fff',
    padding: 24,
  },
  completedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  completedSubtitle: {
    fontSize: 18,
    color: '#8E8E93',
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
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rewardText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  feedbackSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    minWidth: 90,
  },
  feedbackButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#8E8E93',
  },
  skipFeedbackText: {
    marginTop: 16,
    fontSize: 14,
    color: '#007AFF',
  },
  hamsterReaction: {
    marginTop: 24,
    fontSize: 18,
    fontStyle: 'italic',
    color: '#FF9500',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
