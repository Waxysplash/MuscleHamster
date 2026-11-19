// Suggested Workout Card - "Want to do more?" on Today.
// Picks a guided workout from the user's level, goals and chosen time (SuggestionService).
// Shuffle moves to the next good option; a gentle rest-day link sits underneath.
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getSuggestion,
  TimeChoice,
  TimeChoiceInfo,
  defaultTimeChoice,
} from '../services/SuggestionService';
import { WorkoutTypeInfo } from '../models/Workout';

const ACCENT = '#FF9500';

export default function SuggestedWorkoutCard({
  profile,
  stats,
  onStart,
  onRest,
  showRestOption = true,
}) {
  const [timeChoice, setTimeChoice] = useState(() => defaultTimeChoice(profile?.fitnessLevel));
  const [shuffle, setShuffle] = useState(0);

  const suggestion = useMemo(
    () => getSuggestion({ profile, stats, timeChoice, shuffle }),
    // Only re-pick when what the rules read changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.fitnessLevel, profile?.fitnessGoals, stats?.workoutHistory, stats?.weeklyGoal, timeChoice, shuffle]
  );

  if (!suggestion) return null;
  const { workout, minutes, reason, options } = suggestion;
  const typeInfo = WorkoutTypeInfo[workout.category];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Want to do more? Try this</Text>

      <View style={styles.timeRow} accessibilityRole="radiogroup">
        {Object.values(TimeChoice).map((t) => {
          const selected = t === timeChoice;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.timeChip, selected && styles.timeChipSelected]}
              onPress={() => { setTimeChoice(t); setShuffle(0); }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${TimeChoiceInfo[t].label} workouts`}
            >
              <Text style={[styles.timeText, selected && styles.timeTextSelected]}>
                {TimeChoiceInfo[t].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.workoutRow}
        onPress={() => onStart?.(workout)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${workout.name}, ${minutes} minutes. ${reason}. Opens the workout.`}
      >
        <View style={[styles.typeIcon, { backgroundColor: `${typeInfo?.color || ACCENT}22` }]}>
          <Ionicons name={typeInfo?.icon || 'fitness'} size={24} color={typeInfo?.color || ACCENT} />
        </View>
        <View style={styles.workoutText}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.reason}>{reason}</Text>
        </View>
        <View style={styles.startButton}>
          <Text style={styles.startText}>Start</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        {options > 1 ? (
          <TouchableOpacity
            onPress={() => setShuffle((n) => n + 1)}
            style={styles.footerButton}
            accessibilityRole="button"
            accessibilityLabel="Show a different workout"
          >
            <Ionicons name="shuffle" size={18} color="#8B5A2B" />
            <Text style={styles.footerText}>Something else</Text>
          </TouchableOpacity>
        ) : <View />}
        {showRestOption && onRest && (
          <TouchableOpacity
            onPress={onRest}
            style={styles.footerButton}
            accessibilityRole="button"
            accessibilityLabel="I'm resting today. Rest days count toward your streak"
          >
            <Ionicons name="bed" size={18} color="#8B5A2B" />
            <Text style={styles.footerText}>I'm resting today</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  label: { fontSize: 15, fontWeight: '700', color: '#4A3728', marginBottom: 10 },
  timeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  timeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.25)',
  },
  timeChipSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  timeText: { fontSize: 14, fontWeight: '600', color: '#8B5A2B' },
  timeTextSelected: { color: '#fff' },
  workoutRow: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutText: { flex: 1, marginLeft: 12, marginRight: 8 },
  workoutName: { fontSize: 17, fontWeight: '700', color: '#4A3728' },
  reason: { fontSize: 13, color: '#6B5D52', marginTop: 2 },
  startButton: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  startText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  footerButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, minHeight: 36 },
  footerText: { fontSize: 14, fontWeight: '600', color: '#8B5A2B' },
});
