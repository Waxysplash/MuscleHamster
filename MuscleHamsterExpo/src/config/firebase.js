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
    throw new Error(
      'Firebase configuration not found. Please ensure your .env file is set up correctly. ' +
      'See .env.example for required variables.'
    );
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
// On web, getAuth() uses browser persistence automatically
// On native, we'll set up persistence separately if needed
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
