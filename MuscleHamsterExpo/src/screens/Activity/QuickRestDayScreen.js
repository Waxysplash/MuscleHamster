// Quick Rest Day Screen - Simple rest day check-in
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../context/ActivityContext';
import { RestDayActivity, RestDayActivityInfo } from '../../models/Activity';
import { HamsterImages } from '../../config/AssetImages';

const motivationalMessages = [
  "Rest days are important! Your muscles grow while you recover. I'm proud of you for listening to your body!",
  "Taking a rest day? Smart move! Recovery is when the magic happens. You're doing great!",
  "Even champions need rest days! Your body will thank you tomorrow. Keep being awesome!",
  "Rest is part of the journey, not a detour. You're making progress even now!",
  "Listening to your body is a sign of strength, not weakness. Proud of you!",
];

export default function QuickRestDayScreen({ navigation }) {
  const { recordRestDayCheckIn, hasCheckedInToday } = useActivity();

  const [state, setState] = useState('idle'); // idle, loading, success, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [motivationalMessage] = useState(
    () => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

  // If already checked in today, show success state
  useEffect(() => {
    if (hasCheckedInToday) {
      setState('already_done');
    }
  }, [hasCheckedInToday]);

  const handleLogRestDay = async () => {
    setState('loading');
    setError(null);

    try {
      const checkInResult = await recordRestDayCheckIn(RestDayActivity.QUICK_REST);
      if (checkInResult.success) {
        setResult(checkInResult);
        setState('success');
      } else {
        setError(checkInResult.error || 'Something went wrong');
        setState('error');
      }
    } catch (e) {
      setError(e.message || 'Failed to log rest day');
      setState('error');
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  // Loading state
  if (state === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#8B5A2B" />
          <Text style={styles.loadingText}>Logging your rest day...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setState('idle')}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Already checked in today
  if (state === 'already_done') {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleDone} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#6B5D52" />
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <Image source={HamsterImages.rest} style={styles.hamsterImage} />
          <Text style={styles.title}>Already Rested Today!</Text>
          <View style={styles.speechBubble}>
            <Text style={styles.messageText}>
              You've already logged your activity for today. See you tomorrow!
            </Text>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Thanks!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Image source={HamsterImages.rest} style={styles.hamsterImageLarge} />

          <Text style={styles.successTitle}>Rest Day Logged!</Text>

          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={24} color="#FF9500" />
            <Text style={styles.rewardText}>+{result?.pointsEarned || 2} points</Text>
          </View>

          <View style={styles.speechBubble}>
            <Text style={styles.messageText}>{motivationalMessage}</Text>
          </View>

          {result?.newStreak > 0 && (
            <View style={styles.streakInfo}>
              <Ionicons name="flame" size={24} color="#FF3B30" />
              <Text style={styles.streakText}>{result.newStreak} day streak maintained!</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Thanks!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Idle state - Show rest day prompt
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleDone} style={styles.closeButton}>
        <Ionicons name="close" size={28} color="#6B5D52" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Image source={HamsterImages.rest} style={styles.hamsterImageLarge} />

        <Text style={styles.title}>Taking a Rest Day?</Text>
        <Text style={styles.subtitle}>
          Rest is essential for recovery and growth. Log your rest day to keep your streak going!
        </Text>

        <View style={styles.pointsPreview}>
          <Ionicons name="star" size={20} color="#FF9500" />
          <Text style={styles.pointsPreviewText}>Earn 2 points</Text>
        </View>

        <TouchableOpacity style={styles.logButton} onPress={handleLogRestDay}>
          <Ionicons name="bed" size={24} color="#fff" />
          <Text style={styles.logButtonText}>Log Rest Day</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hamsterImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  hamsterImageLarge: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 32,
    gap: 8,
  },
  pointsPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A2B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A3728',
    marginBottom: 16,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  rewardText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF9500',
  },
  speechBubble: {
    backgroundColor: 'rgba(139,90,43,0.08)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#6B5D52',
    lineHeight: 24,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
  },
  doneButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#8B5A2B',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#FF9500',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
