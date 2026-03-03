// Log Progress Screen - Enter workout metrics
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCustomWorkouts } from '../../context/CustomWorkoutContext';

export default function LogProgressScreen({ route, navigation }) {
  const { workoutId, workoutName } = route.params;
  const { recordProgress } = useCustomWorkouts();

  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // At least one metric should be filled
    const hasMetric = sets || reps || weight || duration || distance || notes;
    if (!hasMetric) {
      Alert.alert(
        'No Data',
        'Please enter at least one metric or note for this session.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(true);
    try {
      const metrics = {
        sets: sets ? parseInt(sets, 10) : null,
        reps: reps ? parseInt(reps, 10) : null,
        weight: weight.trim() || null,
        duration: duration ? parseInt(duration, 10) : null,
        distance: distance.trim() || null,
        notes: notes.trim(),
      };

      const result = await recordProgress(workoutId, metrics);

      if (result.success) {
        Alert.alert(
          'Progress Logged!',
          `Great job! You earned ${result.pointsEarned} points.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#4A3728" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Progress</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={[styles.saveButtonText, isSaving && styles.saveButtonTextDisabled]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Workout Name */}
          <View style={styles.workoutInfo}>
            <Ionicons name="fitness" size={20} color="#FF9500" />
            <Text style={styles.workoutName}>{workoutName}</Text>
          </View>

          <Text style={styles.subtitle}>
            Fill in the metrics that apply to your workout
          </Text>

          {/* Sets & Reps Row */}
          <View style={styles.rowSection}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Sets</Text>
              <TextInput
                style={styles.textInput}
                value={sets}
                onChangeText={setSets}
                placeholder="e.g., 3"
                placeholderTextColor="#A89B8C"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                style={styles.textInput}
                value={reps}
                onChangeText={setReps}
                placeholder="e.g., 10"
                placeholderTextColor="#A89B8C"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          {/* Weight */}
          <View style={styles.section}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g., 25 lbs, bodyweight, 10 kg"
              placeholderTextColor="#A89B8C"
              maxLength={30}
            />
          </View>

          {/* Duration & Distance Row */}
          <View style={styles.rowSection}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Duration (min)</Text>
              <TextInput
                style={styles.textInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 30"
                placeholderTextColor="#A89B8C"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Distance</Text>
              <TextInput
                style={styles.textInput}
                value={distance}
                onChangeText={setDistance}
                placeholder="e.g., 2 mi"
                placeholderTextColor="#A89B8C"
                maxLength={20}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did it go? Any observations about your performance?"
              placeholderTextColor="#A89B8C"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Ionicons name="trending-up" size={20} color="#34C759" />
            <Text style={styles.tipsText}>
              Tracking your progress helps you see improvement over time. Even small gains add up!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3728',
  },
  saveButton: {
    backgroundColor: '#8B5A2B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#C4B5A8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  saveButtonTextDisabled: {
    color: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#4A3728',
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  tipsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(52,199,89,0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B5D52',
    lineHeight: 20,
  },
});
