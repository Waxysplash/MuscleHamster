// Points history - Storybook redesign (proposal on the design canvas, Nov 2026)
// "You have" and "This week" cards, then every earn/spend grouped by day.
// Reads transactions straight from live stats (the old screen read stale state
// and could show an empty list right after earning points).
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { StatIcons, HamsterImages } from '../../config/AssetImages';
import ErrorView from '../../components/ErrorView';
import { StoryCard, StoryIcon } from '../../components/ui/Story';
import { TransactionType, TransactionCategory, TransactionCategoryInfo } from '../../models/Activity';
import { Colors, Fonts, Outline, T } from '../../config/theme';

const CATEGORY_LOOK = {
  [TransactionCategory.WORKOUT]: { icon: 'barbell', art: 'tab_workouts', color: Colors.peach },
  [TransactionCategory.STEPS]: { icon: 'walk', art: 'steps', color: Colors.sky },
  [TransactionCategory.REST_DAY]: { icon: 'cafe', art: 'rest_day', color: Colors.sand },
  [TransactionCategory.STREAK_FREEZE]: { icon: 'snow', art: 'streak_freeze', color: Colors.sky },
  [TransactionCategory.SHOP_PURCHASE]: { icon: 'bag-handle', art: 'shop', color: Colors.peach },
  [TransactionCategory.AD_REWARD]: { icon: 'gift', art: 'weekly_goal_reached', color: Colors.mint },
};

const formatNumber = (num) => String(num || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const dayLabel = (dayStart) => {
  const today = startOfDay(new Date());
  const diffDays = Math.round((today - dayStart) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return dayStart.toLocaleDateString('en-US', { weekday: 'long' });
  return dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Monday-start week, matching the weekly goal
const startOfWeek = () => {
  const d = startOfDay(new Date());
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
};

export default function PointsHistoryScreen() {
  const { currentUser } = useAuth();
  const { stats, totalPoints, loadStats } = useActivity();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      await loadStats(true);
    } catch (e) {
      setError('Could not load your points history. Please try again.');
    }
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser) reload();
    }, [currentUser, reload])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const transactions = useMemo(
    () =>
      [...(stats?.transactions || [])]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 150),
    [stats?.transactions]
  );

  const earnedThisWeek = useMemo(() => {
    const weekStart = startOfWeek();
    return transactions
      .filter((t) => t.type === TransactionType.EARN && new Date(t.timestamp) >= weekStart)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const sections = useMemo(() => {
    const groups = [];
    let current = null;
    transactions.forEach((t) => {
      const key = startOfDay(t.timestamp).getTime();
      if (!current || current.key !== key) {
        current = { key, title: dayLabel(new Date(key)), data: [] };
        groups.push(current);
      }
      current.data.push(t);
    });
    return groups;
  }, [transactions]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <ErrorView message="Please sign in to see your points history." />
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorView message={error} onRetry={reload} />
      </View>
    );
  }

  const header = (
    <View style={styles.cardsRow}>
      <StoryCard color={Colors.peach} containerStyle={{ flex: 1 }}>
        <Text style={styles.cardLabel}>You have</Text>
        <View style={styles.balanceRow} accessibilityLabel={`You have ${totalPoints} points`}>
          <Image source={StatIcons.points} style={{ width: 26, height: 26 }} resizeMode="contain" />
          <Text style={styles.cardValue}>{formatNumber(totalPoints)}</Text>
        </View>
      </StoryCard>
      <StoryCard color={Colors.mint} containerStyle={{ flex: 1 }}>
        <Text style={styles.cardLabel}>This week</Text>
        <Text style={styles.cardValue} accessibilityLabel={`${earnedThisWeek} points earned this week`}>
          +{formatNumber(earnedThisWeek)}
        </Text>
      </StoryCard>
    </View>
  );

  const renderItem = ({ item, index, section }) => {
    const isEarn = item.type === TransactionType.EARN;
    const look = CATEGORY_LOOK[item.category] || { icon: 'star', color: Colors.sand };
    const categoryName = TransactionCategoryInfo[item.category]?.displayName || 'Other';
    const first = index === 0;
    const last = index === section.data.length - 1;
    return (
      <View
        style={[styles.row, first && styles.rowFirst, last && styles.rowLast]}
        accessible
        accessibilityLabel={`${item.description}. ${categoryName}. ${isEarn ? 'Earned' : 'Spent'} ${item.amount} points`}
      >
        <StoryIcon name={look.icon} art={look.art} size={40} color={look.color} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.rowSub}>{categoryName}</Text>
        </View>
        <Text style={[styles.amount, isEarn && { color: Colors.success }]}>
          {isEarn ? '+' : '−'}{item.amount}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => <Text style={styles.day}>{section.title}</Text>}
        renderSectionFooter={() => <View style={{ height: 14 }} />}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <StoryCard color={Colors.surface}>
            <View style={styles.emptyRow}>
              <Image source={HamsterImages.happy} style={{ width: 56, height: 56 }} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text style={T.heading}>No points yet</Text>
                <Text style={T.small}>Do a workout, a walk or today's exercise to earn your first points.</Text>
              </View>
            </View>
          </StoryCard>
        }
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.ink} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 40 },
  cardsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  cardLabel: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.brown },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  cardValue: { fontFamily: Fonts.heading, fontSize: 28, color: Colors.ink, marginTop: 2 },
  day: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.brown, marginBottom: 8, marginLeft: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderLeftWidth: Outline.width,
    borderRightWidth: Outline.width,
    borderBottomWidth: Outline.width,
    borderColor: Colors.ink,
  },
  rowFirst: { borderTopWidth: Outline.width, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  rowLast: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  rowTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  rowSub: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary },
  amount: { fontFamily: Fonts.bodyHeavy, fontSize: 16, color: Colors.ink },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
