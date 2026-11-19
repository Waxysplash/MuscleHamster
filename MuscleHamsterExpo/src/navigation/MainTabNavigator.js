import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/Home';
import { DailyExerciseCheckInScreen } from '../screens/Home';
import { WorkoutsScreen, WorkoutDetailScreen, WorkoutPlayerScreen, GymBodyPartScreen, GymExerciseDetailScreen, HomeCategoryScreen, HomeExerciseDetailScreen, AddWorkoutScreen, CustomWorkoutDetailScreen, LogProgressScreen } from '../screens/Workout';
import { ShopScreen, ShopCategoryScreen } from '../screens/Shop';
import { RestDayCheckInScreen, StreakFreezeScreen, QuickRestDayScreen } from '../screens/Activity';
import { useFriends } from '../context/FriendContext';
import FeatureFlags, { showSocialTab } from '../config/FeatureFlags';
import { playSFX } from '../services/AudioService';
import { SoundEffect } from '../models/AudioPreferences';

// Settings screens
import {
  SettingsScreen,
  AccountSettingsScreen,
  AudioSettingsScreen,
  NotificationSettingsScreen,
  PointsHistoryScreen,
  PrivacySettingsScreen,
  ProfileSettingsScreen,
  ProfileVisibilityScreen,
} from '../screens/Settings';

// Social screens
import {
  SocialScreen,
  AddFriendsScreen,
  PendingRequestsScreen,
  FriendProfileScreen,
  BlockedUsersScreen,
} from '../screens/Social';

// Inventory screens
import {
  InventoryScreen,
  InventoryCategoryScreen,
  InventoryItemPreviewScreen,
} from '../screens/Inventory';

