// SaveRoutineModal - Modal for naming and saving a workout routine
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatIcons } from '../../config/AssetImages';

/**
 * SaveRoutineModal Component
 * Shows a simple modal to name a routine before saving
 */
export default function SaveRoutineModal({
  visible,
  workouts = [],
  onSave,
  onClose,
  isSaving = false,
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setName('');
      setError('');
    }
  }, [visible]);

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a name for your routine');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    setError('');
    onSave?.(trimmedName);
  };

  // Suggested names based on workout types
  const suggestions = [
    'Upper Body A',
    'Upper Body B',
    'Lower Body A',
    'Lower Body B',
    'Push Day',
    'Pull Day',
    'Leg Day',
    'Full Body',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color="#6B5D52" />
            </TouchableOpacity>
            <Text style={styles.title}>Save as Routine</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Workout count */}
          <View style={styles.workoutPreview}>
            <Image source={StatIcons.workout} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <Text style={styles.workoutCount}>
              {workouts.length} workout{workouts.length !== 1 ? 's' : ''} will be saved
            </Text>
          </View>

          {/* Name input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Routine Name</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="e.g., Upper Body A"
              placeholderTextColor="#A0968E"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              maxLength={50}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Quick suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Suggestions:</Text>
            <View style={styles.suggestions}>
              {suggestions.slice(0, 4).map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => setName(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="bookmark" size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Routine</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 55, 40, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFF4E6',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 380,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#4A3728',
  },
  workoutPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 90, 43, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  workoutCount: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
    color: '#8B5A2B',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
    color: '#4A3728',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#4A3728',
    borderWidth: 2,
    borderColor: '#E8E0D8',
  },
  inputError: {
    borderColor: '#C0392B',
  },
  errorText: {
    color: '#C0392B',
    fontFamily: 'Nunito_400Regular', fontSize: 13,
    marginTop: 6,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsLabel: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
    color: '#6B5D52',
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },
  suggestionText: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
    color: '#6B5D52',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#E8E0D8',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#6B5D52',
  },
  saveButton: {
    flex: 1.5,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#8B5A2B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#fff',
  },
});
