// Navigation Service
// Allows navigation from outside React components (e.g., notification handlers)
import { createNavigationContainerRef } from '@react-navigation/native';
import Logger from './LoggerService';

// Create a navigation ref that can be used outside of React components
export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen
 * Safe to call even if navigation isn't ready yet
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    Logger.warn('NavigationService: Navigation not ready, queuing navigation to', name);
    // Wait for navigation to be ready
    const checkReady = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(checkReady);
        navigationRef.navigate(name, params);
      }
    }, 100);
    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkReady), 5000);
  }
}

/**
 * Navigate to the Home tab
 * Used when user taps a notification
 */
export function navigateToHome() {
  Logger.debug('NavigationService: Navigating to Home tab');
  navigate('Home');
}

/**
 * Reset to the main tab navigator
 * Used for deep navigation resets
 */
export function resetToMain() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }
}

export default {
  navigationRef,
  navigate,
  navigateToHome,
  resetToMain,
};
