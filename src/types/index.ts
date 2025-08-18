// 날씨 관련 타입 정의
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  city: string;
  country: string;
  timestamp: number;
  isStale?: boolean;
  isMock?: boolean;
}

export interface WeatherForecast {
  datetime: Date;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

// AI 추천 관련 타입 정의
export interface StyleRecommendation {
  top?: string;
  bottom?: string;
  outer?: string;
  shoes?: string;
  accessories?: string;
  reason?: string;
  confidence?: number;
  timestamp?: number;
}

export interface UserPreferences {
  gender: 'male' | 'female' | 'other';
  ageRange: '10-19' | '20-29' | '30-39' | '40-49' | '50+';
  occupation: string;
  stylePreference: 'casual' | 'business' | 'formal' | 'sporty' | 'trendy';
  notifications: boolean;
  weatherAlerts: boolean;
  autoRecommendation: boolean;
  preferredColors: string[];
  budgetRange: 'very_low' | 'low' | 'medium' | 'high';
  bodyType: 'slim' | 'average' | 'curvy' | 'athletic';
  skinTone: 'light' | 'medium' | 'dark' | 'warm' | 'cool';
  lifestyle: 'active' | 'relaxed' | 'business' | 'creative' | 'natural';
  weatherSensitivity: 'very_cold' | 'cold' | 'normal' | 'warm' | 'very_warm';
  formalLevel: 'very_formal' | 'formal' | 'business_casual' | 'casual' | 'very_casual';
  brandPreferences: string[];
  avoidColors: string[];
  specialNeeds: string[];
  locationSharing: boolean;
  dataSync: boolean;
  pushTiming: 'early_morning' | 'morning' | 'late_morning' | 'evening';
  language: 'ko' | 'en' | 'ja';
  units: 'metric' | 'imperial';
}

// 일정 관련 타입 정의
export interface Schedule {
  id: string;
  title: string;
  time: string;
  type: 'business' | 'casual' | 'date' | 'exercise' | 'formal';
  location?: string;
  description?: string;
  date: string;
  recommendedStyle?: StyleRecommendation;
}

export type ScheduleType = Schedule['type'];

// 네비게이션 관련 타입 정의
export type RootStackParamList = {
  Home: undefined;
  Schedule: undefined;
  Settings: undefined;
  Analytics?: undefined;
};

// API 관련 타입 정의
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  loading?: boolean;
}

// 캐시 관련 타입 정의
export interface CacheData<T> {
  data: T;
  timestamp: number;
  expireTime: number;
}

export interface CacheStatus {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  totalSize: number;
  totalSizeKB: number;
}

// 앱 상태 관련 타입 정의
export interface AppState {
  isLoading: boolean;
  isOffline: boolean;
  theme: 'light' | 'dark' | 'auto';
  configError: string | null;
}

// Redux 스토어 타입 정의 (나중에 구현할 때 사용)
export interface RootState {
  app: AppState;
  weather: {
    current: WeatherData | null;
    forecast: WeatherForecast[];
    loading: boolean;
    error: string | null;
  };
  user: {
    preferences: UserPreferences;
    schedules: Schedule[];
    history: StyleRecommendation[];
  };
  recommendations: {
    current: StyleRecommendation | null;
    loading: boolean;
    error: string | null;
  };
}

// 쇼핑 관련 타입 re-export
export type { 
  Product, 
  WeatherBasedRecommendation, 
  ShoppingRecommendation,
  ProductCategory,
  Mall 
} from './shopping';

// 유틸리티 타입들
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// 컴포넌트 Props 타입들
export interface BaseComponentProps {
  style?: any;
  testID?: string;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

// 환경 변수 타입 정의
export interface EnvironmentConfig {
  OPENWEATHER_API_KEY?: string;
  OPENAI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  GOOGLE_CLOUD_API_KEY?: string;
  APP_ENV: 'development' | 'staging' | 'production';
  API_TIMEOUT: number;
  CACHE_DURATION: number;
}

// 이벤트 타입 정의
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export interface AnalyticsEvent extends AppEvent {
  category: 'user_action' | 'weather' | 'recommendation' | 'error';
  action: string;
  label?: string;
  value?: number;
}