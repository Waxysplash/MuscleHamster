// AddWorkoutModal - 2-step flow: Pick body parts → Pick workout
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAY_LABELS, DAY_TYPES } from '../../services/ScheduleService';
import { WorkoutService } from '../../services/WorkoutService';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';
import { BodyFocus, BodyFocusInfo } from '../../models/Workout';

// Body part options for selection
const BODY_PART_OPTIONS = [
  { id: BodyFocus.FULL_BODY, name: 'Full Body', icon: 'body-outline', color: '#FF9500' },
  { id: BodyFocus.UPPER_BODY, name: 'Upper Body', icon: 'fitness-outline', color: '#4ECDC4' },
  { id: BodyFocus.LOWER_BODY, name: 'Lower Body', icon: 'footsteps-outline', color: '#FF6B6B' },
  { id: BodyFocus.CHEST, name: 'Chest', icon: 'shield-outline', color: '#F39C12' },
  { id: BodyFocus.BACK, name: 'Back', icon: 'arrow-back-outline', color: '#45B7D1' },
  { id: BodyFocus.ARMS, name: 'Arms', icon: 'hand-left-outline', color: '#9B59B6' },
  { id: BodyFocus.SHOULDERS, name: 'Shoulders', icon: 'expand-outline', color: '#E67E22' },
  { id: BodyFocus.LEGS, name: 'Legs', icon: 'walk-outline', color: '#E74C3C' },
  { id: BodyFocus.CORE, name: 'Core', icon: 'ellipse-outline', color: '#8B5A2B' },
  { id: 'cardio', name: 'Cardio', icon: 'heart-outline', color: '#FF3B30' },
];

