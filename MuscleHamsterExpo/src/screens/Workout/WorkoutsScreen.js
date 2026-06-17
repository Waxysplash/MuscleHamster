// Workouts Screen - My Plan / Browse Tabs
// Redesigned with horizontal day slider and reorganized Browse tab
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatIcons } from '../../config/AssetImages';
import { useSchedule } from '../../context/ScheduleContext';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';
import { useActivity } from '../../context/ActivityContext';
import {
  HorizontalDaySlider,
  DayDetailExpander,
  AddWorkoutModal,
  MyWorkoutsSection,
} from '../../components/Schedule';
import LoadingView from '../../components/LoadingView';
import { useResponsive } from '../../utils/responsive';
import { RestDayActivity } from '../../models/Activity';
import { getTodayName } from '../../services/ScheduleService';
import { findExerciseById } from '../../services/WorkoutLibrary';

// Gym body part images
const GymBodyPartImages = {
  legs: require('../../../assets/images/gym_legs.png'),
  arms: require('../../../assets/images/gym_arms.png'),
  back: require('../../../assets/images/gym_back.png'),
  chest: require('../../../assets/images/gym_chest.png'),
  shoulders: require('../../../assets/images/gym_shoulders.png'),
  core: require('../../../assets/images/gym_core.png'),
};

// Home category images
const HomeCategoryImages = {
  quick_sweats: require('../../../assets/images/home_quick_sweats.png'),
  lower_body: require('../../../assets/images/home_lower_body.png'),
  upper_body: require('../../../assets/images/home_upper_body.png'),
  core: require('../../../assets/images/home_core.png'),
  desk: require('../../../assets/images/home_desk.png'),
};

// Body part categories for gym workouts
const GYM_BODY_PARTS = [
  { id: 'legs', name: 'Legs', color: '#FF6B6B' },
  { id: 'arms', name: 'Arms', color: '#4ECDC4' },
  { id: 'back', name: 'Back', color: '#45B7D1' },
  { id: 'chest', name: 'Chest', color: '#F39C12' },
  { id: 'shoulders', name: 'Shoulders', color: '#9B59B6' },
  { id: 'core', name: 'Core', color: '#E74C3C' },
];

// Home workout categories
const HOME_CATEGORIES = [
  { id: 'quick_sweats', name: 'Quick Sweats', icon: 'flash-outline', color: '#FF9500' },
  { id: 'lower_body', name: 'Lower Body', icon: 'footsteps-outline', color: '#FF6B6B' },
  { id: 'upper_body', name: 'Upper Body', icon: 'body-outline', color: '#4ECDC4' },
  { id: 'core', name: 'Core', icon: 'ellipse-outline', color: '#E74C3C' },
  { id: 'desk', name: 'Desk Workouts', icon: 'desktop-outline', color: '#45B7D1' },
];

