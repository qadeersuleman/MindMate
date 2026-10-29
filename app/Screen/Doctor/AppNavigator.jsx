import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getSession } from '../../utils/session';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DoctorRegisterScreen from './DoctorRegisterScreen';
import DoctorDashboardScreen from './DoctorDashboardScreen';
import SetAvailabilityScreen from './SetAvailabilityScreen';
import SearchDoctorsScreen from './SearchDoctorsScreen';
import BookAppointmentScreen from './BookAppointmentScreen';
import PatientDashboardScreen from './PatientDashboardScreen';
import AppointmentDetailScreen from './AppointmentDetailScreen';
import VideoCallScreen from './VideoCallScreen';
import ChatScreen from './ChatScreen';

import Colors from '../../assets/colors.jsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Patient Tab Navigator
function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.brand.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="PatientDashboard" 
        component={PatientDashboardScreen}
        options={{
          headerShown : false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="SearchDoctors" 
        component={SearchDoctorsScreen}
        options={{
          headerShown : false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Doctor Tab Navigator
function DoctorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#6366F1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="DoctorDashboard" 
        component={DoctorDashboardScreen}
        options={{
          headerShown : false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Availability" 
        component={SetAvailabilityScreen}
        options={{
          headerShown : false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}



export default function AppNavigator({ userType }) {
  const [userRole, setUserRole] = useState(userType);
  const [loading, setLoading] = useState(!userType);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!userType) {
          const userData = await getSession();
          if (userData) {
            setUserRole(userData.role || 'user');
          } else {
            setUserRole('user');
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [userType]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={userRole === 'doctor' ? 'DoctorTabs' : 'PatientTabs'}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.brand.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
      }}
    >
      {userRole === 'doctor' ? (
        <>
          <Stack.Screen 
            name="DoctorTabs" 
            component={DoctorTabs} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AppointmentDetail" 
            component={AppointmentDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="VideoCall" 
            component={VideoCallScreen}
            options={{ 
              title: 'Video Consultation',
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="PatientTabs" 
            component={PatientTabs} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="DoctorRegister" 
            component={DoctorRegisterScreen}
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="BookAppointment" 
            component={BookAppointmentScreen}
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AppointmentDetail" 
            component={AppointmentDetailScreen}
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="VideoCall" 
            component={VideoCallScreen}
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ headerShown: false }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}