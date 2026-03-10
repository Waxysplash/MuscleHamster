import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
let firebaseInitError = null;

try {
  const firebaseConfig = getFirebaseConfig();

  if (firebaseConfig) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Auth
    // On web, getAuth() uses browser persistence automatically
    // On native, we'll set up persistence separately if needed
    auth = getAuth(app);

    // Initialize Firestore
    db = getFirestore(app);
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

export { app, auth, db };
