import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// =============================================================================
// GOOGLE OAUTH CLIENT IDS
// =============================================================================
// These IDs are created in Google Cloud Console > APIs & Services > Credentials
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Select your project (or create one)
// 3. Click "Create Credentials" > "OAuth client ID"
// 4. Create THREE OAuth 2.0 Client IDs:
//
//    a) WEB APPLICATION (for Expo Go development):
//       - Application type: "Web application"
//       - Authorized redirect URIs: https://auth.expo.io/@your-expo-username/MuscleHamster
//       - Copy the client ID below
//
//    b) iOS (for production/TestFlight builds):
//       - Application type: "iOS"
//       - Bundle ID: com.musclehamster.app (must match app.json)
//       - Copy the client ID below
//
//    c) Android (for production builds):
//       - Application type: "Android"
//       - Package name: com.musclehamster.app (must match app.json)
//       - SHA-1 fingerprint: Run `eas credentials` to get this from EAS Build
//       - Copy the client ID below
//
// 5. Enable "Google Identity" API in your project if not already enabled
// =============================================================================

const GOOGLE_WEB_CLIENT_ID = '783320940502-o8h2fs9iaal938kmmb860npcjm29h20p.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = ''; // Add your iOS client ID here
const GOOGLE_ANDROID_CLIENT_ID = ''; // Add your Android client ID here

/**
 * Check if Apple Sign-In is available on this device
 * @returns {Promise<boolean>}
 */
export async function isAppleSignInAvailable() {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Generate a random nonce for Apple Sign-In security
 * @returns {Promise<{nonce: string, hashedNonce: string}>}
 */
async function generateNonce() {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const nonce = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce
  );

  return { nonce, hashedNonce };
}

/**
 * Sign in with Apple and authenticate with Firebase
 * @returns {Promise<{success: boolean, error?: string, cancelled?: boolean}>}
 */
export async function signInWithApple() {
  try {
    // Generate nonce for security
    const { nonce, hashedNonce } = await generateNonce();

    // Request Apple Sign-In
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    // Create Firebase OAuth credential
    const provider = new OAuthProvider('apple.com');
    const oauthCredential = provider.credential({
      idToken: credential.identityToken,
      rawNonce: nonce,
    });

    // Sign in to Firebase
    await signInWithCredential(auth, oauthCredential);

    return { success: true };
  } catch (error) {
    // Handle user cancellation
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
      return { success: false, cancelled: true };
    }

    console.error('Apple Sign-In error:', error);
    return {
      success: false,
      error: 'Apple Sign-In failed. Please try again.',
    };
  }
}

/**
 * Get Google OAuth configuration for expo-auth-session
 * @returns {Object} OAuth configuration
 */
export function getGoogleAuthConfig() {
  return {
    clientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  };
}

/**
 * Get the Google Web Client ID
 * @returns {string}
 */
export function getGoogleWebClientId() {
  return GOOGLE_WEB_CLIENT_ID;
}

/**
 * Get the Google iOS Client ID
 * @returns {string}
 */
export function getGoogleIosClientId() {
  return GOOGLE_IOS_CLIENT_ID;
}

/**
 * Get the Google Android Client ID
 * @returns {string}
 */
export function getGoogleAndroidClientId() {
  return GOOGLE_ANDROID_CLIENT_ID;
}

/**
 * Sign in to Firebase with Google ID token
 * @param {string} idToken - The Google ID token from OAuth flow
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signInWithGoogleToken(idToken) {
  try {
    // Create Firebase Google credential
    const credential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    await signInWithCredential(auth, credential);

    return { success: true };
  } catch (error) {
    console.error('Google Sign-In Firebase error:', error);
    return {
      success: false,
      error: 'Google Sign-In failed. Please try again.',
    };
  }
}

/**
 * Get a friendly error message for social auth errors
 * @param {string} errorCode - Firebase or provider error code
 * @returns {string}
 */
export function getSocialAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/invalid-credential':
      'The sign-in credential is invalid. Please try again.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled. Please contact support.',
    'auth/user-disabled':
      'This account has been disabled.',
    'auth/network-request-failed':
      "Can't connect to the internet. Check your connection and try again.",
  };

  return errorMessages[errorCode] || 'Something went wrong. Please try again.';
}
