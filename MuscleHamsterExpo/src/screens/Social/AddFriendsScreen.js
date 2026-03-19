/**
 * AddFriendsScreen.js
 * MuscleHamster Expo
 *
 * Screen for adding friends via invite codes
 * Users can share their code or enter a friend's code
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  ScrollView,
  Keyboard,
  Platform,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFriends } from '../../context/FriendContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAlert } from '../../context/AlertContext';
import Logger from '../../services/LoggerService';
import { getHamsterStateColor } from '../../models/Friend';

export default function AddFriendsScreen() {
  const navigation = useNavigation();
  const { getInviteCode, useInviteCode, lookupInviteCode, pendingRequestCount } = useFriends();
  const { userProfile } = useUserProfile();
  const { showAlert } = useAlert();

  const [myInviteCode, setMyInviteCode] = useState(null);
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [inputCode, setInputCode] = useState(''); // Just the 6-char part (no MH- prefix)
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadMyInviteCode();
  }, []);

  const loadMyInviteCode = async () => {
    setIsLoadingCode(true);
    const code = await getInviteCode(userProfile?.hamsterName);
    setMyInviteCode(code);
    setIsLoadingCode(false);
  };

  const handleCopyCode = async () => {
    if (!myInviteCode) return;

    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(myInviteCode);
      } else {
        Clipboard.setString(myInviteCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Logger.error('Copy error:', error);
    }
  };

  const handleShareCode = async () => {
    if (!myInviteCode) return;

    try {
      const hamsterName = userProfile?.hamsterName || 'My hamster';
      await Share.share({
        message: `Join me on Muscle Hamster! Use my invite code: ${myInviteCode}\n\n${hamsterName} wants to work out with you! Download the app and add me as a friend.`,
        title: 'Invite to Muscle Hamster',
      });
    } catch (error) {
      Logger.error('Share error:', error);
    }
  };

  const handleInputChange = (text) => {
    // Only allow alphanumeric, uppercase, max 6 chars (the part after MH-)
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setInputCode(cleaned);
    setLookupResult(null);
  };

  // Build full code with MH- prefix for lookups
  const getFullCode = () => `MH-${inputCode}`;

  const handleLookupCode = async () => {
    if (inputCode.length < 6) {
      showAlert('Invalid Code', 'Please enter all 6 characters of the invite code');
      return;
    }

    Keyboard.dismiss();
    setIsLookingUp(true);
    setLookupResult(null);

    const fullCode = getFullCode();
    const result = await lookupInviteCode(fullCode);
    setIsLookingUp(false);

    if (!result) {
      showAlert('Not Found', "We couldn't find anyone with that invite code. Please check and try again.");
      return;
    }

    setLookupResult(result);
  };

  const handleSendRequest = async () => {
    if (!lookupResult) return;

    setIsSendingRequest(true);
    const fullCode = getFullCode();
    const result = await useInviteCode(fullCode);
    setIsSendingRequest(false);

    if (result.success) {
      showAlert(
        'Request Sent!',
        `Your friend request has been sent to ${lookupResult.ownerHamsterName}. They'll see it soon!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      showAlert('Oops', result.error || 'Could not send friend request');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5A2B" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Pending Requests Link */}
        {pendingRequestCount > 0 && (
          <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() => navigation.navigate('PendingRequests')}
          >
            <View style={styles.pendingIcon}>
              <Ionicons name="mail" size={20} color="#FF9500" />
            </View>
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>Friend Requests</Text>
              <Text style={styles.pendingSubtitle}>{pendingRequestCount} waiting for you</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        {/* My Invite Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Invite Code</Text>
          <Text style={styles.sectionSubtitle}>
            Share this code with friends so they can add you
          </Text>

          <View style={styles.inviteCodeCard}>
            {isLoadingCode ? (
              <ActivityIndicator size="large" color="#8B5A2B" />
            ) : myInviteCode ? (
              <>
                <View style={styles.codeContainer}>
                  <Text style={styles.inviteCodeText}>{myInviteCode}</Text>
                </View>

                <View style={styles.codeActions}>
                  <TouchableOpacity
                    style={[styles.codeButton, copied && styles.codeButtonCopied]}
                    onPress={handleCopyCode}
                  >
                    <Ionicons
                      name={copied ? "checkmark" : "copy-outline"}
                      size={20}
                      color={copied ? "#34C759" : "#8B5A2B"}
                    />
                    <Text style={[styles.codeButtonText, copied && styles.codeButtonTextCopied]}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
                    <Ionicons name="share-outline" size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.errorText}>Could not load invite code</Text>
            )}
          </View>
        </View>

        {/* Enter Friend's Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a Friend</Text>
          <Text style={styles.sectionSubtitle}>
            Enter your friend's invite code to send them a request
          </Text>

          <View style={styles.inputCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.codePrefix}>MH-</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="XXXXXX"
                placeholderTextColor="#C7C7CC"
                value={inputCode}
                onChangeText={handleInputChange}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                returnKeyType="search"
                onSubmitEditing={handleLookupCode}
              />
              {inputCode.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setInputCode('');
                    setLookupResult(null);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#C7C7CC" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.lookupButton,
                inputCode.length < 6 && styles.lookupButtonDisabled
              ]}
              onPress={handleLookupCode}
              disabled={inputCode.length < 6 || isLookingUp}
            >
              {isLookingUp ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.lookupButtonText}>Look Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Lookup Result */}
          {lookupResult && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={[
                  styles.resultAvatar,
                  { backgroundColor: `${getHamsterStateColor(lookupResult.ownerProfile?.hamsterState)}33` }
                ]}>
                  <Ionicons
                    name="paw"
                    size={28}
                    color={getHamsterStateColor(lookupResult.ownerProfile?.hamsterState)}
                  />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{lookupResult.ownerHamsterName}</Text>
                  <Text style={styles.resultSubtitle}>
                    {lookupResult.ownerProfile?.currentStreak > 0
                      ? `${lookupResult.ownerProfile.currentStreak} day streak`
                      : 'Ready to start working out!'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={handleSendRequest}
                disabled={isSendingRequest}
              >
                {isSendingRequest ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.addFriendButtonText}>Send Friend Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.howItWorksCard}>
            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Ionicons name="share-social" size={20} color="#8B5A2B" />
              </View>
              <View style={styles.howItWorksContent}>
                <Text style={styles.howItWorksTitle}>Share Your Code</Text>
                <Text style={styles.howItWorksText}>
                  Send your invite code to friends via text, social media, or in person
                </Text>
              </View>
            </View>

            <View style={styles.howItWorksDivider} />

            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Ionicons name="enter-outline" size={20} color="#34C759" />
              </View>
              <View style={styles.howItWorksContent}>
                <Text style={styles.howItWorksTitle}>Enter Their Code</Text>
                <Text style={styles.howItWorksText}>
                  Got a friend's code? Enter it above to send them a request
                </Text>
              </View>
            </View>

            <View style={styles.howItWorksDivider} />

            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Ionicons name="flame" size={20} color="#FF9500" />
              </View>
              <View style={styles.howItWorksContent}>
                <Text style={styles.howItWorksTitle}>Build Streaks Together</Text>
                <Text style={styles.howItWorksText}>
                  Once connected, work out together and build friend streaks!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A3728',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A3728',
  },
  pendingSubtitle: {
    fontSize: 13,
    color: '#6B5D52',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#4A3728',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginBottom: 16,
  },
  inviteCodeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  inviteCodeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9500',
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5A2B',
  },
  codeButtonCopied: {
    borderColor: '#34C759',
  },
  codeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5A2B',
  },
  codeButtonTextCopied: {
    color: '#34C759',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 90, 43, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  codePrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5A2B',
    letterSpacing: 1,
  },
  codeInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    letterSpacing: 2,
    color: '#4A3728',
  },
  clearButton: {
    padding: 4,
  },
  lookupButton: {
    backgroundColor: '#8B5A2B',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  lookupButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  lookupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3728',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6B5D52',
    marginTop: 2,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addFriendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  howItWorksCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  howItWorksIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  howItWorksContent: {
    flex: 1,
    marginLeft: 12,
  },
  howItWorksTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    color: '#4A3728',
  },
  howItWorksText: {
    fontSize: 13,
    color: '#6B5D52',
    lineHeight: 18,
  },
  howItWorksDivider: {
    height: 1,
    backgroundColor: '#E5DDD5',
    marginVertical: 8,
    marginLeft: 48,
  },
});
