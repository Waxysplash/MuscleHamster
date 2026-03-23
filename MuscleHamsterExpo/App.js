import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth, AuthState } from './src/context/AuthContext';
import { UserProfileProvider, useUserProfile } from './src/context/UserProfileContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { FriendProvider } from './src/context/FriendContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { CustomWorkoutProvider } from './src/context/CustomWorkoutContext';
import { RoutineProvider } from './src/context/RoutineContext';
import { AlertProvider } from './src/context/AlertContext';
import {
  initializeNotificationService,
  setNotificationTapHandler,
} from './src/services/NotificationService';
import { navigationRef, navigateToHome } from './src/services/NavigationService';
import { NotificationType } from './src/models/NotificationPreferences';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import LoadingView from './src/components/LoadingView';
import ErrorBoundary from './src/components/ErrorBoundary';
import Logger from './src/services/LoggerService';

const RootStack = createNativeStackNavigator();

// Initialize notification service and set up tap handler
function NotificationInitializer({ children }) {
  useEffect(() => {
    // Initialize the notification service
    initializeNotificationService();

    // Set up the notification tap handler
    // This is called when user taps a notification
    setNotificationTapHandler((notificationType) => {
      Logger.debug('App: Notification tapped, type:', notificationType);

      // Navigate to Home tab for all notification types
      // The Home screen will show the appropriate state based on user's current streak/check-in status
      switch (notificationType) {
        case NotificationType.DAILY_REMINDER:
          Logger.debug('App: Daily reminder tapped, navigating to Home');
          navigateToHome();
          break;

        case NotificationType.STREAK_AT_RISK:
          Logger.debug('App: Streak at risk tapped, navigating to Home');
          navigateToHome();
          break;

        case NotificationType.FRIEND_NUDGE:
          Logger.debug('App: Friend nudge tapped, navigating to Home');
          navigateToHome();
          break;

        default:
          Logger.debug('App: Unknown notification type, navigating to Home');
          navigateToHome();
          break;
      }
    });
  }, []);

  return children;
}

function RootNavigator() {
  const { authState } = useAuth();
  const { isProfileComplete, isLoading: isProfileLoading } = useUserProfile();

  // Show loading while checking auth or profile
  if (authState === AuthState.UNKNOWN || isProfileLoading) {
    return <LoadingView message="Waking up your hamster..." />;
  }

  // Not authenticated - show auth flow
  if (authState === AuthState.UNAUTHENTICATED) {
    return <AuthNavigator />;
  }

  // Authenticated but profile not complete - show onboarding
  // When onboarding completes, isProfileComplete becomes true and RootNavigator
  // automatically switches to MainTabNavigator (no manual navigation needed)
  if (!isProfileComplete) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      </RootStack.Navigator>
    );
  }

  // Fully authenticated with complete profile
  return <MainTabNavigator />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationInitializer>
        <AuthProvider>
          <UserProfileProvider>
            <ActivityProvider>
              <ScheduleProvider>
                <InventoryProvider>
                  <CustomWorkoutProvider>
                    <RoutineProvider>
                      <FriendProvider>
                        <AlertProvider>
                        <NavigationContainer ref={navigationRef}>
                          <StatusBar style="auto" />
                          <RootNavigator />
                        </NavigationContainer>
                        </AlertProvider>
                      </FriendProvider>
                    </RoutineProvider>
                  </CustomWorkoutProvider>
                </InventoryProvider>
              </ScheduleProvider>
            </ActivityProvider>
          </UserProfileProvider>
        </AuthProvider>
      </NotificationInitializer>
    </ErrorBoundary>
  );
}
