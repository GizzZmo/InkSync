import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, MainTabParamList } from '../types';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main tab screens
import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import AppointmentListScreen from '../screens/bookings/AppointmentListScreen';
import ChatListScreen from '../screens/messages/ChatListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Detail screens
import ArtistDetailScreen from '../screens/explore/ArtistDetailScreen';
import BookingCreateScreen from '../screens/bookings/BookingCreateScreen';
import AppointmentDetailScreen from '../screens/bookings/AppointmentDetailScreen';
import ChatRoomScreen from '../screens/messages/ChatRoomScreen';
import WaiverSignScreen from '../screens/bookings/WaiverSignScreen';
import AftercareScreen from '../screens/aftercare/AftercareScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'InkSync' }} />
      <HomeStack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ title: 'Artist Profile' }} />
      <HomeStack.Screen name="BookingCreate" component={BookingCreateScreen} options={{ title: 'Book Appointment' }} />
      <HomeStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
    </HomeStack.Navigator>
  );
}

function BookingsNavigator() {
  return (
    <BookingsStack.Navigator>
      <BookingsStack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'My Bookings' }} />
      <BookingsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
      <BookingsStack.Screen name="WaiverSign" component={WaiverSignScreen} options={{ title: 'Sign Waiver' }} />
      <BookingsStack.Screen name="Aftercare" component={AftercareScreen} options={{ title: 'Aftercare' }} />
    </BookingsStack.Navigator>
  );
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
      <MessagesStack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ title: 'Chat' }} />
    </MessagesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Bookings" component={BookingsNavigator} />
      <Tab.Screen name="Messages" component={MessagesNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
