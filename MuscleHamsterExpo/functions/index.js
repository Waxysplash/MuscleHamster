/**
 * Firebase Cloud Functions for Muscle Hamster
 *
 * Deploy with: firebase deploy --only functions
 *
 * Prerequisites:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize: firebase init functions (in project root)
 * 4. Install dependencies: cd functions && npm install
 */

// Use v1 API for compatibility with existing 1st Gen functions
const functions = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { Expo } = require('expo-server-sdk');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Initialize Expo SDK
const expo = new Expo();

// ============================================
// SECURITY HELPERS
// ============================================

/**
 * Sanitize a name for safe display in notifications
 * Removes HTML, dangerous chars, and ensures safe length
 */
const sanitizeName = (name, fallback = 'A friend') => {
  if (!name || typeof name !== 'string') {
    return fallback;
  }

  const sanitized = name
    .replace(/<[^>]*>/g, '')      // Remove HTML tags
    .replace(/[<>'"&]/g, '')      // Remove dangerous chars
    .replace(/javascript:|data:|vbscript:/gi, '') // Remove script protocols
    .trim()
    .substring(0, 50);

  return sanitized.length > 0 ? sanitized : fallback;
};

/**
 * Validate Firebase User ID format
 */
const isValidUserId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[a-zA-Z0-9]{20,128}$/.test(id);
};

/**
 * Validate invite code format (MH-XXXXXX)
 */
const isValidInviteCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  return /^MH-[A-HJ-NP-Z2-9]{6}$/i.test(code.toUpperCase().trim());
};

// Rate limiting storage (in-memory, resets on cold start)
// For production at scale, use Redis or Firestore
const rateLimitStore = new Map();

/**
 * Check rate limit for a user action
 * @param {string} userId - User ID
 * @param {string} action - Action type (e.g., 'inviteLookup')
 * @param {number} maxAttempts - Max attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if rate limited
 */
const isRateLimited = (userId, action, maxAttempts, windowMs) => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: [], firstAttempt: now };

  // Clean old attempts outside the window
  record.attempts = record.attempts.filter(t => now - t < windowMs);

  if (record.attempts.length >= maxAttempts) {
    return true;
  }

  record.attempts.push(now);
  rateLimitStore.set(key, record);
  return false;
};

// ============================================
// NUDGE COOLDOWN CONSTANTS
// ============================================
const NUDGE_COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8 hours
const NUDGE_DAILY_LIMIT = 5;

// ============================================
// CLOUD FUNCTIONS
// ============================================

/**
 * Cloud Function: Send push notification when a nudge is created
 * Also enforces server-side cooldown and daily limits
 */
