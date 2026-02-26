import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Firebase configuration from environment variables (via app.config.js)
// See .env.example for required variables
const getFirebaseConfig = () => {
  const config = Constants.expoConfig?.extra?.firebase;

  // Fallback for development if env vars not set
  if (!config?.apiKey) {
    console.warn('Firebase config not found in environment. Using fallback.');
    return {
      apiKey: "AIzaSyD1_pzaBmy3DBNoAGNdVmE_hzJ4wjgMu_o",
      authDomain: "muscle-hamster.firebaseapp.com",
      projectId: "muscle-hamster",
      storageBucket: "muscle-hamster.firebasestorage.app",
      messagingSenderId: "783320940502",
      appId: "1:783320940502:web:900c6516e29c492e3aee77",
      measurementId: "G-V1E9ZR33VF"
    };
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
