import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  isAppleSignInAvailable,
  signInWithApple as socialSignInWithApple,
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          profileComplete: false, // Will be updated by UserProfileContext
        });
        setAuthState(AuthState.AUTHENTICATED);
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
    try {
      await firebaseSignOut(auth);
      // Auth state listener will handle clearing currentUser
    } catch (err) {
      Logger.error('Sign out error:', err);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setError(null);

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
