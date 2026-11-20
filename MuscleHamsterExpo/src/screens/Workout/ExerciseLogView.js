// Exercise page with fast set logging (Storybook redesign, Nov 2026)
// Shared by GymExerciseDetail and HomeExerciseDetail. Each keeps its own journal key
// (gym: body part name, home: category name), so past entries still show up.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../context/AlertContext';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { JournalService } from '../../services/JournalService';
import { TrainingSource } from '../../models/Activity';
import { getMoveGuide } from '../../models/MoveGuide';
import { describeReward } from '../../utils/rewardMessage';
import Logger from '../../services/LoggerService';
import { ExerciseIcon } from '../../config/AssetImages';
import SetLogger, { summarizeEntry } from '../../components/SetLogger';
import { StoryCard } from '../../components/ui/Story';
import { Colors, Fonts, Outline, T } from '../../config/theme';

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export default function ExerciseLogView({ navigation, exercise, groupName, fallbackKey, subtitle, weightOptional }) {
  const { showAlert } = useAlert();
  const { recordTraining } = useActivity();
  const { profile } = useUserProfile();
  const hamsterName = profile?.hamsterName || 'your hamster';
  const journalKey = groupName || fallbackKey;

  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showHow, setShowHow] = useState(true);

  const loadEntries = useCallback(async () => {
    try {
      setEntries(await JournalService.getExerciseEntries(exercise.name, journalKey));
    } catch (e) {
      Logger.warn('Failed to load journal entries');
    } finally {
      setLoaded(true);
    }
  }, [exercise.name, journalKey]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const guide = getMoveGuide(exercise.name);
  const how = guide.how || exercise.description;

  const save = async ({ sets, notes }) => {
    try {
      await JournalService.addJournalEntry(exercise.name, journalKey, { sets, notes });
    } catch (e) {
      showAlert('Not saved', "We couldn't save that. Please try again.");
      return false;
    }
    let message = 'Saved to your journal.';
    // Logged sets feed the hamster (shared training reward path)
    if (sets.length > 0) {
      try {
        const reward = await recordTraining({
          source: TrainingSource.JOURNAL,
          sourceId: `${journalKey}:${exercise.name}`,
          name: exercise.name,
          sets: sets.length,
        });
        message = describeReward(reward, hamsterName) || message;
      } catch (e) {
        Logger.warn('Failed to award journal points');
      }
    }
    showAlert('Logged!', message);
    await loadEntries();
    return true;
  };

  const deleteEntry = (entryId) => {
    showAlert('Delete this entry?', 'This removes it from your journal.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await JournalService.deleteJournalEntry(exercise.name, journalKey, entryId);
            await loadEntries();
          } catch (e) {
            showAlert('Not deleted', "We couldn't delete that entry.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={Colors.ink} />
        </Pressable>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.hero}>
            <Image source={ExerciseIcon} style={{ width: 64, height: 64 }} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} accessibilityRole="header">{exercise.name}</Text>
              <Text style={T.small}>
                {[subtitle, LEVEL_LABEL[exercise.difficulty]].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>

          {/* How to do it */}
          {how ? (
            <StoryCard shadow={false} containerStyle={{ marginBottom: 14 }}>
              <Pressable
                style={styles.howHeader}
                onPress={() => setShowHow((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ expanded: showHow }}
              >
                <Text style={styles.howTitle}>How to do it</Text>
                <Ionicons name={showHow ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.ink} />
              </Pressable>
              {showHow ? (
                <>
                  <Text style={[T.body, { marginTop: 6 }]}>{how}</Text>
                  {exercise.target ? <Text style={[T.small, { marginTop: 6 }]}>Works: {exercise.target}</Text> : null}
                  {guide.easier ? (
                    <Text style={[T.small, { marginTop: 6 }]}>
                      <Text style={{ fontFamily: Fonts.bodyBold, color: Colors.ink }}>Easier: </Text>
                      {guide.easier}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </StoryCard>
          ) : null}

          {/* Logging */}
          {loaded ? (
            <SetLogger
              lastEntry={entries[0]}
              weightOptional={weightOptional}
              hamsterName={hamsterName}
              onSave={save}
            />
          ) : null}

          {/* History */}
          {entries.length > 0 ? (
            <View style={{ marginTop: 22 }}>
              <Text style={styles.groupTitle}>Your history</Text>
              <View style={styles.historyBox}>
                {entries.slice(0, 10).map((entry, i, arr) => (
                  <View key={entry.id} style={[styles.historyRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                      <Text style={T.small}>{summarizeEntry(entry) || 'Note only'}</Text>
                      {entry.notes ? <Text style={[T.small, { fontStyle: 'italic' }]}>{entry.notes}</Text> : null}
                    </View>
                    <Pressable onPress={() => deleteEntry(entry.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Delete entry from ${formatDate(entry.date)}`}>
                      <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
                    </Pressable>
                  </View>
                ))}
              </View>
              {entries.length > 10 ? <Text style={[T.small, { textAlign: 'center', marginTop: 8 }]}>+ {entries.length - 10} older entries</Text> : null}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 8, paddingTop: 4 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  title: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.ink },
  howHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  howTitle: { fontFamily: Fonts.heading, fontSize: 17, color: Colors.ink },
  groupTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.brown, marginBottom: 8, marginLeft: 4 },
  historyBox: { backgroundColor: Colors.surface, borderWidth: Outline.width, borderColor: Colors.ink, borderRadius: 18, overflow: 'hidden' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: Outline.width,
    borderBottomColor: Colors.ink,
  },
  historyDate: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
});
