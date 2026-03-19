// AddWorkoutModal - Pick a workout for a specific day
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAY_LABELS, DAY_TYPES } from '../../services/ScheduleService';
import { WorkoutService } from '../../services/WorkoutService';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';

/**
 * AddWorkoutModal Component
 * Modal for selecting a workout or rest day for a specific day
 *
 * @param {boolean} visible - Whether modal is visible
 * @param {string} dayName - Day being edited ('monday', etc.)
 * @param {object} currentDayData - Current day's schedule data
 * @param {function} onSelectWorkout - Callback when workout selected
 * @param {function} onSelectRest - Callback when rest day selected
 * @param {function} onClear - Callback to clear the day
 * @param {function} onClose - Callback to close modal
 */
export default function AddWorkoutModal({
  visible,
  dayName,
  currentDayData,
  onSelectWorkout,
  onSelectRest,
  onClear,
  onClose,
}) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [stockWorkouts, setStockWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get custom workouts
  const { customWorkouts } = useCustomWorkouts();

  // Load stock workouts
  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const workouts = await WorkoutService.getAllWorkouts();
      setStockWorkouts(workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadWorkouts();
      setSearchQuery('');
    }
  }, [visible, loadWorkouts]);

  // Filter workouts by search
  const filteredStockWorkouts = stockWorkouts.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomWorkouts = customWorkouts.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if day has content
  const hasContent = currentDayData && currentDayData.type !== DAY_TYPES.EMPTY;

  // Handle workout selection
  const handleSelectWorkout = (workout, type) => {
    onSelectWorkout?.(workout.id, type, workout.name);
  };

  const dayLabel = DAY_LABELS[dayName] || dayName;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#4A3728" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {dayLabel}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Options</Text>

            {/* Rest Day */}
            <TouchableOpacity
              style={styles.quickOption}
              onPress={onSelectRest}
            >
              <View style={[styles.quickOptionIcon, styles.restIcon]}>
                <Ionicons name="bed" size={24} color="#8B5A2B" />
              </View>
              <View style={styles.quickOptionInfo}>
                <Text style={styles.quickOptionTitle}>Rest Day</Text>
                <Text style={styles.quickOptionSubtitle}>
                  Recovery is part of the journey
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
            </TouchableOpacity>

            {/* Clear Day (if has content) */}
            {hasContent && (
              <TouchableOpacity
                style={styles.quickOption}
                onPress={onClear}
              >
                <View style={[styles.quickOptionIcon, styles.clearIcon]}>
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </View>
                <View style={styles.quickOptionInfo}>
                  <Text style={styles.quickOptionTitle}>Clear Day</Text>
                  <Text style={styles.quickOptionSubtitle}>
                    Remove scheduled activity
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B5D52" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts..."
              placeholderTextColor="#A89B8C"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#A89B8C" />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5A2B" />
            </View>
          )}

          {/* My Workouts (Custom) */}
          {!isLoading && filteredCustomWorkouts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Workouts</Text>
              {filteredCustomWorkouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutItem}
                  onPress={() => handleSelectWorkout(workout, 'custom')}
                >
                  <View style={[styles.workoutIcon, styles.customWorkoutIcon]}>
                    <Ionicons name="person" size={20} color="#8B5A2B" />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.completionCount || 0} times completed
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#FF9500" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Stock Workouts */}
          {!isLoading && filteredStockWorkouts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workouts</Text>
              {filteredStockWorkouts.slice(0, 15).map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutItem}
                  onPress={() => handleSelectWorkout(workout, 'stock')}
                >
                  <View style={styles.workoutIcon}>
                    <Ionicons name="barbell" size={20} color="#fff" />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.duration ? `${workout.duration}` : ''}
                      {workout.difficulty ? ` • ${workout.difficulty}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#FF9500" />
                </TouchableOpacity>
              ))}

              {filteredStockWorkouts.length > 15 && (
                <Text style={styles.moreText}>
                  +{filteredStockWorkouts.length - 15} more workouts
                </Text>
              )}
            </View>
          )}

          {/* No Results */}
          {!isLoading &&
            searchQuery.length > 0 &&
            filteredStockWorkouts.length === 0 &&
            filteredCustomWorkouts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#C4B5A8" />
                <Text style={styles.emptyTitle}>No workouts found</Text>
                <Text style={styles.emptyText}>
                  Try a different search term
                </Text>
              </View>
            )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0DB',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D52',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  quickOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restIcon: {
    backgroundColor: '#F5F0EB',
  },
  clearIcon: {
    backgroundColor: '#FFEBEE',
  },
  quickOptionInfo: {
    flex: 1,
  },
  quickOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
  },
  quickOptionSubtitle: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A3728',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#8B5A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customWorkoutIcon: {
    backgroundColor: '#FFF3E0',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  workoutMeta: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  moreText: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 4,
  },
});
