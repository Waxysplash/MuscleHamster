// Home Screen - Full Implementation with Notifications
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { HamsterStateInfo, StreakStatus } from '../../models/Activity';
import LoadingView from '../../components/LoadingView';
import NotificationContextBanner from '../../components/NotificationContextBanner';
import HamsterPortrait from '../../components/HamsterPortrait';
import { useInventory } from '../../context/InventoryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { createNotificationContext, NotificationType } from '../../models/Notification';

export default function HomeScreen({ navigation }) {
  const { profile } = useUserProfile();
  const {
    stats,
    isLoading,
    streakStatus,
    hamsterState,
    totalPoints,
    currentStreak,
    previousBrokenStreak,
    hasCheckedInToday,
    loadStats,
  } = useActivity();

  const {
    equippedOutfit,
    equippedAccessory,
    placedEnclosureItems,
    loadInventory,
  } = useInventory();

  const [refreshing, setRefreshing] = useState(false);
  const [hasShownStreakFreeze, setHasShownStreakFreeze] = useState(false);

  // Notification banner state
  const [notificationContext, setNotificationContext] = useState(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Reload stats and inventory when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadInventory();
    }, [loadStats, loadInventory])
  );

  // Show streak freeze if needed
  useEffect(() => {
    if (
      previousBrokenStreak &&
      previousBrokenStreak > 0 &&
      !hasShownStreakFreeze
    ) {
      setHasShownStreakFreeze(true);
      navigation.navigate('StreakFreeze');
    }
  }, [previousBrokenStreak, hasShownStreakFreeze, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleNotificationBannerDismiss = () => {
    setShowNotificationBanner(false);
    setNotificationContext(null);
  };

  const handleNotificationAction = () => {
    navigation.navigate('RestDayCheckIn');
  };

  const hamsterInfo = HamsterStateInfo[hamsterState] || HamsterStateInfo.hungry;
  const hamsterName = profile?.hamsterName || 'Your Hamster';

  const getStreakStatusInfo = () => {
    if (!streakStatus) return { icon: 'flame-outline', color: '#8E8E93', text: 'Start your streak!' };

    switch (streakStatus.status) {
      case StreakStatus.ACTIVE:
        return { icon: 'flame', color: '#FF3B30', text: 'Streak secured!' };
      case StreakStatus.AT_RISK:
        return { icon: 'flame', color: '#FF9500', text: 'Check in today to keep it!' };
      case StreakStatus.BROKEN:
        return { icon: 'refresh', color: '#8E8E93', text: 'Start a new streak!' };
      default:
        return { icon: 'flame-outline', color: '#8E8E93', text: 'Start your streak!' };
    }
  };

  const streakInfo = getStreakStatusInfo();
  const hasCompletedWorkoutToday = stats?.workoutHistory?.some(
    (w) => new Date(w.completedAt).toDateString() === new Date().toDateString()
  );

  if (isLoading && !stats) {
    return <LoadingView message="Waking up your hamster..." />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Notification Banner */}
        {showNotificationBanner && notificationContext && (
          <NotificationContextBanner
            context={notificationContext}
            onDismiss={handleNotificationBannerDismiss}
            onAction={notificationContext.hasActionButton ? handleNotificationAction : null}
          />
        )}

        {/* Points Header */}
        <View style={styles.pointsHeader}>
          <Ionicons name="star" size={20} color="#FF9500" />
          <Text style={styles.pointsText}>{totalPoints} points</Text>
        </View>

        {/* Hamster Portrait Section */}
        <View style={styles.portraitSection}>
          <LinearGradient
            colors={['#87CEEB', '#4ECDC4']}
            style={styles.portraitBackground}
          >
            {/* Status Badge */}
            <View style={styles.statusOverlay}>
              <View style={[styles.stateBadge, { backgroundColor: '#fff' }]}>
                <Ionicons name={hamsterInfo.icon} size={16} color={hamsterInfo.color} />
                <Text style={[styles.stateText, { color: hamsterInfo.color }]}>
                  {hamsterInfo.displayName}
                </Text>
              </View>
            </View>

            {/* Hamster Portrait - Large and Prominent */}
            <View style={styles.hamsterPortraitWrapper}>
              <HamsterPortrait
                state={hamsterState}
                size={280}
                showHeadband={!equippedAccessory}
                equippedAccessory={equippedAccessory}
              />
            </View>
          </LinearGradient>

          {/* Hamster Info Below Portrait */}
          <View style={styles.hamsterInfoSection}>
            <Text style={styles.hamsterName}>{hamsterName}</Text>
            <Text style={styles.hamsterGreeting}>{hamsterInfo.greeting}</Text>

            {/* Customize Button */}
            <TouchableOpacity
              style={styles.customizeButton}
              onPress={() => navigation.navigate('Inventory')}
              accessibilityLabel="Customize your hamster"
            >
              <Ionicons name="color-palette" size={16} color="#007AFF" />
              <Text style={styles.customizeButtonText}>Customize</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.todayCard}>
            {hasCheckedInToday ? (
              <View style={styles.completedStatus}>
                <Ionicons name="checkmark-circle" size={32} color="#34C759" />
                <View style={styles.completedInfo}>
                  <Text style={styles.completedTitle}>All done for today!</Text>
                  <Text style={styles.completedSubtitle}>
                    {hasCompletedWorkoutToday ? 'Workout completed' : 'Rest day check-in done'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.pendingStatus}>
                <Ionicons name="time" size={32} color="#FF9500" />
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingTitle}>Ready for action!</Text>
                  <Text style={styles.pendingSubtitle}>Complete a workout or rest day check-in</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Daily Actions */}
        {!hasCheckedInToday && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.workoutButton]}
                onPress={() => navigation.navigate('Workouts')}
                accessibilityLabel="Start a workout"
              >
                <Ionicons name="fitness" size={28} color="#fff" />
                <Text style={styles.actionButtonText}>Start Workout</Text>
              </TouchableOpacity>

              {!hasCompletedWorkoutToday && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.restDayButton]}
                  onPress={() => navigation.navigate('RestDayCheckIn')}
                  accessibilityLabel="Rest day check-in"
                >
                  <Ionicons name="cafe" size={28} color="#fff" />
                  <Text style={styles.actionButtonText}>Rest Day</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Streak Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streak</Text>
          <TouchableOpacity
            style={[styles.streakCard, { borderColor: streakInfo.color + '40' }]}
            onPress={() => {
              if (previousBrokenStreak && previousBrokenStreak > 0) {
                navigation.navigate('StreakFreeze');
              }
            }}
            disabled={!previousBrokenStreak}
          >
            <View style={styles.streakContent}>
              <Ionicons name={streakInfo.icon} size={40} color={streakInfo.color} />
              <View style={styles.streakInfo}>
                <Text style={[styles.streakNumber, { color: streakInfo.color }]}>
                  {currentStreak}
                </Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            </View>
            <Text style={styles.streakStatus}>{streakInfo.text}</Text>

            {streakStatus?.status === StreakStatus.AT_RISK && (
              <View style={styles.atRiskBadge}>
                <Text style={styles.atRiskText}>AT RISK</Text>
              </View>
            )}

            {previousBrokenStreak && previousBrokenStreak > 0 && (
              <View style={styles.restoreHint}>
                <Ionicons name="snow" size={16} color="#5AC8FA" />
                <Text style={styles.restoreHintText}>Tap to restore streak</Text>
              </View>
            )}
          </TouchableOpacity>

          {stats?.longestStreak > 0 && (
            <Text style={styles.longestStreak}>
              Longest streak: {stats.longestStreak} days
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="fitness" size={24} color="#007AFF" />
              <Text style={styles.statValue}>{stats?.totalWorkoutsCompleted || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cafe" size={24} color="#5856D6" />
              <Text style={styles.statValue}>{stats?.totalRestDayCheckIns || 0}</Text>
              <Text style={styles.statLabel}>Rest Days</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FF9500" />
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,149,0,0.1)',
  },
  pointsText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  portraitSection: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  portraitBackground: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  hamsterPortraitWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stateText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  hamsterInfoSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  hamsterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  hamsterGreeting: {
    marginTop: 8,
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 20,
  },
  customizeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  todayCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
  },
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedInfo: {
    marginLeft: 12,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingInfo: {
    marginLeft: 12,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  pendingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  workoutButton: {
    backgroundColor: '#34C759',
  },
  restDayButton: {
    backgroundColor: '#5856D6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  streakCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakInfo: {
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  streakStatus: {
    marginTop: 12,
    fontSize: 16,
    color: '#3C3C43',
  },
  atRiskBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  atRiskText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  restoreHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  restoreHintText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5AC8FA',
  },
  longestStreak: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
