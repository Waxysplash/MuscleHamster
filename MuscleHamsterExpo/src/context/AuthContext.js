import React, { createContext, useContext, useState, useCallback } from 'react';

// Auth state enum equivalent
export const AuthState = {
  UNKNOWN: 'unknown',
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED: 'authenticated',
};

// Auth error messages with hamster voice
const AuthErrors = {
  invalidEmail: "That email doesn't look quite right. Mind double-checking it?",
  weakPassword: 'Your hamster needs a stronger password! At least 8 characters, please.',
  emailAlreadyInUse: "Looks like you've been here before! Try signing in instead.",
  invalidCredentials: "That didn't quite work. Double-check your email and password?",
  userNotFound: "We couldn't find that account. Want to create one instead?",
  networkError: "Your hamster can't reach the internet right now. Check your connection and try again!",
  unknown: 'Something unexpected happened. Let\'s try again!',
};

const AuthContext = createContext(null);

// Mock auth service - in-memory storage
const registeredUsers = {};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidEmail = (email) => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(AuthState.UNAUTHENTICATED);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signUp = useCallback(async (email, password) => {
    setError(null);

    // Simulate network delay
    await delay(800 + Math.random() * 700);

    // Validate email
    if (!isValidEmail(email)) {
      setError(AuthErrors.invalidEmail);
      return false;
    }

    // Validate password
    if (password.length < 8) {
      setError(AuthErrors.weakPassword);
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    if (registeredUsers[normalizedEmail]) {
      setError(AuthErrors.emailAlreadyInUse);
      return false;
    }

    // Register user
    registeredUsers[normalizedEmail] = password;
    const user = { id: Date.now().toString(), email: normalizedEmail, profileComplete: false };
    setCurrentUser(user);
    setAuthState(AuthState.AUTHENTICATED);
    return true;
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError(null);

    await delay(800 + Math.random() * 700);

    if (!isValidEmail(email)) {
      setError(AuthErrors.invalidEmail);
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!registeredUsers[normalizedEmail]) {
      setError(AuthErrors.userNotFound);
      return false;
    }

    if (registeredUsers[normalizedEmail] !== password) {
      setError(AuthErrors.invalidCredentials);
      return false;
    }

    const user = { id: Date.now().toString(), email: normalizedEmail, profileComplete: false };
    setCurrentUser(user);
    setAuthState(AuthState.AUTHENTICATED);
    return true;
  }, []);

  const signOut = useCallback(async () => {
    await delay(300);
    setCurrentUser(null);
    setAuthState(AuthState.UNAUTHENTICATED);
  }, []);

  const resetPassword = useCallback(async (email) => {
    setError(null);

    await delay(800 + Math.random() * 700);

    if (!isValidEmail(email)) {
      setError(AuthErrors.invalidEmail);
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!registeredUsers[normalizedEmail]) {
      setError(AuthErrors.userNotFound);
      return false;
    }

    // In real app, would send email
    return true;
  }, []);

  const value = {
    authState,
    currentUser,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
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
