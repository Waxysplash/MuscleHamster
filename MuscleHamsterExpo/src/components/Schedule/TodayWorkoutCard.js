// TodayWorkoutCard - Shows today's scheduled workout with start button
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAY_TYPES, DAY_LABELS } from '../../services/ScheduleService';

/**
 * TodayWorkoutCard Component
 * Displays today's scheduled workout or rest day
 *
 * @param {object} todaySchedule - { type, workoutId, workoutName, completed, dayName }
 * @param {function} onStartWorkout - Callback to start the workout
 * @param {function} onPickWorkout - Callback to pick a workout (if none selected)
 * @param {function} onLogRestDay - Callback to log rest day
 */
export default function TodayWorkoutCard({
  todaySchedule,
  onStartWorkout,
  onPickWorkout,
  onLogRestDay,
}) {
  if (!todaySchedule) return null;

  const { type, workoutId, workoutName, completed, dayName } = todaySchedule;
  const dayLabel = DAY_LABELS[dayName] || dayName;

  // Completed state
  if (completed) {
    return (
      <View style={styles.completedCard}>
        <View style={styles.completedIcon}>
          <Ionicons name="checkmark-circle" size={32} color="#34C759" />
        </View>
        <View style={styles.completedInfo}>
          <Text style={styles.completedTitle}>
            {type === DAY_TYPES.REST ? 'Rest day logged!' : 'Workout done!'}
          </Text>
          <Text style={styles.completedSubtitle}>
            {workoutName || 'Great job today'}
          </Text>
        </View>
      </View>
    );
  }

  // Rest day scheduled
  if (type === DAY_TYPES.REST) {
    return (
      <View style={styles.restDayCard}>
        <View style={styles.restDayHeader}>
          <View style={styles.restDayIcon}>
            <Ionicons name="bed" size={24} color="#8B5A2B" />
          </View>
          <View style={styles.restDayInfo}>
            <Text style={styles.restDayTitle}>Scheduled Rest Day</Text>
            <Text style={styles.restDaySubtitle}>
              Recovery is part of the journey
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logRestButton}
          onPress={onLogRestDay}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.logRestButtonText}>Log Rest Day</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Workout day - no specific workout picked
  if (type === DAY_TYPES.WORKOUT && !workoutId) {
    return (
      <View style={styles.pickWorkoutCard}>
        <View style={styles.pickWorkoutHeader}>
          <View style={styles.pickWorkoutIcon}>
            <Ionicons name="fitness" size={24} color="#FF9500" />
          </View>
          <View style={styles.pickWorkoutInfo}>
            <Text style={styles.pickWorkoutTitle}>
              {dayLabel} is a workout day!
            </Text>
            <Text style={styles.pickWorkoutSubtitle}>
              You planned to exercise today
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.pickButton}
          onPress={onPickWorkout}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.pickButtonText}>Pick a Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Workout day with specific workout selected
  if (type === DAY_TYPES.WORKOUT && workoutId) {
    return (
      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutIcon}>
            <Ionicons name="barbell" size={24} color="#fff" />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutLabel}>TODAY'S PLAN</Text>
            <Text style={styles.workoutTitle}>{workoutName}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStartWorkout?.(workoutId)}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // Completed Card
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  completedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },

  // Rest Day Card
  restDayCard: {
    backgroundColor: '#F5F0EB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  restDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restDayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restDayInfo: {
    flex: 1,
  },
  restDayTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
  },
  restDaySubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 2,
  },
  logRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  logRestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Pick Workout Card
  pickWorkoutCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#FF9500',
    borderStyle: 'dashed',
  },
  pickWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickWorkoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickWorkoutInfo: {
    flex: 1,
  },
  pickWorkoutTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
  },
  pickWorkoutSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 2,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Workout Card
  workoutCard: {
    backgroundColor: '#8B5A2B',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
