// Workouts Screen - Full Implementation
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutService } from '../../services/WorkoutService';
import { useUserProfile } from '../../context/UserProfileContext';
import { useActivity } from '../../context/ActivityContext';
import { ActivityService } from '../../services/ActivityService';
import { WorkoutType, WorkoutTypeInfo, DurationBucketInfo } from '../../models/Workout';
import { FitnessLevelInfo } from '../../models/UserProfile';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2;

export default function WorkoutsScreen({ navigation }) {
  const { profile } = useUserProfile();
  const { stats } = useActivity();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState([]);
  const [allWorkouts, setAllWorkouts] = useState([]);

  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all workouts
      const workouts = await WorkoutService.getAllWorkouts();
      setAllWorkouts(workouts);

      // Get recommended workouts based on profile
      if (profile) {
        const recentIds = await ActivityService.getRecentWorkoutIds(5);
        const dislikedIds = await ActivityService.getDislikedWorkoutIds();
        const lovedIds = await ActivityService.getLovedWorkoutIds();

        const recommended = await WorkoutService.getRecommendedWorkouts(profile, {
          recentWorkoutIds: recentIds,
          dislikedWorkoutIds: dislikedIds,
          lovedWorkoutIds: lovedIds,
        });
        setRecommendedWorkouts(recommended);
      } else {
        // Fallback for users without profile
        const featured = await WorkoutService.getFeaturedWorkouts();
        setRecommendedWorkouts(featured.map((w) => ({ ...w, explanation: 'A great workout to try!' })));
      }
    } catch (e) {
      setError('Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

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

  const getWorkoutCountByType = (type) => {
    return allWorkouts.filter((w) => w.category === type).length;
  };

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Recommended Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={20} color="#FF9500" />
          <Text style={styles.sectionTitle}>Recommended for You</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedScroll}
        >
          {recommendedWorkouts.map((workout) => {
            const typeInfo = WorkoutTypeInfo[workout.category];
            const durationInfo = DurationBucketInfo[workout.duration];
            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.recommendedCard}
                onPress={() => navigateToWorkout(workout)}
                accessibilityLabel={`${workout.name}, ${typeInfo?.displayName}`}
              >
                <View style={[styles.categoryBadge, { backgroundColor: typeInfo?.color + '20' }]}>
                  <Ionicons name={typeInfo?.icon || 'fitness'} size={24} color={typeInfo?.color} />
                </View>
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={12} color="#6B5D52" />
                  <Text style={styles.durationText}>{durationInfo?.range}</Text>
                </View>
                <Text style={styles.workoutName} numberOfLines={1}>{workout.name}</Text>
                <View style={styles.difficultyRow}>
                  <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(workout.difficulty) }]} />
                  <Text style={styles.difficultyText}>
                    {FitnessLevelInfo[workout.difficulty]?.displayName}
                  </Text>
                </View>
                {workout.explanation && (
                  <Text style={styles.explanationText} numberOfLines={2}>
                    {workout.explanation}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Browse Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Type</Text>
        <View style={styles.grid}>
          {Object.values(WorkoutType).map((type) => {
            const info = WorkoutTypeInfo[type];
            const count = getWorkoutCountByType(type);
            return (
              <TouchableOpacity
                key={type}
                style={[styles.categoryCard, { width: cardWidth }]}
                onPress={() => {
                  // For now, just show first workout of this type
                  const workout = allWorkouts.find((w) => w.category === type);
                  if (workout) {
                    navigateToWorkout(workout);
                  }
                }}
                accessibilityLabel={`${info.displayName} workouts, ${count} available`}
              >
                <View style={[styles.categoryIcon, { backgroundColor: info.color + '15' }]}>
                  <Ionicons name={info.icon} size={28} color={info.color} />
                </View>
                <Text style={styles.categoryLabel}>{info.displayName}</Text>
                <Text style={styles.categoryCount}>{count} workouts</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* All Workouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Workouts</Text>
        {allWorkouts.map((workout) => {
          const typeInfo = WorkoutTypeInfo[workout.category];
          const durationInfo = DurationBucketInfo[workout.duration];
          return (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutRow}
              onPress={() => navigateToWorkout(workout)}
              accessibilityLabel={`${workout.name}`}
            >
              <View style={[styles.workoutRowIcon, { backgroundColor: typeInfo?.color + '15' }]}>
                <Ionicons name={typeInfo?.icon || 'fitness'} size={24} color={typeInfo?.color} />
              </View>
              <View style={styles.workoutRowInfo}>
                <Text style={styles.workoutRowName}>{workout.name}</Text>
                <View style={styles.workoutRowMeta}>
                  <Text style={styles.workoutRowDuration}>{durationInfo?.range}</Text>
                  <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(workout.difficulty) }]} />
                  <Text style={styles.workoutRowDifficulty}>
                    {FitnessLevelInfo[workout.difficulty]?.displayName}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 6,
    color: '#4A3728',
  },
  recommendedScroll: {
    paddingRight: 16,
  },
  recommendedCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  categoryBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#6B5D52',
    marginLeft: 4,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#4A3728',
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: '#6B5D52',
  },
  explanationText: {
    fontSize: 12,
    color: '#8B5A2B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6B5D52',
    marginTop: 2,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  workoutRowIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  },
  workoutRowDuration: {
    fontSize: 13,
    color: '#6B5D52',
    marginRight: 8,
  },
  workoutRowDifficulty: {
    fontSize: 13,
    color: '#6B5D52',
  },
});
