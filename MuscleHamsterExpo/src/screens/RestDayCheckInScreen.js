// Rest Day Check-In Screen - Phase 06
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../context/ActivityContext';
import { RestDayActivity, RestDayActivityInfo } from '../models/Activity';

const CheckInState = {
  SELECTION: 'selection',
  CONFIRMING: 'confirming',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function RestDayCheckInScreen({ navigation }) {
  const { recordRestDayCheckIn } = useActivity();

  const [state, setState] = useState(CheckInState.SELECTION);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const quickInteractions = Object.values(RestDayActivity).filter(
    (a) => RestDayActivityInfo[a].isQuickInteraction
  );
  const loggableActivities = Object.values(RestDayActivity).filter(
    (a) => !RestDayActivityInfo[a].isQuickInteraction
  );

  const handleSelectActivity = async (activity) => {
    setSelectedActivity(activity);
    setState(CheckInState.CONFIRMING);
    setError(null);

    try {
      const checkInResult = await recordRestDayCheckIn(activity);
      if (checkInResult.success) {
        setResult(checkInResult);
        setState(CheckInState.SUCCESS);
      } else {
        setError(checkInResult.error || 'Something went wrong');
        setState(CheckInState.ERROR);
      }
    } catch (e) {
      setError(e.message || 'Failed to check in');
      setState(CheckInState.ERROR);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setState(CheckInState.SELECTION);
    setSelectedActivity(null);
    setError(null);
  };

  if (state === CheckInState.CONFIRMING) {
    const activityInfo = RestDayActivityInfo[selectedActivity];
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#5856D6" />
          <Text style={styles.confirmingText}>
            Recording your {activityInfo.displayName.toLowerCase()}...
          </Text>
        </View>
      </View>
    );
  }

  if (state === CheckInState.ERROR) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state === CheckInState.SUCCESS) {
    const activityInfo = RestDayActivityInfo[selectedActivity];
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.celebrationIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>Rest Day Complete!</Text>

          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={24} color="#FF9500" />
            <Text style={styles.rewardText}>+{result.pointsEarned} points</Text>
          </View>

          <View style={styles.speechBubble}>
            <Text style={styles.hamsterReaction}>{activityInfo.hamsterReaction}</Text>
          </View>

          <View style={styles.streakInfo}>
            <Ionicons name="flame" size={24} color="#FF3B30" />
            <Text style={styles.streakText}>{result.newStreak} day streak maintained!</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Selection state
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Rest Day Check-in</Text>
      <Text style={styles.subtitle}>Take a moment to care for yourself (and your hamster!)</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Hamster Interactions</Text>
        <View style={styles.activitiesRow}>
          {quickInteractions.map((activity) => {
            const info = RestDayActivityInfo[activity];
            return (
              <TouchableOpacity
                key={activity}
                style={styles.activityCard}
                onPress={() => handleSelectActivity(activity)}
                accessibilityLabel={info.displayName}
              >
                <View style={[styles.activityIcon, { backgroundColor: '#FFE0E0' }]}>
                  <Ionicons name={info.icon} size={32} color="#FF6B6B" />
                </View>
                <Text style={styles.activityName}>{info.displayName}</Text>
                <Text style={styles.activityDescription}>{info.description}</Text>
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={14} color="#FF9500" />
                  <Text style={styles.pointsText}>+{info.pointsAwarded}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log an Activity</Text>
        {loggableActivities.map((activity) => {
          const info = RestDayActivityInfo[activity];
          return (
            <TouchableOpacity
              key={activity}
              style={styles.activityRow}
              onPress={() => handleSelectActivity(activity)}
              accessibilityLabel={info.displayName}
            >
              <View style={[styles.activityRowIcon, { backgroundColor: '#E0F0FF' }]}>
                <Ionicons name={info.icon} size={24} color="#007AFF" />
              </View>
              <View style={styles.activityRowInfo}>
                <Text style={styles.activityRowName}>{info.displayName}</Text>
                <Text style={styles.activityRowDescription}>{info.description}</Text>
              </View>
              <View style={styles.activityRowPoints}>
                <Ionicons name="star" size={16} color="#FF9500" />
                <Text style={styles.pointsText}>+{info.pointsAwarded}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  activitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityCard: {
    width: '45%',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  activityIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  activityDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255,149,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  activityRowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityRowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  activityRowDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  activityRowPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#5856D6',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  celebrationIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  rewardText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#FF9500',
  },
  speechBubble: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    maxWidth: '90%',
  },
  hamsterReaction: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#3C3C43',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
  },
  doneButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
