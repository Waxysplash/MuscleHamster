import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
// NOTE: For production, move these values to environment variables using:
// - expo-constants (recommended for Expo)
// - react-native-dotenv
// - or app.config.js with process.env
// Firebase API keys are safe to expose client-side, but other sensitive
// config should use environment variables for security best practices.
const firebaseConfig = {
  apiKey: "AIzaSyD1_pzaBmy3DBNoAGNdVmE_hzJ4wjgMu_o",
  authDomain: "muscle-hamster.firebaseapp.com",
  projectId: "muscle-hamster",
  storageBucket: "muscle-hamster.firebasestorage.app",
  messagingSenderId: "783320940502",
  appId: "1:783320940502:web:900c6516e29c492e3aee77",
  measurementId: "G-V1E9ZR33VF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
// On web, getAuth() uses browser persistence automatically
// On native, we'll set up persistence separately if needed
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
