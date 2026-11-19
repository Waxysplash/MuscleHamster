/**
 * FriendProfileScreen.js
 * MuscleHamster Expo
 *
 * View a friend's profile with stats, streaks, and nudge functionality
 * Ported from Phase 09: Social Features (Swift version)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFriends } from '../../context/FriendContext';
import { useAlert } from '../../context/AlertContext';
import {
  getHamsterStateColor,
  getStreakStatusColor,
  getStreakStatusDisplayName,
  getStreakStatusIcon,
  FriendStreakStatus,
  NudgeMessages,
  HamsterState,
} from '../../models/Friend';
import { getHamsterImage } from '../../config/AssetImages';

// Map HamsterState to image state name (mirrors SocialScreen)
const mapHamsterStateToImageState = (state) => {
  switch (state) {
    case HamsterState.HUNGRY:
      return 'hungry';
    case HamsterState.CHILLIN:
    case HamsterState.RESTED:
    case 'rested':
      return 'rest';
    case HamsterState.HAPPY:
    case HamsterState.EXCITED:
    case HamsterState.PROUD:
    default:
      return 'happy';
  }
};

export default function FriendProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile, streak } = route.params;
  const {
    removeFriend,
    blockUser,
    sendNudge,
    getNudgeEligibility,
  } = useFriends();
  const { showAlert } = useAlert();

  const [isRemoving, setIsRemoving] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isNudging, setIsNudging] = useState(false);
  const [showNudgeSent, setShowNudgeSent] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [nudgeEligibility, setNudgeEligibility] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const stateColor = getHamsterStateColor(profile.hamsterState);

  useEffect(() => {
    checkNudgeEligibility();
  }, []);

  const checkNudgeEligibility = async () => {
    const result = await getNudgeEligibility(profile.id, true);
    setNudgeEligibility(result);
  };

  const handleRemoveFriend = () => {
    showAlert(
      'Remove Friend',
      `You'll no longer be able to see each other's progress or build friend streaks together.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Remove`,
          style: 'destructive',
          onPress: async () => {
            setIsRemoving(true);
            const result = await removeFriend(profile.id);
            setIsRemoving(false);
            if (result.success) {
              navigation.goBack();
            } else {
              showAlert('Oops', result.error || 'Could not remove friend');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = () => {
    showAlert(
      `Block ${profile.displayName}?`,
      "They won't be able to see your profile, send requests, or interact with you. You can unblock them later in Privacy settings.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setIsBlocking(true);
            const result = await blockUser(profile.id);
            setIsBlocking(false);
            if (result.success) {
              navigation.goBack();
            } else {
              showAlert('Oops', result.error || 'Could not block user');
            }
          },
        },
      ]
    );
  };

  const handleSendNudge = async () => {
    setIsNudging(true);
    const result = await sendNudge(profile.id, true);
    setIsNudging(false);

    if (result.success) {
      const confirmationIndex = Math.floor(Math.random() * NudgeMessages.confirmations.length);
      const message = NudgeMessages.confirmations[confirmationIndex].replace('[Name]', profile.displayName);
      setNudgeMessage(message);
      setShowNudgeSent(true);
      checkNudgeEligibility();
    } else {
      showAlert('Oops', result.error || 'Could not send nudge');
    }
  };

  const friendImageState = profile.isRestingToday
    ? 'rest'
    : mapHamsterStateToImageState(profile.hamsterState);
  const hamsterImage = getHamsterImage(friendImageState);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#8B5A2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.displayName}'s Hamster</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal-circle" size={24} color="#8B5A2B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Read-only banner */}
        <View style={styles.readOnlyBanner}>
          <Ionicons name="eye" size={14} color="#6B5D52" />
          <Text style={styles.readOnlyText}>You're viewing {profile.displayName}'s profile</Text>
        </View>

        {/* Hamster Header */}
        <View style={styles.hamsterHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: `${stateColor}33` }]}>
            <Image source={hamsterImage} style={styles.avatarImage} resizeMode="contain" />
          </View>

          <Text style={styles.displayName}>{profile.displayName}</Text>
          {profile.hamsterName && (
            <Text style={styles.hamsterName}>{profile.hamsterName}</Text>
          )}

          {/* Status badge */}
          <View style={styles.statusBadges}>
            <View style={[styles.statusBadge, { backgroundColor: `${stateColor}22` }]}>
              <Text style={[styles.statusBadgeText, { color: stateColor }]}>
                {profile.hamsterState}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              value={profile.currentStreak}
              label="Current Streak"
              icon="flame"
              color="#FF9500"
            />
            <StatCard
              value={profile.longestStreak}
              label="Best Streak"
              icon="trophy"
              color="#FFCC00"
            />
            <StatCard
              value={profile.totalWorkoutsCompleted}
              label="Workouts"
              icon="fitness"
              color="#2E7D32"
            />
          </View>
        </View>

        {/* Friend Streak Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Streak Together</Text>
          {streak && streak.currentStreak > 0 ? (
            <FriendStreakCard streak={streak} friendName={profile.displayName} />
          ) : (
            <View style={styles.noStreakCard}>
              <Ionicons name="sparkles" size={36} color="rgba(175, 82, 222, 0.6)" />
              <Text style={styles.noStreakTitle}>No streak yet!</Text>
              <Text style={styles.noStreakMessage}>
                Check in on the same day to start building a streak together.
              </Text>
            </View>
          )}
        </View>

        {/* Nudge Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Encouragement</Text>
          <NudgeCard
            eligibility={nudgeEligibility}
            friendName={profile.displayName}
            isNudging={isNudging}
            onNudge={handleSendNudge}
          />
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {(isRemoving || isBlocking) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#8B5A2B" />
            <Text style={styles.loadingText}>
              {isRemoving ? 'Removing friend...' : 'Blocking user...'}
            </Text>
          </View>
        </View>
      )}

      {/* Nudge sent modal */}
      <Modal visible={showNudgeSent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.nudgeSentModal}>
            <View style={styles.nudgeSentIcon}>
              <Ionicons name="hand-left" size={36} color="#2E7D32" />
            </View>
            <Text style={styles.nudgeSentTitle}>Encouragement Sent!</Text>
            <Text style={styles.nudgeSentMessage}>{nudgeMessage}</Text>
            <TouchableOpacity
              style={styles.nudgeSentButton}
              onPress={() => setShowNudgeSent(false)}
            >
              <Text style={styles.nudgeSentButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Actions menu modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleRemoveFriend();
              }}
            >
              <Ionicons name="person-remove" size={20} color="#C0392B" />
              <Text style={[styles.menuItemText, { color: '#C0392B' }]}>Remove Friend</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleBlockUser();
              }}
            >
              <Ionicons name="ban" size={20} color="#C0392B" />
              <Text style={[styles.menuItemText, { color: '#C0392B' }]}>Block User</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuItemText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function StatCard({ value, label, icon, color }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FriendStreakCard({ streak, friendName }) {
  const statusColor = getStreakStatusColor(streak.status);
  const statusIcon = getStreakStatusIcon(streak.status);
  const statusName = getStreakStatusDisplayName(streak.status);

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <View style={styles.streakCount}>
          <Ionicons name={statusIcon} size={24} color={statusColor} />
          <Text style={[styles.streakNumber, { color: statusColor }]}>{streak.currentStreak}</Text>
          <Text style={styles.streakDays}>{streak.currentStreak === 1 ? 'day' : 'days'}</Text>
        </View>
        <View style={[styles.streakStatusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.streakStatusText, { color: statusColor }]}>{statusName}</Text>
        </View>
      </View>

      {streak.longestStreak > 0 && (
        <View style={styles.bestTogether}>
          <Text style={styles.bestTogetherLabel}>Best Together</Text>
          <Text style={styles.bestTogetherValue}>{streak.longestStreak} days</Text>
        </View>
      )}

      <Text style={styles.streakMessage}>
        {streak.status === FriendStreakStatus.ACTIVE
          ? streak.currentStreak >= 7
            ? 'You two are unstoppable!'
            : 'You both crushed it today!'
          : streak.status === FriendStreakStatus.WAITING
          ? `Waiting for ${friendName} to check in...`
          : streak.status === FriendStreakStatus.AT_RISK
          ? 'Check in today to save your streak!'
          : 'Ready to start a new streak together?'}
      </Text>
    </View>
  );
}

