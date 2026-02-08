// Workout Detail Screen - Phase 04-05
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutService } from '../../services/WorkoutService';
import {
  WorkoutTypeInfo,
  DurationBucketInfo,
  BodyFocusInfo,
  EquipmentInfo,
  Equipment,
} from '../../models/Workout';
import { FitnessLevelInfo, FitnessGoalInfo } from '../../models/UserProfile';

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await WorkoutService.getWorkout(workoutId);
      if (!data) {
        setError('Workout not found');
      } else {
        setWorkout(data);
      }
    } catch (e) {
      setError('Failed to load workout');
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkout = () => {
    navigation.navigate('WorkoutPlayer', { workout });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (error || !workout) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error || 'Workout not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWorkout}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeInfo = WorkoutTypeInfo[workout.category];
  const difficultyInfo = FitnessLevelInfo[workout.difficulty];
  const durationInfo = DurationBucketInfo[workout.duration];
  const hasNoEquipment = workout.equipment.includes(Equipment.NONE) && workout.equipment.length === 1;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: typeInfo.color + '20' }]}>
          <View style={[styles.iconContainer, { backgroundColor: typeInfo.color }]}>
            <Ionicons name={typeInfo.icon} size={40} color="#fff" />
          </View>
          <Text style={styles.category}>{typeInfo.displayName}</Text>
          <Text style={styles.title}>{workout.name}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#8E8E93" />
            <Text style={styles.statValue}>{durationInfo.range}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name={difficultyInfo.icon} size={20} color="#8E8E93" />
            <Text style={styles.statValue}>{difficultyInfo.displayName}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flash" size={20} color="#8E8E93" />
            <Text style={styles.statValue}>{workout.exercises.length} exercises</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{workout.description}</Text>
        </View>

        {/* Body Focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Targets</Text>
          <View style={styles.tagsContainer}>
            {workout.bodyFocus.map((focus) => (
              <View key={focus} style={styles.tag}>
                <Ionicons name={BodyFocusInfo[focus].icon} size={16} color="#007AFF" />
                <Text style={styles.tagText}>{BodyFocusInfo[focus].displayName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          {hasNoEquipment ? (
            <View style={styles.noEquipmentBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.noEquipmentText}>No equipment needed!</Text>
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              {workout.equipment.filter(e => e !== Equipment.NONE).map((equip) => (
                <View key={equip} style={styles.tag}>
                  <Ionicons name={EquipmentInfo[equip].icon} size={16} color="#FF9500" />
                  <Text style={styles.tagText}>{EquipmentInfo[equip].displayName}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Great for</Text>
          <View style={styles.goalsContainer}>
            {workout.fitnessGoals.map((goal) => (
              <View key={goal} style={styles.goalItem}>
                <Ionicons name={FitnessGoalInfo[goal].icon} size={20} color="#5856D6" />
                <Text style={styles.goalText}>{FitnessGoalInfo[goal].displayName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exercise Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises.slice(0, 5).map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDuration}>{exercise.duration}s</Text>
              </View>
            </View>
          ))}
          {workout.exercises.length > 5 && (
            <Text style={styles.moreExercises}>
              +{workout.exercises.length - 5} more exercises
            </Text>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={startWorkout}
          accessibilityLabel="Start workout"
        >
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    marginLeft: 6,
    fontSize: 14,
    color: '#3C3C43',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E5EA',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3C3C43',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#3C3C43',
  },
  noEquipmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,199,89,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  noEquipmentText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#34C759',
    fontWeight: '500',
  },
  goalsContainer: {
    gap: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  goalText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#3C3C43',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  exerciseInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  exerciseName: {
    fontSize: 16,
    color: '#000',
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moreExercises: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
