// WeekCalendar - Mon-Sun week view for scheduling
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DayCell from './DayCell';
import {
  DAYS_OF_WEEK,
  getTodayName,
  formatDateShort,
  getDateForDay,
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
 * @param {function} onPreviousWeek - Navigate to previous week
 * @param {function} onNextWeek - Navigate to next week
 * @param {function} onGoToCurrentWeek - Go back to current week
 * @param {boolean} showNavigation - Show week navigation arrows
 */
export default function WeekCalendar({
  weekStart,
  schedule,
  onDayPress,
  onPreviousWeek,
  onNextWeek,
  onGoToCurrentWeek,
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

  // Format week range for header
  const getWeekRangeText = () => {
    const monday = new Date(weekStart + 'T00:00:00');
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = formatDateShort(monday);
    const sunStr = formatDateShort(sunday);

    return `${monStr} - ${sunStr}`;
  };

  return (
    <View style={styles.container}>
      {/* Week Header with Navigation */}
      {showNavigation && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onPreviousWeek}
            accessibilityLabel="Previous week"
          >
            <Ionicons name="chevron-back" size={24} color="#8B5A2B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.weekLabel}
            onPress={!isThisWeek ? onGoToCurrentWeek : undefined}
            disabled={isThisWeek}
          >
            <Text style={styles.weekText}>
              {isThisWeek ? 'This Week' : getWeekRangeText()}
            </Text>
            {!isThisWeek && (
              <Text style={styles.returnText}>Tap to return to this week</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={onNextWeek}
            accessibilityLabel="Next week"
          >
            <Ionicons name="chevron-forward" size={24} color="#8B5A2B" />
          </TouchableOpacity>
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
        <Ionicons name="barbell" size={14} color="#8B5A2B" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
  },
  returnText: {
    fontSize: 11,
    color: '#FF9500',
    marginTop: 2,
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
