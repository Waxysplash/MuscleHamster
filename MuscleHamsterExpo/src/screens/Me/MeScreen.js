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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../context/ActivityContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { StatIcons } from '../../config/AssetImages';

const Row = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
  >
    <View style={styles.rowIcon}>
      <Ionicons name={icon} size={20} color="#8B5A2B" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#8B5A2B" />
  </TouchableOpacity>
);

const Stat = ({ icon, value, label }) => (
  <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
    <Image source={icon} style={styles.statIcon} resizeMode="contain" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This week</Text>
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
        </View>
      )}

      <Text style={styles.heading}>You</Text>
      <View style={styles.group}>
        <Row
          icon="person-circle"
          title="Profile & goals"
          subtitle="Fitness level, goals, workout days"
          onPress={() => navigation.navigate('ProfileSettings')}
        />
        <Row
          icon="receipt"
          title="Points history"
          onPress={() => navigation.navigate('PointsHistory')}
        />
        <Row
          icon="notifications"
          title="Reminders"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <Row
          icon="settings"
          title="All settings"
          subtitle="Account, sound, privacy"
          onPress={() => navigation.navigate('SettingsMain')}
        />
      </View>
    </ScrollView>
  );
}

const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 20, fontWeight: '700', color: '#4A3728', marginTop: 8, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    ...shadow,
  },
  statIcon: { width: 26, height: 26 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#4A3728', marginTop: 4 },
  statLabel: { fontSize: 13, color: '#6B5D52' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, ...shadow },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#4A3728' },
  cardText: { fontSize: 15, color: '#4A3728', marginTop: 8 },
  cardSubtle: { fontSize: 14, color: '#6B5D52', marginTop: 4 },
  weeklyDots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#34C759' },
  dotDone: { backgroundColor: '#34C759' },
  group: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...shadow },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(139,90,43,0.15)',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139,90,43,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#4A3728' },
  rowSubtitle: { fontSize: 13, color: '#6B5D52', marginTop: 2 },
});
