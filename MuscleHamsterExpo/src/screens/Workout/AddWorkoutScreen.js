// Add Workout Screen - Create custom workouts
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

const WORKOUT_TYPES = [
  { id: 'strength', name: 'Strength', icon: 'barbell-outline' },
  { id: 'cardio', name: 'Cardio', icon: 'heart-outline' },
  { id: 'class', name: 'Class', icon: 'people-outline' },
  { id: 'other', name: 'Other', icon: 'fitness-outline' },
];

const TARGET_TYPES = [
  { id: 'reps', name: 'Reps / Sets', placeholder: 'e.g., 3 sets x 10 reps' },
  { id: 'duration', name: 'Duration', placeholder: 'e.g., 30 minutes' },
  { id: 'custom', name: 'Custom Goal', placeholder: 'e.g., Complete the class' },
];

export default function AddWorkoutScreen({ navigation }) {
  const { addWorkout } = useCustomWorkouts();
  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState('custom');
  const [targetValue, setTargetValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a workout name.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await addWorkout({
        name: name.trim(),
        type,
        description: description.trim(),
        targetType,
        targetValue: targetValue.trim(),
      });

      if (result.success) {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTargetType = TARGET_TYPES.find(t => t.id === targetType);

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
          <Text style={styles.headerTitle}>Add Workout</Text>
          <TouchableOpacity
            style={[styles.saveButton, (!name.trim() || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!name.trim() || isSaving}
          >
            <Text style={[styles.saveButtonText, (!name.trim() || isSaving) && styles.saveButtonTextDisabled]}>
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
          <View style={styles.section}>
            <Text style={styles.label}>Workout Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Spin Class, Morning Run"
              placeholderTextColor="#A89B8C"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />
          </View>

          {/* Workout Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeGrid}>
              {WORKOUT_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.typeButton,
                    type === item.id && styles.typeButtonSelected,
                  ]}
                  onPress={() => setType(item.id)}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={type === item.id ? '#FFF8F0' : '#6B5D52'}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    type === item.id && styles.typeButtonTextSelected,
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Target Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Goal Type</Text>
            <View style={styles.targetTypeRow}>
              {TARGET_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.targetTypeButton,
                    targetType === item.id && styles.targetTypeButtonSelected,
                  ]}
                  onPress={() => setTargetType(item.id)}
                >
                  <Text style={[
                    styles.targetTypeText,
                    targetType === item.id && styles.targetTypeTextSelected,
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Target Value */}
          <View style={styles.section}>
            <Text style={styles.label}>Target (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={targetValue}
              onChangeText={setTargetValue}
              placeholder={selectedTargetType?.placeholder || 'Enter your goal'}
              placeholderTextColor="#A89B8C"
              maxLength={50}
            />
          </View>

          {/* Description/Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any notes, reminders, or details about this workout..."
              placeholderTextColor="#A89B8C"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Ionicons name="bulb-outline" size={20} color="#FF9500" />
            <Text style={styles.tipsText}>
              Track your progress over time! Each time you complete this workout, you can log sets, reps, weight, duration, and notes.
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 10,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#8B5A2B',
    borderColor: '#8B5A2B',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B5D52',
  },
  typeButtonTextSelected: {
    color: '#FFF8F0',
  },
  targetTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetTypeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DFD5',
  },
  targetTypeButtonSelected: {
    backgroundColor: '#8B5A2B',
    borderColor: '#8B5A2B',
  },
  targetTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5D52',
  },
  targetTypeTextSelected: {
    color: '#FFF8F0',
  },
  tipsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,149,0,0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B5D52',
    lineHeight: 20,
  },
});
