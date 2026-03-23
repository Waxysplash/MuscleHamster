import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, isFirebaseInitialized, getFirebaseError } from '../config/firebase';
import {
  isAppleSignInAvailable,
  signInWithApple as socialSignInWithApple,
  signOutFromGoogle,
  reauthenticateWithGoogle as socialReauthWithGoogle,
  reauthenticateWithApple as socialReauthWithApple,
} from '../services/SocialAuthService';
import Logger from '../services/LoggerService';
import { registerForPushNotifications, clearPushToken } from '../services/NotificationService';

// Auth state enum equivalent
export const AuthState = {
  UNKNOWN: 'unknown',
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED: 'authenticated',
};

// Map Firebase error codes to friendly hamster messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': "That email doesn't look quite right. Mind double-checking it?",
    'auth/weak-password': 'Your hamster needs a stronger password! At least 6 characters, please.',
    'auth/email-already-in-use': "Looks like you've been here before! Try signing in instead.",
    'auth/invalid-credential': "That didn't quite work. Double-check your email and password?",
    'auth/user-not-found': "We couldn't find that account. Want to create one instead?",
    'auth/wrong-password': "That password doesn't match. Want to try again?",
    'auth/too-many-requests': "Whoa, slow down! Too many attempts. Try again in a bit.",
    'auth/network-request-failed': "Your hamster can't reach the internet right now. Check your connection!",
  };
  return errorMessages[errorCode] || 'Something unexpected happened. Let\'s try again!';
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(AuthState.UNKNOWN);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  // Check Apple Sign-In availability on mount
  useEffect(() => {
    isAppleSignInAvailable().then(setIsAppleAvailable);
  }, []);

  // Listen for auth state changes (handles persistence automatically)
  useEffect(() => {
    // If Firebase failed to initialize, go to unauthenticated state
    // This allows the app to at least show the sign-in screen
    if (!isFirebaseInitialized() || !auth) {
      Logger.error('Firebase not initialized:', getFirebaseError());
      setAuthState(AuthState.UNAUTHENTICATED);
      setError('Unable to connect. Please check your internet and try again.');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          profileComplete: false, // Will be updated by UserProfileContext
        });
        setAuthState(AuthState.AUTHENTICATED);
        // Set user ID for Crashlytics (helps identify crashes per user)
        Logger.setUserId(firebaseUser.uid);

        // Register for push notifications and save token to Firestore
        // This enables Cloud Functions to send notifications to this user
        try {
          await registerForPushNotifications(firebaseUser.uid);
        } catch (err) {
          // Non-critical - don't block auth flow if push registration fails
          Logger.debug('Push notification registration failed:', err);
        }
      } else {
        setCurrentUser(null);
        setAuthState(AuthState.UNAUTHENTICATED);
      }
    });

    return unsubscribe;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signUp = useCallback(async (email, password) => {
    setError(null);

    if (!isFirebaseInitialized() || !auth) {
      setError('Unable to connect. Please check your internet and try again.');
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle setting currentUser
      return true;
    } catch (err) {
      Logger.debug('Sign up error:', err.code, err.message);
      setError(getErrorMessage(err.code));
      return false;
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError(null);

    if (!isFirebaseInitialized() || !auth) {
      setError('Unable to connect. Please check your internet and try again.');
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle setting currentUser
      return true;
    } catch (err) {
      Logger.debug('Sign in error:', err.code, err.message);
      setError(getErrorMessage(err.code));
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isFirebaseInitialized() || !auth) {
      setCurrentUser(null);
      setAuthState(AuthState.UNAUTHENTICATED);
      return;
    }

    try {
      // Clear push token from Firestore before signing out
      if (auth.currentUser) {
        await clearPushToken(auth.currentUser.uid);
      }
      // Sign out from Google if user was signed in with Google
      await signOutFromGoogle();
      await firebaseSignOut(auth);
      // Auth state listener will handle clearing currentUser
    } catch (err) {
      Logger.error('Sign out error:', err);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setError(null);

    if (!isFirebaseInitialized() || !auth) {
      setError('Unable to connect. Please check your internet and try again.');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      return false;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setError(null);

    const result = await socialSignInWithApple();

    if (result.cancelled) {
      // User cancelled - no error needed
      return { success: false, cancelled: true };
    }

    if (!result.success) {
      setError(result.error);
      return { success: false };
    }

    // Auth state listener will handle setting currentUser
    return { success: true };
  }, []);

  // Re-authenticate user with password (needed for sensitive operations)
  const reauthenticate = useCallback(async (password) => {
    if (!isFirebaseInitialized() || !auth || !auth.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      return { success: true };
    } catch (err) {
      Logger.debug('Reauthentication error:', err.code, err.message);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'wrong-password' };
      }
      return { success: false, error: err.message };
    }
  }, []);

  // Re-authenticate with Google (for Google sign-in users)
  const reauthenticateWithGoogle = useCallback(async () => {
    if (!isFirebaseInitialized() || !auth || !auth.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    return await socialReauthWithGoogle();
  }, []);

  // Re-authenticate with Apple (for Apple sign-in users)
  const reauthenticateWithApple = useCallback(async () => {
    if (!isFirebaseInitialized() || !auth || !auth.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    return await socialReauthWithApple();
  }, []);

  // Delete account and all associated data
  const deleteAccount = useCallback(async () => {
    setError(null);
    Logger.debug('[AuthContext] deleteAccount called');

    if (!isFirebaseInitialized() || !auth || !auth.currentUser) {
      Logger.debug('[AuthContext] deleteAccount: Not authenticated');
      setError('Unable to delete account. Please try again.');
      return { success: false, error: 'Not authenticated' };
    }

    const userId = auth.currentUser.uid;
    Logger.debug('[AuthContext] deleteAccount: Deleting user', userId);

    try {
      // 1. Delete simple documents (userId as document ID)
      const simpleCollections = [
        'users',
        'userStats',
        'inventory',
        'exerciseJournals',
        'userFavorites',
        'customWorkouts',
        'savedRoutines',
      ];

      for (const collectionName of simpleCollections) {
        try {
          const docRef = doc(db, collectionName, userId);
          await deleteDoc(docRef);
          Logger.debug(`[AuthContext] Deleted ${collectionName}/${userId}`);
        } catch (err) {
          Logger.debug(`[AuthContext] No ${collectionName} document to delete (or error):`, err.message);
        }
      }

      // 2. Delete weeklySchedules (document ID format: userId_weekStart)
      try {
        const schedulesRef = collection(db, 'weeklySchedules');
        const schedulesQuery = query(schedulesRef, where('userId', '==', userId));
        const schedulesSnapshot = await getDocs(schedulesQuery);

        if (!schedulesSnapshot.empty) {
          const batch = writeBatch(db);
          schedulesSnapshot.docs.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();
          Logger.debug(`[AuthContext] Deleted ${schedulesSnapshot.size} weeklySchedules`);
        }
      } catch (err) {
        Logger.debug('[AuthContext] Error deleting weeklySchedules:', err.message);
      }

      // 3. Delete friends (user is in the 'users' array)
      try {
        const friendsRef = collection(db, 'friends');
        const friendsQuery = query(friendsRef, where('users', 'array-contains', userId));
        const friendsSnapshot = await getDocs(friendsQuery);

        if (!friendsSnapshot.empty) {
          const batch = writeBatch(db);
          friendsSnapshot.docs.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();
          Logger.debug(`[AuthContext] Deleted ${friendsSnapshot.size} friend relationships`);
        }
      } catch (err) {
        Logger.debug('[AuthContext] Error deleting friends:', err.message);
      }

      // 4. Delete nudges (sent or received)
      try {
        // Nudges sent by user
        const nudgesSentRef = collection(db, 'nudges');
        const nudgesSentQuery = query(nudgesSentRef, where('fromUserId', '==', userId));
        const nudgesSentSnapshot = await getDocs(nudgesSentQuery);

        if (!nudgesSentSnapshot.empty) {
          const batch = writeBatch(db);
          nudgesSentSnapshot.docs.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();
          Logger.debug(`[AuthContext] Deleted ${nudgesSentSnapshot.size} sent nudges`);
        }

        // Nudges received by user
        const nudgesReceivedQuery = query(nudgesSentRef, where('toUserId', '==', userId));
        const nudgesReceivedSnapshot = await getDocs(nudgesReceivedQuery);

        if (!nudgesReceivedSnapshot.empty) {
          const batch = writeBatch(db);
          nudgesReceivedSnapshot.docs.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();
          Logger.debug(`[AuthContext] Deleted ${nudgesReceivedSnapshot.size} received nudges`);
        }
      } catch (err) {
        Logger.debug('[AuthContext] Error deleting nudges:', err.message);
      }

      // 5. Delete invites (user's invite code)
      try {
        const invitesRef = collection(db, 'invites');
        const invitesQuery = query(invitesRef, where('ownerId', '==', userId));
        const invitesSnapshot = await getDocs(invitesQuery);

        if (!invitesSnapshot.empty) {
          const batch = writeBatch(db);
          invitesSnapshot.docs.forEach((docSnap) => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();
          Logger.debug(`[AuthContext] Deleted ${invitesSnapshot.size} invites`);
        }
      } catch (err) {
        Logger.debug('[AuthContext] Error deleting invites:', err.message);
      }

      // 6. Clear all local AsyncStorage data
      try {
        await AsyncStorage.clear();
        Logger.debug('[AuthContext] Cleared AsyncStorage');
      } catch (err) {
        Logger.debug('[AuthContext] Error clearing AsyncStorage:', err.message);
      }

      // 7. Delete the Firebase Auth account
      Logger.debug('[AuthContext] About to delete Firebase Auth account...');
      await deleteUser(auth.currentUser);
      Logger.info('[AuthContext] Account deleted successfully');

      // Auth state listener will handle clearing currentUser
      return { success: true };
    } catch (err) {
      Logger.error('[AuthContext] Account deletion error:', err.code, err.message);

      // Handle specific error codes
      if (err.code === 'auth/requires-recent-login') {
        Logger.debug('[AuthContext] Requires recent login');
        setError('For security, please sign out and sign back in, then try deleting again.');
        return { success: false, error: 'requires-recent-login' };
      }

      setError('Something went wrong while deleting your account. Please try again.');
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    authState,
    currentUser,
    error,
    isAppleAvailable,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithApple,
    reauthenticate,
    reauthenticateWithGoogle,
    reauthenticateWithApple,
    deleteAccount,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
