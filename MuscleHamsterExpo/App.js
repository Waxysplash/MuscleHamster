import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth, AuthState } from './src/context/AuthContext';
import { UserProfileProvider, useUserProfile } from './src/context/UserProfileContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { FriendProvider } from './src/context/FriendContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { CustomWorkoutProvider } from './src/context/CustomWorkoutContext';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import LoadingView from './src/components/LoadingView';
import ErrorBoundary from './src/components/ErrorBoundary';

const RootStack = createNativeStackNavigator();

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
      <AuthProvider>
        <UserProfileProvider>
          <ActivityProvider>
            <InventoryProvider>
              <CustomWorkoutProvider>
                <FriendProvider>
                  <NotificationProvider>
                    <NavigationContainer>
                      <StatusBar style="auto" />
                      <RootNavigator />
                    </NavigationContainer>
                  </NotificationProvider>
                </FriendProvider>
              </CustomWorkoutProvider>
            </InventoryProvider>
          </ActivityProvider>
        </UserProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
