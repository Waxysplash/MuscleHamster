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
import { doc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, isFirebaseInitialized, getFirebaseError } from '../config/firebase';
import {
  isAppleSignInAvailable,
  signInWithApple as socialSignInWithApple,
  signOutFromGoogle,
} from '../services/SocialAuthService';
import Logger from '../services/LoggerService';

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

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          profileComplete: false, // Will be updated by UserProfileContext
        });
        setAuthState(AuthState.AUTHENTICATED);
        // Set user ID for Crashlytics (helps identify crashes per user)
        Logger.setUserId(firebaseUser.uid);
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

  // Delete account and all associated data
  const deleteAccount = useCallback(async () => {
    setError(null);

    if (!isFirebaseInitialized() || !auth || !auth.currentUser) {
      setError('Unable to delete account. Please try again.');
      return { success: false, error: 'Not authenticated' };
    }

    const userId = auth.currentUser.uid;

    try {
      // Delete all user data from Firestore collections
      const collectionsToDelete = [
        'users',
        'userStats',
        'inventory',
        'exerciseJournals',
        'userFavorites',
        'customWorkouts',
      ];

      for (const collectionName of collectionsToDelete) {
        try {
          const docRef = doc(db, collectionName, userId);
          await deleteDoc(docRef);
          Logger.debug(`Deleted ${collectionName} for user ${userId}`);
        } catch (err) {
          // Document might not exist, that's okay
          Logger.debug(`No ${collectionName} document to delete for user ${userId}`);
        }
      }

      // Clear all local AsyncStorage data
      try {
        await AsyncStorage.clear();
        Logger.debug('Cleared AsyncStorage');
      } catch (err) {
        Logger.debug('Error clearing AsyncStorage:', err);
      }

      // Delete the Firebase Auth account
      await deleteUser(auth.currentUser);
      Logger.info('Account deleted successfully');

      // Auth state listener will handle clearing currentUser
      return { success: true };
    } catch (err) {
      Logger.error('Account deletion error:', err);

      // Handle specific error codes
      if (err.code === 'auth/requires-recent-login') {
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
