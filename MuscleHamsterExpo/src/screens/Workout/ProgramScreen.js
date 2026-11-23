// Program screen: one ready-made workout category (Push, Pull, Legs, Core, Cardio, Stretch)
// with a Beginner, Intermediate and Advanced version. The user's own level is marked.
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProgram, LEVEL_INFO } from '../../models/Programs';
import { getProgramWorkouts } from '../../services/WorkoutService';
import { getWorkoutMinutes } from '../../services/SuggestionService';
import { useUserProfile } from '../../context/UserProfileContext';
import { StoryCard, StoryButton, StoryIcon } from '../../components/ui/Story';
import { Colors, Fonts, Outline, T } from '../../config/theme';

export default function ProgramScreen({ route, navigation }) {
  const program = getProgram(route.params?.programId);
  const { profile } = useUserProfile();
  const myLevel = profile?.fitnessLevel || 'beginner';

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[T.body, { padding: 20 }]}>That workout group couldn't be found.</Text>
      </SafeAreaView>
    );
  }

  const workouts = getProgramWorkouts(program.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: program.color }]}>
          <StoryIcon name={program.icon} art={program.type !== 'strength' ? `type_${program.type}` : undefined} size={72} color={Colors.surface} />
          <Text style={[T.hero, { marginTop: 10 }]}>{program.title}</Text>
          <Text style={[T.bodyBold, { color: Colors.brown }]}>{program.subtitle}</Text>
          <Text style={[T.body, { textAlign: 'center', marginTop: 8 }]}>{program.about}</Text>
          <Text style={[T.small, { color: Colors.text, marginTop: 6, textAlign: 'center' }]}>You'll need: {program.needs}</Text>
        </View>

        <Text style={styles.sectionTitle}>Pick your level</Text>

        {workouts.map((w) => {
          const mine = w.difficulty === myLevel;
          const moves = w.exercises
            .filter((e) => e.type === 'work')
            .filter((e, i, arr) => arr.findIndex((x) => x.name === e.name) === i)
            .map((e) => e.name);
          return (
            <StoryCard
              key={w.id}
              color={mine ? Colors.peach : Colors.surface}
              containerStyle={{ marginBottom: 16 }}
            >
              {mine && (
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color={Colors.ink} />
                  <Text style={styles.badgeText}>Recommended for you</Text>
                </View>
              )}
              <Text style={T.title}>{LEVEL_INFO[w.difficulty].label}</Text>
              <Text style={[T.small, { color: Colors.text }]}>
                {getWorkoutMinutes(w)} min · {moves.length} moves · {w.exercises[0]?.totalRounds || 1} rounds
              </Text>
              <Text style={[T.small, { marginTop: 8 }]} numberOfLines={2}>
                {moves.join(', ')}
              </Text>
              <StoryButton
                title="Open workout"
                icon="play"
                variant={mine ? 'primary' : 'secondary'}
                size="sm"
                style={{ marginTop: 12 }}
                accessibilityLabel={`Open ${w.name}, ${getWorkoutMinutes(w)} minutes`}
                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w.id })}
              />
            </StoryCard>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 12, paddingVertical: 4 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 18, paddingTop: 4, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    marginBottom: 20,
  },
  sectionTitle: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.ink, marginBottom: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.ink },
});