exports.onNudgeCreated = functions.firestore
  .document('nudges/{nudgeId}')
  .onCreate(async (snap, context) => {
    const nudge = snap.data();
    const { toUserId, fromUserId, message } = nudge;
    const nudgeId = context.params.nudgeId;

    try {
      // Validate user IDs
      if (!isValidUserId(toUserId) || !isValidUserId(fromUserId)) {
        console.log('Invalid user IDs in nudge, deleting:', nudgeId);
        await snap.ref.delete();
        return null;
      }

      // Server-side cooldown enforcement
      const now = Timestamp.now();
      const cooldownCutoff = new Date(now.toMillis() - NUDGE_COOLDOWN_MS);
      const dailyCutoff = new Date(now.toMillis() - 24 * 60 * 60 * 1000);

      // Check for recent nudges from same sender to same recipient
      const recentNudgesQuery = await db.collection('nudges')
        .where('fromUserId', '==', fromUserId)
        .where('toUserId', '==', toUserId)
        .where('sentAt', '>', Timestamp.fromDate(cooldownCutoff))
        .get();

      // Exclude the current nudge from the count
      const recentCount = recentNudgesQuery.docs.filter(d => d.id !== nudgeId).length;
      if (recentCount > 0) {
        console.log('Nudge cooldown violated, deleting:', nudgeId);
        await snap.ref.delete();
        return { deleted: true, reason: 'cooldown_violated' };
      }

      // Check daily limit (all nudges from this sender today)
      const dailyNudgesQuery = await db.collection('nudges')
        .where('fromUserId', '==', fromUserId)
        .where('sentAt', '>', Timestamp.fromDate(dailyCutoff))
        .get();

      // Exclude current nudge
      const dailyCount = dailyNudgesQuery.docs.filter(d => d.id !== nudgeId).length;
      if (dailyCount >= NUDGE_DAILY_LIMIT) {
        console.log('Daily nudge limit exceeded, deleting:', nudgeId);
        await snap.ref.delete();
        return { deleted: true, reason: 'daily_limit_exceeded' };
      }

      // Get recipient's push token
      const recipientDoc = await db.collection('users').doc(toUserId).get();
      if (!recipientDoc.exists) {
        console.log('Recipient not found:', toUserId);
        return null;
      }

      const recipientData = recipientDoc.data();
      const pushToken = recipientData.pushToken;

      if (!pushToken) {
        console.log('No push token for recipient:', toUserId);
        return null;
      }

      if (!Expo.isExpoPushToken(pushToken)) {
        console.log('Invalid Expo push token:', pushToken);
        return null;
      }

      // Respect user's friend nudge preference
      if (recipientData.friendNudgesEnabled === false) {
        console.log('Recipient has disabled friend nudges:', toUserId);
        return null;
      }

      // Get sender's name and sanitize it
      const senderDoc = await db.collection('users').doc(fromUserId).get();
      const rawSenderName = senderDoc.exists ? senderDoc.data().hamsterName : null;
      const senderName = sanitizeName(rawSenderName, 'A friend');

      // Prepare the push notification
      const notificationMessages = [
        `${senderName}'s hamster is cheering for you! Time to check in?`,
        `Your friend ${senderName} is rooting for you today!`,
        `${senderName} sent some encouragement - your hamster noticed!`,
        `${senderName} believes in you! Ready to check in?`,
        `A friendly nudge from ${senderName}'s hamster!`,
      ];

      const body = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];

      const pushMessage = {
        to: pushToken,
        sound: 'default',
        title: 'You got a nudge!',
        body: body,
        data: {
          type: 'nudge',
          nudgeId: nudgeId,
          fromUserId: fromUserId,
        },
        badge: 1,
      };

      // Send the notification
      const chunks = expo.chunkPushNotifications([pushMessage]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log('Push notification sent:', ticketChunk);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }

      return { success: true, tickets };
    } catch (error) {
      console.error('Error in onNudgeCreated:', error);
      return null;
    }
  });

/**
 * Cloud Function: Send push notification when a friend request is received
 */
