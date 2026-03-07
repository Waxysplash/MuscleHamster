// app.config.js - Dynamic Expo configuration
// Reads Firebase config from environment variables for security
// See .env.example for required variables

export default {
  expo: {
    name: "Muscle Hamster",
    slug: "MuscleHamsterExpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/branding/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "musclehamster",
    // App Store metadata
    description: "A friendly fitness app where you care for a virtual hamster by completing workouts. No guilt, just gains!",
    githubUrl: "https://github.com/Waxysplash/MuscleHamster",
    primaryColor: "#FF9500",
    splash: {
      image: "./assets/branding/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FFF8F0"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.musclehamster.app",
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.musclehamster.app",
      adaptiveIcon: {
        foregroundImage: "./assets/branding/adaptive-icon.png",
        backgroundColor: "#FFF8F0"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/branding/favicon.png"
    },
    plugins: [
      "expo-web-browser",
      "expo-apple-authentication",
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics"
    ],
    extra: {
      eas: {
        projectId: "0d1ab199-4a96-4a74-b718-9eee0ca7eacf"
      },
      // Firebase configuration from environment variables
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
      },
      // Google OAuth
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID
    }
  }
};
