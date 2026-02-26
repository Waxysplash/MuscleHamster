// Home Exercise Detail Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JournalService } from '../../services/JournalService';

export default function HomeExerciseDetailScreen({ route, navigation }) {
  const { exercise, category } = route.params;

  // Journal state
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sets, setSets] = useState([{ weight: '', reps: '' }]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load journal entries
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const exerciseEntries = await JournalService.getExerciseEntries(
        exercise.name,
        category?.name || 'home'
      );
      setEntries(exerciseEntries);
    } catch (e) {
      console.warn('Failed to load journal entries:', e);
    } finally {
      setIsLoading(false);
    }
  }, [exercise.name, category?.name]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addSet = () => {
    setSets([...sets, { weight: '', reps: '' }]);
  };

  const removeSet = (index) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index);
      setSets(newSets);
    }
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const saveEntry = async () => {
    // Validate at least one set has data
    const validSets = sets.filter(s => s.weight || s.reps);
    if (validSets.length === 0 && !notes.trim()) {
      Alert.alert('No Data', 'Please enter at least one set or a note.');
      return;
    }

    setIsSaving(true);
    try {
      await JournalService.addJournalEntry(
        exercise.name,
        category?.name || 'home',
        { sets: validSets, notes: notes.trim() }
      );

      // Reset form and reload
      setSets([{ weight: '', reps: '' }]);
      setNotes('');
      setShowAddForm(false);
      await loadEntries();
    } catch (e) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await JournalService.deleteJournalEntry(
                exercise.name,
                category?.name || 'home',
                entryId
              );
              await loadEntries();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete entry.');
            }
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
          <Text style={styles.headerTitle}>Exercise</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Exercise Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.exerciseIcon, { backgroundColor: category.color + '20' }]}>
              <Ionicons name="fitness" size={64} color={category.color} />
            </View>
          </View>

          {/* Exercise Name */}
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
            <Ionicons name={category.icon} size={16} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="list" size={20} color="#FF9500" />
              <Text style={styles.instructionsTitle}>How To Do It</Text>
            </View>
            <Text style={styles.instructionsText}>{exercise.description}</Text>
          </View>

          {/* Journal Section */}
          <View style={styles.journalSection}>
            <View style={styles.journalHeader}>
              <View style={styles.journalTitleRow}>
                <Ionicons name="journal" size={22} color="#8B5A2B" />
                <Text style={styles.journalTitle}>Progress Journal</Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Ionicons
                  name={showAddForm ? "close" : "add"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Add Entry Form */}
            {showAddForm && (
              <View style={styles.addForm}>
                <Text style={styles.formLabel}>Log Your Sets</Text>

                {sets.map((set, index) => (
                  <View key={index} style={styles.setRow}>
                    <Text style={styles.setNumber}>Set {index + 1}</Text>
                    <View style={styles.setInputs}>
                      <View style={styles.inputGroup}>
                        <TextInput
                          style={styles.input}
                          placeholder="Weight"
                          placeholderTextColor="#A0968E"
                          keyboardType="numeric"
                          value={set.weight}
                          onChangeText={(v) => updateSet(index, 'weight', v)}
                        />
                        <Text style={styles.inputUnit}>lbs</Text>
                      </View>
                      <View style={styles.inputGroup}>
                        <TextInput
                          style={styles.input}
                          placeholder="Reps"
                          placeholderTextColor="#A0968E"
                          keyboardType="numeric"
                          value={set.reps}
                          onChangeText={(v) => updateSet(index, 'reps', v)}
                        />
                        <Text style={styles.inputUnit}>reps</Text>
                      </View>
                      {sets.length > 1 && (
                        <TouchableOpacity
                          style={styles.removeSetButton}
                          onPress={() => removeSet(index)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                  <Ionicons name="add-circle-outline" size={20} color="#8B5A2B" />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>

                <Text style={styles.formLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="How did it feel? Any observations..."
                  placeholderTextColor="#A0968E"
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                />

                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={saveEntry}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save Entry</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Previous Entries */}
            {isLoading ? (
              <ActivityIndicator style={styles.loader} color="#8B5A2B" />
            ) : entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="fitness-outline" size={40} color="#C4B8AE" />
                <Text style={styles.emptyText}>No entries yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap + to log your first workout
                </Text>
              </View>
            ) : (
              <View style={styles.entriesList}>
                {entries.slice(0, 10).map((entry) => (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                      <TouchableOpacity
                        onPress={() => deleteEntry(entry.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#A0968E" />
                      </TouchableOpacity>
                    </View>

                    {entry.sets && entry.sets.length > 0 && (
                      <View style={styles.entrySets}>
                        {entry.sets.map((set, idx) => (
                          <View key={idx} style={styles.entrySet}>
                            <Text style={styles.entrySetText}>
                              Set {idx + 1}: {set.weight ? `${set.weight} lbs` : '-'} × {set.reps ? `${set.reps} reps` : '-'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {entry.notes ? (
                      <Text style={styles.entryNotes}>{entry.notes}</Text>
                    ) : null}
                  </View>
                ))}

                {entries.length > 10 && (
                  <Text style={styles.moreEntries}>
                    + {entries.length - 10} more entries
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Done Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
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
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3728',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
  },
  instructionsText: {
    fontSize: 16,
    color: '#6B5D52',
    lineHeight: 24,
  },
  // Journal styles
  journalSection: {
    marginBottom: 16,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
  },
  addButton: {
    backgroundColor: '#8B5A2B',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5D52',
    marginBottom: 8,
    marginTop: 8,
  },
  setRow: {
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5A2B',
    marginBottom: 6,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E6DC',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#4A3728',
  },
  inputUnit: {
    fontSize: 13,
    color: '#A0968E',
  },
  removeSetButton: {
    padding: 8,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  addSetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  notesInput: {
    backgroundColor: '#FFF8F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E6DC',
    padding: 12,
    fontSize: 15,
    color: '#4A3728',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loader: {
    paddingVertical: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B5D52',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0968E',
    marginTop: 4,
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  entrySets: {
    gap: 4,
  },
  entrySet: {
    paddingVertical: 2,
  },
  entrySetText: {
    fontSize: 15,
    color: '#4A3728',
  },
  entryNotes: {
    fontSize: 14,
    color: '#6B5D52',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0E6DC',
  },
  moreEntries: {
    fontSize: 14,
    color: '#A0968E',
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0E6DC',
  },
  doneButton: {
    backgroundColor: '#8B5A2B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF8F0',
  },
});
