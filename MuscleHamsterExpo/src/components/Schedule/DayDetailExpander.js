// DayDetailExpander - Expandable view showing selected day's workouts
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAY_TYPES, DAY_LABELS } from '../../services/ScheduleService';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * DayDetailExpander Component
 * Shows content for the selected day with animation
 *
 * @param {string} dayName - Selected day name
 * @param {object} dayData - { type, workouts[], completed }
 * @param {function} onStartWorkout - Callback to start a workout
 * @param {function} onAddWorkout - Callback to open workout picker
 * @param {function} onLogRestDay - Callback to log rest day
 */
export default function DayDetailExpander({
  dayName,
  dayData,
  onStartWorkout,
  onAddWorkout,
  onLogRestDay,
}) {
  if (!dayName) return null;

  const dayLabel = DAY_LABELS[dayName] || dayName;
  const dayType = dayData?.type || DAY_TYPES.EMPTY;
  const isCompleted = dayData?.completed === true;

  // Get effective workouts
  const workouts = dayData?.workouts || [];
  const hasLegacyWorkout = !workouts.length && dayData?.workoutId;
  const effectiveWorkouts = hasLegacyWorkout
    ? [{ workoutId: dayData.workoutId, workoutName: dayData.workoutName, workoutType: dayData.workoutType }]
    : workouts;
  const workoutCount = effectiveWorkouts.length;

  // Animate layout changes
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [dayName, dayType, workoutCount]);

  // Completed state
  if (isCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completedCard}>
          <View style={styles.completedIcon}>
            <Ionicons name="checkmark-circle" size={32} color="#34C759" />
          </View>
          <View style={styles.completedInfo}>
            <Text style={styles.completedTitle}>
              {dayType === DAY_TYPES.REST ? 'Rest day logged!' : 'Workout done!'}
            </Text>
            <Text style={styles.completedSubtitle}>
              {workoutCount > 1
                ? `${workoutCount} workouts completed`
                : (effectiveWorkouts[0]?.workoutName || 'Great job!')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Rest day scheduled
  if (dayType === DAY_TYPES.REST) {
    return (
      <View style={styles.container}>
        <Text style={styles.dayTitle}>{dayLabel}</Text>
        <View style={styles.restDayCard}>
          <View style={styles.restDayHeader}>
            <View style={styles.restDayIcon}>
              <Ionicons name="bed" size={24} color="#8B5A2B" />
            </View>
            <View style={styles.restDayInfo}>
              <Text style={styles.restDayTitle}>Scheduled Rest Day</Text>
              <Text style={styles.restDaySubtitle}>Recovery is part of the journey</Text>
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
      </View>
    );
  }

  // Empty day or workout day without workouts selected
  if (dayType === DAY_TYPES.EMPTY || (dayType === DAY_TYPES.WORKOUT && workoutCount === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.dayTitle}>{dayLabel}</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No workout scheduled</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddWorkout?.(dayName)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.addButtonText}>Add a Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Workout day with workouts scheduled
  if (dayType === DAY_TYPES.WORKOUT && workoutCount > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.dayTitle}>{dayLabel}'s Workout</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onAddWorkout?.(dayName)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color="#8B5A2B" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Multiple workouts */}
        {workoutCount > 1 ? (
          <View style={styles.workoutList}>
            {effectiveWorkouts.map((w, index) => (
              <TouchableOpacity
                key={w.workoutId || index}
                style={styles.workoutListItem}
                onPress={() => onStartWorkout?.(w.workoutId)}
                activeOpacity={0.7}
              >
                <View style={styles.workoutListIcon}>
                  <Ionicons name="barbell" size={18} color="#8B5A2B" />
                </View>
                <Text style={styles.workoutListName} numberOfLines={1}>
                  {w.workoutName}
                </Text>
                <Ionicons name="play-circle" size={26} color="#FF9500" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          // Single workout
          <View style={styles.singleWorkoutCard}>
            <View style={styles.singleWorkoutHeader}>
              <View style={styles.singleWorkoutIcon}>
                <Ionicons name="barbell" size={24} color="#fff" />
              </View>
              <View style={styles.singleWorkoutInfo}>
                <Text style={styles.singleWorkoutLabel}>TODAY'S PLAN</Text>
                <Text style={styles.singleWorkoutTitle}>{effectiveWorkouts[0]?.workoutName}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStartWorkout?.(effectiveWorkouts[0]?.workoutId)}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Empty state
  emptyCard: {
    backgroundColor: '#F5F0EB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B5D52',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Completed state
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

  // Rest day
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

  // Edit button
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5A2B',
  },

  // Workout list (multiple workouts)
  workoutList: {
    gap: 10,
  },
  workoutListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutListIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutListName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },

  // Single workout card
  singleWorkoutCard: {
    backgroundColor: '#8B5A2B',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  singleWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  singleWorkoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleWorkoutInfo: {
    flex: 1,
  },
  singleWorkoutLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  singleWorkoutTitle: {
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
