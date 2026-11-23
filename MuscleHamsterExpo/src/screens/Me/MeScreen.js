// Me tab - your progress and your settings in one place.
// Phase 2 redesign: stats moved off Home; Settings is no longer its own tab.
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { StatIcons } from '../../config/AssetImages';
import { StoryCard, StoryIcon } from '../../components/ui/Story';
import { Colors, Fonts, Outline, T } from '../../config/theme';

const Row = ({ icon, art, title, subtitle, onPress, last = false }) => (
  <TouchableOpacity
    style={[styles.row, last && { borderBottomWidth: 0 }]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
  >
    <StoryIcon name={icon} art={art} size={40} color={Colors.peach} />
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={22} color={Colors.ink} />
  </TouchableOpacity>
);

const Stat = ({ icon, value, label }) => (
  <StoryCard containerStyle={{ flex: 1 }} style={{ alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6 }}>
    <View accessible accessibilityLabel={`${value} ${label}`} style={{ alignItems: 'center' }}>
      <Image source={icon} style={styles.statIcon} resizeMode="contain" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </StoryCard>
);

export default function MeScreen({ navigation }) {
  const { stats, currentStreak, totalPoints, weeklyProgress } = useActivity();
  const { profile } = useUserProfile();
  const hamsterName = profile?.hamsterName || 'your hamster';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Your progress</Text>

      <View style={styles.statsRow}>
        <Stat icon={StatIcons.streak} value={currentStreak || 0} label="day streak" />
        <Stat icon={StatIcons.workout} value={stats?.totalWorkoutsCompleted || 0} label="workouts" />
        <Stat icon={StatIcons.points} value={totalPoints || 0} label="points" />
      </View>

      {weeklyProgress && (
        <StoryCard color={Colors.sand} containerStyle={{ marginBottom: 16 }}>
          <Text style={T.label}>This week</Text>
          <View style={styles.weeklyDots}>
            {Array.from({ length: weeklyProgress.target }).map((_, i) => (
              <View key={i} style={[styles.dot, i < weeklyProgress.daysDone && styles.dotDone]} />
            ))}
          </View>
          <Text style={styles.cardText}>
            {weeklyProgress.reached
              ? `Weekly goal reached! ${hamsterName} is proud of you.`
              : `${weeklyProgress.daysDone} of ${weeklyProgress.target} active days`}
          </Text>
          {stats?.longestStreak > 0 && (
            <Text style={styles.cardSubtle}>Personal best: {stats.longestStreak} day streak</Text>
          )}
        </StoryCard>
      )}

      <Text style={styles.heading}>You</Text>
      <StoryCard padded={false} style={{ overflow: 'hidden' }}>
        <Row
          icon="person-circle"
          art="me_profile"
          title="Profile & goals"
          subtitle="Fitness level, goals, workout days"
          onPress={() => navigation.navigate('ProfileSettings')}
        />
        <Row
          icon="receipt"
          art="me_points_history"
          title="Points history"
          onPress={() => navigation.navigate('PointsHistory')}
        />
        <Row
          icon="notifications"
          art="me_reminders"
          title="Reminders"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <Row
          icon="settings"
          art="me_settings"
          title="All settings"
          subtitle="Account, sound, privacy"
          last
          onPress={() => navigation.navigate('SettingsMain')}
        />
      </StoryCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 32 },
  heading: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.ink, marginTop: 8, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statIcon: { width: 28, height: 28 },
  statValue: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.ink, marginTop: 4 },
  statLabel: { fontFamily: Fonts.bodySemi, fontSize: 14, color: Colors.textSecondary },
  cardText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink, marginTop: 8 },
  cardSubtle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  weeklyDots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: Outline.width, borderColor: Colors.ink, backgroundColor: Colors.surface },
  dotDone: { backgroundColor: Colors.brand },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
    borderBottomWidth: Outline.width,
    borderBottomColor: Colors.ink,
  },
  rowTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  rowSubtitle: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
});
