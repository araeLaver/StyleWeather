import { useEffect, useState, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setTheme, selectTheme } from '../store/slices/appSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';
type ColorScheme = 'light' | 'dark';

interface UseThemeReturn {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  isDarkMode: boolean;
  isSystemDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  colors: any;
}

const THEME_STORAGE_KEY = 'theme_preference';

export const useTheme = (): UseThemeReturn => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectTheme);
  const systemColorScheme = useColorScheme();
  const [isSystemDark, setIsSystemDark] = useState(systemColorScheme === 'dark');

  // 현재 적용된 색상 스키마 계산 (항상 라이트모드)
  const colorScheme: ColorScheme = 'light';

  const isDarkMode = false; // 다크모드 비활성화

  // 테마별 색상 정의
  const colors = {
    light: {
      // 기본 색상
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // 배경색
      background: {
        primary: '#FFFFFF',
        secondary: '#F8FAFC',
        tertiary: '#F1F5F9',
      },
      
      // 텍스트 색상
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        disabled: '#D1D5DB',
        inverse: '#FFFFFF',
      },
      
      // 경계선 및 구분선
      border: {
        light: '#F3F4F6',
        medium: '#E5E7EB',
        dark: '#D1D5DB',
      },
      
      // 카드 및 표면
      surface: {
        primary: '#FFFFFF',
        secondary: '#F8FAFC',
        elevated: '#FFFFFF',
      },
      
      // 그림자
      shadow: {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        dark: 'rgba(0, 0, 0, 0.2)',
      }
    },
    
    dark: {
      // 기본 색상 (다크모드에서는 조금 더 부드럽게)
      primary: '#60A5FA',
      secondary: '#9CA3AF',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      
      // 배경색 (밝게 조정)
      background: {
        primary: '#2A2D3A',     // 훨씬 더 밝게
        secondary: '#363A4A',   // 밝은 보조 배경
        tertiary: '#424856',    // 더 밝은 삼차 배경
      },
      
      // 텍스트 색상 (높은 대비)
      text: {
        primary: '#FFFFFF',     // 완전한 흰색
        secondary: '#E5E7EB',   // 매우 밝은 보조 텍스트
        tertiary: '#C7C9CD',    // 밝은 삼차 텍스트
        disabled: '#9CA3AF',    // 밝은 비활성 색상
        inverse: '#2A2D3A',
      },
      
      // 경계선 및 구분선 (구분 명확화)
      border: {
        light: '#3A3D47',       // 더 밝은 경계선
        medium: '#4A4F5A',      // 중간 강도
        dark: '#5A616C',        // 강한 경계선
      },
      
      // 카드 및 표면 (밝게 조정)
      surface: {
        primary: '#363A4A',     // 밝은 주 표면
        secondary: '#424856',   // 더 밝은 보조 표면
        elevated: '#4E5562',    // 매우 밝은 상승 표면
      },
      
      // 그림자 (다크모드에서는 더 진하게)
      shadow: {
        light: 'rgba(0, 0, 0, 0.2)',
        medium: 'rgba(0, 0, 0, 0.3)',
        dark: 'rgba(0, 0, 0, 0.5)',
      }
    }
  };

  // 테마 모드 변경
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      dispatch(setTheme(mode));
      console.log('Theme mode changed to:', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [dispatch]);

  // 테마 토글 (light ↔ dark, auto는 시스템 설정에 따라)
  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [isDarkMode, setThemeMode]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      console.log('System color scheme changed to:', newColorScheme);
      setIsSystemDark(newColorScheme === 'dark');
    });

    return () => subscription?.remove();
  }, []);

  // 앱 시작시 저장된 테마 설정 로드
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          dispatch(setTheme(savedTheme as ThemeMode));
          console.log('Loaded theme preference:', savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, [dispatch]);

  return {
    themeMode,
    colorScheme,
    isDarkMode,
    isSystemDark,
    setThemeMode,
    toggleTheme,
    colors: colors[colorScheme],
  };
};