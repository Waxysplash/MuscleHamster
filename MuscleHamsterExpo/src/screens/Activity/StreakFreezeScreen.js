// Streak Freeze Screen - Phase 06
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../context/ActivityContext';
import { PointsConfig } from '../../models/Activity';

const FreezeState = {
  PROMPT: 'prompt',
  RESTORING: 'restoring',
  SUCCESS: 'success',
  DECLINED: 'declined',
  ERROR: 'error',
};

export default function StreakFreezeScreen({ navigation }) {
  const {
    previousBrokenStreak,
    totalPoints,
    restoreStreak,
    acknowledgeStreakReset,
  } = useActivity();

  const [state, setState] = useState(FreezeState.PROMPT);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const canAfford = totalPoints >= PointsConfig.streakFreezeCost;
  const streakDays = previousBrokenStreak || 0;

  const handleRestore = async () => {
    setState(FreezeState.RESTORING);
    try {
      const restoreResult = await restoreStreak();
      if (restoreResult.success) {
        setResult(restoreResult);
        setState(FreezeState.SUCCESS);
      } else {
        setError(restoreResult.error || 'Something went wrong');
        setState(FreezeState.ERROR);
      }
    } catch (e) {
      setError(e.message || 'Failed to restore streak');
      setState(FreezeState.ERROR);
    }
  };

  const handleDecline = async () => {
    await acknowledgeStreakReset();
    setState(FreezeState.DECLINED);
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const getMessage = () => {
    if (!canAfford) {
      if (streakDays >= 7) {
        return "A great streak needs some rest sometimes! You'll build it back!";
      }
      return "No worries! Every journey has bumps. Let's start fresh!";
    }
    if (streakDays >= 7) {
      return `That's a mighty ${streakDays}-day streak! Want to save it?`;
    }
    return "Missed a day? No problem! You can restore your streak.";
  };

  if (state === FreezeState.RESTORING) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#5AC8FA" />
          <Text style={styles.loadingText}>Restoring your streak...</Text>
        </View>
      </View>
    );
  }

  if (state === FreezeState.ERROR) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setState(FreezeState.PROMPT)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (state === FreezeState.SUCCESS) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="snow" size={60} color="#5AC8FA" />
          </View>
          <Text style={styles.successTitle}>Streak Restored!</Text>
          <Text style={styles.successSubtitle}>
            Your {result.restoredStreak}-day streak is back!
          </Text>

          <View style={styles.costBadge}>
            <Ionicons name="star" size={20} color="#FF9500" />
            <Text style={styles.costText}>-{result.pointsSpent} points</Text>
          </View>

          <View style={styles.speechBubble}>
            <Text style={styles.hamsterReaction}>{result.hamsterReaction}</Text>
          </View>

          <View style={styles.reminderBox}>
            <Ionicons name="alert-circle" size={20} color="#FF9500" />
            <Text style={styles.reminderText}>
              Don't forget to check in today to keep your streak going!
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Got It!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === FreezeState.DECLINED) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
            <Ionicons name="refresh" size={60} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>Fresh Start!</Text>
          <Text style={styles.successSubtitle}>
            Every new streak starts with day 1. You've got this!
          </Text>

          <View style={styles.speechBubble}>
            <Text style={styles.hamsterReaction}>
              I believe in you! Let's build an even better streak together! 💪
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Let's Go!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prompt state
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.promptContent}>
        <View style={styles.brokenStreakIcon}>
          <Ionicons name="flame" size={60} color="#8E8E93" />
          <View style={styles.breakMark}>
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </View>
        </View>

        <Text style={styles.title}>Streak Broken</Text>
        <Text style={styles.streakInfo}>Your {streakDays}-day streak has ended</Text>
        <Text style={styles.message}>{getMessage()}</Text>

        {canAfford ? (
          <>
            <View style={styles.restoreCard}>
              <View style={styles.restoreHeader}>
                <Ionicons name="snow" size={24} color="#5AC8FA" />
                <Text style={styles.restoreTitle}>Streak Freeze</Text>
              </View>
              <Text style={styles.restoreDescription}>
                Restore your streak and keep going!
              </Text>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Cost:</Text>
                <View style={styles.costBadge}>
                  <Ionicons name="star" size={16} color="#FF9500" />
                  <Text style={styles.costText}>{PointsConfig.streakFreezeCost}</Text>
                </View>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Your balance:</Text>
              <Text style={styles.balanceValue}>{totalPoints} points</Text>
            </View>
            <Text style={styles.afterPurchase}>
              After restore: {totalPoints - PointsConfig.streakFreezeCost} points
            </Text>

            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <Ionicons name="snow" size={20} color="#fff" />
              <Text style={styles.restoreButtonText}>Restore My Streak</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.cantAffordCard}>
            <Text style={styles.cantAffordText}>
              Streak Freeze costs {PointsConfig.streakFreezeCost} points
            </Text>
            <Text style={styles.cantAffordBalance}>
              You have {totalPoints} points
            </Text>
            <Text style={styles.cantAffordHint}>
              Keep working out to earn more points for next time!
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.declineButtonText}>Start Fresh Instead</Text>
        </TouchableOpacity>
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
  promptContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  brokenStreakIcon: {
    position: 'relative',
    marginBottom: 16,
  },
  breakMark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  streakInfo: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    marginBottom: 24,
  },
  restoreCard: {
    backgroundColor: 'rgba(90,200,250,0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
  },
  restoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restoreTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#5AC8FA',
  },
  restoreDescription: {
    fontSize: 16,
    color: '#3C3C43',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  costText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  afterPurchase: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5AC8FA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  restoreButtonText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cantAffordCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  cantAffordText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  cantAffordBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 8,
  },
  cantAffordHint: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
  declineButton: {
    paddingVertical: 16,
  },
  declineButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#5AC8FA',
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
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(90,200,250,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  successSubtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 24,
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
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  reminderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF9500',
    flex: 1,
  },
  doneButton: {
    marginHorizontal: 24,
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
