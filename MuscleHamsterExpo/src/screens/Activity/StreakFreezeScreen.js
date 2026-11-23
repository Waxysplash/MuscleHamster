// Streak Freeze Screen - Phase 06
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIcon from '../../components/ui/AppIcon';
import { useActivity } from '../../context/ActivityContext';
import { PointsConfig } from '../../models/Activity';
import { StatIcons } from '../../config/AssetImages';

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
          <ActivityIndicator size="large" color="#1A7F91" />
          <Text style={styles.loadingText}>Restoring your streak...</Text>
        </View>
      </View>
    );
  }

  if (state === FreezeState.ERROR) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#C0392B" />
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
            <AppIcon name="streak_freeze" size={76} />
          </View>
          <Text style={styles.successTitle}>Streak Restored!</Text>
          <Text style={styles.successSubtitle}>
            Your {result.restoredStreak}-day streak is back!
          </Text>

          <View style={styles.costBadge}>
            <Image source={StatIcons.points} style={{ width: 22, height: 22 }} resizeMode="contain" />
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
            <Ionicons name="refresh" size={60} color="#2E7D32" />
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
        <TouchableOpacity
          onPress={handleDone}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={28} color="#6B5D52" />
        </TouchableOpacity>
      </View>

      <View style={styles.promptContent}>
        <View style={styles.brokenStreakIcon}>
          <Ionicons name="heart" size={60} color="#FF9500" />
        </View>

        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.streakInfo}>Your hamster missed you. Your {streakDays}-day streak took a break, and that's okay.</Text>
        <Text style={styles.message}>{getMessage()}</Text>

        {canAfford ? (
          <>
            <View style={styles.restoreCard}>
              <View style={styles.restoreHeader}>
                <Ionicons name="snow" size={24} color="#1A7F91" />
                <Text style={styles.restoreTitle}>Streak Freeze</Text>
              </View>
              <Text style={styles.restoreDescription}>
                Restore your streak and keep going!
              </Text>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Cost:</Text>
                <View style={styles.costBadge}>
                  <Image source={StatIcons.points} style={{ width: 18, height: 18 }} resizeMode="contain" />
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
          <Text style={styles.declineButtonText}>Start fresh (free)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4E6',
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
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
  },
  title: {
    fontFamily: 'Quicksand_700Bold', fontSize: 28,
    marginBottom: 8,
    color: '#4A3728',
  },
  streakInfo: {
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#6B5D52',
    marginBottom: 16,
  },
  message: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
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
    fontFamily: 'Quicksand_700Bold', fontSize: 20,
    marginLeft: 8,
    color: '#1A7F91',
  },
  restoreDescription: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#3C3C43',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
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
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#A65000',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  balanceLabel: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
  },
  balanceValue: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
    color: '#4A3728',
  },
  afterPurchase: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    marginBottom: 24,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A7F91',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  restoreButtonText: {
    marginLeft: 8,
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#fff',
  },
  cantAffordCard: {
    backgroundColor: 'rgba(139,90,43,0.08)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  cantAffordText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
  },
  cantAffordBalance: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#C0392B',
    marginTop: 8,
  },
  cantAffordHint: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 12,
  },
  declineButton: {
    paddingVertical: 16,
  },
  declineButtonText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#A65000',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#1A7F91',
  },
  errorTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    marginTop: 16,
    color: '#C0392B',
  },
  errorText: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
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
    backgroundColor: '#FFE3B8',
    borderWidth: 2.5,
    borderColor: '#4A3728',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 28,
    marginBottom: 8,
    color: '#4A3728',
  },
  successSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 18,
    color: '#6B5D52',
    marginBottom: 24,
  },
  speechBubble: {
    backgroundColor: 'rgba(139,90,43,0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    maxWidth: '90%',
  },
  hamsterReaction: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#6B5D52',
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
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#A65000',
    flex: 1,
  },
  doneButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    color: '#fff',
  },
});
