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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { StoryCard, StoryButton, StoryIcon } from '../../components/ui/Story';
import { Colors, Fonts, Outline, T } from '../../config/theme';
import StepsCard from '../../components/StepsCard';
import SuggestedWorkoutCard from '../../components/SuggestedWorkoutCard';
import { scaleDailyExercise } from '../../models/DailyExercise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSuggestion } from '../../services/SuggestionService';
import { getTodayName } from '../../services/ScheduleService';
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
    weeklyProgress,
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
    scheduleWorkout,
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
  const fitnessLevel = profile?.fitnessLevel;
  useEffect(() => {
    let cancelled = false;
    getTodaysExercise(userIdForExercise).then((exercise) => {
      // Scale the amount to the user's level (beginners get half) and attach an easier version
      if (!cancelled) setTodaysExercise(scaleDailyExercise(exercise, fitnessLevel));
    });
    return () => { cancelled = true; };
  }, [userIdForExercise, fitnessLevel]);

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

  // Beginner review: the days picked in onboarding should mean something.
  // If this week's plan is empty, put a suggested guided workout on each picked day
  // from today onward. Runs once per week per user; never overwrites a plan.
  const pickedDays = profile?.workoutDays;
  useEffect(() => {
    if (!currentUser?.id || !currentWeekStart || hasScheduleThisWeek || !pickedDays?.length) return;
    const key = `@MuscleHamster:autoPlan:${currentUser.id}:${currentWeekStart}`;
    (async () => {
      try {
        if (await AsyncStorage.getItem(key)) return;
        await AsyncStorage.setItem(key, '1');
        const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const todayIdx = order.indexOf(getTodayName());
        const days = order.filter((d, i) => i >= todayIdx && pickedDays.includes(d));
        // Keep going even after the first save re-renders this screen (the key stops repeats)
        for (let i = 0; i < days.length; i++) {
          const s = getSuggestion({ profile, stats, shuffle: i });
          if (s) await scheduleWorkout(days[i], s.workout.id, 'guided', s.workout.name);
        }
      } catch (e) {
        Logger.warn('Auto-plan failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentWeekStart, hasScheduleThisWeek, pickedDays]);

  // Show streak freeze if needed
  useEffect(() => {
    // Beginner review: no automatic "streak ended" pop-up when someone comes back.
    // The gentle "Welcome back" card on Today offers it instead.
    if (previousBrokenStreak && previousBrokenStreak > 0 && !hasShownStreakFreeze) {
      setHasShownStreakFreeze(true);
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
    if (!streakStatus) return { icon: 'flame-outline', color: '#6B5D52', text: 'Start your streak!' };

    switch (streakStatus.status) {
      case StreakStatus.ACTIVE:
        return { icon: 'flame', color: '#C0392B', text: 'Streak secured!' };
      case StreakStatus.AT_RISK:
        return { icon: 'flame', color: '#A65000', text: 'Check in today to keep it!' };
      case StreakStatus.BROKEN:
        return { icon: 'refresh', color: '#6B5D52', text: 'Start a new streak!' };
      default:
        return { icon: 'flame-outline', color: '#6B5D52', text: 'Start your streak!' };
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
        <StoryCard color={Colors.mint} containerStyle={styles.cardGap}>
          <View style={styles.row}>
            <StoryIcon name="checkmark" color={Colors.successFill} />
            <View style={styles.rowText}>
              <Text style={T.heading}>{hamsterName} is fed for today!</Text>
              <Text style={T.small}>
                {hasCompletedWorkoutToday ? 'Workout done. Lovely work!' : 'Want a bonus? Try the workout below.'}
              </Text>
            </View>
          </View>
        </StoryCard>
      );
    }

    // Daily exercise card
    const amount = todaysExercise
      ? `${todaysExercise.repCount} ${todaysExercise.repType === 'seconds' ? 'seconds' : /breathing/i.test(todaysExercise.name) ? 'slow rounds' : 'times'}`
      : '';
    return (
      <StoryCard color={Colors.peach} containerStyle={styles.cardGap}>
        <Text style={T.label}>Today's exercise</Text>
        <Text style={[T.title, { marginTop: 2 }]}>{todaysExercise ? todaysExercise.name : 'Getting it ready...'}</Text>
        {todaysExercise ? <Text style={[T.body, { color: Colors.textSecondary }]}>{amount}</Text> : null}
        <StoryButton
          title={`Feed ${hamsterName}`}
          icon="nutrition"
          style={{ marginTop: 14 }}
          disabled={!todaysExercise}
          accessibilityHint="Opens today's exercise"
          onPress={() => {
            if (!todaysExercise) return;
            navigation.navigate('DailyExerciseCheckIn', { exercise: todaysExercise });
          }}
        />
      </StoryCard>
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
                <View style={styles.stateBadge}>
                  <Ionicons name={hamsterInfo.icon} size={isTablet ? 16 : 14} color={hamsterInfo.color} />
                  <Text style={[styles.stateText, isTablet && { fontSize: 14 }]}>
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.ink} />
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

          {/* Suggested guided workout - from level, goals and time (Phase 2) */}
          <SuggestedWorkoutCard
            profile={profile}
            stats={stats}
            onStart={(workout) => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
            onRest={() => navigation.navigate('QuickRestDay')}
            showRestOption={!hasCheckedInToday && !hasLoggedRestDayToday}
          />

          {/* Steps - iOS only; renders nothing where unsupported */}
          <StepsCard hamsterName={hamsterName} />

          {/* Mini Week Strip - tap to plan the week */}
          <MiniWeekStrip
            weekStart={currentWeekStart}
            schedule={currentWeekSchedule}
            isEmpty={!hasScheduleThisWeek}
            onPress={() => navigation.navigate('Workouts', { screen: 'WorkoutsMain', params: { view: 'plan' } })}
          />

          {/* THIS WEEK - weekly goal + streak (full stats live in the Me tab) */}
          {weeklyProgress && (
            <StoryCard color={Colors.sand} containerStyle={styles.cardGap}>
              <View
                accessible
                accessibilityLabel={`This week: ${Math.min(weeklyProgress.daysDone, weeklyProgress.target)} of ${weeklyProgress.target} active days${weeklyProgress.reached ? '. Weekly goal reached!' : ''}${currentStreak > 0 ? `. ${currentStreak} day streak.` : ''}`}
              >
                <Text style={T.label}>This week</Text>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <View style={styles.weeklyDots}>
                    {Array.from({ length: weeklyProgress.target }).map((_, i) => (
                      <View
                        key={i}
                        style={[styles.weeklyDot, i < weeklyProgress.daysDone && styles.weeklyDotDone]}
                      />
                    ))}
                  </View>
                  <Text style={[T.bodyBold, { flex: 1, marginLeft: 12 }]}>
                    {weeklyProgress.reached
                      ? `Goal reached! ${hamsterName} is proud of you`
                      : `${weeklyProgress.daysDone} of ${weeklyProgress.target} active days`}
                  </Text>
                </View>
                {currentStreak > 0 && (
                  <View style={[styles.row, { marginTop: 10 }]}>
                    <Image source={StatIcons.streak} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    <Text style={[T.small, { marginLeft: 6, color: Colors.text }]}>{currentStreak} day streak</Text>
                  </View>
                )}
                {streakStatus?.status === StreakStatus.AT_RISK && (
                  <Text style={[T.small, { marginTop: 6 }]}>{streakInfo.text}</Text>
                )}
              </View>
            </StoryCard>
          )}

          {/* Welcome back - gentle, never a pop-up */}
          {previousBrokenStreak && previousBrokenStreak > 0 && (
            <StoryCard color={Colors.surface} containerStyle={styles.cardGap}>
              <View style={styles.row}>
                <StoryIcon name="heart" />
                <View style={styles.rowText}>
                  <Text style={T.heading}>Welcome back! {hamsterName} missed you</Text>
                  <Text style={T.small}>Want to bring back your {previousBrokenStreak}-day streak?</Text>
                </View>
              </View>
              <StoryButton
                title="Have a look"
                variant="secondary"
                size="sm"
                style={{ marginTop: 12 }}
                onPress={() => navigation.navigate('StreakFreeze')}
              />
            </StoryCard>
          )}
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
    backgroundColor: Colors.background,
  },
  cardGap: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
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
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
  },
  pointsText: {
    fontFamily: 'Nunito_800ExtraBold', fontSize: 15,
    color: Colors.ink,
  },
  hamsterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 55, // Lowered 25% from center
  },
  nameBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
  },
  hamsterName: {
    fontFamily: Fonts.heading, fontSize: 17,
    color: '#4A3728',
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
  },
  stateText: {
    fontFamily: 'Nunito_700Bold', fontSize: 14,
    color: Colors.ink,
  },
  // CONTENT SECTION (Scrollable)
  contentSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    borderTopWidth: Outline.width,
    borderLeftWidth: Outline.width,
    borderRightWidth: Outline.width,
    borderColor: Colors.ink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingTop: 22,
    paddingBottom: 32,
  },
  contentWrapper: {
    width: '100%',
  },
  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B85A00' /* buttonOrange: readable with white text */,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#4A3728',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
    borderWidth: 2.5,
    borderColor: '#4A3728',
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
    fontFamily: 'Nunito_700Bold', fontSize: 14,
    color: '#FFFFFF',
  },
  actionTitle: {
    fontFamily: 'Nunito_700Bold', fontSize: 18,
    color: '#fff',
    marginTop: 2,
  },
  actionSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 15,
    color: '#FFFFFF',
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
    fontFamily: 'Nunito_600SemiBold', fontSize: 17,
    color: '#2E7D32',
  },
  completedSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
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
        shadowColor: '#4A3728',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
    borderWidth: 2.5,
    borderColor: '#4A3728',
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
    fontFamily: 'Nunito_700Bold', fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  scheduledWorkoutTitle: {
    fontFamily: 'Nunito_700Bold', fontSize: 18,
    color: '#fff',
    marginTop: 2,
  },
  scheduledWorkoutSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
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
    fontFamily: 'Nunito_700Bold', fontSize: 10,
    color: '#8B5A2B',
    letterSpacing: 1,
  },
  restDayTitle: {
    fontFamily: 'Nunito_700Bold', fontSize: 18,
    color: '#4A3728',
    marginTop: 2,
  },
  restDaySubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
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
    fontFamily: 'Nunito_700Bold', fontSize: 10,
    color: '#A65000',
    letterSpacing: 1,
  },
  pickWorkoutTitle: {
    fontFamily: 'Nunito_700Bold', fontSize: 18,
    color: '#4A3728',
    marginTop: 2,
  },
  pickWorkoutSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  // Section grouping
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 13,
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
        shadowColor: '#4A3728',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
  },
  statNumber: {
    fontFamily: 'Quicksand_700Bold', fontSize: 28,
    color: '#4A3728',
    marginTop: 6,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 11,
    color: '#6B5D52',
    marginTop: 2,
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  weeklyDots: {
    flexDirection: 'row',
    gap: 6,
  },
  weeklyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: Outline.width,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  weeklyDotDone: {
    backgroundColor: Colors.brand,
  },
  weeklyText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
    color: '#4A3728',
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
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
    color: '#A65000',
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
    fontFamily: 'Nunito_600SemiBold', fontSize: 15,
    color: '#1A7F91',
  },
  restoreSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
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
    fontFamily: 'Nunito_600SemiBold', fontSize: 15,
    color: '#4A3728',
  },
  restDayActionSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 12,
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
        shadowColor: '#4A3728',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
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
    fontFamily: 'Nunito_600SemiBold', fontSize: 15,
    color: '#A65000',
  },
  // Longest Streak
  longestStreak: {
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
  },
});
