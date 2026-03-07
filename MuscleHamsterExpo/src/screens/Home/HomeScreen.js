// Home Screen - Fixed enclosure top, scrollable content below
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { HamsterStateInfo, StreakStatus, getSimplifiedState } from '../../models/Activity';
import LoadingView from '../../components/LoadingView';
import HamsterPortrait from '../../components/HamsterPortrait';
import { useInventory } from '../../context/InventoryContext';
import { EnclosureBackground } from '../../config/AssetImages';
import { getTodaysExercise } from '../../models/DailyExercise';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../../components/ErrorBanner';
import Logger from '../../services/LoggerService';
import { useResponsive, getEnclosureHeight, getHamsterSize } from '../../utils/responsive';

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth();
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
    loadInventory,
  } = useInventory();

  // Responsive layout
  const { isTablet, spacing, contentMaxWidth } = useResponsive();
  const enclosureHeight = getEnclosureHeight();
  const hamsterSize = getHamsterSize();

  const [refreshing, setRefreshing] = useState(false);
  const [hasShownStreakFreeze, setHasShownStreakFreeze] = useState(false);
  const [error, setError] = useState(null);

  // Get today's exercise (deterministic per user per day)
  const todaysExercise = getTodaysExercise(currentUser?.id || 'guest');

  // Reload stats and inventory when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          await Promise.all([loadStats(), loadInventory()]);
          setError(null);
        } catch (e) {
          Logger.error('Failed to load home data:', e);
          setError('Could not refresh data');
        }
      };
      load();
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
    setError(null);
    try {
      await Promise.all([loadStats(), loadInventory()]);
    } catch (e) {
      Logger.error('Failed to refresh:', e);
      setError('Could not refresh. Pull down to try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Use simplified state (happy/hungry) when feature flag is on
  const displayState = getSimplifiedState(hamsterState);
  const hamsterInfo = HamsterStateInfo[displayState] || HamsterStateInfo.hungry;
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
    <View style={styles.container}>
      {/* FIXED TOP SECTION - Enclosure with Hamster */}
      <View style={[styles.enclosureSection, { height: enclosureHeight }]}>
        <ImageBackground
          source={EnclosureBackground}
          style={styles.enclosureBackground}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.enclosureSafeArea}>
            {/* Top Bar - State badge left, Name center, Points badge right */}
            <View style={[styles.topBar, isTablet && { paddingHorizontal: 24 }]}>
              {/* State Badge - Left */}
              <View style={styles.topBarLeft}>
                <View style={[styles.stateBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                  <Ionicons name={hamsterInfo.icon} size={isTablet ? 16 : 14} color={hamsterInfo.color} />
                  <Text style={[styles.stateText, { color: hamsterInfo.color }, isTablet && { fontSize: 14 }]}>
                    {hamsterInfo.displayName}
                  </Text>
                </View>
              </View>

              {/* Hamster Name - Center */}
              <View style={styles.nameBadge}>
                <Text style={[styles.hamsterName, isTablet && { fontSize: 18 }]}>{hamsterName}</Text>
              </View>

              {/* Points Badge - Right */}
              <View style={styles.topBarRight}>
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={isTablet ? 18 : 16} color="#FF9500" />
                  <Text style={[styles.pointsText, isTablet && { fontSize: 17 }]}>{totalPoints}</Text>
                </View>
              </View>
            </View>

            {/* Hamster Portrait */}
            <View style={[styles.hamsterContainer, isTablet && { marginTop: 30 }]}>
              <HamsterPortrait
                state={displayState}
                size={hamsterSize}
                equippedOutfit={equippedOutfit}
                equippedAccessory={equippedAccessory}
              />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={onRefresh}
          onDismiss={() => setError(null)}
          style={{ marginTop: 8 }}
        />
      )}

      {/* SCROLLABLE BOTTOM SECTION */}
      <View style={styles.contentSection}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && { alignItems: 'center' }
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Content wrapper for max-width on tablets */}
          <View style={[
            styles.contentWrapper,
            isTablet && { maxWidth: contentMaxWidth, width: '100%' }
          ]}>
          {/* Today's Action Card */}
          {!hasCheckedInToday ? (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('DailyExerciseCheckIn', { exercise: todaysExercise })}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrapper}>
                <Ionicons name="fitness" size={28} color="#fff" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>TODAY'S ACTION</Text>
                <Text style={styles.actionTitle}>Feed {hamsterName}!</Text>
                <Text style={styles.actionSubtitle}>30-60 seconds daily exercise</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.completedCard}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
              <View style={styles.completedInfo}>
                <Text style={styles.completedTitle}>All done for today!</Text>
                <Text style={styles.completedSubtitle}>
                  {hasCompletedWorkoutToday ? 'Workout completed' : 'Daily exercise done'}
                </Text>
              </View>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Streak Card */}
            <View style={[styles.statCard, styles.streakCard]}>
              <Ionicons name={streakInfo.icon} size={28} color={streakInfo.color} />
              <Text style={[styles.statNumber, { color: streakInfo.color }]}>{currentStreak}</Text>
              <Text style={styles.statLabel}>day streak</Text>
            </View>

            {/* Workouts Card */}
            <View style={styles.statCard}>
              <Ionicons name="barbell" size={28} color="#007AFF" />
              <Text style={styles.statNumber}>{stats?.totalWorkoutsCompleted || 0}</Text>
              <Text style={styles.statLabel}>workouts</Text>
            </View>

            {/* Points Card */}
            <View style={styles.statCard}>
              <Ionicons name="star" size={28} color="#FF9500" />
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>
          </View>

          {/* Streak Status Message */}
          {streakStatus?.status === StreakStatus.AT_RISK && (
            <View style={styles.streakWarning}>
              <Ionicons name="alert-circle" size={20} color="#FF9500" />
              <Text style={styles.streakWarningText}>{streakInfo.text}</Text>
            </View>
          )}

          {/* Restore Streak Option */}
          {previousBrokenStreak && previousBrokenStreak > 0 && (
            <TouchableOpacity
              style={styles.restoreCard}
              onPress={() => navigation.navigate('StreakFreeze')}
            >
              <Ionicons name="snow" size={24} color="#5AC8FA" />
              <View style={styles.restoreInfo}>
                <Text style={styles.restoreTitle}>Streak Freeze Available</Text>
                <Text style={styles.restoreSubtitle}>Restore your {previousBrokenStreak} day streak</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5AC8FA" />
            </TouchableOpacity>
          )}

          {/* Customize Button */}
          <TouchableOpacity
            style={styles.customizeButton}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Ionicons name="sparkles" size={20} color="#8B5A2B" />
            <Text style={styles.customizeText}>Customize {hamsterName}</Text>
            <Ionicons name="chevron-forward" size={18} color="#8B5A2B" />
          </TouchableOpacity>

          {/* Longest Streak */}
          {stats?.longestStreak > 0 && (
            <Text style={styles.longestStreak}>
              Personal best: {stats.longestStreak} day streak
            </Text>
          )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  // ENCLOSURE SECTION (Fixed at top - height set dynamically)
  enclosureSection: {
    width: '100%',
  },
  enclosureBackground: {
    flex: 1,
    width: '100%',
  },
  enclosureSafeArea: {
    flex: 1,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  topBarLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  topBarRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF9500',
  },
  hamsterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 55, // Lowered 25% from center
  },
  nameBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  hamsterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3728',
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  stateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // CONTENT SECTION (Scrollable)
  contentSection: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  contentWrapper: {
    width: '100%',
  },
  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  // Completed Card
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,199,89,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  completedInfo: {
    marginLeft: 12,
  },
  completedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34C759',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  streakCard: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A3728',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B5D52',
    marginTop: 2,
    fontWeight: '500',
  },
  // Streak Warning
  streakWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  streakWarningText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
    flex: 1,
  },
  // Restore Card
  restoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(90,200,250,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  restoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restoreTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5AC8FA',
  },
  restoreSubtitle: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Customize Button
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  customizeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5A2B',
    marginLeft: 12,
  },
  // Longest Streak
  longestStreak: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
  },
});
