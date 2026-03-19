// DayCell - Individual day in the week calendar
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
 * DayCell Component
 * Displays a single day in the week calendar
 *
 * @param {string} dayName - 'monday', 'tuesday', etc.
 * @param {object} dayData - { type, workoutId, workoutName, completed, completedAt }
 * @param {boolean} isToday - Whether this is today
 * @param {function} onPress - Callback when cell is pressed
 * @param {number} cellWidth - Width of the cell
 */
export default function DayCell({
  dayName,
  dayData,
  isToday = false,
  onPress,
  cellWidth = 44,
}) {
  const dayType = dayData?.type || DAY_TYPES.EMPTY;
  const isCompleted = dayData?.completed === true;
  const workoutName = dayData?.workoutName;
  const hasWorkoutPicked = dayType === DAY_TYPES.WORKOUT && dayData?.workoutId;

  // Determine cell appearance based on state
  const getCellStyle = () => {
    const baseStyle = [styles.cell, { width: cellWidth, height: cellWidth + 24 }];

    if (isToday) {
      baseStyle.push(styles.todayCell);
    }

    if (isCompleted) {
      baseStyle.push(styles.completedCell);
    }

    return baseStyle;
  };

  // Render the icon/indicator for this day
  const renderIcon = () => {
    if (isCompleted) {
      return (
        <View style={[styles.iconContainer, styles.completedIcon]}>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </View>
      );
    }

    if (dayType === DAY_TYPES.REST) {
      return (
        <View style={[styles.iconContainer, styles.restIcon]}>
          <Ionicons name="bed" size={18} color="#8B5A2B" />
        </View>
      );
    }

    if (dayType === DAY_TYPES.WORKOUT) {
      if (hasWorkoutPicked) {
        return (
          <View style={[styles.iconContainer, styles.workoutIcon]}>
            <Ionicons name="barbell" size={18} color="#fff" />
          </View>
        );
      } else {
        // Workout day without specific workout
        return (
          <View style={[styles.iconContainer, styles.workoutDayIcon]}>
            <Ionicons name="fitness" size={18} color="#FF9500" />
          </View>
        );
      }
    }

    // Empty day - no icon
    return (
      <View style={[styles.iconContainer, styles.emptyIcon]} />
    );
  };

  // Get truncated workout name
  const getDisplayName = () => {
    if (dayType === DAY_TYPES.REST) {
      return 'Rest';
    }

    if (dayType === DAY_TYPES.WORKOUT && workoutName) {
      // Truncate to first word or 6 chars
      const firstWord = workoutName.split(' ')[0];
      return firstWord.length > 7 ? firstWord.substring(0, 6) + '...' : firstWord;
    }

    return '';
  };

  return (
    <TouchableOpacity
      style={getCellStyle()}
      onPress={() => onPress?.(dayName, dayData)}
      activeOpacity={0.7}
      accessibilityLabel={`${DAY_LABELS[dayName]} - ${dayType === DAY_TYPES.EMPTY ? 'No workout scheduled' : workoutName || dayType}`}
    >
      {/* Day label */}
      <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
        {DAY_LABELS[dayName]}
      </Text>

      {/* Icon */}
      {renderIcon()}

      {/* Workout name (truncated) */}
      <Text
        style={[styles.workoutName, isCompleted && styles.completedText]}
        numberOfLines={1}
      >
        {getDisplayName()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
  },
  todayCell: {
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  completedCell: {
    backgroundColor: '#E8F5E9',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5D52',
    marginBottom: 4,
  },
  todayLabel: {
    color: '#FF9500',
    fontWeight: '700',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyIcon: {
    backgroundColor: '#F5F0EB',
  },
  workoutIcon: {
    backgroundColor: '#8B5A2B',
  },
  workoutDayIcon: {
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
  workoutName: {
    fontSize: 9,
    color: '#6B5D52',
    textAlign: 'center',
    maxWidth: '100%',
  },
  completedText: {
    color: '#34C759',
  },
});