// Phase 2 tabs
import HamsterScreen from '../screens/Hamster/HamsterScreen';
import MeScreen from '../screens/Me/MeScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const WorkoutsStack = createNativeStackNavigator();
const SocialStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF4E6',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontFamily: 'Quicksand_700Bold', fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="RestDayCheckIn"
        component={RestDayCheckInScreen}
        options={{
          title: 'Rest Day',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="QuickRestDay"
        component={QuickRestDayScreen}
        options={{
          title: 'Rest Day',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="StreakFreeze"
        component={StreakFreezeScreen}
        options={{
          title: 'Streak Freeze',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="DailyExerciseCheckIn"
        component={DailyExerciseCheckInScreen}
        options={{
          title: "Today's Exercise",
          presentation: 'modal',
        }}
      />
      {/* Suggested workouts open straight from Today */}
      <HomeStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: 'Workout', headerBackTitle: 'Today' }}
      />
      <HomeStack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={{
          title: '',
          headerShown: false,
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
    </HomeStack.Navigator>
  );
}

function WorkoutsStackScreen() {
  return (
    <WorkoutsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF4E6',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontFamily: 'Quicksand_700Bold', fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <WorkoutsStack.Screen
        name="WorkoutsMain"
        component={WorkoutsScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="GymBodyPartWorkouts"
        component={GymBodyPartScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="GymExerciseDetail"
        component={GymExerciseDetailScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="HomeCategoryWorkouts"
        component={HomeCategoryScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="HomeExerciseDetail"
        component={HomeExerciseDetailScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: 'Workout' }}
      />
      <WorkoutsStack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={{
          title: '',
          headerShown: false,
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
      <WorkoutsStack.Screen
        name="AddWorkout"
        component={AddWorkoutScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <WorkoutsStack.Screen
        name="CustomWorkoutDetail"
        component={CustomWorkoutDetailScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="LogProgress"
        component={LogProgressScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </WorkoutsStack.Navigator>
  );
}

const HamsterStack = createNativeStackNavigator();

function HamsterStackScreen() {
  return (
    <HamsterStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFF4E6' },
        headerTintColor: '#4A3728',
        headerTitleStyle: { color: '#4A3728', fontFamily: 'Quicksand_700Bold', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <HamsterStack.Screen name="HamsterMain" component={HamsterScreen} options={{ headerShown: false }} />
      <HamsterStack.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop', headerBackTitle: 'Hamster' }} />
      <HamsterStack.Screen
        name="ShopCategory"
        component={ShopCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category
            ? route.params.category.charAt(0).toUpperCase() + route.params.category.slice(1)
            : 'Category',
        })}
      />
      <HamsterStack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: 'My Collection', presentation: 'modal' }}
      />
      <HamsterStack.Screen
        name="InventoryCategory"
        component={InventoryCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category
            ? route.params.category.charAt(0).toUpperCase() + route.params.category.slice(1)
            : 'Items',
        })}
      />
      <HamsterStack.Screen
        name="InventoryItemPreview"
        component={InventoryItemPreviewScreen}
        options={{ title: 'Preview', presentation: 'modal' }}
      />
    </HamsterStack.Navigator>
  );
}

function SocialStackScreen() {
  return (
    <SocialStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF4E6',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontFamily: 'Quicksand_700Bold', fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <SocialStack.Screen
        name="SocialMain"
        component={SocialScreen}
        options={{ headerShown: false }}
      />
      <SocialStack.Screen
        name="AddFriends"
        component={AddFriendsScreen}
        options={{ headerShown: false }}
      />
      <SocialStack.Screen
        name="PendingRequests"
        component={PendingRequestsScreen}
        options={{ headerShown: false }}
      />
      <SocialStack.Screen
        name="FriendProfile"
        component={FriendProfileScreen}
        options={{ headerShown: false }}
      />
      <SocialStack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ headerShown: false }}
      />
    </SocialStack.Navigator>
  );
}

// Social tab with badge for pending requests
function SocialTabIcon({ color, size }) {
  // Hook must be called unconditionally (React rules of hooks)
  const { pendingRequestCount = 0 } = useFriends();

  return (
    <View>
      <Ionicons name="people" size={size} color={color} />
      {pendingRequestCount > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>
            {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// Me tab: progress + all settings
const SettingsStack = createNativeStackNavigator();

function MeStackScreen() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF4E6',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontFamily: 'Quicksand_700Bold', fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <SettingsStack.Screen
        name="MeMain"
        component={MeScreen}
        options={{ title: 'Me' }}
      />
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
      <SettingsStack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{ title: 'My Profile' }}
      />
      <SettingsStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Reminders' }}
      />
      <SettingsStack.Screen
        name="AudioSettings"
        component={AudioSettingsScreen}
        options={{ title: 'Audio Settings' }}
      />
      <SettingsStack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: 'Privacy' }}
      />
      <SettingsStack.Screen
        name="ProfileVisibility"
        component={ProfileVisibilityScreen}
        options={{ title: 'Profile Visibility' }}
      />
      <SettingsStack.Screen
        name="PointsHistory"
        component={PointsHistoryScreen}
        options={{ title: 'Points History' }}
      />
      <SettingsStack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
}

export default function MainTabNavigator() {
  // Simplified MVP: No tab bar, just Home as hub
  if (!FeatureFlags.tabBarNavigation) {
    return <HomeStackScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Storybook tab bar: ink outline on top, active tab sits on a peach pill
        tabBarInactiveTintColor: '#6B5D52',
        tabBarActiveTintColor: '#4A3728',
        tabBarActiveBackgroundColor: '#FFE3B8',
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 4, marginVertical: 4 },
        tabBarLabelStyle: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
        tabBarStyle: {
          backgroundColor: '#FFF4E6',
          borderTopColor: '#4A3728',
          borderTopWidth: 2.5,
        },
      }}
      screenListeners={{
        tabPress: () => {
          playSFX(SoundEffect.BUTTON_TAP);
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sunny" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Today tab',
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Workouts tab',
        }}
      />
      {showSocialTab() && (
        <Tab.Screen
          name="Friends"
          component={SocialStackScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <SocialTabIcon color={color} size={size} />
            ),
            tabBarAccessibilityLabel: 'Friends tab',
          }}
        />
      )}
      <Tab.Screen
        name="Hamster"
        component={HamsterStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Hamster tab: shop and dress up',
        }}
      />
      <Tab.Screen
        name="Me"
        component={MeStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Me tab: progress and settings',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#C0392B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontFamily: 'Nunito_700Bold', fontSize: 10,
  },
});