/**
 * AddWorkoutModal Component
 * 2-step flow for selecting a workout for a specific day
 * Step 1: Pick body parts
 * Step 2: Pick workout from matching results
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
  const [step, setStep] = useState(1); // 1 = body parts, 2 = workouts
  const [selectedBodyParts, setSelectedBodyParts] = useState([]);
  const [matchingWorkouts, setMatchingWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get custom workouts
  const { customWorkouts } = useCustomWorkouts();

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedBodyParts([]);
      setMatchingWorkouts([]);
    }
  }, [visible]);

  // Toggle body part selection
  const toggleBodyPart = (bodyPartId) => {
    setSelectedBodyParts((prev) => {
      if (prev.includes(bodyPartId)) {
        return prev.filter((id) => id !== bodyPartId);
      }
      return [...prev, bodyPartId];
    });
  };

  // Load workouts matching selected body parts
  const loadMatchingWorkouts = useCallback(async () => {
    if (selectedBodyParts.length === 0) return;

    setIsLoading(true);
    try {
      // Get stock workouts matching body focus
      const stockWorkouts = await WorkoutService.getWorkoutsByBodyFocus(selectedBodyParts);

      // Filter custom workouts by tags/type
      const matchingCustom = customWorkouts.filter((w) => {
        // Check if workout type matches cardio selection
        if (selectedBodyParts.includes('cardio') && w.type === 'cardio') {
          return true;
        }
        // Check tags for body part matches
        if (w.tags && Array.isArray(w.tags)) {
          return w.tags.some((tag) =>
            selectedBodyParts.some((bp) =>
              tag.toLowerCase().includes(bp.toLowerCase()) ||
              bp.toLowerCase().includes(tag.toLowerCase())
            )
          );
        }
        return false;
      });

      setMatchingWorkouts([
        ...matchingCustom.map((w) => ({ ...w, isCustom: true })),
        ...stockWorkouts.map((w) => ({ ...w, isCustom: false })),
      ]);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBodyParts, customWorkouts]);

  // Handle "Next" button - go to step 2
  const handleNext = () => {
    setStep(2);
    loadMatchingWorkouts();
  };

  // Handle going back to step 1
  const handleBack = () => {
    setStep(1);
    setMatchingWorkouts([]);
  };

  // Handle workout selection
  const handleSelectWorkout = (workout) => {
    const type = workout.isCustom ? 'custom' : 'stock';
    onSelectWorkout?.(workout.id, type, workout.name);
  };

  // Check if day has content
  const hasContent = currentDayData && currentDayData.type !== DAY_TYPES.EMPTY;
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
          {step === 2 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#4A3728" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#4A3728" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{dayLabel}</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            // STEP 1: Body Part Selection
            <>
              {/* Quick Options */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Options</Text>

                {/* Rest Day */}
                <TouchableOpacity style={styles.quickOption} onPress={onSelectRest}>
                  <View style={[styles.quickOptionIcon, styles.restIcon]}>
                    <Ionicons name="bed" size={24} color="#8B5A2B" />
                  </View>
                  <View style={styles.quickOptionInfo}>
                    <Text style={styles.quickOptionTitle}>Rest Day</Text>
                    <Text style={styles.quickOptionSubtitle}>Recovery is part of the journey</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
                </TouchableOpacity>

                {/* Clear Day */}
                {hasContent && (
                  <TouchableOpacity style={styles.quickOption} onPress={onClear}>
                    <View style={[styles.quickOptionIcon, styles.clearIcon]}>
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </View>
                    <View style={styles.quickOptionInfo}>
                      <Text style={styles.quickOptionTitle}>Clear Day</Text>
                      <Text style={styles.quickOptionSubtitle}>Remove scheduled activity</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Body Part Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What do you want to work out?</Text>
                <Text style={styles.sectionSubtitle}>Select one or more areas</Text>

                <View style={styles.bodyPartGrid}>
                  {BODY_PART_OPTIONS.map((part) => {
                    const isSelected = selectedBodyParts.includes(part.id);
                    return (
                      <TouchableOpacity
                        key={part.id}
                        style={[
                          styles.bodyPartCard,
                          isSelected && styles.bodyPartCardSelected,
                        ]}
                        onPress={() => toggleBodyPart(part.id)}
                      >
                        <View
                          style={[
                            styles.bodyPartIcon,
                            { backgroundColor: isSelected ? part.color : '#F5F0EB' },
                          ]}
                        >
                          <Ionicons
                            name={part.icon}
                            size={24}
                            color={isSelected ? '#fff' : part.color}
                          />
                        </View>
                        <Text
                          style={[
                            styles.bodyPartName,
                            isSelected && styles.bodyPartNameSelected,
                          ]}
                        >
                          {part.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkmark}>
                            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Next Button */}
              {selectedBodyParts.length > 0 && (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>
                    Find Workouts ({selectedBodyParts.length} selected)
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            // STEP 2: Workout Selection
            <>
              {/* Selected Body Parts Summary */}
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryLabel}>Targeting:</Text>
                <View style={styles.selectedTags}>
                  {selectedBodyParts.map((id) => {
                    const part = BODY_PART_OPTIONS.find((p) => p.id === id);
                    return (
                      <View key={id} style={[styles.selectedTag, { backgroundColor: part?.color + '20' }]}>
                        <Text style={[styles.selectedTagText, { color: part?.color }]}>
                          {part?.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Loading */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#8B5A2B" />
                </View>
              )}

              {/* Workouts List */}
              {!isLoading && matchingWorkouts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Choose a Workout</Text>

                  {matchingWorkouts.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.workoutItem}
                      onPress={() => handleSelectWorkout(workout)}
                    >
                      <View
                        style={[
                          styles.workoutIcon,
                          workout.isCustom && styles.customWorkoutIcon,
                        ]}
                      >
                        <Ionicons
                          name={workout.isCustom ? 'person' : 'barbell'}
                          size={20}
                          color={workout.isCustom ? '#8B5A2B' : '#fff'}
                        />
                      </View>
                      <View style={styles.workoutInfo}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <Text style={styles.workoutMeta}>
                          {workout.isCustom
                            ? `${workout.completionCount || 0} times completed`
                            : workout.description || ''}
                        </Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color="#FF9500" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* No Results */}
              {!isLoading && matchingWorkouts.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="fitness-outline" size={48} color="#C4B5A8" />
                  <Text style={styles.emptyTitle}>No workouts found</Text>
                  <Text style={styles.emptyText}>
                    Try selecting different body parts or create a custom workout
                  </Text>
                </View>
              )}
            </>
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
  backButton: {
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
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginBottom: 16,
  },
  quickOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  bodyPartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bodyPartCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bodyPartCardSelected: {
    borderColor: '#8B5A2B',
    backgroundColor: '#FFF8F0',
  },
  bodyPartIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bodyPartName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3728',
    textAlign: 'center',
  },
  bodyPartNameSelected: {
    color: '#8B5A2B',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  selectedSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  selectedSummaryLabel: {
    fontSize: 13,
    color: '#6B5D52',
    marginBottom: 8,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
