// HorizontalDaySlider - Swipeable Mon-Sun strip with snap scrolling
import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import SliderDayItem from './SliderDayItem';
import { DAYS_OF_WEEK, getTodayName } from '../../services/ScheduleService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 56; // Width of each day item
const ITEM_SPACING = 4;
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_SPACING;

/**
 * HorizontalDaySlider Component
 * Displays Mon-Sun as horizontal swipeable strip
 * Auto-selects today on mount
 *
 * @param {object} schedule - { days: { monday: {...}, ... } }
 * @param {string} selectedDay - Currently selected day name
 * @param {function} onDaySelect - Callback when day is selected
 */
export default function HorizontalDaySlider({
  schedule,
  selectedDay,
  onDaySelect,
}) {
  const flatListRef = useRef(null);
  const todayName = getTodayName();

  // Scroll to selected day
  const scrollToDay = useCallback((dayName) => {
    const index = DAYS_OF_WEEK.indexOf(dayName);
    if (index !== -1 && flatListRef.current) {
      // Calculate offset to center the selected item
      const offset = Math.max(0, index * TOTAL_ITEM_WIDTH - (SCREEN_WIDTH - TOTAL_ITEM_WIDTH) / 2);
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  }, []);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (selectedDay) {
      // Small delay to ensure FlatList is rendered
      setTimeout(() => scrollToDay(selectedDay), 100);
    }
  }, []);

  // Scroll when selection changes externally
  useEffect(() => {
    if (selectedDay) {
      scrollToDay(selectedDay);
    }
  }, [selectedDay, scrollToDay]);

  const handleDayPress = (dayName, dayData) => {
    onDaySelect?.(dayName, dayData);
  };

  // Force re-render when schedule changes by creating unique keys
  const getItemKey = (dayName) => {
    const dayData = schedule?.days?.[dayName];
    const workoutCount = dayData?.workouts?.length || 0;
    const dayType = dayData?.type || 'empty';
    return `${dayName}-${dayType}-${workoutCount}`;
  };

  const renderItem = ({ item: dayName }) => {
    const dayData = schedule?.days?.[dayName] || {};
    const isToday = dayName === todayName;
    const isSelected = dayName === selectedDay;

    // Debug log for each day
    if (dayData?.type && dayData.type !== 'empty') {
      console.log(`[HorizontalDaySlider] ${dayName}:`, {
        type: dayData.type,
        workouts: dayData.workouts?.length || 0
      });
    }

    return (
      <SliderDayItem
        key={getItemKey(dayName)}
        dayName={dayName}
        dayData={dayData}
        isToday={isToday}
        isSelected={isSelected}
        onPress={handleDayPress}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>

      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={DAYS_OF_WEEK}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TOTAL_ITEM_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
          getItemLayout={(data, index) => ({
            length: TOTAL_ITEM_WIDTH,
            offset: TOTAL_ITEM_WIDTH * index,
            index,
          })}
          extraData={JSON.stringify(schedule?.days || {})}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
    textAlign: 'center',
  },
  sliderContainer: {
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 8,
  },
});
