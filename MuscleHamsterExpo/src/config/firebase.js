import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase configuration from environment variables (via app.config.js)
// See .env.example for required variables
const getFirebaseConfig = () => {
  const config = Constants.expoConfig?.extra?.firebase;

  // Require environment variables - no hardcoded fallback for security
  if (!config?.apiKey) {
    console.error(
      'Firebase configuration not found. Please ensure your .env file is set up correctly. ' +
      'See .env.example for required variables.'
    );
    return null;
  }

  return config;
};

// Initialize Firebase with error handling to prevent white screen crashes
let app = null;
let auth = null;
let db = null;
let functions = null;
let firebaseInitError = null;

try {
  const firebaseConfig = getFirebaseConfig();

  if (firebaseConfig) {
    // Check if Firebase is already initialized (handles hot reload)
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // Initialize Auth with AsyncStorage persistence for React Native
    // Use try/catch to handle case where auth is already initialized
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (authError) {
      // Auth already initialized, use getAuth instead
      if (authError.code === 'auth/already-initialized') {
        auth = getAuth(app);
      } else {
        throw authError;
      }
    }

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Cloud Functions
    functions = getFunctions(app);
  } else {
    firebaseInitError = new Error('Firebase configuration missing');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
  firebaseInitError = error;
}

// Helper to check if Firebase is available
export const isFirebaseInitialized = () => app !== null && auth !== null && db !== null;
export const getFirebaseError = () => firebaseInitError;

// Helper to call Cloud Functions
export const callFunction = (functionName) => {
  if (!functions) {
    throw new Error('Firebase Functions not initialized');
  }
  return httpsCallable(functions, functionName);
};

export { app, auth, db, functions };
