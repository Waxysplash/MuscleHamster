/**
 * PointsHistoryScreen.js
 * MuscleHamster Expo
 *
 * Transaction history screen showing points earned and spent
 * Ported from Phase 07.1: Points Wallet
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import ErrorView from '../../components/ErrorView';
import {
  TransactionType,
  TransactionCategory,
  TransactionCategoryInfo,
} from '../../models/Activity';

// View states
const ViewState = {
  LOADING: 'loading',
  ERROR: 'error',
  CONTENT: 'content',
  EMPTY: 'empty',
};

export default function PointsHistoryScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { stats, totalPoints, loadStats } = useActivity();
  const [viewState, setViewState] = useState(ViewState.LOADING);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setViewState(ViewState.LOADING);
    setError(null);

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!currentUser) {
      setError('Please sign in to view your points history.');
      setViewState(ViewState.ERROR);
      return;
    }

    try {
      await loadStats();
      const txns = stats?.transactions || [];
      setTransactions(txns.slice(0, 100)); // Limit to 100 recent transactions

      if (txns.length === 0) {
        setViewState(ViewState.EMPTY);
      } else {
        setViewState(ViewState.CONTENT);
      }
    } catch (e) {
      console.warn('Failed to load points history:', e);
      setError('Failed to load your points history. Please try again.');
      setViewState(ViewState.ERROR);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Get points earned today from transactions
  const getPointsEarnedToday = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(t => t.type === TransactionType.EARN && new Date(t.timestamp).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get points spent today from transactions
  const getPointsSpentToday = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(t => t.type === TransactionType.SPEND && new Date(t.timestamp).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Format short date
  const formatShortDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case TransactionCategory.WORKOUT:
        return '#007AFF';
      case TransactionCategory.REST_DAY:
        return '#34C759';
      case TransactionCategory.STREAK_FREEZE:
        return '#AF52DE';
      case TransactionCategory.SHOP_PURCHASE:
        return '#FF2D55';
      case TransactionCategory.AD_REWARD:
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case TransactionCategory.WORKOUT:
        return 'fitness';
      case TransactionCategory.REST_DAY:
        return 'cafe';
      case TransactionCategory.STREAK_FREEZE:
        return 'snow';
      case TransactionCategory.SHOP_PURCHASE:
        return 'bag';
      case TransactionCategory.AD_REWARD:
        return 'gift';
      default:
        return 'help-circle';
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const info = TransactionCategoryInfo[category];
    return info?.displayName || 'Other';
  };

  // Render balance header
  const renderBalanceHeader = () => {
    const earnedToday = getPointsEarnedToday();
    const spentToday = getPointsSpentToday();

    return (
      <View style={styles.balanceSection}>
        <View style={styles.balanceContainer}>
          <Ionicons name="star" size={32} color="#FF9500" />
          <Text style={styles.balanceAmount}>{formatNumber(totalPoints)}</Text>
        </View>
        <Text style={styles.balanceLabel}>Total Points</Text>

        {/* Today's Activity Summary */}
        <View style={styles.todaySummary}>
          {earnedToday > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEarned}>+{earnedToday}</Text>
              <Text style={styles.summaryLabel}>earned today</Text>
            </View>
          )}
          {spentToday > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summarySpent}>-{spentToday}</Text>
              <Text style={styles.summaryLabel}>spent today</Text>
            </View>
          )}
          {earnedToday === 0 && spentToday === 0 && (
            <Text style={styles.noActivityText}>No activity today</Text>
          )}
        </View>
      </View>
    );
  };

  // Render transaction row
  const renderTransactionRow = ({ item: transaction }) => {
    const color = getCategoryColor(transaction.category);
    const icon = getCategoryIcon(transaction.category);
    const isEarn = transaction.type === TransactionType.EARN;

    return (
      <View style={styles.transactionRow}>
        <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionCategory}>
              {getCategoryDisplayName(transaction.category)}
            </Text>
            <Text style={styles.transactionDot}> • </Text>
            <Text style={styles.transactionDate}>
              {formatShortDate(transaction.timestamp)}
            </Text>
          </View>
        </View>

        <Text style={[styles.transactionAmount, isEarn ? styles.earnAmount : styles.spendAmount]}>
          {isEarn ? '+' : '-'}{transaction.amount}
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="sparkles" size={48} color="#8E8E93" />
      <Text style={styles.emptyTitle}>Your points journey starts here!</Text>
      <Text style={styles.emptyMessage}>
        Complete a workout to earn your first points.
      </Text>
    </View>
  );

  // Loading state
  if (viewState === ViewState.LOADING) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your points history...</Text>
      </View>
    );
  }

  // Error state
  if (viewState === ViewState.ERROR) {
    return (
      <View style={styles.container}>
        <ErrorView message={error} onRetry={loadData} />
      </View>
    );
  }

  // Content or empty state
  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionRow}
        ListHeaderComponent={renderBalanceHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 16,
  },
  todaySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryEarned: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34C759',
  },
  summarySpent: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF9500',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  noActivityText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '500',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#8E8E93',
  },
  transactionDot: {
    fontSize: 13,
    color: '#8E8E93',
  },
  transactionDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '600',
  },
  earnAmount: {
    color: '#34C759',
  },
  spendAmount: {
    color: '#FF9500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 66,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
