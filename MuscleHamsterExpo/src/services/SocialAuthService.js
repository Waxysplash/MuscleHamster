import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { OAuthProvider, GoogleAuthProvider, signInWithCredential, reauthenticateWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';
import { auth } from '../config/firebase';
import Logger from './LoggerService';

// =============================================================================
// GOOGLE SIGN-IN CONFIGURATION
// =============================================================================
// Uses native Google Sign-In SDK which complies with Google's OAuth 2.0 policies.
// This replaces expo-auth-session WebView-based auth which Google blocked.
//
// SETUP:
// 1. GoogleService-Info.plist must be in the project root
// 2. The @react-native-google-signin/google-signin config plugin is added to app.config.js
// 3. The webClientId is required for Firebase authentication
// =============================================================================

// Get Web Client ID from environment variables
const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;

// Configure Google Sign-In on module load
// Use the Web Client ID for Firebase integration
GoogleSignin.configure({
  // Web Client ID from environment variables (set in app.config.js)
  webClientId: googleWebClientId,
  // Request offline access to get idToken
  offlineAccess: true,
});

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

    Logger.error('Apple Sign-In error:', error);
    return {
      success: false,
      error: 'Apple Sign-In failed. Please try again.',
    };
  }
}

/**
 * Sign in with Google using native SDK and authenticate with Firebase
 * Uses native Google Sign-In which complies with Google's OAuth 2.0 policies.
 * @returns {Promise<{success: boolean, error?: string, cancelled?: boolean}>}
 */
export async function signInWithGoogle() {
  try {
    // Check if Google Play Services are available (Android only, always true on iOS)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Perform native Google Sign-In
    const signInResult = await GoogleSignin.signIn();

    // Log the full response for debugging
    Logger.debug('Google Sign-In result:', JSON.stringify(signInResult, null, 2));

    // Get the ID token - try both possible locations
    // Newer API: signInResult.data.idToken
    // Older API: signInResult.idToken
    const idToken = signInResult?.data?.idToken || signInResult?.idToken;

    if (!idToken) {
      Logger.error('Google Sign-In: No ID token received. Result:', JSON.stringify(signInResult));
      return {
        success: false,
        error: 'Google Sign-In failed. Please try again.',
      };
    }

    // Create Firebase Google credential
    const credential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    await signInWithCredential(auth, credential);

    return { success: true };
  } catch (error) {
    // Handle user cancellation
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    }

    // Handle Play Services not available (Android)
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Logger.error('Google Sign-In: Play Services not available');
      return {
        success: false,
        error: 'Google Play Services is required for Google Sign-In.',
      };
    }

    // Handle in-progress sign-in
    if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, cancelled: true };
    }

    Logger.error('Google Sign-In error:', error);
    return {
      success: false,
      error: 'Google Sign-In failed. Please try again.',
    };
  }
}

/**
 * Sign out from Google (call this when user signs out of app)
 */
export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    // Ignore sign out errors
    Logger.debug('Google Sign-Out error:', error);
  }
}

/**
 * Re-authenticate with Google for sensitive operations (like account deletion)
 * This prompts the user to sign in with Google again to get fresh credentials.
 * @returns {Promise<{success: boolean, error?: string, cancelled?: boolean}>}
 */
export async function reauthenticateWithGoogle() {
  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in with Google to get fresh credentials
    const signInResult = await GoogleSignin.signIn();

    // Get the ID token
    const idToken = signInResult?.data?.idToken || signInResult?.idToken;

    if (!idToken) {
      Logger.error('Google re-auth: No ID token received');
      return {
        success: false,
        error: 'Google authentication failed. Please try again.',
      };
    }

    // Create Firebase Google credential
    const credential = GoogleAuthProvider.credential(idToken);

    // Re-authenticate the current user with fresh credential
    if (!auth.currentUser) {
      return {
        success: false,
        error: 'No user signed in.',
      };
    }

    await reauthenticateWithCredential(auth.currentUser, credential);
    Logger.debug('Google re-authentication successful');

    return { success: true };
  } catch (error) {
    // Handle user cancellation
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    }

    // Handle Play Services not available (Android)
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error: 'Google Play Services is required.',
      };
    }

    Logger.error('Google re-auth error:', error);
    return {
      success: false,
      error: 'Google authentication failed. Please try again.',
    };
  }
}

/**
 * Re-authenticate with Apple for sensitive operations (like account deletion)
 * This prompts the user to sign in with Apple again to get fresh credentials.
 * @returns {Promise<{success: boolean, error?: string, cancelled?: boolean}>}
 */
export async function reauthenticateWithApple() {
  try {
    // Check if Apple Sign-In is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Apple Sign-In is not available on this device.',
      };
    }

    // Generate nonce for security
    const { nonce, hashedNonce } = await generateNonce();

    // Request Apple Sign-In to get fresh credentials
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

    // Re-authenticate the current user with fresh credential
    if (!auth.currentUser) {
      return {
        success: false,
        error: 'No user signed in.',
      };
    }

    await reauthenticateWithCredential(auth.currentUser, oauthCredential);
    Logger.debug('Apple re-authentication successful');

    return { success: true };
  } catch (error) {
    // Handle user cancellation
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
      return { success: false, cancelled: true };
    }

    Logger.error('Apple re-auth error:', error);
    return {
      success: false,
      error: 'Apple authentication failed. Please try again.',
    };
  }
}

/**
 * Check if user is currently signed in with Google
 * @returns {Promise<boolean>}
 */
export async function isGoogleSignedIn() {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return !!userInfo;
  } catch {
    return false;
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
