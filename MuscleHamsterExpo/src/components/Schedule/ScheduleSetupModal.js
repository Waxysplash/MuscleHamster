// ScheduleSetupModal - First-time setup for workout preferences
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAYS_OF_WEEK, DAY_LABELS } from '../../services/ScheduleService';

// Preset time options
const TIME_OPTIONS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
  { label: '8:00 PM', value: '20:00' },
];

/**
 * ScheduleSetupModal Component
 * First-time setup flow for workout preferences
 *
 * @param {boolean} visible - Whether modal is visible
 * @param {function} onComplete - Callback with preferences when setup completes
 * @param {function} onSkip - Callback when user skips setup
 */
export default function ScheduleSetupModal({
  visible,
  onComplete,
  onSkip,
}) {
  // State
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [selectedDays, setSelectedDays] = useState(['monday', 'wednesday', 'friday']);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  // Handle day count selection
  const handleDaysPerWeekChange = (count) => {
    setDaysPerWeek(count);

    // Auto-select days based on count (spread evenly through the week)
    const autoSelectedDays = getRecommendedDays(count);
    setSelectedDays(autoSelectedDays);
  };

  // Get recommended days for a given count
  const getRecommendedDays = (count) => {
    const recommendations = {
      1: ['wednesday'],
      2: ['monday', 'thursday'],
      3: ['monday', 'wednesday', 'friday'],
      4: ['monday', 'tuesday', 'thursday', 'friday'],
      5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      7: DAYS_OF_WEEK,
    };
    return recommendations[count] || recommendations[3];
  };

  // Toggle a day selection
  const toggleDay = (dayName) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayName)) {
        // Don't allow deselecting if at minimum
        if (prev.length <= 1) return prev;
        return prev.filter((d) => d !== dayName);
      } else {
        return [...prev, dayName].sort(
          (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
        );
      }
    });

    // Update days per week count
    setDaysPerWeek((prev) => {
      const newCount = selectedDays.includes(dayName)
        ? Math.max(1, prev - 1)
        : Math.min(7, prev + 1);
      return newCount;
    });
  };

  // Get display label for current time
  const getTimeLabel = () => {
    const option = TIME_OPTIONS.find((t) => t.value === reminderTime);
    return option ? option.label : '7:00 AM';
  };

  // Handle time selection
  const handleTimeSelect = (timeValue) => {
    setReminderTime(timeValue);
    setShowTimeOptions(false);
  };

  // Handle completion
  const handleComplete = () => {
    onComplete?.({
      daysPerWeek: selectedDays.length,
      preferredDays: selectedDays,
      reminderTime: reminderTime,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="calendar" size={48} color="#FF9500" />
            <Text style={styles.title}>Set Up Your Week</Text>
            <Text style={styles.subtitle}>
              Plan when you want to work out and we'll help you stay on track
            </Text>
          </View>

          {/* Days Per Week */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How many days per week?
            </Text>
            <View style={styles.daysCountRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    selectedDays.length === count && styles.countButtonSelected,
                  ]}
                  onPress={() => handleDaysPerWeekChange(count)}
                >
                  <Text
                    style={[
                      styles.countText,
                      selectedDays.length === count && styles.countTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Select Days */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Which days work best?
            </Text>
            <View style={styles.daysGrid}>
              {DAYS_OF_WEEK.map((dayName) => (
                <TouchableOpacity
                  key={dayName}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(dayName) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDay(dayName)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(dayName) && styles.dayTextSelected,
                    ]}
                  >
                    {DAY_LABELS[dayName]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reminder Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              When should we remind you?
            </Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimeOptions(!showTimeOptions)}
            >
              <Ionicons name="notifications" size={24} color="#FF9500" />
              <Text style={styles.timeText}>{getTimeLabel()}</Text>
              <Ionicons
                name={showTimeOptions ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#8B5A2B"
              />
            </TouchableOpacity>

            {showTimeOptions && (
              <View style={styles.timeOptionsContainer}>
                {TIME_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timeOption,
                      reminderTime === option.value && styles.timeOptionSelected,
                    ]}
                    onPress={() => handleTimeSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        reminderTime === option.value && styles.timeOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {reminderTime === option.value && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Ionicons name="sparkles" size={24} color="#FF9500" />
            <Text style={styles.summaryText}>
              You'll work out{' '}
              <Text style={styles.summaryHighlight}>
                {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'}
              </Text>
              {' '}per week with a reminder at{' '}
              <Text style={styles.summaryHighlight}>{getTimeLabel()}</Text>
            </Text>
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>Set Up My Week</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A3728',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
  },
  daysCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E0DB',
  },
  countButtonSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  countText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B5D52',
  },
  countTextSelected: {
    color: '#fff',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: '#E5E0DB',
  },
  dayButtonSelected: {
    backgroundColor: '#8B5A2B',
    borderColor: '#8B5A2B',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B5D52',
  },
  dayTextSelected: {
    color: '#fff',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  timeText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
  },
  timeOptionsContainer: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F0EB',
    gap: 6,
  },
  timeOptionSelected: {
    backgroundColor: '#8B5A2B',
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A3728',
  },
  timeOptionTextSelected: {
    color: '#fff',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    color: '#6B5D52',
    lineHeight: 22,
  },
  summaryHighlight: {
    fontWeight: '700',
    color: '#4A3728',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E0DB',
    backgroundColor: '#FFF8F0',
  },
  completeButton: {
    backgroundColor: '#8B5A2B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: '#6B5D52',
  },
});
