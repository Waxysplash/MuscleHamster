// SliderDayItem - Individual day circle for horizontal slider
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAY_TYPES, DAY_LABELS } from '../../services/ScheduleService';
import { StatIcons } from '../../config/AssetImages';

/**
 * SliderDayItem Component
 * Displays a single day in the horizontal slider
 * Shows status indicator (empty/workout/rest/completed)
 *
 * @param {string} dayName - 'monday', 'tuesday', etc.
 * @param {object} dayData - { type, workouts[], completed }
 * @param {boolean} isToday - Whether this is today
 * @param {boolean} isSelected - Whether this day is selected
 * @param {function} onPress - Callback when pressed
 */
export default function SliderDayItem({
  dayName,
  dayData,
  isToday = false,
  isSelected = false,
  onPress,
}) {
  const dayType = dayData?.type || DAY_TYPES.EMPTY;
  const isCompleted = dayData?.completed === true;

  // Get workouts array (support both new and legacy format)
  const workouts = dayData?.workouts || [];
  const workoutCount = workouts.length;
  const hasLegacyWorkout = !workoutCount && dayData?.workoutId;
  const effectiveWorkoutCount = workoutCount || (hasLegacyWorkout ? 1 : 0);

  // Get short day label (first 3 letters)
  const getShortDayLabel = () => {
    const fullLabel = DAY_LABELS[dayName] || dayName;
    return fullLabel.substring(0, 3);
  };

  // Render status icon/indicator
  const renderIcon = () => {
    if (isCompleted) {
      return (
        <View style={[styles.iconContainer, styles.completedIcon]}>
          <Ionicons name="checkmark" size={22} color="#fff" />
        </View>
      );
    }

    if (dayType === DAY_TYPES.REST) {
      return (
        <View style={[styles.iconContainer, styles.restIcon]}>
          <Ionicons name="bed" size={20} color="#8B5A2B" />
        </View>
      );
    }

    if (dayType === DAY_TYPES.WORKOUT) {
      if (effectiveWorkoutCount > 1) {
        // Multiple workouts
        return (
          <View style={[styles.iconContainer, styles.multiWorkoutIcon]}>
            <Text style={styles.workoutCountText}>{effectiveWorkoutCount}</Text>
          </View>
        );
      } else if (effectiveWorkoutCount === 1) {
        // Single workout
        return (
          <View style={[styles.iconContainer, styles.workoutIcon]}>
            <Ionicons name="barbell" size={20} color="#fff" />
          </View>
        );
      } else {
        // Workout day without specific workout
        return (
          <View style={[styles.iconContainer, styles.plannedWorkoutIcon]}>
            <Image source={StatIcons.workout} style={{ width: 22, height: 22 }} resizeMode="contain" />
          </View>
        );
      }
    }

    // Empty day
    return (
      <View style={[styles.iconContainer, styles.emptyIcon]} />
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
      ]}
      onPress={() => onPress?.(dayName, dayData)}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityLabel={`${DAY_LABELS[dayName]} - ${dayType === DAY_TYPES.EMPTY ? 'No workout' : dayType}`}
    >
      {/* Day label */}
      <Text style={[
        styles.dayLabel,
        isToday && styles.todayLabel,
        isSelected && styles.selectedLabel,
      ]}>
        {getShortDayLabel()}
      </Text>

      {/* Icon */}
      <View style={[
        styles.iconWrapper,
        isSelected && styles.selectedIconWrapper,
        isToday && !isSelected && styles.todayIconWrapper,
      ]}>
        {renderIcon()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    minWidth: 60,
  },
  selectedContainer: {
    // Selected state handled by iconWrapper
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5D52',
    marginBottom: 6,
  },
  todayLabel: {
    color: '#FF9500',
    fontWeight: '700',
  },
  selectedLabel: {
    color: '#8B5A2B',
    fontWeight: '700',
  },
  iconWrapper: {
    padding: 3,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconWrapper: {
    borderColor: '#FF9500',
  },
  todayIconWrapper: {
    borderColor: '#FFD9A8',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    backgroundColor: '#F5F0EB',
  },
  workoutIcon: {
    backgroundColor: '#8B5A2B',
  },
  multiWorkoutIcon: {
    backgroundColor: '#FF9500',
  },
  workoutCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  plannedWorkoutIcon: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9500',
    borderStyle: 'dashed',
  },
  restIcon: {
    backgroundColor: '#F5F0EB',
  },
  completedIcon: {
    backgroundColor: '#34C759',
  },
});
