// 앱 상수 정의
export const APP_CONSTANTS = {
  NAME: 'StyleWeather',
  VERSION: '1.0.0',
  DEFAULT_CACHE_DURATION: 10 * 60 * 1000, // 10분
  DEFAULT_API_TIMEOUT: 10000, // 10초
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1초
} as const;

// 색상 상수
export const COLORS = {
  // 기본 색상
  primary: '#4A90E2',
  secondary: '#50E3C2',
  accent: '#F5A623',
  
  // 상태 색상
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // 중성 색상
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 배경 색상
  background: {
    primary: '#F5F7FA',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    light: '#FFFFFF',
  },
  
  // 텍스트 색상
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',
  },
  
  // 테마별 색상
  theme: {
    light: {
      background: '#F5F7FA',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    },
    dark: {
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
    },
  },
} as const;

// 폰트 크기 상수
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 48,
} as const;

// 간격 상수
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
} as const;

// 보더 반지름 상수
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// 그림자 상수
export const SHADOWS = {
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// 애니메이션 상수
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// 날씨 아이콘 매핑 (기존 config에서 이동)
export const WEATHER_ICONS = {
  '01d': '☀️', // clear sky day
  '01n': '🌙', // clear sky night
  '02d': '⛅', // few clouds day
  '02n': '☁️', // few clouds night
  '03d': '☁️', // scattered clouds
  '03n': '☁️',
  '04d': '☁️', // broken clouds
  '04n': '☁️',
  '09d': '🌧️', // shower rain
  '09n': '🌧️',
  '10d': '🌦️', // rain day
  '10n': '🌧️', // rain night
  '11d': '⛈️', // thunderstorm
  '11n': '⛈️',
  '13d': '❄️', // snow
  '13n': '❄️',
  '50d': '🌫️', // mist
  '50n': '🌫️'
} as const;

// 스타일 옵션 (기존 config에서 이동)
export const STYLE_OPTIONS = [
  { id: 'casual', name: '캐주얼', emoji: '👕' },
  { id: 'business', name: '비즈니스', emoji: '👔' },
  { id: 'formal', name: '포멀', emoji: '🤵' },
  { id: 'sporty', name: '스포티', emoji: '🏃‍♂️' },
  { id: 'trendy', name: '트렌디', emoji: '✨' }
] as const;

// 기본 위치 (서울)
export const DEFAULT_LOCATION = {
  latitude: 37.5665,
  longitude: 126.9780,
  city: 'Seoul'
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  OPENWEATHER: {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    WEATHER: '/weather',
    FORECAST: '/forecast',
  },
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    CHAT: '/chat/completions',
  },
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USER_SETTINGS: 'userSettings',
  USER_SCHEDULES: 'userSchedules',
  STYLE_HISTORY: 'styleHistory',
  CACHE_PREFIX: 'StyleWeather_Cache_',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  LAST_WEATHER_UPDATE: 'lastWeatherUpdate',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '인터넷 연결을 확인해주세요.',
  API_KEY_MISSING: 'API 키가 설정되지 않았습니다.',
  API_KEY_INVALID: 'API 키가 유효하지 않습니다.',
  LOCATION_PERMISSION_DENIED: '위치 권한이 필요합니다.',
  WEATHER_FETCH_FAILED: '날씨 정보를 가져올 수 없습니다.',
  AI_RECOMMENDATION_FAILED: 'AI 추천을 생성할 수 없습니다.',
  UNEXPECTED_ERROR: '예상치 못한 오류가 발생했습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: '설정이 저장되었습니다.',
  SCHEDULE_ADDED: '일정이 추가되었습니다.',
  SCHEDULE_UPDATED: '일정이 수정되었습니다.',
  SCHEDULE_DELETED: '일정이 삭제되었습니다.',
  FEEDBACK_SUBMITTED: '피드백이 전송되었습니다.',
  DATA_SYNCED: '데이터가 동기화되었습니다.',
} as const;

// 정규식 패턴
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// 지원하는 언어
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const;

// 환경별 설정
export const ENVIRONMENT_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    LOG_LEVEL: 'debug',
    ENABLE_FLIPPER: true,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.styleweather.com',
    LOG_LEVEL: 'info',
    ENABLE_FLIPPER: false,
  },
  production: {
    API_BASE_URL: 'https://api.styleweather.com',
    LOG_LEVEL: 'error',
    ENABLE_FLIPPER: false,
  },
} as const;

// 피처 플래그 (기능 토글)
export const FEATURE_FLAGS = {
  DARK_MODE: true,
  SOCIAL_SHARING: true,
  PHOTO_UPLOAD: true,
  OFFLINE_MODE: true,
  ANALYTICS: true,
  PUSH_NOTIFICATIONS: true,
  PREMIUM_FEATURES: false, // 향후 프리미엄 기능용
} as const;

// 성능 메트릭 임계값
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 5000, // 5초
  IMAGE_LOAD_TIME: 3000, // 3초
  CACHE_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB
  MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024, // 100MB
} as const;