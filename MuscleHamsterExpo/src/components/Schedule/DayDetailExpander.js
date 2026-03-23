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
 * @param {function} onViewProgress - Callback to view workout progress log
 * @param {function} onMarkWorkoutComplete - Callback to mark a workout as complete
 * @param {function} onAddWorkout - Callback to open workout picker
 * @param {function} onLogRestDay - Callback to log rest day
 */
export default function DayDetailExpander({
  dayName,
  dayData,
  onViewProgress,
  onMarkWorkoutComplete,
  onAddWorkout,
  onLogRestDay,
}) {
  if (!dayName) return null;

  const dayLabel = DAY_LABELS[dayName] || dayName;
  const dayType = dayData?.type || DAY_TYPES.EMPTY;

  // Get effective workouts
  const workouts = dayData?.workouts || [];
  const hasLegacyWorkout = !workouts.length && dayData?.workoutId;
  const effectiveWorkouts = hasLegacyWorkout
    ? [{ workoutId: dayData.workoutId, workoutName: dayData.workoutName, workoutType: dayData.workoutType }]
    : workouts;
  const workoutCount = effectiveWorkouts.length;

  // Count how many workouts are completed
  const completedWorkoutCount = effectiveWorkouts.filter(w => w.completed).length;

  // Only show day-level completed state for rest days that have been logged
  const isRestDayCompleted = dayData?.completed === true && dayType === DAY_TYPES.REST;

  // Debug logging
  console.log('[DayDetailExpander] Rendering:', {
    dayName,
    dayType,
    workoutCount,
    completedWorkoutCount,
    isRestDayCompleted,
    rawDayData: dayData,
  });

  // Animate layout changes
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [dayName, dayType, workoutCount]);

  // Rest day completed state (only for rest days)
  if (isRestDayCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completedCard}>
          <View style={styles.completedIcon}>
            <Ionicons name="checkmark-circle" size={32} color="#34C759" />
          </View>
          <View style={styles.completedInfo}>
            <Text style={styles.completedTitle}>Rest day logged!</Text>
            <Text style={styles.completedSubtitle}>Great job taking care of yourself!</Text>
          </View>
        </View>
      </View>
    );
  }

  // Rest day scheduled (not yet logged)
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

        {/* Workout list */}
        <View style={styles.workoutList}>
          {effectiveWorkouts.map((w, index) => {
            const isWorkoutCompleted = w.completed === true;
            return (
              <View key={w.workoutId || index} style={styles.workoutListItem}>
                {/* Checkbox to mark complete */}
                <TouchableOpacity
                  style={styles.checkboxButton}
                  onPress={() => onMarkWorkoutComplete?.(w.workoutId)}
                  activeOpacity={0.7}
                  accessibilityLabel={isWorkoutCompleted ? `Unmark ${w.workoutName}` : `Mark ${w.workoutName} as complete`}
                >
                  <View style={[styles.checkbox, isWorkoutCompleted && styles.checkboxChecked]}>
                    {isWorkoutCompleted && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Workout name - tappable for progress log */}
                <TouchableOpacity
                  style={styles.workoutNameButton}
                  onPress={() => onViewProgress?.(w.workoutId)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.workoutListName, isWorkoutCompleted && styles.workoutListNameCompleted]} numberOfLines={1}>
                    {w.workoutName}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#8B5A2B" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Show completion progress if some workouts are done */}
        {completedWorkoutCount > 0 && completedWorkoutCount < workoutCount && (
          <View style={styles.progressRow}>
            <Ionicons name="fitness-outline" size={16} color="#6B5D52" />
            <Text style={styles.progressText}>
              {completedWorkoutCount} of {workoutCount} done
            </Text>
          </View>
        )}

        {/* Show celebration when all workouts are done */}
        {completedWorkoutCount === workoutCount && workoutCount > 0 && (
          <View style={styles.allDoneRow}>
            <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            <Text style={styles.allDoneText}>All workouts done!</Text>
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

  // Workout list
  workoutList: {
    gap: 10,
  },
  workoutListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  checkboxButton: {
    padding: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#8B5A2B',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  workoutNameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  workoutListName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  workoutListNameCompleted: {
    color: '#6B5D52',
    textDecorationLine: 'line-through',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#6B5D52',
    fontWeight: '500',
  },
  allDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  allDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
});
