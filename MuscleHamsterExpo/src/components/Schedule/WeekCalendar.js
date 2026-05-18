// WeekCalendar - Mon-Sun week view for scheduling
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DayCell from './DayCell';
import { StatIcons } from '../../config/AssetImages';
import {
  DAYS_OF_WEEK,
  getTodayName,
  isCurrentWeek,
} from '../../services/ScheduleService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * WeekCalendar Component
 * Displays a full week (Mon-Sun) for scheduling workouts
 *
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @param {object} schedule - { days: { monday: {...}, ... } }
 * @param {function} onDayPress - Callback when a day is pressed
 * @param {boolean} showNavigation - Show week header
 */
export default function WeekCalendar({
  weekStart,
  schedule,
  onDayPress,
  showNavigation = true,
}) {
  const todayName = getTodayName();
  const isThisWeek = isCurrentWeek(weekStart);
  const days = schedule?.days || {};

  // Calculate cell width based on screen width
  // 7 days + gaps + padding
  const horizontalPadding = 16 * 2; // 16px on each side
  const gapWidth = 6 * 6; // 6px gap between 7 cells
  const availableWidth = SCREEN_WIDTH - horizontalPadding - gapWidth;
  const cellWidth = Math.floor(availableWidth / 7);

  return (
    <View style={styles.container}>
      {/* Week Header - Simple "This Week" title */}
      {showNavigation && (
        <View style={styles.header}>
          <Text style={styles.weekText}>This Week</Text>
        </View>
      )}

      {/* Days Grid */}
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map((dayName) => (
          <DayCell
            key={dayName}
            dayName={dayName}
            dayData={days[dayName]}
            isToday={isThisWeek && dayName === todayName}
            onPress={onDayPress}
            cellWidth={cellWidth}
          />
        ))}
      </View>

      {/* Week Summary */}
      <WeekSummary schedule={schedule} />
    </View>
  );
}

/**
 * WeekSummary - Shows quick stats for the week
 */
function WeekSummary({ schedule }) {
  const days = schedule?.days || {};

  // Count scheduled workouts and completed
  let scheduledCount = 0;
  let completedCount = 0;
  let restDayCount = 0;

  DAYS_OF_WEEK.forEach((day) => {
    const dayData = days[day];
    if (dayData?.type === 'workout') {
      scheduledCount++;
      if (dayData.completed) completedCount++;
    } else if (dayData?.type === 'rest') {
      restDayCount++;
      if (dayData.completed) completedCount++;
    }
  });

  if (scheduledCount === 0 && restDayCount === 0) {
    return null; // No summary if nothing scheduled
  }

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Image source={StatIcons.workout} style={{ width: 16, height: 16 }} resizeMode="contain" />
        <Text style={styles.summaryText}>
          {completedCount}/{scheduledCount + restDayCount} done
        </Text>
      </View>
      {restDayCount > 0 && (
        <View style={styles.summaryItem}>
          <Ionicons name="bed" size={14} color="#6B5D52" />
          <Text style={styles.summaryText}>
            {restDayCount} rest {restDayCount === 1 ? 'day' : 'days'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F0EB',
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#6B5D52',
  },
});
