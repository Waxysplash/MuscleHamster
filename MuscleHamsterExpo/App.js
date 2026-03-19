import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth, AuthState } from './src/context/AuthContext';
import { UserProfileProvider, useUserProfile } from './src/context/UserProfileContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { FriendProvider } from './src/context/FriendContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { CustomWorkoutProvider } from './src/context/CustomWorkoutContext';
import { AlertProvider } from './src/context/AlertContext';
import { initializeNotificationService } from './src/services/NotificationService';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import LoadingView from './src/components/LoadingView';
import ErrorBoundary from './src/components/ErrorBoundary';

const RootStack = createNativeStackNavigator();

// Initialize notification service on app start
function NotificationInitializer({ children }) {
  useEffect(() => {
    initializeNotificationService();
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
              <InventoryProvider>
                <CustomWorkoutProvider>
                  <FriendProvider>
                    <AlertProvider>
                      <NavigationContainer>
                        <StatusBar style="auto" />
                        <RootNavigator />
                      </NavigationContainer>
                    </AlertProvider>
                  </FriendProvider>
                </CustomWorkoutProvider>
              </InventoryProvider>
            </ActivityProvider>
          </UserProfileProvider>
        </AuthProvider>
      </NotificationInitializer>
    </ErrorBoundary>
  );
}
