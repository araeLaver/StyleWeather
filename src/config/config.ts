import {
  APP_CONSTANTS,
  API_ENDPOINTS,
  DEFAULT_LOCATION,
  STYLE_OPTIONS,
  WEATHER_ICONS,
  ERROR_MESSAGES,
} from '../constants';
import type { EnvironmentConfig } from '../types';

// 환경 변수 타입 정의 및 파싱
const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
    OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    GOOGLE_CLOUD_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
    APP_ENV: (process.env.EXPO_PUBLIC_APP_ENV as 'development' | 'staging' | 'production') || 'development',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT ?? '') || APP_CONSTANTS.DEFAULT_API_TIMEOUT,
    CACHE_DURATION: parseInt(process.env.EXPO_PUBLIC_CACHE_DURATION ?? '') || APP_CONSTANTS.DEFAULT_CACHE_DURATION,
  };
};

// 메인 설정 객체
export const CONFIG = {
  // 환경 변수
  ...getEnvironmentConfig(),
  
  // API 엔드포인트
  OPENWEATHER_BASE_URL: API_ENDPOINTS.OPENWEATHER.BASE_URL,
  OPENAI_BASE_URL: API_ENDPOINTS.OPENAI.BASE_URL,
  
  // 소셜 미디어 설정
  FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  TWITTER_API_KEY: process.env.EXPO_PUBLIC_TWITTER_API_KEY,
  INSTAGRAM_CLIENT_ID: process.env.EXPO_PUBLIC_INSTAGRAM_CLIENT_ID,
  
  // Analytics 설정
  GOOGLE_ANALYTICS_ID: process.env.EXPO_PUBLIC_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  
  // 앱 상수
  APP_NAME: APP_CONSTANTS.NAME,
  VERSION: APP_CONSTANTS.VERSION,
  
  // 기본값
  DEFAULT_LOCATION,
  
  // 스타일 옵션
  STYLE_OPTIONS,
  
  // 날씨 아이콘 매핑
  WEATHER_ICONS,
} as const;

// API 키 유효성 검증 함수
export const validateConfig = (): boolean => {
  const errors: string[] = [];
  
  if (!CONFIG.OPENWEATHER_API_KEY) {
    errors.push(ERROR_MESSAGES.API_KEY_MISSING + ' (OpenWeather)');
  }
  
  if (!CONFIG.OPENAI_API_KEY) {
    console.warn('⚠️ EXPO_PUBLIC_OPENAI_API_KEY is not set - AI recommendations will use fallback logic');
  }
  
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase configuration is incomplete - data sync will be disabled');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
};

// 개발 모드에서 설정 상태 로깅
export const logConfigStatus = (): void => {
  if (CONFIG.APP_ENV === 'development') {
    console.log('🔧 StyleWeather Configuration Status:');
    console.log(`📱 App Environment: ${CONFIG.APP_ENV}`);
    console.log(`🌤️ OpenWeather API: ${CONFIG.OPENWEATHER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🤖 OpenAI API: ${CONFIG.OPENAI_API_KEY ? '✅ Configured' : '⚠️ Not set (using fallback)'}`);
    console.log(`🗄️ Supabase: ${CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY ? '✅ Configured' : '⚠️ Not set'}`);
    console.log(`⏱️ API Timeout: ${CONFIG.API_TIMEOUT}ms`);
    console.log(`💾 Cache Duration: ${CONFIG.CACHE_DURATION / 1000}s`);
    
    // 피처 플래그 상태도 로깅
    console.log('🎛️ Feature Flags:');
    console.log(`  Dark Mode: ${process.env.EXPO_PUBLIC_FEATURE_DARK_MODE !== 'false'}`);
    console.log(`  Photo Upload: ${process.env.EXPO_PUBLIC_FEATURE_PHOTO_UPLOAD !== 'false'}`);
    console.log(`  Social Sharing: ${process.env.EXPO_PUBLIC_FEATURE_SOCIAL_SHARING !== 'false'}`);
  }
};

// 설정 가져오기 헬퍼 함수
export const getConfig = () => CONFIG;

// 특정 설정값 가져오기 헬퍼 함수
export const getConfigValue = <K extends keyof typeof CONFIG>(key: K): typeof CONFIG[K] => {
  return CONFIG[key];
};

// 환경별 설정 확인
export const isDevelopment = (): boolean => CONFIG.APP_ENV === 'development';
export const isProduction = (): boolean => CONFIG.APP_ENV === 'production';
export const isStaging = (): boolean => CONFIG.APP_ENV === 'staging';

// API 키 존재 여부 확인 헬퍼
export const hasOpenWeatherAPI = (): boolean => !!CONFIG.OPENWEATHER_API_KEY;
export const hasOpenAI_API = (): boolean => !!CONFIG.OPENAI_API_KEY;
export const hasSupabase = (): boolean => !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

// 타입 export
export type ConfigType = typeof CONFIG;