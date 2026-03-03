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
import { getExerciseDisplayPrompt } from '../../models/DailyExercise';

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckIn = async () => {
    setState(CheckInState.CONFIRMING);
    setError(null);

    try {
      const checkInResult = await recordDailyCheckIn(exercise);
      if (checkInResult.success) {
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
          <Ionicons name="alert-circle" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
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
          <View style={styles.rewardCard}>
            <View style={styles.rewardRow}>
              <Ionicons name="star" size={24} color="#FF9500" />
              <Text style={styles.rewardText}>+{result.pointsEarned} points</Text>
            </View>
            <View style={styles.rewardRow}>
              <Ionicons name="flame" size={24} color="#FF3B30" />
              <Text style={styles.streakText}>{result.newStreak} day streak!</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ready state (default)
  return (
    <View style={styles.container}>
      {/* Close button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#8B5A2B" />
        </TouchableOpacity>
      </View>

      <View style={styles.readyContent}>
        {/* Exercise icon */}
        <View style={styles.exerciseCircle}>
          <Ionicons name={exercise.icon} size={44} color="#FF9500" />
        </View>

        {/* Exercise name & prompt */}
        <Text style={styles.exercisePrompt}>
          {getExerciseDisplayPrompt(exercise)}
        </Text>
        <Text style={styles.exerciseInstruction}>
          {exercise.instruction}
        </Text>
      </View>

      {/* I Did It! button */}
      <TouchableOpacity
        style={styles.iDidItButton}
        onPress={handleCheckIn}
        accessibilityLabel="I did it! Complete the daily exercise"
      >
        <Text style={styles.iDidItButtonText}>I Did It!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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
    fontSize: 18,
    color: '#FF9500',
  },
  readyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  exercisePrompt: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4A3728',
    marginBottom: 12,
  },
  exerciseInstruction: {
    fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  iDidItButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  iDidItButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Error
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#FF9500',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
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
    fontSize: 28,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255,149,0,0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    maxWidth: '90%',
  },
  encouragementText: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#FF9500',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  doneButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
