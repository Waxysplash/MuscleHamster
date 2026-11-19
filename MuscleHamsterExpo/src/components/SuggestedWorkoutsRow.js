// "Suggested for you" row at the top of the Workouts tab: a quick, a medium and a longer
// guided workout picked from the user's level and goals (SuggestionService).
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSuggestionList } from '../services/SuggestionService';
import { WorkoutTypeInfo } from '../models/Workout';

export default function SuggestedWorkoutsRow({ profile, stats, onOpen }) {
  const list = useMemo(
    () => getSuggestionList({ profile, stats }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.fitnessLevel, profile?.fitnessGoals, stats?.workoutHistory, stats?.weeklyGoal]
  );

  if (!list.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Suggested for you</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {list.map(({ workout, minutes }) => {
          const info = WorkoutTypeInfo[workout.category];
          return (
            <TouchableOpacity
              key={workout.id}
              style={styles.card}
              onPress={() => onOpen?.(workout)}
              accessibilityRole="button"
              accessibilityLabel={`${workout.name}, ${minutes} minutes, ${info?.displayName || ''}`}
            >
              <View style={[styles.icon, { backgroundColor: `${info?.color || '#FF9500'}22` }]}>
                <Ionicons name={info?.icon || 'fitness'} size={22} color={info?.color || '#FF9500'} />
              </View>
              <Text style={styles.name} numberOfLines={2}>{workout.name}</Text>
              <Text style={styles.meta}>{minutes} min · {info?.displayName}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#4A3728', marginBottom: 10 },
  row: { gap: 10, paddingRight: 8 },
  card: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#4A3728', marginTop: 10, minHeight: 40 },
  meta: { fontSize: 13, color: '#6B5D52', marginTop: 4 },
});
