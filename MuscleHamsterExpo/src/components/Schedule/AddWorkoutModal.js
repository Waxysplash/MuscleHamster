// AddWorkoutModal - 2-step flow: Pick category → Pick workout
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
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';

// Category options for selection (matches Add Workout screen types + body parts)
const CATEGORY_OPTIONS = [
  { id: 'arms', name: 'Arms', icon: 'hand-left-outline', color: '#9B59B6' },
  { id: 'legs', name: 'Legs', icon: 'walk-outline', color: '#E74C3C' },
  { id: 'shoulders', name: 'Shoulders', icon: 'expand-outline', color: '#E67E22' },
  { id: 'chest', name: 'Chest', icon: 'shield-outline', color: '#F39C12' },
  { id: 'back', name: 'Back', icon: 'arrow-back-outline', color: '#45B7D1' },
  { id: 'core', name: 'Core', icon: 'ellipse-outline', color: '#8B5A2B' },
  { id: 'cardio', name: 'Cardio', icon: 'heart-outline', color: '#FF3B30' },
  { id: 'class', name: 'Class', icon: 'people-outline', color: '#AF52DE' },
];

// Gym workouts from Browse tab (same as GymBodyPartScreen)
const GYM_WORKOUTS = {
  legs: [
    { id: 'gym-legs-1', name: 'Barbell Back Squat', target: 'Quads/Glutes' },
    { id: 'gym-legs-2', name: 'Leg Press', target: 'Quads' },
    { id: 'gym-legs-3', name: 'Romanian Deadlift', target: 'Hamstrings/Glutes' },
    { id: 'gym-legs-4', name: 'Walking Lunges', target: 'Glutes/Quads' },
    { id: 'gym-legs-5', name: 'Leg Extensions', target: 'Quads Isolation' },
    { id: 'gym-legs-6', name: 'Lying Leg Curl', target: 'Hamstrings' },
    { id: 'gym-legs-7', name: 'Goblet Squat', target: 'Quads/Core' },
    { id: 'gym-legs-8', name: 'Bulgarian Split Squat', target: 'Quads/Glutes' },
    { id: 'gym-legs-9', name: 'Seated Calf Raise', target: 'Soleus' },
    { id: 'gym-legs-10', name: 'Hack Squat', target: 'Quads' },
  ],
  arms: [
    { id: 'gym-arms-1', name: 'Barbell Curls', target: 'Biceps' },
    { id: 'gym-arms-2', name: 'Tricep Pushdowns', target: 'Triceps' },
    { id: 'gym-arms-3', name: 'Dumbbell Hammer Curls', target: 'Biceps/Forearms' },
    { id: 'gym-arms-4', name: 'Skull Crushers', target: 'Triceps' },
    { id: 'gym-arms-5', name: 'Preacher Curls', target: 'Biceps' },
    { id: 'gym-arms-6', name: 'Overhead DB Extension', target: 'Triceps' },
    { id: 'gym-arms-7', name: 'Concentration Curls', target: 'Bicep Peak' },
    { id: 'gym-arms-8', name: 'Dips (Bench or Bar)', target: 'Triceps' },
    { id: 'gym-arms-9', name: 'Incline Dumbbell Curl', target: 'Biceps' },
    { id: 'gym-arms-10', name: 'Cable Overhead Extension', target: 'Triceps' },
  ],
  back: [
    { id: 'gym-back-1', name: 'Pull-Ups', target: 'Lat Width' },
    { id: 'gym-back-2', name: 'Lat Pulldown', target: 'Outer Lats' },
    { id: 'gym-back-3', name: 'Bent-Over Barbell Row', target: 'Mid-Back Thickness' },
    { id: 'gym-back-4', name: 'Seated Cable Row', target: 'Mid-Back/Rhomboids' },
    { id: 'gym-back-5', name: 'One-Arm Dumbbell Row', target: 'Lower Lats' },
    { id: 'gym-back-6', name: 'Deadlift', target: 'Full Back/Posterior Chain' },
    { id: 'gym-back-7', name: 'T-Bar Row', target: 'Mid-Back Thickness' },
    { id: 'gym-back-8', name: 'Face Pulls', target: 'Rear Delts/Upper Traps' },
    { id: 'gym-back-9', name: 'Chest-Supported Row', target: 'Upper Back' },
    { id: 'gym-back-10', name: 'Straight-Arm Pulldown', target: 'Lat Isolation' },
  ],
  chest: [
    { id: 'gym-chest-1', name: 'Barbell Bench Press', target: 'Mid-Pectorals' },
    { id: 'gym-chest-2', name: 'Dumbbell Bench Press', target: 'Mid-Pectorals' },
    { id: 'gym-chest-3', name: 'Incline Dumbbell Press', target: 'Upper Chest' },
    { id: 'gym-chest-4', name: 'Chest Dip', target: 'Lower Chest' },
    { id: 'gym-chest-5', name: 'Cable Fly', target: 'Inner Chest' },
    { id: 'gym-chest-6', name: 'Push-Ups', target: 'Overall Chest' },
    { id: 'gym-chest-7', name: 'Pec Deck Machine', target: 'Inner Chest' },
    { id: 'gym-chest-8', name: 'Decline Bench Press', target: 'Lower Chest' },
    { id: 'gym-chest-9', name: 'Dumbbell Pullover', target: 'Chest/Serratus' },
    { id: 'gym-chest-10', name: 'Machine Chest Press', target: 'Overall Chest' },
  ],
  shoulders: [
    { id: 'gym-shoulders-1', name: 'Overhead Barbell Press', target: 'Front/Side Delts' },
    { id: 'gym-shoulders-2', name: 'Dumbbell Lateral Raise', target: 'Side Delts' },
    { id: 'gym-shoulders-3', name: 'Seated Dumbbell Press', target: 'Front/Side Delts' },
    { id: 'gym-shoulders-4', name: 'Arnold Press', target: 'All Three Heads' },
    { id: 'gym-shoulders-5', name: 'Front Dumbbell Raise', target: 'Front Delts' },
    { id: 'gym-shoulders-6', name: 'Reverse Cable Fly', target: 'Rear Delts' },
    { id: 'gym-shoulders-7', name: 'Upright Row', target: 'Side Delts/Traps' },
    { id: 'gym-shoulders-8', name: 'Face Pulls', target: 'Rear Delts/Traps' },
    { id: 'gym-shoulders-9', name: 'Bent-Over Rear Delt Fly', target: 'Rear Delts' },
    { id: 'gym-shoulders-10', name: 'Smith Machine Press', target: 'Front/Side Delts' },
  ],
  core: [
    { id: 'gym-core-1', name: 'Plank', target: 'Entire Core' },
    { id: 'gym-core-2', name: 'Hanging Leg Raise', target: 'Lower Abs' },
    { id: 'gym-core-3', name: 'Bicycle Crunch', target: 'Obliques/Abs' },
    { id: 'gym-core-4', name: 'Cable Woodchopper', target: 'Obliques' },
    { id: 'gym-core-5', name: 'Ab Wheel Rollout', target: 'Deep Core' },
    { id: 'gym-core-6', name: 'Russian Twist', target: 'Obliques' },
    { id: 'gym-core-7', name: 'Dead Bug', target: 'Core Stability' },
    { id: 'gym-core-8', name: 'Hollow Body Hold', target: 'Deep Core' },
    { id: 'gym-core-9', name: "Captain's Chair Raise", target: 'Lower Abs' },
    { id: 'gym-core-10', name: 'Side Plank', target: 'Obliques' },
  ],
};