export default function WorkoutsScreen({ navigation, route }) {
  // Responsive design
  const { isTablet, width, contentMaxWidth, spacing } = useResponsive();
  const numColumns = isTablet ? 3 : 2;
  const effectiveWidth = Math.min(width, contentMaxWidth + 48);
  const cardWidth = (effectiveWidth - (spacing.horizontal * 2) - (12 * (numColumns - 1))) / numColumns;

  // State
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'home', or 'gym'
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayName()); // Default to today

  // Schedule context
  const {
    currentWeekSchedule,
    isLoading: isScheduleLoading,
    scheduleWorkout,
    setRestDay,
    clearDay,
    markDayCompleted,
    markWorkoutComplete,
    refreshData,
  } = useSchedule();

  // Custom workouts context
  const { customWorkouts, isLoading: customLoading, refreshData: refreshCustom } = useCustomWorkouts();

  // Activity context for logging rest day
  const { recordRestDayCheckIn } = useActivity();

  // Modals
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [modalDayName, setModalDayName] = useState(null);
  const [modalDayData, setModalDayData] = useState(null);

  // Refresh data on focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
      refreshCustom();
    }, [refreshData, refreshCustom])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshData(), refreshCustom()]);
    setRefreshing(false);
  };

  // Navigation handlers
  const navigateToBodyPart = (bodyPart) => {
    navigation.navigate('GymBodyPartWorkouts', { bodyPart });
  };

  const navigateToHomeCategory = (category) => {
    navigation.navigate('HomeCategoryWorkouts', { category });
  };

  const navigateToCustomWorkout = (workout) => {
    navigation.navigate('CustomWorkoutDetail', { workoutId: workout.id });
  };

  const navigateToAddWorkout = () => {
    navigation.navigate('AddWorkout');
  };

  // Day selection handler
  const handleDaySelect = (dayName, dayData) => {
    setSelectedDay(dayName);
  };

  // Open add workout modal for a specific day
  const handleOpenAddWorkout = (dayName) => {
    const dayData = currentWeekSchedule?.days?.[dayName] || {};
    setModalDayName(dayName);
    setModalDayData(dayData);
    setShowAddWorkoutModal(true);
  };

  // Handle multiple workout selection
  const handleSelectWorkouts = async (workoutsArray) => {
    if (modalDayName && workoutsArray.length > 0) {
      // Store the day we're saving to before closing modal
      const savedDay = modalDayName;

      const success = await scheduleWorkout(savedDay, workoutsArray);

      if (success) {
        // Ensure we're showing the day we just saved to
        setSelectedDay(savedDay);
      }

      // Close modal after ensuring selectedDay is set
      setShowAddWorkoutModal(false);
      setModalDayName(null);
    }
  };

  const handleSelectRestDay = async () => {
    if (modalDayName) {
      await setRestDay(modalDayName);
      setShowAddWorkoutModal(false);
      setModalDayName(null);
    }
  };

  const handleClearDay = async () => {
    if (modalDayName) {
      await clearDay(modalDayName);
      setShowAddWorkoutModal(false);
      setModalDayName(null);
    }
  };

  // Navigate to exercise detail or progress log for a workout
  const handleViewProgress = (workoutId) => {
    // Find the workout data from the schedule
    const workouts = selectedDayData?.workouts || [];
    const workout = workouts.find(w => w.workoutId === workoutId);
    const workoutType = workout?.workoutType || '';

    // Try to find the exercise in the workout library
    const libraryResult = findExerciseById(workoutId);

    if (libraryResult?.type === 'gym') {
      // Navigate to gym exercise detail with progress journal
      navigation.navigate('GymExerciseDetail', {
        exercise: libraryResult.exercise,
        bodyPart: libraryResult.bodyPart,
      });
    } else if (libraryResult?.type === 'home') {
      // Navigate to home exercise detail
      navigation.navigate('HomeExerciseDetail', {
        exercise: libraryResult.exercise,
        category: libraryResult.category,
      });
    } else if (workoutType === 'custom' || workoutId.startsWith('custom-')) {
      // Custom workout - navigate to custom workout detail
      navigation.navigate('CustomWorkoutDetail', { workoutId });
    } else {
      // Fallback to log progress screen
      const workoutName = workout?.workoutName || 'Workout';
      navigation.navigate('LogProgress', { workoutId, workoutName });
    }
  };

  // Mark a specific workout as complete (toggles individual workout)
  const handleMarkWorkoutComplete = async (workoutId) => {
    if (selectedDay) {
      await markWorkoutComplete(selectedDay, workoutId);
    }
  };

  const handleLogRestDay = async () => {
    // Log the rest day through activity context
    await recordRestDayCheckIn(RestDayActivity.QUICK_REST);
    // Mark the selected day as completed
    if (selectedDay) {
      await markDayCompleted(selectedDay);
    }
  };

  // Get selected day data
  const selectedDayData = currentWeekSchedule?.days?.[selectedDay] || {};

  if (__DEV__) {
    console.log('[WorkoutsScreen] RENDER:', {
      selectedDay,
      selectedDayType: selectedDayData?.type,
      selectedDayWorkouts: selectedDayData?.workouts?.length || 0,
    });
  }

  if (isScheduleLoading && !currentWeekSchedule) {
    return <LoadingView message="Loading your plan..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tab Selector - 3 flat tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plan' && styles.tabActive]}
            onPress={() => setActiveTab('plan')}
          >
            <Ionicons
              name="calendar"
              size={16}
              color={activeTab === 'plan' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>
              My Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'home' && styles.tabActive]}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons
              name="home-outline"
              size={16}
              color={activeTab === 'home' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>
              At Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gym' && styles.tabActive]}
            onPress={() => setActiveTab('gym')}
          >
            <Ionicons
              name="barbell-outline"
              size={16}
              color={activeTab === 'gym' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'gym' && styles.tabTextActive]}>
              At Gym
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            isTablet && { alignItems: 'center' }
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={[
            styles.contentWrapper,
            isTablet && { maxWidth: contentMaxWidth + 48, width: '100%' }
          ]}>
            {activeTab === 'plan' ? (
              // MY PLAN TAB
              <View style={styles.section}>
                {/* Horizontal Day Slider */}
                <HorizontalDaySlider
                  schedule={currentWeekSchedule}
                  selectedDay={selectedDay}
                  onDaySelect={handleDaySelect}
                />

                {/* Day Detail Expander */}
                <DayDetailExpander
                  key={`${selectedDay}-${selectedDayData?.type || 'empty'}-${selectedDayData?.workouts?.length || 0}-${(selectedDayData?.workouts || []).filter(w => w.completed).length}`}
                  dayName={selectedDay}
                  dayData={selectedDayData}
                  onViewProgress={handleViewProgress}
                  onMarkWorkoutComplete={handleMarkWorkoutComplete}
                  onAddWorkout={handleOpenAddWorkout}
                  onLogRestDay={handleLogRestDay}
                />

                {/* My Custom Workouts link */}
                {customWorkouts && customWorkouts.length > 0 && (
                  <TouchableOpacity
                    style={styles.myWorkoutsLink}
                    onPress={() => setActiveTab('myworkouts')}
                  >
                    <Ionicons name="person-outline" size={18} color="#8B5A2B" />
                    <Text style={styles.myWorkoutsLinkText}>My Custom Workouts</Text>
                    <Ionicons name="chevron-forward" size={18} color="#8B5A2B" />
                  </TouchableOpacity>
                )}
              </View>
            ) : activeTab === 'home' ? (
              // AT HOME TAB
              <View style={styles.section}>
                <View style={styles.browseHeader}>
                  <Ionicons name="home" size={20} color="#FF9500" />
                  <Text style={styles.browseTitle}>Choose Category</Text>
                </View>
                <Text style={styles.browseSubtitle}>
                  No equipment needed - workout anywhere
                </Text>

                <View style={styles.bodyPartGrid}>
                  {HOME_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.bodyPartCard, { width: cardWidth }]}
                      onPress={() => navigateToHomeCategory(category)}
                      accessibilityLabel={`${category.name} workouts`}
                    >
                      <Image
                        source={HomeCategoryImages[category.id]}
                        style={styles.bodyPartImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.bodyPartName}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : activeTab === 'gym' ? (
              // AT GYM TAB
              <View style={styles.section}>
                <View style={styles.browseHeader}>
                  <Image source={StatIcons.workout} style={{ width: 22, height: 22 }} resizeMode="contain" />
                  <Text style={styles.browseTitle}>Choose Body Part</Text>
                </View>
                <Text style={styles.browseSubtitle}>
                  Target specific muscle groups
                </Text>

                <View style={styles.bodyPartGrid}>
                  {GYM_BODY_PARTS.map((part) => (
                    <TouchableOpacity
                      key={part.id}
                      style={[styles.bodyPartCard, { width: cardWidth }]}
                      onPress={() => navigateToBodyPart(part)}
                      accessibilityLabel={`${part.name} workouts`}
                    >
                      <Image
                        source={GymBodyPartImages[part.id]}
                        style={[
                          styles.bodyPartImage,
                          part.id === 'shoulders' && styles.bodyPartImageSmaller
                        ]}
                        resizeMode="contain"
                      />
                      <Text style={styles.bodyPartName}>{part.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              // MY WORKOUTS (accessed via link from plan tab)
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.backToplanLink}
                  onPress={() => setActiveTab('plan')}
                >
                  <Ionicons name="arrow-back" size={18} color="#8B5A2B" />
                  <Text style={styles.myWorkoutsLinkText}>Back to My Plan</Text>
                </TouchableOpacity>
                <MyWorkoutsSection
                  customWorkouts={customWorkouts}
                  onAddWorkout={navigateToAddWorkout}
                  onWorkoutPress={navigateToCustomWorkout}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Workout Modal */}
        <AddWorkoutModal
          visible={showAddWorkoutModal}
          dayName={modalDayName}
          currentDayData={modalDayData}
          onSelectWorkouts={handleSelectWorkouts}
          onSelectRest={handleSelectRestDay}
          onClear={handleClearDay}
          onClose={() => {
            setShowAddWorkoutModal(false);
            setModalDayName(null);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    gap: 5,
  },
  tabActive: {
    backgroundColor: '#8B5A2B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D52',
  },
  tabTextActive: {
    color: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  contentWrapper: {
    width: '100%',
  },
  section: {
    paddingHorizontal: 16,
  },
  myWorkoutsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.06)',
  },
  myWorkoutsLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  backToplanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  browseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  browseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#4A3728',
  },
  browseSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginBottom: 16,
    marginLeft: 28,
  },
  bodyPartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bodyPartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bodyPartImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  bodyPartImageSmaller: {
    width: 65,
    height: 65,
  },
  bodyPartName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
});
