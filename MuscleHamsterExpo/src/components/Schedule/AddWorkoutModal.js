// AddWorkoutModal - 2-step flow: Pick category → Pick multiple workouts
// Now with "My Routines" support for saved workout groups
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DAY_LABELS, DAY_TYPES } from '../../services/ScheduleService';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';
import { useRoutines } from '../../context/RoutineContext';
import { useAlert } from '../../context/AlertContext';
import SaveRoutineModal from './SaveRoutineModal';

// Category images (same as Browse tab)
const CategoryImages = {
  legs: require('../../../assets/images/gym_legs.png'),
  arms: require('../../../assets/images/gym_arms.png'),
  back: require('../../../assets/images/gym_back.png'),
  chest: require('../../../assets/images/gym_chest.png'),
  shoulders: require('../../../assets/images/gym_shoulders.png'),
  core: require('../../../assets/images/gym_core.png'),
  cardio: require('../../../assets/images/gym_cardio.png'),
  class: require('../../../assets/images/gym_class.png'),
};

// Category options for selection
const CATEGORY_OPTIONS = [
  { id: 'arms', name: 'Arms', color: '#9B59B6' },
  { id: 'legs', name: 'Legs', color: '#E74C3C' },
  { id: 'shoulders', name: 'Shoulders', color: '#E67E22' },
  { id: 'chest', name: 'Chest', color: '#F39C12' },
  { id: 'back', name: 'Back', color: '#45B7D1' },
  { id: 'core', name: 'Core', color: '#8B5A2B' },
  { id: 'cardio', name: 'Cardio', color: '#FF3B30' },
  { id: 'class', name: 'Class', color: '#AF52DE' },
];

// Gym workouts from Browse tab
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
 * 2-step flow for selecting workouts for a specific day
 * Step 1: Pick categories (body parts)
 * Step 2: Pick multiple workouts from those categories
 */
