/**
 * ProfileVisibilityScreen.js
 * MuscleHamster Expo
 *
 * View for selecting profile visibility level
 * Ported from Phase 09.5: Privacy Controls
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import friendService from '../../services/FriendService';
import Logger from '../../services/LoggerService';
import {
  ProfileVisibilityLevel,
  getVisibilityDisplayName,
  getVisibilityDescription,
  getVisibilityIcon,
  getVisibilityColor,
} from '../../models/Friend';

// Extended descriptions for each visibility level
const VISIBILITY_DETAILED_DESCRIPTIONS = {
  [ProfileVisibilityLevel.EVERYONE]:
    'Anyone using Muscle Hamster can find you via search and view your profile. Great for making new friends!',
  [ProfileVisibilityLevel.FRIENDS_ONLY]:
    'Only people you\'ve already added as friends can see your full profile. Others will see limited info.',
  [ProfileVisibilityLevel.PRIVATE]:
    'You won\'t appear in search results. Only existing friends can see you. New friend requests are disabled.',
};

export default function ProfileVisibilityScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(ProfileVisibilityLevel.EVERYONE);
  const [originalLevel, setOriginalLevel] = useState(ProfileVisibilityLevel.EVERYONE);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = currentUser?.id || 'currentUser';

  const hasChanges = selectedLevel !== originalLevel;

  // Load settings on focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await friendService.getPrivacySettings(currentUserId);
      setSelectedLevel(settings.profileVisibility);
      setOriginalLevel(settings.profileVisibility);
    } catch (e) {
      Logger.warn('Failed to load privacy settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const currentSettings = await friendService.getPrivacySettings(currentUserId);
      const newSettings = {
        ...currentSettings,
        profileVisibility: selectedLevel,
        // Disable friend requests if private
        allowFriendRequests:
          selectedLevel === ProfileVisibilityLevel.PRIVATE
            ? false
            : currentSettings.allowFriendRequests,
      };

      await friendService.updatePrivacySettings(currentUserId, newSettings);

      setOriginalLevel(selectedLevel);
      navigation.goBack();
    } catch (e) {
      Logger.warn('Failed to save privacy settings:', e);
      Alert.alert(
        "Couldn't Save",
        'Something went wrong. Please try again.',
        [
          { text: 'Try Again', onPress: saveSettings },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case ProfileVisibilityLevel.EVERYONE:
        return '#34C759';
      case ProfileVisibilityLevel.FRIENDS_ONLY:
        return '#007AFF';
      case ProfileVisibilityLevel.PRIVATE:
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const visibilityOptions = [
    ProfileVisibilityLevel.EVERYONE,
    ProfileVisibilityLevel.FRIENDS_ONLY,
    ProfileVisibilityLevel.PRIVATE,
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="eye" size={28} color="#007AFF" />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Control Your Visibility</Text>
            <Text style={styles.infoBannerSubtitle}>
              Choose who can discover you and see your profile.
            </Text>
          </View>
        </View>

        {/* Visibility Options */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Who can find your profile?</Text>
          <View style={styles.card}>
            {visibilityOptions.map((level, index) => {
              const color = getLevelColor(level);
              const isSelected = selectedLevel === level;

              return (
                <React.Fragment key={level}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setSelectedLevel(level)}
                    accessibilityLabel={`${getVisibilityDisplayName(level)}. ${getVisibilityDescription(level)}`}
                    accessibilityValue={{ text: isSelected ? 'Selected' : '' }}
                    accessibilityHint="Double tap to select this visibility level"
                  >
                    <View style={[styles.optionIcon, { backgroundColor: `${color}20` }]}>
                      <Ionicons name={getVisibilityIcon(level)} size={22} color={color} />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionLabel}>{getVisibilityDisplayName(level)}</Text>
                      <Text style={styles.optionDescription} numberOfLines={2}>
                        {getVisibilityDescription(level)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={26} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
          <Text style={styles.footerText}>Changes take effect immediately.</Text>
        </View>

        {/* Change Preview */}
        {hasChanges && (
          <View style={styles.section}>
            <View style={styles.changePreview}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <View style={styles.changePreviewText}>
                <Text style={styles.changePreviewTitle}>
                  Changing to {getVisibilityDisplayName(selectedLevel)}
                </Text>
                <Text style={styles.changePreviewDescription}>
                  {VISIBILITY_DETAILED_DESCRIPTIONS[selectedLevel]}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Saving Overlay */}
      <Modal visible={isSaving} transparent animationType="fade">
        <View style={styles.savingOverlay}>
          <View style={styles.savingModal}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoBannerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C7C7CC',
    marginLeft: 72,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 3,
    lineHeight: 18,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    marginHorizontal: 16,
  },
  changePreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  changePreviewText: {
    flex: 1,
    marginLeft: 10,
  },
  changePreviewTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  changePreviewDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 18,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C7C7CC',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  savingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  savingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
});
