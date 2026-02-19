import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import {
  getGoogleWebClientId,
  getGoogleIosClientId,
  getGoogleAndroidClientId,
  signInWithGoogleToken,
} from '../services/SocialAuthService';

// Required for web browser redirect
WebBrowser.maybeCompleteAuthSession();

// Generate the redirect URI for the current platform
const redirectUri = makeRedirectUri({
  scheme: 'musclehamster',
  // For web, use the current origin
  ...(Platform.OS === 'web' && { path: '' }),
});

// Log the redirect URI so developers can add it to Google Cloud Console
console.log('Google OAuth Redirect URI:', redirectUri);

/**
 * Custom hook for Google OAuth authentication
 * Handles the OAuth flow and Firebase sign-in
 *
 * @returns {{
 *   signIn: () => Promise<void>,
 *   loading: boolean,
 *   error: string | null,
 *   redirectUri: string
 * }}
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure Google OAuth request with platform-specific client IDs
  // - webClientId is used for Expo Go development
  // - iosClientId is used for native iOS builds
  // - androidClientId is used for native Android builds
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: getGoogleWebClientId(),
    iosClientId: getGoogleIosClientId() || undefined,
    androidClientId: getGoogleAndroidClientId() || undefined,
    redirectUri,
  });

  // Handle OAuth response
  useEffect(() => {
    async function handleResponse() {
      if (response?.type === 'success') {
        setLoading(true);
        setError(null);

        const { id_token } = response.params;
        const result = await signInWithGoogleToken(id_token);

        if (!result.success) {
          setError(result.error);
        }
        // Auth state listener in AuthContext will handle navigation

        setLoading(false);
      } else if (response?.type === 'error') {
        setError('Google Sign-In failed. Please try again.');
        setLoading(false);
      } else if (response?.type === 'dismiss') {
        // User cancelled - no error needed
        setLoading(false);
      }
    }

    handleResponse();
  }, [response]);

  const signIn = useCallback(async () => {
    if (!request) {
      setError('Google Sign-In is not ready. Please try again.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await promptAsync();
      // Response will be handled by useEffect above
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError('Google Sign-In failed. Please try again.');
      setLoading(false);
    }
  }, [request, promptAsync]);

  return {
    signIn,
    loading,
    error,
    isReady: !!request,
    redirectUri,
  };
}
