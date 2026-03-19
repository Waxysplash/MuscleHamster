// Workouts Screen - My Plan / Browse Tabs
// Restructured for weekly planner feature
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
import { WorkoutService } from '../../services/WorkoutService';
import { useSchedule } from '../../context/ScheduleContext';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';
import { useActivity } from '../../context/ActivityContext';
import {
  WeekCalendar,
  TodayWorkoutCard,
  ScheduleSetupModal,
  AddWorkoutModal,
} from '../../components/Schedule';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import FavoriteButton from '../../components/FavoriteButton';
import { useResponsive } from '../../utils/responsive';
import { DAY_TYPES } from '../../services/ScheduleService';
import { RestDayActivity } from '../../models/Activity';

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

// Workout type info for custom workouts
const TYPE_INFO = {
  strength: { icon: 'barbell-outline', label: 'Strength', color: '#4ECDC4' },
  cardio: { icon: 'heart-outline', label: 'Cardio', color: '#FF6B6B' },
  class: { icon: 'people-outline', label: 'Class', color: '#9B59B6' },
  other: { icon: 'fitness-outline', label: 'Other', color: '#FF9500' },
};

export default function WorkoutsScreen({ navigation, route }) {
  // Responsive design
  const { isTablet, width, contentMaxWidth, spacing } = useResponsive();
  const numColumns = isTablet ? 3 : 2;
  const effectiveWidth = Math.min(width, contentMaxWidth + 48);
  const cardWidth = (effectiveWidth - (spacing.horizontal * 2) - (12 * (numColumns - 1))) / numColumns;

  // State
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' or 'browse'
  const [browseSubTab, setBrowseSubTab] = useState('home'); // 'home' or 'gym'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Schedule context
  const {
    preferences,
    hasCompletedSetup,
    hasSkippedSetup,
    currentWeekStart,
    currentWeekSchedule,
    todaySchedule,
    isLoading: isScheduleLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    scheduleWorkout,
    setRestDay,
    clearDay,
    markTodayCompleted,
    completeSetup,
    skipSetup,
    refreshData,
  } = useSchedule();

  // Custom workouts context
  const { customWorkouts, isLoading: customLoading, refreshData: refreshCustom } = useCustomWorkouts();

  // Activity context for logging rest day
  const { recordRestDayCheckIn } = useActivity();

  // Modals
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);

  // NOTE: Setup modal is now ONLY shown when user taps "Set Up My Week" button
  // Auto-popup has been removed per user request

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
  const navigateToWorkout = (workout) => {
    navigation.navigate('WorkoutDetail', { workoutId: workout.id });
  };

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

  // Schedule handlers
  const handleDayPress = (dayName, dayData) => {
    setSelectedDay(dayName);
    setSelectedDayData(dayData);
    setShowAddWorkoutModal(true);
  };

  const handleSelectWorkout = async (workoutId, workoutType, workoutName) => {
    if (selectedDay) {
      await scheduleWorkout(selectedDay, workoutId, workoutType, workoutName);
      setShowAddWorkoutModal(false);
      setSelectedDay(null);
    }
  };

  const handleSelectRestDay = async () => {
    if (selectedDay) {
      await setRestDay(selectedDay);
      setShowAddWorkoutModal(false);
      setSelectedDay(null);
    }
  };

  const handleClearDay = async () => {
    if (selectedDay) {
      await clearDay(selectedDay);
      setShowAddWorkoutModal(false);
      setSelectedDay(null);
    }
  };

  const handleSetupComplete = async (prefs) => {
    await completeSetup(prefs);
    setShowSetupModal(false);
  };

  const handleStartWorkout = (workoutId) => {
    // Navigate to workout player
    navigation.navigate('WorkoutDetail', { workoutId });
  };

  const handlePickWorkout = () => {
    // Open add workout modal for today
    const todayName = todaySchedule?.dayName;
    if (todayName) {
      setSelectedDay(todayName);
      setSelectedDayData(todaySchedule);
      setShowAddWorkoutModal(true);
    }
  };

  const handleLogRestDay = async () => {
    // Log the rest day through activity context
    await recordRestDayCheckIn(RestDayActivity.QUICK_REST);
    // Mark the scheduled day as completed
    await markTodayCompleted();
  };

  // Format last completed
  const formatLastCompleted = (dateString) => {
    if (!dateString) return 'Never completed';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isScheduleLoading && !currentWeekSchedule) {
    return <LoadingView message="Loading your plan..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tab Selector - 2 tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plan' && styles.tabActive]}
            onPress={() => setActiveTab('plan')}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={activeTab === 'plan' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>
              My Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'browse' && styles.tabActive]}
            onPress={() => setActiveTab('browse')}
          >
            <Ionicons
              name="search"
              size={18}
              color={activeTab === 'browse' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}>
              Browse
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
                {/* Week Calendar */}
                <WeekCalendar
                  weekStart={currentWeekStart}
                  schedule={currentWeekSchedule}
                  onDayPress={handleDayPress}
                  onPreviousWeek={goToPreviousWeek}
                  onNextWeek={goToNextWeek}
                  onGoToCurrentWeek={goToCurrentWeek}
                />

                {/* Today's Workout Card */}
                {todaySchedule && (
                  <View style={styles.todaySection}>
                    <Text style={styles.todaySectionTitle}>Today</Text>
                    <TodayWorkoutCard
                      todaySchedule={todaySchedule}
                      onStartWorkout={handleStartWorkout}
                      onPickWorkout={handlePickWorkout}
                      onLogRestDay={handleLogRestDay}
                    />
                  </View>
                )}

                {/* Empty State - No schedule (show if not setup or was skipped) */}
                {(!hasCompletedSetup || hasSkippedSetup) && (
                  <View style={styles.emptyPlanState}>
                    <Ionicons name="calendar-outline" size={56} color="#C4B5A8" />
                    <Text style={styles.emptyTitle}>Plan your week</Text>
                    <Text style={styles.emptyText}>
                      Set up your workout days to stay on track
                    </Text>
                    <TouchableOpacity
                      style={styles.setupButton}
                      onPress={() => setShowSetupModal(true)}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={styles.setupButtonText}>Set Up My Week</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* My Workouts Section */}
                <View style={styles.myWorkoutsSection}>
                  <View style={styles.myWorkoutsHeader}>
                    <Ionicons name="person" size={20} color="#FF9500" />
                    <Text style={styles.myWorkoutsTitle}>My Workouts</Text>
                  </View>

                  {/* Add Workout Button */}
                  <TouchableOpacity
                    style={styles.addWorkoutButton}
                    onPress={navigateToAddWorkout}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#FFF8F0" />
                    <Text style={styles.addWorkoutButtonText}>Add Workout</Text>
                  </TouchableOpacity>

                  {/* Custom Workouts List */}
                  {customWorkouts.length === 0 ? (
                    <View style={styles.emptyCustomState}>
                      <Text style={styles.emptyCustomText}>
                        Track custom workouts like Spin Class or Morning Run
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.workoutsList}>
                      {customWorkouts.slice(0, 5).map((workout) => {
                        const typeInfo = TYPE_INFO[workout.type] || TYPE_INFO.other;
                        return (
                          <TouchableOpacity
                            key={workout.id}
                            style={styles.workoutCard}
                            onPress={() => navigateToCustomWorkout(workout)}
                            accessibilityLabel={`${workout.name} workout`}
                          >
                            <View style={[styles.workoutIcon, { backgroundColor: typeInfo.color + '20' }]}>
                              <Ionicons name={typeInfo.icon} size={24} color={typeInfo.color} />
                            </View>
                            <View style={styles.workoutInfo}>
                              <Text style={styles.workoutName}>{workout.name}</Text>
                              <View style={styles.workoutMeta}>
                                <Text style={styles.workoutMetaText}>
                                  {workout.completionCount} {workout.completionCount === 1 ? 'time' : 'times'}
                                </Text>
                                <Text style={styles.workoutMetaDot}>•</Text>
                                <Text style={styles.workoutMetaText}>
                                  {formatLastCompleted(workout.lastCompletedAt)}
                                </Text>
                              </View>
                            </View>
                            <FavoriteButton workoutId={workout.id} size={22} />
                            <Ionicons name="chevron-forward" size={20} color="#8B5A2B" style={{ marginLeft: 4 }} />
                          </TouchableOpacity>
                        );
                      })}
                      {customWorkouts.length > 5 && (
                        <Text style={styles.moreWorkoutsText}>
                          +{customWorkouts.length - 5} more workouts
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              // BROWSE TAB
              <View style={styles.section}>
                {/* Sub-tabs for At Home / At Gym */}
                <View style={styles.subTabContainer}>
                  <TouchableOpacity
                    style={[styles.subTab, browseSubTab === 'home' && styles.subTabActive]}
                    onPress={() => setBrowseSubTab('home')}
                  >
                    <Ionicons
                      name="home-outline"
                      size={16}
                      color={browseSubTab === 'home' ? '#8B5A2B' : '#6B5D52'}
                    />
                    <Text style={[styles.subTabText, browseSubTab === 'home' && styles.subTabTextActive]}>
                      At Home
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subTab, browseSubTab === 'gym' && styles.subTabActive]}
                    onPress={() => setBrowseSubTab('gym')}
                  >
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color={browseSubTab === 'gym' ? '#8B5A2B' : '#6B5D52'}
                    />
                    <Text style={[styles.subTabText, browseSubTab === 'gym' && styles.subTabTextActive]}>
                      At Gym
                    </Text>
                  </TouchableOpacity>
                </View>

                {browseSubTab === 'home' ? (
                  // AT HOME
                  <>
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
                  </>
                ) : (
                  // AT GYM
                  <>
                    <View style={styles.browseHeader}>
                      <Ionicons name="barbell" size={20} color="#FF9500" />
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
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Setup Modal */}
        <ScheduleSetupModal
          visible={showSetupModal}
          onComplete={handleSetupComplete}
          onSkip={() => {
            skipSetup();
            setShowSetupModal(false);
          }}
        />

        {/* Add Workout Modal */}
        <AddWorkoutModal
          visible={showAddWorkoutModal}
          dayName={selectedDay}
          currentDayData={selectedDayData}
          onSelectWorkout={handleSelectWorkout}
          onSelectRest={handleSelectRestDay}
          onClear={handleClearDay}
          onClose={() => {
            setShowAddWorkoutModal(false);
            setSelectedDay(null);
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#8B5A2B',
  },
  tabText: {
    fontSize: 15,
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
  todaySection: {
    marginTop: 20,
  },
  todaySectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
  },
  emptyPlanState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 8,
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  myWorkoutsSection: {
    marginTop: 28,
  },
  myWorkoutsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  myWorkoutsTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
    color: '#4A3728',
  },
  addWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  addWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  emptyCustomState: {
    paddingVertical: 16,
  },
  emptyCustomText: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
  },
  workoutsList: {
    gap: 10,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  workoutMetaText: {
    fontSize: 13,
    color: '#6B5D52',
  },
  workoutMetaDot: {
    fontSize: 13,
    color: '#A89B8C',
    marginHorizontal: 6,
  },
  moreWorkoutsText: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  subTabActive: {
    backgroundColor: '#FFF8F0',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5D52',
  },
  subTabTextActive: {
    color: '#8B5A2B',
    fontWeight: '600',
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