/**
 * AddWorkoutModal Component
 * 2-step flow for selecting a workout for a specific day
 * Step 1: Pick category (body part, cardio, or class)
 * Step 2: Pick workout from Browse library or My Workouts
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
  const [step, setStep] = useState(1); // 1 = categories, 2 = workouts
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [matchingWorkouts, setMatchingWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get custom workouts
  const { customWorkouts } = useCustomWorkouts();

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedCategories([]);
      setMatchingWorkouts([]);
    }
  }, [visible]);

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  // Load workouts matching selected categories
  const loadMatchingWorkouts = useCallback(() => {
    if (selectedCategories.length === 0) return;

    setIsLoading(true);

    // Small delay to show loading state
    setTimeout(() => {
      const results = [];

      // Get workouts from Browse library (GYM_WORKOUTS)
      selectedCategories.forEach((category) => {
        if (GYM_WORKOUTS[category]) {
          GYM_WORKOUTS[category].forEach((workout) => {
            results.push({
              ...workout,
              isCustom: false,
              category: category,
            });
          });
        }
      });

      // Get matching custom workouts
      const matchingCustom = customWorkouts.filter((w) => {
        // Check if workout type matches category (cardio, class)
        if (selectedCategories.includes(w.type)) {
          return true;
        }
        // Check tags for body part matches
        if (w.tags && Array.isArray(w.tags)) {
          return w.tags.some((tag) =>
            selectedCategories.some((cat) =>
              tag.toLowerCase().includes(cat.toLowerCase()) ||
              cat.toLowerCase().includes(tag.toLowerCase())
            )
          );
        }
        return false;
      });

      // Add custom workouts at the top
      const customResults = matchingCustom.map((w) => ({
        ...w,
        isCustom: true,
      }));

      setMatchingWorkouts([...customResults, ...results]);
      setIsLoading(false);
    }, 200);
  }, [selectedCategories, customWorkouts]);

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
    const type = workout.isCustom ? 'custom' : 'gym';
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
            // STEP 1: Category Selection
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

              {/* Category Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What do you want to work out?</Text>
                <Text style={styles.sectionSubtitle}>Select one or more categories</Text>

                <View style={styles.categoryGrid}>
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryCard,
                          isSelected && styles.categoryCardSelected,
                        ]}
                        onPress={() => toggleCategory(cat.id)}
                      >
                        <View
                          style={[
                            styles.categoryIcon,
                            { backgroundColor: isSelected ? cat.color : '#F5F0EB' },
                          ]}
                        >
                          <Ionicons
                            name={cat.icon}
                            size={24}
                            color={isSelected ? '#fff' : cat.color}
                          />
                        </View>
                        <Text
                          style={[
                            styles.categoryName,
                            isSelected && styles.categoryNameSelected,
                          ]}
                        >
                          {cat.name}
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
              {selectedCategories.length > 0 && (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>
                    Find Workouts ({selectedCategories.length} selected)
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            // STEP 2: Workout Selection
            <>
              {/* Selected Categories Summary */}
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryLabel}>Targeting:</Text>
                <View style={styles.selectedTags}>
                  {selectedCategories.map((id) => {
                    const cat = CATEGORY_OPTIONS.find((c) => c.id === id);
                    return (
                      <View key={id} style={[styles.selectedTag, { backgroundColor: cat?.color + '20' }]}>
                        <Text style={[styles.selectedTagText, { color: cat?.color }]}>
                          {cat?.name}
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
                            : workout.target || ''}
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
                    Try selecting different categories or create a custom workout
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    borderColor: '#8B5A2B',
    backgroundColor: '#FFF8F0',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3728',
    textAlign: 'center',
  },
  categoryNameSelected: {
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