exports.onFriendRequestCreated = functions.firestore
  .document('friends/{friendId}')
  .onCreate(async (snap, context) => {
    const friendData = snap.data();

    // Only send notification for pending requests
    if (friendData.status !== 'pending') {
      return null;
    }

    const { users, initiatedBy } = friendData;
    const receiverId = users.find(id => id !== initiatedBy);

    if (!receiverId) {
      return null;
    }

    // Validate user IDs
    if (!isValidUserId(initiatedBy) || !isValidUserId(receiverId)) {
      console.log('Invalid user IDs in friend request');
      return null;
    }

    try {
      // Get receiver's push token
      const receiverDoc = await db.collection('users').doc(receiverId).get();
      if (!receiverDoc.exists) {
        return null;
      }

      const receiverData = receiverDoc.data();
      const pushToken = receiverData.pushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        return null;
      }

      // Get sender's name and sanitize it
      const senderDoc = await db.collection('users').doc(initiatedBy).get();
      const rawSenderName = senderDoc.exists ? senderDoc.data().hamsterName : null;
      const senderName = sanitizeName(rawSenderName, 'Someone');

      // Prepare the push notification
      const pushMessage = {
        to: pushToken,
        sound: 'default',
        title: 'New Friend Request!',
        body: `${senderName} wants to be workout buddies with you!`,
        data: {
          type: 'friend_request',
          friendId: context.params.friendId,
          fromUserId: initiatedBy,
        },
        badge: 1,
      };

      // Send the notification
      const chunks = expo.chunkPushNotifications([pushMessage]);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
          console.log('Friend request notification sent');
        } catch (error) {
          console.error('Error sending friend request notification:', error);
        }
      }

      // Track invite code usage (server-side to avoid client permission issues)
      try {
        const senderDoc = await db.collection('users').doc(initiatedBy).get();
        const receiverInviteCode = receiverData.inviteCode;
        const senderInviteCode = senderDoc.exists ? senderDoc.data().inviteCode : null;

        // Check if either user's invite code was used (update the one that exists)
        for (const code of [receiverInviteCode, senderInviteCode]) {
          if (code) {
            const inviteDoc = await db.collection('invites').doc(code).get();
            if (inviteDoc.exists) {
              const inviteData = inviteDoc.data();
              // Only update if the other user is the one who used this code
              const otherUserId = inviteData.ownerId === initiatedBy ? receiverId : initiatedBy;
              if (inviteData.ownerId !== otherUserId) {
                await inviteDoc.ref.update({
                  usedBy: FieldValue.arrayUnion(otherUserId),
                });
              }
            }
          }
        }
      } catch (trackingError) {
        console.log('Invite tracking update failed (non-critical):', trackingError.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in onFriendRequestCreated:', error);
      return null;
    }
  });

/**
 * Cloud Function: Send push notification when a friend request is accepted
 */
exports.onFriendRequestAccepted = functions.firestore
  .document('friends/{friendId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only process when status changes from pending to accepted
    if (before.status !== 'pending' || after.status !== 'accepted') {
      return null;
    }

    const { users, initiatedBy } = after;

    // Increment friendCount for both users (server-side to avoid permission issues)
    try {
      const batch = db.batch();
      for (const uid of users) {
        const userRef = db.collection('users').doc(uid);
        batch.update(userRef, {
          friendCount: FieldValue.increment(1),
        });
      }
      await batch.commit();
      console.log('Friend counts incremented for:', users);
    } catch (countError) {
      console.error('Error incrementing friend counts:', countError);
      // Don't fail the whole function - notification should still send
    }
    // Notify the person who sent the request
    const senderId = initiatedBy;

    // Validate user IDs
    if (!isValidUserId(senderId)) {
      console.log('Invalid sender ID in friend request accepted');
      return null;
    }

    try {
      // Get sender's push token
      const senderDoc = await db.collection('users').doc(senderId).get();
      if (!senderDoc.exists) {
        return null;
      }

      const senderData = senderDoc.data();
      const pushToken = senderData.pushToken;

      if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        return null;
      }

      // Get accepter's name and sanitize it
      const accepterId = users.find(id => id !== senderId);
      if (!isValidUserId(accepterId)) {
        return null;
      }

      const accepterDoc = await db.collection('users').doc(accepterId).get();
      const rawAccepterName = accepterDoc.exists ? accepterDoc.data().hamsterName : null;
      const accepterName = sanitizeName(rawAccepterName, 'Your friend');

      // Prepare the push notification
      const pushMessage = {
        to: pushToken,
        sound: 'default',
        title: 'Friend Request Accepted!',
        body: `${accepterName} is now your workout buddy! Start building a streak together.`,
        data: {
          type: 'friend_accepted',
          friendId: context.params.friendId,
          friendUserId: accepterId,
        },
        badge: 1,
      };

      // Send the notification
      const chunks = expo.chunkPushNotifications([pushMessage]);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
          console.log('Friend accepted notification sent');
        } catch (error) {
          console.error('Error sending friend accepted notification:', error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in onFriendRequestAccepted:', error);
      return null;
    }
  });

/**
 * Cloud Function: Decrement friend counts when a friend relationship is deleted
 * Handles both unfriending and blocking (where doc is overwritten)
 */
