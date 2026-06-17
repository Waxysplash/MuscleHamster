// Home Screen - Fixed enclosure top, scrollable content below
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useSchedule } from '../../context/ScheduleContext';
import { HamsterStateInfo, StreakStatus, getSimplifiedState } from '../../models/Activity';
import LoadingView from '../../components/LoadingView';
import HamsterPortrait from '../../components/HamsterPortrait';
import { MiniWeekStrip } from '../../components/Schedule';
import { useInventory } from '../../context/InventoryContext';
import { EnclosureBackground, StatIcons } from '../../config/AssetImages';
import { getTodaysExercise } from '../../services/DailyExerciseService';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../../components/ErrorBanner';
import NotificationPermissionPrompt from '../../components/NotificationPermissionPrompt';
import Logger from '../../services/LoggerService';
import { useResponsive, getEnclosureHeight, getHamsterSize } from '../../utils/responsive';
import { shouldShowPermissionPrompt, enableNotifications } from '../../services/NotificationService';

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
    hasLoggedRestDayToday,
    loadStats,
  } = useActivity();

  const {
    equippedOutfit,
    equippedAccessory,
    loadInventory,
  } = useInventory();

  // Schedule context for weekly planner integration
  const {
    currentWeekStart,
    currentWeekSchedule,
    hasScheduleThisWeek,
    todaySchedule,
    loadCurrentWeek,
  } = useSchedule();

  // Check if today is a scheduled workout day
  const isTodayWorkoutDay = todaySchedule?.type === 'workout';

  // Responsive layout
  const { isTablet, spacing, contentMaxWidth } = useResponsive();
  const enclosureHeight = getEnclosureHeight();
  const hamsterSize = getHamsterSize();

  const [refreshing, setRefreshing] = useState(false);
  const [hasShownStreakFreeze, setHasShownStreakFreeze] = useState(false);
  const [error, setError] = useState(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Get today's exercise (cycles through the pool before repeating, persisted per user)
  const [todaysExercise, setTodaysExercise] = useState(null);
  const userIdForExercise = currentUser?.id || 'guest';
  useEffect(() => {
    let cancelled = false;
    getTodaysExercise(userIdForExercise).then((exercise) => {
      if (!cancelled) setTodaysExercise(exercise);
    });
    return () => { cancelled = true; };
  }, [userIdForExercise]);

  // Reload stats, inventory, and schedule when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          await Promise.all([loadStats(), loadInventory(), loadCurrentWeek()]);
          setError(null);
        } catch (e) {
          Logger.error('Failed to load home data:', e);
          setError('Could not refresh data');
        }
      };
      load();
    }, [loadStats, loadInventory, loadCurrentWeek])
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

  // Check if we should show notification permission prompt (after first workout)
  useEffect(() => {
    const checkNotificationPrompt = async () => {
      const totalWorkouts = stats?.totalWorkoutsCompleted || 0;
      const shouldShow = await shouldShowPermissionPrompt(totalWorkouts);
      if (shouldShow) {
        // Small delay to not overwhelm user right after completing workout
        setTimeout(() => setShowNotificationPrompt(true), 1500);
      }
    };

    if (stats && !isLoading) {
      checkNotificationPrompt();
    }
  }, [stats, isLoading]);

  // Handle notification prompt completion
  const handleNotificationPromptComplete = async (granted) => {
    if (granted) {
      await enableNotifications();
    }
    setShowNotificationPrompt(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([loadStats(), loadInventory(), loadCurrentWeek()]);
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

  // Memoize expensive date computation
  const hasCompletedWorkoutToday = useMemo(() => {
    const today = new Date().toDateString();
    return stats?.workoutHistory?.some(
      (w) => new Date(w.completedAt).toDateString() === today
    ) || false;
  }, [stats?.workoutHistory]);

  // Render the Today's Action card - Daily exercise check-in only
  const renderTodayActionCard = () => {
    // Already checked in today - show completed card
    if (hasCheckedInToday) {
      return (
        <View style={styles.completedCard}>
          <Ionicons name="checkmark-circle" size={32} color="#34C759" />
          <View style={styles.completedInfo}>
            <Text style={styles.completedTitle}>All done for today!</Text>
            <Text style={styles.completedSubtitle}>
              {hasCompletedWorkoutToday ? 'Workout completed' : 'Daily exercise done'}
            </Text>
          </View>
        </View>
      );
    }

    // Daily exercise check-in card
    return (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => {
          if (!todaysExercise) return;
          navigation.navigate('DailyExerciseCheckIn', { exercise: todaysExercise });
        }}
        activeOpacity={0.9}
      >
        <View style={styles.actionIconWrapper}>
          <Ionicons name="fitness" size={28} color="#fff" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionLabel}>TODAY'S ACTION</Text>
          <Text style={styles.actionTitle}>Feed {hamsterName}!</Text>
          <Text style={styles.actionSubtitle}>
            {isTodayWorkoutDay ? "It's a workout day — let's go!" : 'Complete your daily exercise'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

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
                  <Image
                    source={StatIcons.points}
                    style={{ width: isTablet ? 20 : 18, height: isTablet ? 20 : 18 }}
                    resizeMode="contain"
                  />
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
                isRestDay={hasLoggedRestDayToday}
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
          {/* Today's Action Card - Schedule-aware */}
          {renderTodayActionCard()}

          {/* Mini Week Strip - Always visible */}
          <MiniWeekStrip
            weekStart={currentWeekStart}
            schedule={currentWeekSchedule}
            isEmpty={!hasScheduleThisWeek}
            onPress={() => navigation.navigate('Workouts', { screen: 'WorkoutsMain' })}
          />

          {/* YOUR PROGRESS Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR PROGRESS</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {/* Streak Card */}
              <View style={[
                styles.statCard,
                currentStreak > 0 && { borderLeftWidth: 3, borderLeftColor: streakInfo.color },
              ]}>
                <Image source={StatIcons.streak} style={styles.statIcon} resizeMode="contain" />
                <Text style={[styles.statNumber, { color: streakInfo.color }]}>{currentStreak}</Text>
                <Text style={styles.statLabel}>day streak</Text>
              </View>

              {/* Workouts Card */}
              <View style={styles.statCard}>
                <Image source={StatIcons.workout} style={styles.statIcon} resizeMode="contain" />
                <Text style={styles.statNumber}>{stats?.totalWorkoutsCompleted || 0}</Text>
                <Text style={styles.statLabel}>workouts</Text>
              </View>

              {/* Points Card */}
              <View style={styles.statCard}>
                <Image source={StatIcons.points} style={styles.statIcon} resizeMode="contain" />
                <Text style={styles.statNumber}>{totalPoints}</Text>
                <Text style={styles.statLabel}>points</Text>
              </View>
            </View>

            {/* Longest Streak - inside progress section */}
            {stats?.longestStreak > 0 && (
              <View style={styles.longestStreakRow}>
                <Image source={StatIcons.streak} style={{ width: 16, height: 16 }} resizeMode="contain" />
                <Text style={styles.longestStreak}>
                  Personal best: {stats.longestStreak} day streak
                </Text>
              </View>
            )}

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
          </View>

          {/* QUICK ACTIONS Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

            {/* Rest Day Card - separate from Shop/Customize, hidden after check-in */}
            {!hasCheckedInToday && !hasLoggedRestDayToday && (
              <TouchableOpacity
                style={styles.restDayActionCard}
                onPress={() => navigation.navigate('QuickRestDay')}
                activeOpacity={0.8}
              >
                <View style={styles.restDayActionIcon}>
                  <Ionicons name="bed" size={22} color="#8B5A2B" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.restDayActionTitle}>Take a Rest Day</Text>
                  <Text style={styles.restDayActionSubtitle}>Rest days count toward your streak</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
              </TouchableOpacity>
            )}

            {/* Shop & Customize Buttons */}
            <View style={styles.actionButtonsRow}>
              {/* Shop Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Shop')}
              >
                <View style={styles.shopIconBg}>
                  <Ionicons name="bag" size={18} color="#FF9500" />
                </View>
                <Text style={styles.actionButtonText}>Shop</Text>
              </TouchableOpacity>

              {/* Customize Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Inventory')}
              >
                <View style={styles.customizeIconBg}>
                  <Ionicons name="sparkles" size={18} color="#8B5A2B" />
                </View>
                <Text style={[styles.actionButtonText, { color: '#8B5A2B' }]}>Customize</Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </ScrollView>
      </View>

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt
        visible={showNotificationPrompt}
        onComplete={handleNotificationPromptComplete}
        onDismiss={() => setShowNotificationPrompt(false)}
      />

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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
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
    borderRadius: 20,
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
  // Scheduled Workout Card (brown theme)
  scheduledWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5A2B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
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
  scheduledWorkoutIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduledWorkoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  scheduledWorkoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  scheduledWorkoutSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Rest Day Card (warm cream/brown theme)
  restDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.2)',
  },
  restDayIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restDayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5A2B',
    letterSpacing: 1,
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
    marginTop: 2,
  },
  restDaySubtitle: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Pick Workout Card (orange accent with dashed border)
  pickWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF9500',
    borderStyle: 'dashed',
  },
  pickWorkoutIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickWorkoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
    letterSpacing: 1,
  },
  pickWorkoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3728',
    marginTop: 2,
  },
  pickWorkoutSubtitle: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Section grouping
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5D52',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.06)',
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
  statIcon: {
    width: 40,
    height: 40,
  },
  statNumber: {
    fontSize: 28,
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
  longestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  // Streak Warning
  streakWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
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
  // Rest Day Action Card
  restDayActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.12)',
  },
  restDayActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139,90,43,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restDayActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A3728',
  },
  restDayActionSubtitle: {
    fontSize: 12,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Shop & Customize Buttons Row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139,90,43,0.06)',
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
  shopIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,149,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(139,90,43,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
  },
  // Longest Streak
  longestStreak: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B5D52',
  },
});
