import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';

import HomeScreen from './src/screens/HomeScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import CustomSplashScreen from './src/components/SplashScreen';
import { ThemeProvider } from './src/components/ThemeProvider';
import { validateConfig, logConfigStatus } from './src/config/config';
import { COLORS } from './src/constants';
import store from './src/store';
import type { RootStackParamList } from './src/types';

const Tab = createBottomTabNavigator<RootStackParamList>();

interface TabIconProps {
  focused: boolean;
  name: keyof RootStackParamList;
}

function TabIcon({ focused, name }: TabIconProps): JSX.Element {
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
  
  return <Text style={styles.tabIcon}>{icon}</Text>;
}

// 내부 컴포넌트: 테마를 사용하는 내비게이션  
function ThemedNavigation(): JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => TabIcon({ focused, name: route.name }),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray[400],
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
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
    </NavigationContainer>
  );
}

export default function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        // 앱 시작시 설정 검증 및 로깅
        validateConfig();
        logConfigStatus();
      } catch (error) {
        console.error('Configuration validation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown configuration error';
        setConfigError(errorMessage);
      }
    };

    initializeApp();
  }, []);

  const handleSplashFinish = (): void => {
    setIsLoading(false);
  };

  // 설정 오류가 있는 경우 에러 화면 표시
  if (configError) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚙️</Text>
            <Text style={styles.errorTitle}>설정 오류</Text>
            <Text style={styles.errorMessage}>{configError}</Text>
            <Text style={styles.errorHint}>.env 파일을 확인해주세요.</Text>
          </View>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>
          <SafeAreaProvider>
            <ThemedNavigation />
          </SafeAreaProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: 5,
    paddingBottom: 5,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background.light,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorHint: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});