import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppState } from '../../types';
import OfflineManager from '../../utils/OfflineManager';

// 오프라인 큐 아이템 타입
interface OfflineQueueItem {
  id: string;
  type: 'weather' | 'recommendation' | 'schedule' | 'preference';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

// 초기 상태 정의
const initialState: AppState = {
  isLoading: false,
  isOffline: false,
  theme: 'auto',
  configError: null,
};

// 오프라인 데이터 동기화 Thunk
export const syncOfflineData = createAsyncThunk(
  'app/syncOfflineData',
  async (item: OfflineQueueItem, { rejectWithValue }) => {
    try {
      console.log(`Syncing offline item: ${item.type} - ${item.action}`);
      
      // 실제 API 호출 로직
      // 여기서는 각 타입별로 적절한 API 호출을 수행
      switch (item.type) {
        case 'weather':
          // 날씨 데이터 동기화 (보통은 서버에서 가져오는 것이므로 스킵)
          console.log('Weather data sync skipped (read-only)');
          return { success: true, item };
          
        case 'recommendation':
          // 추천 피드백 동기화
          console.log('Syncing recommendation feedback:', item.data);
          // 실제로는 API 호출
          return { success: true, item };
          
        case 'schedule':
          // 일정 동기화
          console.log('Syncing schedule:', item.action, item.data);
          // 실제로는 API 호출
          return { success: true, item };
          
        case 'preference':
          // 사용자 설정 동기화
          console.log('Syncing preferences:', item.data);
          // 실제로는 API 호출
          return { success: true, item };
          
        default:
          console.warn('Unknown item type:', item.type);
          return { success: false, item, error: 'Unknown item type' };
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      return rejectWithValue({ 
        success: false, 
        item, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
);

// 캐시 정리 Thunk
export const cleanupCache = createAsyncThunk(
  'app/cleanupCache',
  async (_, { rejectWithValue }) => {
    try {
      const offlineManager = OfflineManager.getInstance();
      await offlineManager.cleanupExpiredCache();
      const stats = await offlineManager.getCacheStats();
      
      console.log('Cache cleanup completed:', stats);
      return { success: true, stats };
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
      return rejectWithValue({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// App 슬라이스 생성
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // 오프라인 상태 설정
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    
    // 테마 변경
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    
    // 설정 오류 설정
    setConfigError: (state, action: PayloadAction<string | null>) => {
      state.configError = action.payload;
    },
    
    // 앱 상태 초기화
    resetAppState: (state) => {
      Object.assign(state, initialState);
    },
    
    // 앱 시작시 초기화
    initializeApp: (state) => {
      state.isLoading = true;
      state.configError = null;
    },
    
    // 앱 초기화 완료
    appInitialized: (state) => {
      state.isLoading = false;
    },
  },
});

// 액션 export
export const {
  setLoading,
  setOfflineStatus,
  setTheme,
  setConfigError,
  resetAppState,
  initializeApp,
  appInitialized,
} = appSlice.actions;

// 셀렉터들
export const selectAppState = (state: { app: AppState }) => state.app;
export const selectIsLoading = (state: { app: AppState }) => state.app.isLoading;
export const selectIsOffline = (state: { app: AppState }) => state.app.isOffline;
export const selectTheme = (state: { app: AppState }) => state.app.theme;
export const selectConfigError = (state: { app: AppState }) => state.app.configError;

// 계산된 셀렉터들
export const selectIsDarkMode = (state: { app: AppState }) => {
  const { theme } = state.app;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  // auto인 경우 시스템 설정을 따름 (실제 구현에서는 시스템 테마 감지 필요)
  return false;
};

export const selectAppReady = (state: { app: AppState }) => {
  return !state.app.isLoading && !state.app.configError;
};

export default appSlice.reducer;