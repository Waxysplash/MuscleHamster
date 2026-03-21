// MyWorkoutsSection - Full custom workouts list for Browse tab
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FavoriteButton from '../FavoriteButton';

// Workout type info for custom workouts
const TYPE_INFO = {
  strength: { icon: 'barbell-outline', label: 'Strength', color: '#4ECDC4' },
  cardio: { icon: 'heart-outline', label: 'Cardio', color: '#FF6B6B' },
  class: { icon: 'people-outline', label: 'Class', color: '#9B59B6' },
  other: { icon: 'fitness-outline', label: 'Other', color: '#FF9500' },
};

/**
 * MyWorkoutsSection Component
 * Displays all custom workouts with Add button
 * Used in the Browse tab's "My Workouts" sub-tab
 *
 * @param {Array} customWorkouts - List of custom workout objects
 * @param {function} onAddWorkout - Callback to navigate to add workout screen
 * @param {function} onWorkoutPress - Callback when a workout is pressed
 */
export default function MyWorkoutsSection({
  customWorkouts = [],
  onAddWorkout,
  onWorkoutPress,
}) {
  // Format last completed date
  const formatLastCompleted = (dateString) => {
    if (!dateString) return 'Never completed';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person" size={20} color="#FF9500" />
        <Text style={styles.title}>My Workouts</Text>
      </View>
      <Text style={styles.subtitle}>
        Track custom workouts like Spin Class or Morning Run
      </Text>

      {/* Add Workout Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddWorkout}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFF8F0" />
        <Text style={styles.addButtonText}>Add Workout</Text>
      </TouchableOpacity>

      {/* Workouts List */}
      {customWorkouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={48} color="#D4C9BE" />
          <Text style={styles.emptyText}>No custom workouts yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first workout to track classes, runs, or gym sessions
          </Text>
        </View>
      ) : (
        <View style={styles.workoutsList}>
          {customWorkouts.map((workout) => {
            const typeInfo = TYPE_INFO[workout.type] || TYPE_INFO.other;
            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => onWorkoutPress?.(workout)}
                accessibilityLabel={`${workout.name} workout`}
              >
                <View style={[styles.workoutIcon, { backgroundColor: typeInfo.color + '20' }]}>
                  <Ionicons name={typeInfo.icon} size={24} color={typeInfo.color} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <View style={styles.workoutMeta}>
                    <Text style={styles.workoutMetaText}>
                      {workout.completionCount} {workout.completionCount === 1 ? 'time' : 'times'}
                    </Text>
                    <Text style={styles.workoutMetaDot}>*</Text>
                    <Text style={styles.workoutMetaText}>
                      {formatLastCompleted(workout.lastCompletedAt)}
                    </Text>
                  </View>
                </View>
                <FavoriteButton workoutId={workout.id} size={22} />
                <Ionicons name="chevron-forward" size={20} color="#8B5A2B" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#4A3728',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginBottom: 16,
    marginLeft: 28,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B5D52',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A89B8C',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  workoutsList: {
    gap: 10,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  workoutMetaText: {
    fontSize: 13,
    color: '#6B5D52',
  },
  workoutMetaDot: {
    fontSize: 13,
    color: '#A89B8C',
    marginHorizontal: 6,
  },
});
