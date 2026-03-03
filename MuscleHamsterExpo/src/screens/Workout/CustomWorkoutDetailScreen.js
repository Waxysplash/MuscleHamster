// Custom Workout Detail Screen - View and track progress for custom workouts
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';
import FavoriteButton from '../../components/FavoriteButton';

const TYPE_INFO = {
  strength: { icon: 'barbell-outline', label: 'Strength', color: '#4ECDC4' },
  cardio: { icon: 'heart-outline', label: 'Cardio', color: '#FF6B6B' },
  class: { icon: 'people-outline', label: 'Class', color: '#9B59B6' },
  other: { icon: 'fitness-outline', label: 'Other', color: '#FF9500' },
};

export default function CustomWorkoutDetailScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const { customWorkouts, getCompletionHistory, deleteWorkout } = useCustomWorkouts();
  const [workout, setWorkout] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const foundWorkout = customWorkouts.find(w => w.id === workoutId);
    setWorkout(foundWorkout);

    if (foundWorkout) {
      const completions = await getCompletionHistory(workoutId);
      setHistory(completions);
    }

    setIsLoading(false);
  }, [customWorkouts, workoutId, getCompletionHistory]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogProgress = () => {
    navigation.navigate('LogProgress', { workoutId, workoutName: workout.name });
  };

  const handleEdit = () => {
    navigation.navigate('EditWorkout', { workoutId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"? This will also delete all progress history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(workoutId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatMetrics = (metrics) => {
    const parts = [];
    if (metrics.sets && metrics.reps) {
      parts.push(`${metrics.sets} x ${metrics.reps} reps`);
    } else if (metrics.reps) {
      parts.push(`${metrics.reps} reps`);
    }
    if (metrics.weight) {
      parts.push(metrics.weight);
    }
    if (metrics.duration) {
      parts.push(`${metrics.duration} min`);
    }
    if (metrics.distance) {
      parts.push(metrics.distance);
    }
    return parts.join(' • ');
  };

  if (isLoading || !workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#4A3728" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loading...</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const typeInfo = TYPE_INFO[workout.type] || TYPE_INFO.other;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4A3728" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{workout.name}</Text>
          <FavoriteButton workoutId={workoutId} size={24} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Workout Info Card */}
          <View style={styles.infoCard}>
            <View style={[styles.typeIconContainer, { backgroundColor: typeInfo.color + '20' }]}>
              <Ionicons name={typeInfo.icon} size={40} color={typeInfo.color} />
            </View>

            <View style={styles.typeBadge}>
              <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                {typeInfo.label}
              </Text>
            </View>

            {workout.targetValue && (
              <View style={styles.targetRow}>
                <Ionicons name="flag-outline" size={18} color="#6B5D52" />
                <Text style={styles.targetText}>{workout.targetValue}</Text>
              </View>
            )}

            {workout.description && (
              <Text style={styles.description}>{workout.description}</Text>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{workout.completionCount}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              {workout.lastCompletedAt && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatDate(workout.lastCompletedAt)}</Text>
                  <Text style={styles.statLabel}>Last Session</Text>
                </View>
              )}
            </View>
          </View>

          {/* Log Progress Button */}
          <TouchableOpacity
            style={styles.logButton}
            onPress={handleLogProgress}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFF8F0" />
            <Text style={styles.logButtonText}>Log Progress</Text>
          </TouchableOpacity>

          {/* Progress History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Progress History</Text>

            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={48} color="#C4B5A8" />
                <Text style={styles.emptyHistoryText}>No progress logged yet</Text>
                <Text style={styles.emptyHistorySubtext}>
                  Tap "Log Progress" after completing this workout
                </Text>
              </View>
            ) : (
              history.map((entry) => (
                <View key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{formatDate(entry.completedAt)}</Text>
                    <Text style={styles.historyTime}>{formatTime(entry.completedAt)}</Text>
                  </View>

                  {formatMetrics(entry.metrics) && (
                    <View style={styles.historyMetrics}>
                      <Ionicons name="stats-chart-outline" size={16} color="#6B5D52" />
                      <Text style={styles.historyMetricsText}>
                        {formatMetrics(entry.metrics)}
                      </Text>
                    </View>
                  )}

                  {entry.notes && (
                    <Text style={styles.historyNotes}>{entry.notes}</Text>
                  )}

                  <View style={styles.historyPoints}>
                    <Ionicons name="star" size={14} color="#FF9500" />
                    <Text style={styles.historyPointsText}>+{entry.pointsEarned} points</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Workout</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3728',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  typeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  targetText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A3728',
  },
  description: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 24,
  },
  logButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  historySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B5D52',
    marginTop: 12,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#A89B8C',
    marginTop: 4,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  historyTime: {
    fontSize: 14,
    color: '#6B5D52',
  },
  historyMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyMetricsText: {
    fontSize: 14,
    color: '#4A3728',
  },
  historyNotes: {
    fontSize: 14,
    color: '#6B5D52',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  historyPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyPointsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
  },
  actionsSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
