// MiniWeekStrip - Compact week visualization for Home screen
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  DAYS_OF_WEEK,
  DAY_LABELS_SHORT,
  DAY_TYPES,
  getTodayName,
  isCurrentWeek,
} from '../../services/ScheduleService';

/**
 * MiniWeekStrip Component
 * Compact week visualization showing scheduled days
 *
 * Legend:
 * ● = workout scheduled (specific workout chosen)
 * ○ = workout day (preference set, but no specific workout yet)
 * 😴 = rest day
 * · = blank/off day
 *
 * @param {string} weekStart - Monday date (YYYY-MM-DD)
 * @param {object} schedule - { days: { monday: {...}, ... } }
 * @param {function} onPress - Callback when strip is pressed (navigate to My Plan)
 */
export default function MiniWeekStrip({
  weekStart,
  schedule,
  onPress,
}) {
  const todayName = getTodayName();
  const isThisWeek = isCurrentWeek(weekStart);
  const days = schedule?.days || {};

  // Get indicator for a day
  const getDayIndicator = (dayName) => {
    const dayData = days[dayName];

    if (!dayData || dayData.type === DAY_TYPES.EMPTY) {
      return { symbol: '·', color: '#D1C7BC' };
    }

    if (dayData.type === DAY_TYPES.REST) {
      if (dayData.completed) {
        return { symbol: '✓', color: '#34C759' };
      }
      return { symbol: '😴', color: '#8B5A2B', isEmoji: true };
    }

    if (dayData.type === DAY_TYPES.WORKOUT) {
      if (dayData.completed) {
        return { symbol: '✓', color: '#34C759' };
      }
      if (dayData.workoutId) {
        // Specific workout scheduled
        return { symbol: '●', color: '#FF9500' };
      }
      // Workout day but no specific workout
      return { symbol: '○', color: '#FF9500' };
    }

    return { symbol: '·', color: '#D1C7BC' };
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="View your weekly plan"
      accessibilityHint="Opens the workout planner"
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>This Week</Text>
        <Text style={styles.viewPlanText}>View Plan →</Text>
      </View>

      <View style={styles.daysRow}>
        {DAYS_OF_WEEK.map((dayName) => {
          const isToday = isThisWeek && dayName === todayName;
          const indicator = getDayIndicator(dayName);

          return (
            <View
              key={dayName}
              style={[
                styles.dayColumn,
                isToday && styles.todayColumn,
              ]}
            >
              <Text style={[
                styles.dayLabel,
                isToday && styles.todayLabel,
              ]}>
                {DAY_LABELS_SHORT[dayName]}
              </Text>
              <View style={[
                styles.indicatorContainer,
                isToday && styles.todayIndicatorContainer,
              ]}>
                {indicator.isEmoji ? (
                  <Text style={styles.emojiIndicator}>{indicator.symbol}</Text>
                ) : (
                  <Text style={[
                    styles.indicator,
                    { color: indicator.color },
                    indicator.symbol === '✓' && styles.checkmark,
                  ]}>
                    {indicator.symbol}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D52',
  },
  viewPlanText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  todayColumn: {
    // Highlight today
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B5D52',
    marginBottom: 6,
  },
  todayLabel: {
    color: '#FF9500',
    fontWeight: '600',
  },
  indicatorContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayIndicatorContainer: {
    backgroundColor: 'rgba(255,149,0,0.1)',
  },
  indicator: {
    fontSize: 18,
    fontWeight: '600',
  },
  emojiIndicator: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
  },
});
