import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import PasswordResetScreen from '../screens/Auth/PasswordResetScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: true,
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          headerShown: true,
          title: 'Sign In',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PasswordReset"
        component={PasswordResetScreen}
        options={{
          headerShown: true,
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}
