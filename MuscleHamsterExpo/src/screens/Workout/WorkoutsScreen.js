// Workouts Screen - At Home / At Gym Tabs
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutService } from '../../services/WorkoutService';
import { DurationBucketInfo } from '../../models/Workout';
import { FitnessLevelInfo } from '../../models/UserProfile';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2;

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

export default function WorkoutsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'gym'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState([]);

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
    }, [loadWorkouts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
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

  // Filter at-home workouts (no equipment needed)
  const atHomeWorkouts = allWorkouts.filter((w) =>
    w.equipment.includes('none') || w.equipment.length === 0
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#34C759';
      case 'intermediate':
        return '#FF9500';
      case 'advanced':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
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
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'home' && styles.tabActive]}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons
              name="home-outline"
              size={20}
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
              size={20}
              color={activeTab === 'gym' ? '#FFF8F0' : '#6B5D52'}
            />
            <Text style={[styles.tabText, activeTab === 'gym' && styles.tabTextActive]}>
              At Gym
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
          ) : (
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
          )}
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
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#8B5A2B',
  },
  tabText: {
    fontSize: 16,
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
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutRowIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutRowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workoutRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
  },
  workoutRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  workoutRowDuration: {
    fontSize: 13,
    color: '#6B5D52',
    marginLeft: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  workoutRowDifficulty: {
    fontSize: 13,
    color: '#6B5D52',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5D52',
    marginTop: 12,
  },
});
