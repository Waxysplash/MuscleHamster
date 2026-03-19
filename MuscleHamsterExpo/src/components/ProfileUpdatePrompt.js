// ProfileUpdatePrompt - Prompts users with old profiles to update
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ProfileUpdatePrompt
 * Shows a modal prompting users with old profile format to update their preferences.
 *
 * @param {boolean} visible - Whether to show the modal
 * @param {function} onUpdate - Called when user taps "Update Now"
 * @param {function} onSkip - Called when user taps "Maybe Later"
 */
export default function ProfileUpdatePrompt({ visible, onUpdate, onSkip }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={40} color="#FF9500" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Quick Profile Update</Text>

          {/* Message */}
          <Text style={styles.message}>
            We've simplified your fitness preferences to make them more useful.
            Take 30 seconds to update your profile?
          </Text>

          {/* What's new */}
          <View style={styles.whatsNew}>
            <Text style={styles.whatsNewTitle}>What's new:</Text>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.bulletText}>Simpler fitness goals</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.bulletText}>Pick your workout days</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.bulletText}>Better workout suggestions</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,149,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3728',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B5D52',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  whatsNew: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5DDD5',
  },
  whatsNewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#6B5D52',
  },
  updateButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  updateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    fontSize: 15,
    color: '#8B5A2B',
  },
});
