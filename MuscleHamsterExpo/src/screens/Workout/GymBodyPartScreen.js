// Gym Body Part Workouts Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutService } from '../../services/WorkoutService';
import { DurationBucketInfo } from '../../models/Workout';
import { FitnessLevelInfo } from '../../models/UserProfile';
import LoadingView from '../../components/LoadingView';

// Sample gym workouts by body part
const GYM_WORKOUTS = {
  legs: [
    { id: 'gym-legs-1', name: 'Leg Press Power', duration: 'medium', difficulty: 'intermediate', description: 'Build strong quads and glutes' },
    { id: 'gym-legs-2', name: 'Squat Fundamentals', duration: 'short', difficulty: 'beginner', description: 'Master the king of exercises' },
    { id: 'gym-legs-3', name: 'Hamstring Focus', duration: 'medium', difficulty: 'intermediate', description: 'Target your posterior chain' },
    { id: 'gym-legs-4', name: 'Calf Builder', duration: 'quick', difficulty: 'beginner', description: 'Develop defined calves' },
    { id: 'gym-legs-5', name: 'Leg Day Destroyer', duration: 'long', difficulty: 'advanced', description: 'Complete lower body workout' },
  ],
  arms: [
    { id: 'gym-arms-1', name: 'Bicep Blaster', duration: 'short', difficulty: 'intermediate', description: 'Pump up your biceps' },
    { id: 'gym-arms-2', name: 'Tricep Sculptor', duration: 'short', difficulty: 'intermediate', description: 'Build horseshoe triceps' },
    { id: 'gym-arms-3', name: 'Arm Day Complete', duration: 'medium', difficulty: 'intermediate', description: 'Full arm workout' },
    { id: 'gym-arms-4', name: 'Forearm Finisher', duration: 'quick', difficulty: 'beginner', description: 'Grip strength and definition' },
    { id: 'gym-arms-5', name: 'Gun Show', duration: 'long', difficulty: 'advanced', description: 'Intense arm hypertrophy' },
  ],
  back: [
    { id: 'gym-back-1', name: 'Lat Pulldown Focus', duration: 'medium', difficulty: 'beginner', description: 'Build a wider back' },
    { id: 'gym-back-2', name: 'Row to Grow', duration: 'medium', difficulty: 'intermediate', description: 'Thicken your back' },
    { id: 'gym-back-3', name: 'Pull-Up Progression', duration: 'short', difficulty: 'intermediate', description: 'Master the pull-up' },
    { id: 'gym-back-4', name: 'Lower Back Strength', duration: 'short', difficulty: 'beginner', description: 'Support your spine' },
    { id: 'gym-back-5', name: 'Back Attack', duration: 'long', difficulty: 'advanced', description: 'Complete back development' },
  ],
  chest: [
    { id: 'gym-chest-1', name: 'Bench Press Basics', duration: 'medium', difficulty: 'beginner', description: 'Build a solid foundation' },
    { id: 'gym-chest-2', name: 'Incline Focus', duration: 'medium', difficulty: 'intermediate', description: 'Target upper chest' },
    { id: 'gym-chest-3', name: 'Cable Crossover Sculpt', duration: 'short', difficulty: 'intermediate', description: 'Define your pecs' },
    { id: 'gym-chest-4', name: 'Push-Up Variations', duration: 'short', difficulty: 'beginner', description: 'Bodyweight chest work' },
    { id: 'gym-chest-5', name: 'Chest Crusher', duration: 'long', difficulty: 'advanced', description: 'Maximum chest gains' },
  ],
  shoulders: [
    { id: 'gym-shoulders-1', name: 'Overhead Press Power', duration: 'medium', difficulty: 'intermediate', description: 'Build boulder shoulders' },
    { id: 'gym-shoulders-2', name: 'Lateral Raise Focus', duration: 'short', difficulty: 'beginner', description: 'Widen your frame' },
    { id: 'gym-shoulders-3', name: 'Rear Delt Developer', duration: 'short', difficulty: 'intermediate', description: 'Complete shoulder development' },
    { id: 'gym-shoulders-4', name: 'Front Raise Finisher', duration: 'quick', difficulty: 'beginner', description: 'Define front delts' },
    { id: 'gym-shoulders-5', name: 'Shoulder Shredder', duration: 'long', difficulty: 'advanced', description: 'Intense deltoid workout' },
  ],
};

const DURATION_MAP = {
  quick: { range: '5-10 min' },
  short: { range: '10-20 min' },
  medium: { range: '20-30 min' },
  long: { range: '30-45 min' },
};

export default function GymBodyPartScreen({ route, navigation }) {
  const { bodyPart } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWorkouts(GYM_WORKOUTS[bodyPart.id] || []);
      setIsLoading(false);
    }, 300);
  }, [bodyPart]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#34C759';
      case 'intermediate':
        return '#FF9500';
      case 'advanced':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const handleWorkoutPress = (workout) => {
    // Navigate to a workout detail or start screen
    // For now, show an alert or navigate to WorkoutDetail
    navigation.navigate('WorkoutDetail', {
      workoutId: workout.id,
      gymWorkout: workout, // Pass the gym workout data
    });
  };

  if (isLoading) {
    return <LoadingView message="Loading workouts..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4A3728" />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: bodyPart.color + '20' }]}>
            <Ionicons name={bodyPart.icon} size={28} color={bodyPart.color} />
          </View>
          <Text style={styles.headerTitle}>{bodyPart.name} Workouts</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {workouts.map((workout) => {
            const durationInfo = DURATION_MAP[workout.duration];
            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => handleWorkoutPress(workout)}
              >
                <View style={[styles.workoutIcon, { backgroundColor: bodyPart.color + '15' }]}>
                  <Ionicons name="barbell" size={24} color={bodyPart.color} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                  <View style={styles.workoutMeta}>
                    <Ionicons name="time-outline" size={14} color="#6B5D52" />
                    <Text style={styles.workoutDuration}>{durationInfo?.range}</Text>
                    <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(workout.difficulty) }]} />
                    <Text style={styles.workoutDifficulty}>
                      {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
              </TouchableOpacity>
            );
          })}

          {workouts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color="#C4B5A8" />
              <Text style={styles.emptyText}>No workouts available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DC',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3728',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 14,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6B5D52',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDuration: {
    fontSize: 13,
    color: '#6B5D52',
    marginLeft: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  workoutDifficulty: {
    fontSize: 13,
    color: '#6B5D52',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5D52',
    marginTop: 12,
  },
});
