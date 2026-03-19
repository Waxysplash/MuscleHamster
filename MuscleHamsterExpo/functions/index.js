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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Expo SDK
const expo = new Expo();

/**
 * Cloud Function: Send push notification when a nudge is created
 *
 * Triggered when a new document is created in the 'nudges' collection
 */
exports.onNudgeCreated = functions.firestore
  .document('nudges/{nudgeId}')
  .onCreate(async (snap, context) => {
    const nudge = snap.data();
    const { toUserId, fromUserId, message } = nudge;

    try {
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

      // Check if this is a valid Expo push token
      if (!Expo.isExpoPushToken(pushToken)) {
        console.log('Invalid Expo push token:', pushToken);
        return null;
      }

      // Get sender's name
      const senderDoc = await db.collection('users').doc(fromUserId).get();
      const senderName = senderDoc.exists
        ? senderDoc.data().hamsterName || 'A friend'
        : 'A friend';

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
          nudgeId: context.params.nudgeId,
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
 *
 * Triggered when a friend document is created or updated with pending status
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

      // Get sender's name
      const senderDoc = await db.collection('users').doc(initiatedBy).get();
      const senderName = senderDoc.exists
        ? senderDoc.data().hamsterName || 'Someone'
        : 'Someone';

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

    // Only send notification when status changes from pending to accepted
    if (before.status !== 'pending' || after.status !== 'accepted') {
      return null;
    }

    const { users, initiatedBy } = after;
    // Notify the person who sent the request
    const senderId = initiatedBy;

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

      // Get accepter's name
      const accepterId = users.find(id => id !== senderId);
      const accepterDoc = await db.collection('users').doc(accepterId).get();
      const accepterName = accepterDoc.exists
        ? accepterDoc.data().hamsterName || 'Your friend'
        : 'Your friend';

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
      title,
      body,
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
