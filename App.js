import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ focused, name }) {
  let icon = '';
  
  switch (name) {
    case 'Home':
      icon = focused ? '🏠' : '🏡';
      break;
    case 'Schedule':
      icon = focused ? '📅' : '📆';
      break;
    case 'Settings':
      icon = focused ? '⚙️' : '⚙';
      break;
    default:
      icon = '📱';
  }
  
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => TabIcon({ focused, name: route.name }),
            tabBarActiveTintColor: '#4299e1',
            tabBarInactiveTintColor: '#a0aec0',
            tabBarStyle: {
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#e2e8f0',
              paddingTop: 5,
              paddingBottom: 5,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: '홈' }}
          />
          <Tab.Screen 
            name="Schedule" 
            component={ScheduleScreen}
            options={{ title: '일정' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: '설정' }}
          />
        </Tab.Navigator>
        <StatusBar style="light" backgroundColor="#2d3748" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