export default function AddWorkoutModal({
  visible,
  dayName,
  currentDayData,
  onSelectWorkouts,
  onSelectRest,
  onClear,
  onClose,
}) {
  // State
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [matchingWorkouts, setMatchingWorkouts] = useState([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Routine state
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);

  // Get custom workouts and routines
  const { customWorkouts } = useCustomWorkouts();
  const { sortedRoutines, createRoutine, useRoutine, deleteRoutine, freeTierLimit } = useRoutines();
  const { showAlert } = useAlert();

  // Reset state when modal opens, pre-populate with existing workouts
  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedCategories([]);
      setMatchingWorkouts([]);

      // Pre-populate selected workouts from current day data
      if (currentDayData?.workouts && currentDayData.workouts.length > 0) {
        setSelectedWorkouts(currentDayData.workouts);
      } else if (currentDayData?.workoutId) {
        // Legacy single workout format
        setSelectedWorkouts([{
          workoutId: currentDayData.workoutId,
          workoutType: currentDayData.workoutType,
          workoutName: currentDayData.workoutName,
        }]);
      } else {
        setSelectedWorkouts([]);
      }
    }
  }, [visible, currentDayData]);

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

    setTimeout(() => {
      const results = [];

      // Get workouts from Browse library
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
        if (selectedCategories.includes(w.type)) {
          return true;
        }
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

      const customResults = matchingCustom.map((w) => ({
        ...w,
        isCustom: true,
      }));

      setMatchingWorkouts([...customResults, ...results]);
      setIsLoading(false);
    }, 200);
  }, [selectedCategories, customWorkouts]);

  // Handle "Next" button
  const handleNext = () => {
    setStep(2);
    loadMatchingWorkouts();
  };

  // Handle going back to step 1
  const handleBack = () => {
    setStep(1);
    setMatchingWorkouts([]);
  };

  // Toggle workout selection (multi-select)
  const toggleWorkout = (workout) => {
    setSelectedWorkouts((prev) => {
      const workoutId = workout.id;
      const exists = prev.some((w) => w.workoutId === workoutId);

      if (exists) {
        return prev.filter((w) => w.workoutId !== workoutId);
      } else {
        return [...prev, {
          workoutId: workout.id,
          workoutType: workout.isCustom ? 'custom' : 'gym',
          workoutName: workout.name,
        }];
      }
    });
  };

  // Check if workout is selected
  const isWorkoutSelected = (workoutId) => {
    return selectedWorkouts.some((w) => w.workoutId === workoutId);
  };

  // Handle save button
  const handleSave = () => {
    if (selectedWorkouts.length > 0) {
      console.log('AddWorkoutModal: Saving workouts', {
        dayName,
        workoutCount: selectedWorkouts.length,
        workouts: selectedWorkouts.map((w) => w.workoutName),
      });
      onSelectWorkouts?.(selectedWorkouts);
    } else {
      console.warn('AddWorkoutModal: No workouts selected');
    }
  };

  // Handle using a saved routine
  const handleUseRoutine = async (routine) => {
    console.log('AddWorkoutModal: Using routine', routine.name);
    const result = await useRoutine(routine.id);

    if (result.success) {
      // Schedule all workouts from the routine
      onSelectWorkouts?.(result.workouts);
    } else {
      showAlert('Error', 'Could not load routine. Please try again.');
    }
  };

  // Handle deleting a routine
  // Uses native Alert.alert because ThemedAlert renders behind this Modal
  const handleDeleteRoutine = (routine) => {
    Alert.alert(
      'Delete Routine?',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRoutine(routine.id);
            if (!result.success) {
              Alert.alert('Error', 'Could not delete routine. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle saving selected workouts as a routine
  const handleSaveAsRoutine = async (name) => {
    setIsSavingRoutine(true);

    const result = await createRoutine(name, selectedWorkouts);

    setIsSavingRoutine(false);
    setShowSaveRoutineModal(false);

    if (result.success) {
      showAlert(
        'Routine Saved!',
        `"${name}" has been saved with ${selectedWorkouts.length} workout${selectedWorkouts.length !== 1 ? 's' : ''}. You can use it anytime from the My Routines section.`,
        [{ text: 'Got it!' }]
      );
    } else if (result.error === 'limit-reached') {
      showAlert(
        'Routine Limit Reached',
        result.message,
        [{ text: 'OK' }]
      );
    } else {
      showAlert('Error', 'Could not save routine. Please try again.');
    }
  };

  // Check if day has content
  const hasContent = currentDayData && currentDayData.type !== DAY_TYPES.EMPTY;
  const dayLabel = DAY_LABELS[dayName] || dayName;

  // Render category card with image
  const renderCategoryCard = (cat) => {
    const isSelected = selectedCategories.includes(cat.id);
    const hasImage = CategoryImages[cat.id];

    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.categoryCard,
          isSelected && styles.categoryCardSelected,
        ]}
        onPress={() => toggleCategory(cat.id)}
      >
        {hasImage ? (
          <Image
            source={CategoryImages[cat.id]}
            style={styles.categoryImage}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: isSelected ? cat.color : '#F5F0EB' },
            ]}
          >
            <Ionicons
              name={cat.icon || 'fitness-outline'}
              size={28}
              color={isSelected ? '#fff' : cat.color}
            />
          </View>
        )}
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
            <Ionicons name="checkmark-circle" size={22} color="#34C759" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
              {/* Clear Day Option (only if has content) */}
              {hasContent && (
                <View style={styles.section}>
                  <TouchableOpacity style={styles.clearOption} onPress={onClear}>
                    <View style={styles.clearIcon}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </View>
                    <Text style={styles.clearText}>Clear All Workouts</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* My Routines Section */}
              {sortedRoutines && sortedRoutines.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>My Routines</Text>
                    <Text style={styles.routineCount}>
                      {sortedRoutines.length}/{freeTierLimit}
                    </Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>Tap to use a saved routine</Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.routineScroll}
                  >
                    {sortedRoutines.map((routine) => (
                      <View key={routine.id} style={styles.routineCardWrapper}>
                        {/* Card container */}
                        <View style={styles.routineCard}>
                          {/* Card content - touchable area (render first, so it's behind) */}
                          <TouchableOpacity
                            style={styles.routineCardContent}
                            onPress={() => handleUseRoutine(routine)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.routineIcon}>
                              <Ionicons name="bookmark" size={20} color="#8B5A2B" />
                            </View>
                            <Text style={styles.routineName} numberOfLines={1}>
                              {routine.name}
                            </Text>
                            <Text style={styles.routineWorkoutCount}>
                              {routine.workouts.length} workout{routine.workouts.length !== 1 ? 's' : ''}
                            </Text>
                            {routine.usageCount > 0 && (
                              <Text style={styles.routineUsage}>
                                Used {routine.usageCount}x
                              </Text>
                            )}
                          </TouchableOpacity>

                          {/* Delete button - render LAST so it's on top */}
                          <Pressable
                            style={({ pressed }) => [
                              styles.routineDeleteButton,
                              pressed && styles.routineDeleteButtonPressed,
                            ]}
                            onPress={() => {
                              console.log('Delete button pressed for:', routine.name);
                              handleDeleteRoutine(routine);
                            }}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          >
                            <Ionicons name="close-circle" size={24} color="#8B5A2B" />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Category Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {sortedRoutines?.length > 0 ? 'Or pick by category' : 'What do you want to work out?'}
                </Text>
                <Text style={styles.sectionSubtitle}>Select one or more categories</Text>

                <View style={styles.categoryGrid}>
                  {CATEGORY_OPTIONS.map(renderCategoryCard)}
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
            // STEP 2: Workout Selection (Multi-select)
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

              {/* Selected Workouts Count */}
              {selectedWorkouts.length > 0 && (
                <View style={styles.selectionBanner}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.selectionBannerText}>
                    {selectedWorkouts.length} workout{selectedWorkouts.length !== 1 ? 's' : ''} selected
                  </Text>
                </View>
              )}

              {/* Loading */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#8B5A2B" />
                </View>
              )}

              {/* Workouts List */}
              {!isLoading && matchingWorkouts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Workouts</Text>
                  <Text style={styles.sectionSubtitle}>Tap to add or remove</Text>

                  {matchingWorkouts.map((workout) => {
                    const isSelected = isWorkoutSelected(workout.id);
                    return (
                      <TouchableOpacity
                        key={workout.id}
                        style={[
                          styles.workoutItem,
                          isSelected && styles.workoutItemSelected,
                        ]}
                        onPress={() => toggleWorkout(workout)}
                      >
                        <View
                          style={[
                            styles.workoutIcon,
                            workout.isCustom && styles.customWorkoutIcon,
                            isSelected && styles.workoutIconSelected,
                          ]}
                        >
                          <Ionicons
                            name={workout.isCustom ? 'person' : 'barbell'}
                            size={20}
                            color={isSelected ? '#fff' : (workout.isCustom ? '#8B5A2B' : '#fff')}
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
                        {isSelected ? (
                          <View style={styles.selectedCheck}>
                            <Ionicons name="checkmark-circle" size={28} color="#34C759" />
                          </View>
                        ) : (
                          <View style={styles.addCircle}>
                            <Ionicons name="add-circle-outline" size={28} color="#8B5A2B" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
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

        {/* Save Buttons (Step 2 only) */}
        {step === 2 && selectedWorkouts.length > 0 && (
          <View style={styles.saveButtonContainer}>
            {/* Save as Routine button */}
            {selectedWorkouts.length >= 2 && (
              <TouchableOpacity
                style={styles.saveAsRoutineButton}
                onPress={() => setShowSaveRoutineModal(true)}
              >
                <Ionicons name="bookmark-outline" size={18} color="#8B5A2B" />
                <Text style={styles.saveAsRoutineText}>Save as Routine</Text>
              </TouchableOpacity>
            )}

            {/* Main save button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>
                Save {selectedWorkouts.length} Workout{selectedWorkouts.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Save Routine Modal */}
      <SaveRoutineModal
        visible={showSaveRoutineModal}
        workouts={selectedWorkouts}
        onSave={handleSaveAsRoutine}
        onClose={() => setShowSaveRoutineModal(false)}
        isSaving={isSavingRoutine}
      />
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  routineCount: {
    fontSize: 13,
    color: '#6B5D52',
    fontWeight: '500',
  },
  routineScroll: {
    paddingRight: 16,
    gap: 10,
  },
  routineCardWrapper: {
    marginRight: 10,
  },
  routineCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 140,
    borderWidth: 2,
    borderColor: 'rgba(139, 90, 43, 0.15)',
  },
  routineCardContent: {
    padding: 14,
    paddingTop: 36,
    zIndex: 1,
  },
  routineDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    padding: 6,
    zIndex: 100,
    elevation: 10,
  },
  routineDeleteButtonPressed: {
    backgroundColor: '#FFDDDD',
    transform: [{ scale: 1.1 }],
  },
  routineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 90, 43, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  routineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 4,
  },
  routineWorkoutCount: {
    fontSize: 12,
    color: '#6B5D52',
  },
  routineUsage: {
    fontSize: 11,
    color: '#A0968E',
    marginTop: 4,
  },
  clearOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  clearIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
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
  categoryImage: {
    width: 56,
    height: 56,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
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
    marginBottom: 16,
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
  selectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  selectionBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  workoutItemSelected: {
    borderColor: '#34C759',
    backgroundColor: '#F8FFF8',
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
  workoutIconSelected: {
    backgroundColor: '#34C759',
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
  selectedCheck: {},
  addCircle: {},
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
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF8F0',
    borderTopWidth: 1,
    borderTopColor: '#E5E0DB',
  },
  saveAsRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 90, 43, 0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 6,
  },
  saveAsRoutineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
