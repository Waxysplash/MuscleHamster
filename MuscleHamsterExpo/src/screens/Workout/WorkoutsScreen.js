// Workouts Screen - Simplified with Get Moving + Browse All
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutService } from '../../services/WorkoutService';
import { WorkoutTypeInfo, DurationBucketInfo } from '../../models/Workout';
import { FitnessLevelInfo } from '../../models/UserProfile';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';

export default function WorkoutsScreen({ navigation }) {
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
      setError("I couldn't find the workouts right now. Let's try again!");
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

  // Beginner-friendly, equipment-free workouts
  const suggestedWorkouts = allWorkouts
    .filter((w) => w.difficulty === 'beginner' && w.equipment?.includes('none'))
    .slice(0, 4);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#34C759';
      case 'intermediate': return '#FF9500';
      case 'advanced': return '#FF3B30';
      default: return '#8E8E93';
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
      {/* Get Moving Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get Moving</Text>
        <Text style={styles.sectionSubtitle}>Quick workouts to feel great today</Text>

        {suggestedWorkouts.length === 0 ? (
          <View style={styles.noSuggestionsCard}>
            <Ionicons name="fitness" size={28} color="#007AFF" />
            <Text style={styles.noSuggestionsText}>More workouts coming soon!</Text>
          </View>
        ) : (
          suggestedWorkouts.map((workout) => {
            const typeInfo = WorkoutTypeInfo[workout.category];
            const durationInfo = DurationBucketInfo[workout.duration];
            return (
              <TouchableOpacity
                key={workout.id}
                style={styles.suggestedCard}
                onPress={() => navigateToWorkout(workout)}
                accessibilityLabel={`${workout.name}, about ${durationInfo?.range}. ${workout.description}`}
              >
                {/* Category icon */}
                <View style={[styles.categoryCircle, { backgroundColor: (typeInfo?.color || '#007AFF') + '20' }]}>
                  <Ionicons name={typeInfo?.icon || 'fitness'} size={24} color={typeInfo?.color || '#007AFF'} />
                </View>

                {/* Workout info */}
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedName} numberOfLines={1}>{workout.name}</Text>
                  <Text style={styles.suggestedDescription} numberOfLines={1}>{workout.description}</Text>
                </View>

                {/* Duration badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>~{durationInfo?.minutes || '?'} min</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* All Workouts (grouped by category) */}
      <View style={styles.section}>
        <View style={styles.allWorkoutsHeader}>
          <Ionicons name="list" size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>All Workouts</Text>
          <Text style={styles.workoutCountText}>{allWorkouts.length} workouts</Text>
        </View>
        {Object.keys(WorkoutTypeInfo).map((type) => {
          const categoryWorkouts = allWorkouts.filter((w) => w.category === type);
          if (categoryWorkouts.length === 0) return null;
          const typeInfo = WorkoutTypeInfo[type];

          return (
            <View key={type} style={styles.categorySection}>
              <View style={styles.categorySectionHeader}>
                <Ionicons name={typeInfo.icon} size={18} color={typeInfo.color} />
                <Text style={styles.categorySectionTitle}>{typeInfo.displayName}</Text>
              </View>
              {categoryWorkouts.map((workout) => {
                const durationInfo = DurationBucketInfo[workout.duration];
                return (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutRow}
                    onPress={() => navigateToWorkout(workout)}
                    accessibilityLabel={workout.name}
                  >
                    <View style={[styles.workoutRowIcon, { backgroundColor: typeInfo.color + '15' }]}>
                      <Ionicons name={typeInfo.icon} size={22} color={typeInfo.color} />
                    </View>
                    <View style={styles.workoutRowInfo}>
                      <Text style={styles.workoutRowName}>{workout.name}</Text>
                      <View style={styles.workoutRowMeta}>
                        <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(workout.difficulty) }]} />
                        <Text style={styles.workoutRowDetail}>
                          {FitnessLevelInfo[workout.difficulty]?.displayName} · {durationInfo?.range}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 12,
  },
  // Suggested workout cards
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  categoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  suggestedDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  durationBadge: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  noSuggestionsCard: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noSuggestionsText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  // All Workouts header
  allWorkoutsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  workoutCountText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 'auto',
  },
  // Category sections
  categorySection: {
    marginBottom: 16,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 8,
  },
  categorySectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  workoutRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutRowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workoutRowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  workoutRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  workoutRowDetail: {
    fontSize: 13,
    color: '#8E8E93',
  },
});
