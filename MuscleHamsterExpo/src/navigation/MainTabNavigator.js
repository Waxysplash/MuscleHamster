import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/Home';
import { DailyExerciseCheckInScreen } from '../screens/Home';
import { WorkoutsScreen, WorkoutDetailScreen, WorkoutPlayerScreen, GymBodyPartScreen, GymExerciseDetailScreen, HomeCategoryScreen, HomeExerciseDetailScreen } from '../screens/Workout';
import { ShopScreen, ShopCategoryScreen } from '../screens/Shop';
import { RestDayCheckInScreen, StreakFreezeScreen } from '../screens/Activity';
import { useActivity } from '../context/ActivityContext';
import { useFriends } from '../context/FriendContext';
import FeatureFlags from '../config/FeatureFlags';

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

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const WorkoutsStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const SocialStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF8F0',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontWeight: '600',
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
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <HomeStack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
      <HomeStack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{ title: 'My Profile' }}
      />
      <HomeStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Reminders' }}
      />
      <HomeStack.Screen
        name="AudioSettings"
        component={AudioSettingsScreen}
        options={{ title: 'Audio Settings' }}
      />
      <HomeStack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: 'Privacy' }}
      />
      <HomeStack.Screen
        name="ProfileVisibility"
        component={ProfileVisibilityScreen}
        options={{ title: 'Profile Visibility' }}
      />
      <HomeStack.Screen
        name="PointsHistory"
        component={PointsHistoryScreen}
        options={{ title: 'Points History' }}
      />
      <HomeStack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ headerShown: false }}
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
      <HomeStack.Screen
        name="Shop"
        component={ShopScreen}
        options={{ title: 'Shop' }}
      />
      <HomeStack.Screen
        name="ShopCategory"
        component={ShopCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category
            ? route.params.category.charAt(0).toUpperCase() + route.params.category.slice(1)
            : 'Category',
        })}
      />
      <HomeStack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: 'My Collection',
          presentation: 'modal',
        }}
      />
      <HomeStack.Screen
        name="InventoryCategory"
        component={InventoryCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category
            ? route.params.category.charAt(0).toUpperCase() + route.params.category.slice(1)
            : 'Items',
        })}
      />
      <HomeStack.Screen
        name="InventoryItemPreview"
        component={InventoryItemPreviewScreen}
        options={{
          title: 'Preview',
          presentation: 'modal',
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
          backgroundColor: '#FFF8F0',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontWeight: '600',
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
    </WorkoutsStack.Navigator>
  );
}

function ShopStackScreen() {
  const { totalPoints } = useActivity();

  return (
    <ShopStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF8F0',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <ShopStack.Screen
        name="ShopMain"
        component={ShopScreen}
        options={{
          title: 'Shop',
          headerRight: () => (
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={16} color="#FF9500" />
              <Text style={styles.pointsText}>{totalPoints}</Text>
            </View>
          ),
        }}
      />
      <ShopStack.Screen
        name="ShopCategory"
        component={ShopCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category
            ? route.params.category.charAt(0).toUpperCase() + route.params.category.slice(1)
            : 'Category',
        })}
      />
      <ShopStack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: 'My Collection',
          presentation: 'modal',
        }}
      />
      <ShopStack.Screen
        name="InventoryCategory"
        component={InventoryCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category
            ? route.params.category.charAt(0).toUpperCase() + route.params.category.slice(1)
            : 'Items',
        })}
      />
      <ShopStack.Screen
        name="InventoryItemPreview"
        component={InventoryItemPreviewScreen}
        options={{
          title: 'Preview',
          presentation: 'modal',
        }}
      />
    </ShopStack.Navigator>
  );
}

function SocialStackScreen() {
  return (
    <SocialStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF8F0',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontWeight: '600',
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
  let pendingCount = 0;
  try {
    const { pendingRequestCount } = useFriends();
    pendingCount = pendingRequestCount;
  } catch (e) {
    // Context not available
  }

  return (
    <View>
      <Ionicons name="people" size={size} color={color} />
      {pendingCount > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>
            {pendingCount > 9 ? '9+' : pendingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// Settings stack for tab
const SettingsStack = createNativeStackNavigator();

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF8F0',
        },
        headerTintColor: '#4A3728',
        headerTitleStyle: {
          color: '#4A3728',
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
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
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFF8F0',
          borderTopColor: 'rgba(139,90,43,0.1)',
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Shop tab',
          title: 'Shop',
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
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,149,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 4,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
