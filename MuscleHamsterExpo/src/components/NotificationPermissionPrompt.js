// Notification Permission Prompt - Phase 08.2
// Pre-prompt view for requesting notification permissions

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import Logger from '../services/LoggerService';

export default function NotificationPermissionPrompt({
  visible,
  onComplete,
  onDismiss,
}) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';

      setPermissionGranted(granted);
      setShowResult(true);
      setIsRequesting(false);
    } catch (error) {
      Logger.warn('Error requesting notification permission:', error);
      setPermissionGranted(false);
      setShowResult(true);
      setIsRequesting(false);
    }
  };

  const handleMaybeLater = () => {
    setPermissionGranted(false);
    setShowResult(true);
  };

  const handleComplete = () => {
    onComplete?.(permissionGranted);
    // Reset state for next time
    setShowResult(false);
    setPermissionGranted(false);
    onDismiss?.();
  };

  const resetAndClose = () => {
    setShowResult(false);
    setPermissionGranted(false);
    setIsRequesting(false);
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <View style={styles.container}>
        {/* Drag indicator */}
        <View style={styles.dragIndicator} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['rgba(0,122,255,0.2)', 'rgba(0,122,255,0.05)']}
              style={styles.iconContainer}
            >
              <Ionicons name="notifications" size={48} color="#007AFF" />
            </LinearGradient>

            <Text style={styles.title}>
              {showResult
                ? permissionGranted
                  ? "You're all set!"
                  : 'No problem!'
                : 'Can I send you a little nudge?'}
            </Text>
          </View>

          {/* Content */}
          {showResult ? (
            <View style={styles.resultContent}>
              {permissionGranted ? (
                <>
                  <Text style={styles.resultText}>
                    I'll send you gentle reminders to keep our workout streak going.
                    You can always change this in Settings.
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color="#34C759"
                    style={styles.resultIcon}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.resultText}>
                    I'll be here whenever you're ready. You can always enable reminders
                    later in Settings if you change your mind.
                  </Text>
                  <Ionicons
                    name="heart"
                    size={48}
                    color="#007AFF"
                    style={styles.resultIcon}
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleComplete}
                accessibilityLabel="Got it. Close notification prompt"
              >
                <Text style={styles.doneButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promptContent}>
              {/* Explanation */}
              <View style={styles.explanationSection}>
                <Text style={styles.explanationTitle}>I promise I'll be gentle!</Text>
                <Text style={styles.explanationText}>
                  Just a friendly reminder when it's time for our workout together.
                  No spam, no pressure - just your hamster cheering you on.
                </Text>
              </View>

              {/* What to expect */}
              <View style={styles.previewSection}>
                <NotificationPreview
                  icon="notifications"
                  title="Daily Reminder"
                  description="A gentle nudge at your preferred time"
                />
                <NotificationPreview
                  icon="flame"
                  title="Streak Support"
                  description="A heads-up if your streak is at risk"
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Buttons - only show when not in result state */}
        {!showResult && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRequestPermission}
              disabled={isRequesting}
              accessibilityLabel="Yes, remind me. Enable notifications"
              accessibilityHint="Your hamster will send gentle workout reminders"
            >
              {isRequesting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Yes, Remind Me</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleMaybeLater}
              disabled={isRequesting}
              accessibilityLabel="Maybe later. Skip notifications for now"
              accessibilityHint="You can enable notifications anytime in Settings"
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

// Notification preview item
function NotificationPreview({ icon, title, description }) {
  return (
    <View style={styles.previewItem}>
      <Ionicons name={icon} size={24} color="#007AFF" style={styles.previewIcon} />
      <View style={styles.previewTextContainer}>
        <Text style={styles.previewTitle}>{title}</Text>
        <Text style={styles.previewDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Compact banner version for workout completion screen
export function NotificationPromptBanner({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={onPress}
      accessibilityLabel="Enable reminders. Opens notification settings"
    >
      <View style={styles.bannerContent}>
        <Ionicons name="notifications" size={24} color="#007AFF" />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Want a gentle reminder?</Text>
          <Text style={styles.bannerSubtitle}>I can nudge you when it's workout time!</Text>
        </View>
      </View>

      <View style={styles.bannerButton}>
        <Text style={styles.bannerButtonText}>Enable Reminders</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dragIndicator: {
    width: 36,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  promptContent: {},
  explanationSection: {
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  explanationText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8E8E93',
    lineHeight: 24,
  },
  previewSection: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  previewIcon: {
    marginRight: 16,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  previewDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  resultContent: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 24,
  },
  resultIcon: {
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },

  // Banner styles
  bannerContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  bannerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bannerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
