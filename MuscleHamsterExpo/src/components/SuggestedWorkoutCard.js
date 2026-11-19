// Suggested Workout Card - "Want to do more?" on Today.
// Picks a guided workout from the user's level, goals and chosen time (SuggestionService).
// Shuffle moves to the next good option; a gentle rest-day link sits underneath.
// Storybook style: outlined card, outlined time chips, chunky Start button.
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getSuggestion,
  TimeChoice,
  TimeChoiceInfo,
  defaultTimeChoice,
} from '../services/SuggestionService';
import { WorkoutTypeInfo } from '../models/Workout';
import { PLAIN_CATEGORY } from '../models/MoveGuide';
import { StoryCard, StoryButton, StoryChip, StoryIcon } from './ui/Story';
import { Colors, Fonts, T } from '../config/theme';

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
  const plain = PLAIN_CATEGORY[workout.category];

  return (
    <StoryCard containerStyle={styles.gap}>
      <Text style={T.label}>Want to do more? Try this</Text>

      <View style={styles.timeRow} accessibilityRole="radiogroup">
        {Object.values(TimeChoice).map((t) => (
          <StoryChip
            key={t}
            label={TimeChoiceInfo[t].label}
            selected={t === timeChoice}
            accessibilityLabel={`${TimeChoiceInfo[t].label} workouts`}
            onPress={() => { setTimeChoice(t); setShuffle(0); }}
          />
        ))}
      </View>

      <View style={styles.workoutRow} accessible accessibilityLabel={`${workout.name}, ${minutes} minutes. ${plain || ''}. ${reason}`}>
        <StoryIcon name={typeInfo?.icon || 'fitness'} size={52} color={Colors.peach} />
        <View style={styles.workoutText}>
          <Text style={T.heading}>{workout.name}</Text>
          <Text style={T.small}>{plain ? `${plain} · ` : ''}{minutes} min</Text>
        </View>
      </View>
      <Text style={[T.small, { marginTop: 8 }]}>{reason}</Text>

      <StoryButton
        title="Start"
        icon="play"
        style={{ marginTop: 14 }}
        accessibilityHint="Opens the workout"
        onPress={() => onStart?.(workout)}
      />

      <View style={styles.footer}>
        {options > 1 ? (
          <Pressable
            onPress={() => setShuffle((n) => n + 1)}
            style={styles.footerButton}
            accessibilityRole="button"
            accessibilityLabel="Show a different workout"
          >
            <Ionicons name="shuffle" size={18} color={Colors.ink} />
            <Text style={styles.footerText}>Something else</Text>
          </Pressable>
        ) : <View />}
        {showRestOption && onRest && (
          <Pressable
            onPress={onRest}
            style={styles.footerButton}
            accessibilityRole="button"
            accessibilityLabel="I'm resting today. Rest days count toward your streak"
          >
            <Ionicons name="bed" size={18} color={Colors.ink} />
            <Text style={styles.footerText}>I'm resting today</Text>
          </Pressable>
        )}
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 14 },
  timeRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 14 },
  workoutRow: { flexDirection: 'row', alignItems: 'center' },
  workoutText: { flex: 1, marginLeft: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  footerButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, minHeight: 44 },
  footerText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink, textDecorationLine: 'underline' },
});