function NudgeCard({ eligibility, friendName, isNudging, onNudge }) {
  const canNudge = eligibility?.eligibility === 'canNudge';

  const getIcon = () => {
    if (!eligibility) return 'hand-left';
    switch (eligibility.eligibility) {
      case 'canNudge': return 'hand-left';
      case 'recipientAlreadyCheckedIn': return 'checkmark-circle';
      case 'senderNotCheckedIn': return 'arrow-up-circle';
      case 'cooldownActive': return 'time';
      case 'dailyLimitReached': return 'heart';
      default: return 'close-circle';
    }
  };

  const getColor = () => {
    if (!eligibility) return '#8B5A2B';
    switch (eligibility.eligibility) {
      case 'canNudge': return '#8B5A2B';
      case 'recipientAlreadyCheckedIn': return '#2E7D32';
      case 'senderNotCheckedIn': return '#FF9500';
      case 'cooldownActive': return '#6B5D52';
      case 'dailyLimitReached': return '#C0392B';
      default: return '#6B5D52';
    }
  };

  const getMessage = () => {
    if (!eligibility) return 'Loading...';
    switch (eligibility.eligibility) {
      case 'canNudge': return `${friendName} hasn't checked in yet`;
      case 'recipientAlreadyCheckedIn': return `${friendName} already checked in!`;
      case 'senderNotCheckedIn': return 'Check in first to nudge';
      case 'cooldownActive': return 'Recently nudged';
      case 'dailyLimitReached': return "You're an encouraging friend!";
      default: return 'Nudge unavailable';
    }
  };

  return (
    <View style={styles.nudgeCard}>
      <View style={styles.nudgeContent}>
        <View style={[styles.nudgeIcon, { backgroundColor: `${getColor()}22` }]}>
          <Ionicons name={getIcon()} size={24} color={getColor()} />
        </View>
        <View style={styles.nudgeInfo}>
          <Text style={styles.nudgeTitle}>{getMessage()}</Text>
          <Text style={styles.nudgeSubtitle}>Send encouragement</Text>
        </View>
        {canNudge && (
          <TouchableOpacity
            style={styles.nudgeButton}
            onPress={onNudge}
            disabled={isNudging}
          >
            {isNudging ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="hand-left" size={16} color="#fff" />
                <Text style={styles.nudgeButtonText}>Nudge</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {eligibility?.eligibility === 'senderNotCheckedIn' && (
        <View style={styles.nudgeHint}>
          <Ionicons name="information-circle" size={14} color="#FF9500" />
          <Text style={styles.nudgeHintText}>
            Complete your check-in first to encourage friends!
          </Text>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF4E6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 17,
    color: '#4A3728',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#E5DDD5',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
  },
  readOnlyText: {
    fontFamily: 'Nunito_400Regular', fontSize: 12,
    color: '#6B5D52',
  },
  hamsterHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  displayName: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    marginBottom: 4,
    color: '#4A3728',
  },
  hamsterName: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 13,
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    marginBottom: 12,
    color: '#4A3728',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontFamily: 'Quicksand_700Bold', fontSize: 24,
    color: '#4A3728',
  },
  statLabel: {
    fontFamily: 'Nunito_400Regular', fontSize: 11,
    color: '#6B5D52',
    marginTop: 4,
    textAlign: 'center',
  },
  noStreakCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  noStreakTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18,
    marginTop: 12,
    marginBottom: 8,
    color: '#4A3728',
  },
  noStreakMessage: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakNumber: {
    fontFamily: 'Quicksand_700Bold', fontSize: 36,
  },
  streakDays: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
  },
  streakStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakStatusText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 12,
  },
  bestTogether: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bestTogetherLabel: {
    fontFamily: 'Nunito_400Regular', fontSize: 13,
    color: '#6B5D52',
  },
  bestTogetherValue: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 13,
    color: '#4A3728',
  },
  streakMessage: {
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
    textAlign: 'center',
  },
  nudgeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  nudgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nudgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nudgeTitle: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
    color: '#4A3728',
  },
  nudgeSubtitle: {
    fontFamily: 'Nunito_400Regular', fontSize: 12,
    color: '#6B5D52',
    marginTop: 2,
  },
  nudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5A2B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nudgeButtonText: {
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold', fontSize: 14,
  },
  nudgeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 8,
  },
  nudgeHintText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular', fontSize: 12,
    color: '#A65000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Nunito_400Regular', fontSize: 14,
    color: '#6B5D52',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeSentModal: {
    backgroundColor: '#fff',
    margin: 40,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  nudgeSentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nudgeSentTitle: {
    fontFamily: 'Quicksand_700Bold', fontSize: 22,
    marginBottom: 8,
    color: '#4A3728',
  },
  nudgeSentMessage: {
    fontFamily: 'Nunito_400Regular', fontSize: 16,
    color: '#6B5D52',
    textAlign: 'center',
    marginBottom: 24,
  },
  nudgeSentButton: {
    backgroundColor: '#8B5A2B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nudgeSentButtonText: {
    color: '#fff',
    fontFamily: 'Nunito_600SemiBold', fontSize: 16,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  menuItemText: {
    fontFamily: 'Nunito_400Regular', fontSize: 17,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5DDD5',
    marginHorizontal: 20,
  },
});
