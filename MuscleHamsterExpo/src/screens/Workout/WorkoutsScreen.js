// Workouts Screen - At Home / At Gym / My Workouts Tabs
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
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import FavoriteButton from '../../components/FavoriteButton';
import { useResponsive } from '../../utils/responsive';

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

// Workout type info
const TYPE_INFO = {
  strength: { icon: 'barbell-outline', label: 'Strength', color: '#4ECDC4' },
  cardio: { icon: 'heart-outline', label: 'Cardio', color: '#FF6B6B' },
  class: { icon: 'people-outline', label: 'Class', color: '#9B59B6' },
  other: { icon: 'fitness-outline', label: 'Other', color: '#FF9500' },
};

export default function WorkoutsScreen({ navigation }) {
  // Responsive design
  const { isTablet, width, contentMaxWidth, spacing, getGridColumns } = useResponsive();
  const numColumns = isTablet ? 3 : 2;
  const effectiveWidth = Math.min(width, contentMaxWidth + 48);
  const cardWidth = (effectiveWidth - (spacing.horizontal * 2) - (12 * (numColumns - 1))) / numColumns;

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'gym', or 'my'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState([]);

  const { customWorkouts, isLoading: customLoading, refreshData } = useCustomWorkouts();

  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const workouts = await WorkoutService.getAllWorkouts();
      setAllWorkouts(workouts);
    } catch (e) {
      setError('Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
      refreshData();
    }, [loadWorkouts, refreshData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadWorkouts(), refreshData()]);
    setRefreshing(false);
  };

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

  if (isLoading) {
    return <LoadingView message="Loading workouts..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadWorkouts} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tab Selector - 3 tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'home' && styles.tabActive]}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons
              name="home-outline"
              size={18}
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
              size={18}
              color={activeTab === 'gym' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'gym' && styles.tabTextActive]}>
              At Gym
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={activeTab === 'my' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
              My Workouts
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
          {activeTab === 'home' ? (
            // AT HOME TAB
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="home" size={20} color="#FF9500" />
                <Text style={styles.sectionTitle}>Choose Category</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
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
              <View style={styles.sectionHeader}>
                <Ionicons name="barbell" size={20} color="#FF9500" />
                <Text style={styles.sectionTitle}>Choose Body Part</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
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
            // MY WORKOUTS TAB
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color="#FF9500" />
                <Text style={styles.sectionTitle}>My Workouts</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Track your own exercises and classes
              </Text>

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
                <View style={styles.emptyState}>
                  <Ionicons name="fitness-outline" size={56} color="#C4B5A8" />
                  <Text style={styles.emptyTitle}>No custom workouts yet</Text>
                  <Text style={styles.emptyText}>
                    Add workouts like Spin Class, Morning Run, or Weight Training to track your progress over time!
                  </Text>
                </View>
              ) : (
                <View style={styles.workoutsList}>
                  {customWorkouts.map((workout) => {
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
                </View>
              )}
            </View>
          )}
          </View>
        </ScrollView>
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
    gap: 8,
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
    fontSize: 14,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: '#4A3728',
  },
  sectionSubtitle: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
  },
  addWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 20,
  },
  addWorkoutButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  workoutsList: {
    gap: 12,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 14,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B5D52',
    textAlign: 'center',
    lineHeight: 22,
  },
});