exports.onFriendRemoved = functions.firestore
  .document('friends/{friendId}')
  .onDelete(async (snap, context) => {
    const data = snap.data();

    // Only decrement if they were actually friends (accepted status)
    if (data.status !== 'accepted') {
      return null;
    }

    const { users } = data;
    if (!users || !Array.isArray(users) || users.length !== 2) {
      return null;
    }

    try {
      const batch = db.batch();
      for (const uid of users) {
        if (isValidUserId(uid)) {
          const userRef = db.collection('users').doc(uid);
          batch.update(userRef, {
            friendCount: FieldValue.increment(-1),
          });
        }
      }
      await batch.commit();
      console.log('Friend counts decremented for:', users);
    } catch (error) {
      console.error('Error decrementing friend counts:', error);
    }

    return null;
  });

// Note: onFriendBlocked is no longer needed. Blocking now deletes the existing
// friend doc (triggering onFriendRemoved for count decrement) then creates a
// new blocked doc. The onFriendRemoved handler handles the friendCount decrement.

/**
 * Callable function: Rate-limited invite code lookup
 * Prevents brute-force attacks on invite codes
 */
exports.lookupInviteCode = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in to look up invite codes'
    );
  }

  const userId = context.auth.uid;
  const { code } = data;

  // Rate limit: 10 attempts per minute
  if (isRateLimited(userId, 'inviteLookup', 10, 60 * 1000)) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many attempts. Please wait a minute and try again.'
    );
  }

  // Validate code format
  if (!code || typeof code !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invite code is required'
    );
  }

  const normalizedCode = code.toUpperCase().trim();

  if (!isValidInviteCode(normalizedCode)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid invite code format. Codes look like: MH-ABC123'
    );
  }

  try {
    // Look up the invite
    const inviteDoc = await db.collection('invites').doc(normalizedCode).get();

    if (!inviteDoc.exists || !inviteDoc.data().active) {
      throw new functions.https.HttpsError(
        'not-found',
        'Invite code not found or expired'
      );
    }

    const inviteData = inviteDoc.data();

    // Prevent using own code
    if (inviteData.ownerId === userId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        "You can't use your own invite code"
      );
    }

    // Get owner's profile
    const ownerDoc = await db.collection('users').doc(inviteData.ownerId).get();

    if (!ownerDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Invite code owner not found'
      );
    }

    const ownerData = ownerDoc.data();

    // Return sanitized owner profile
    return {
      success: true,
      inviteCode: normalizedCode,
      ownerId: inviteData.ownerId,
      ownerHamsterName: sanitizeName(ownerData.hamsterName, 'A hamster friend'),
      ownerProfile: {
        id: inviteData.ownerId,
        hamsterName: sanitizeName(ownerData.hamsterName, 'A hamster friend'),
        currentStreak: ownerData.currentStreak || 0,
        growthStage: ownerData.growthStage || 'baby',
      },
    };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Error in lookupInviteCode:', error);
    throw new functions.https.HttpsError('internal', 'Failed to look up invite code');
  }
});

/**
 * Callable function: Manually send a push notification
 * Used for testing or manual notifications
 */
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in to send notifications'
    );
  }

  const { toUserId, title, body, data: notificationData } = data;

  if (!toUserId || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: toUserId, title, body'
    );
  }

  // Validate user ID
  if (!isValidUserId(toUserId)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid recipient user ID'
    );
  }

  try {
    // Get recipient's push token
    const recipientDoc = await db.collection('users').doc(toUserId).get();
    if (!recipientDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Recipient not found');
    }

    const pushToken = recipientDoc.data().pushToken;
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Recipient does not have a valid push token'
      );
    }

    const pushMessage = {
      to: pushToken,
      sound: 'default',
      title: sanitizeName(title, 'Notification'),
      body: sanitizeName(body, ''),
      data: notificationData || {},
    };

    const chunks = expo.chunkPushNotifications([pushMessage]);

    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
