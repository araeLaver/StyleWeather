import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import type { UserPreferences, Schedule, StyleRecommendation } from '../../types';

// 기본 사용자 설정
const getDefaultUserPreferences = (): UserPreferences => ({
  gender: 'male',
  ageRange: '20-29',
  occupation: '직장인',
  stylePreference: 'casual',
  notifications: true,
  weatherAlerts: true,
  autoRecommendation: true,
  preferredColors: ['black', 'white', 'navy'],
  budgetRange: 'medium',
  bodyType: 'average',
  skinTone: 'medium',
  lifestyle: 'active',
  weatherSensitivity: 'normal',
  formalLevel: 'business_casual',
  brandPreferences: [],
  avoidColors: [],
  specialNeeds: [],
  locationSharing: true,
  dataSync: true,
  pushTiming: 'morning',
  language: 'ko',
  units: 'metric',
});

// 사용자 상태 인터페이스
interface UserState {
  preferences: UserPreferences;
  schedules: Schedule[];
  history: StyleRecommendation[];
  loading: boolean;
  error: string | null;
  isFirstTime: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

// 초기 상태
const initialState: UserState = {
  preferences: getDefaultUserPreferences(),
  schedules: [],
  history: [],
  loading: false,
  error: null,
  isFirstTime: true,
  syncStatus: 'idle',
};

// 비동기 액션들

// 사용자 설정 로드
export const loadUserPreferences = createAsyncThunk(
  'user/loadPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // 기본값과 병합하여 누락된 설정값 보완
        const mergedSettings = { ...getDefaultUserPreferences(), ...parsed };
        return mergedSettings;
      }
      return getDefaultUserPreferences();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load preferences';
      return rejectWithValue(errorMessage);
    }
  }
);

// 사용자 설정 저장
export const saveUserPreferences = createAsyncThunk(
  'user/savePreferences',
  async (preferences: UserPreferences, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(preferences));
      return preferences;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      return rejectWithValue(errorMessage);
    }
  }
);

// 일정 로드
export const loadUserSchedules = createAsyncThunk(
  'user/loadSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const savedSchedules = await AsyncStorage.getItem(STORAGE_KEYS.USER_SCHEDULES);
      if (savedSchedules) {
        return JSON.parse(savedSchedules) as Schedule[];
      }
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load schedules';
      return rejectWithValue(errorMessage);
    }
  }
);

// 일정 저장
export const saveUserSchedules = createAsyncThunk(
  'user/saveSchedules',
  async (schedules: Schedule[], { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SCHEDULES, JSON.stringify(schedules));
      return schedules;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save schedules';
      return rejectWithValue(errorMessage);
    }
  }
);

// 스타일 히스토리 로드
export const loadStyleHistory = createAsyncThunk(
  'user/loadHistory',
  async (_, { rejectWithValue }) => {
    try {
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEYS.STYLE_HISTORY);
      if (savedHistory) {
        return JSON.parse(savedHistory) as StyleRecommendation[];
      }
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
      return rejectWithValue(errorMessage);
    }
  }
);

// 스타일 히스토리에 추가
export const addToStyleHistory = createAsyncThunk(
  'user/addToHistory',
  async (recommendation: StyleRecommendation, { getState, rejectWithValue }) => {
    try {
      const currentState = getState() as { user: UserState };
      const newHistory = [recommendation, ...currentState.user.history].slice(0, 100); // 최대 100개 유지
      await AsyncStorage.setItem(STORAGE_KEYS.STYLE_HISTORY, JSON.stringify(newHistory));
      return newHistory;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to history';
      return rejectWithValue(errorMessage);
    }
  }
);

// 사용자 슬라이스 생성
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 설정 업데이트 (로컬)
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 일정 추가
    addSchedule: (state, action: PayloadAction<Schedule>) => {
      state.schedules.push(action.payload);
    },
    
    // 일정 업데이트
    updateSchedule: (state, action: PayloadAction<{ id: string; updates: Partial<Schedule> }>) => {
      console.log('Redux updateSchedule 실행:', action.payload.id, action.payload.updates);
      const index = state.schedules.findIndex(s => s.id === action.payload.id);
      console.log('찾은 일정 인덱스:', index);
      if (index !== -1) {
        console.log('기존 일정:', state.schedules[index]);
        state.schedules[index] = { ...state.schedules[index], ...action.payload.updates };
        console.log('업데이트된 일정:', state.schedules[index]);
      } else {
        console.log('일정을 찾을 수 없음');
      }
    },
    
    // 일정 삭제
    deleteSchedule: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter(s => s.id !== action.payload);
    },
    
    // 일정 배열 전체 교체
    setSchedules: (state, action: PayloadAction<Schedule[]>) => {
      state.schedules = action.payload;
    },
    
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    
    // 첫 실행 완료 표시
    setNotFirstTime: (state) => {
      state.isFirstTime = false;
    },
    
    // 동기화 상태 설정
    setSyncStatus: (state, action: PayloadAction<'idle' | 'syncing' | 'success' | 'error'>) => {
      state.syncStatus = action.payload;
    },
    
    // 사용자 상태 초기화
    resetUserState: (state) => {
      Object.assign(state, initialState);
    },
    
    // 스타일 히스토리 클리어
    clearStyleHistory: (state) => {
      state.history = [];
    },
    
    // 특정 날짜의 일정 가져오기 (computed)
    // 이것은 selector로 이동해야 함
  },
  extraReducers: (builder) => {
    // loadUserPreferences
    builder
      .addCase(loadUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.isFirstTime = false;
      })
      .addCase(loadUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // saveUserPreferences
    builder
      .addCase(saveUserPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // loadUserSchedules
    builder
      .addCase(loadUserSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
      })
      .addCase(loadUserSchedules.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // saveUserSchedules
    builder
      .addCase(saveUserSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload;
      })
      .addCase(saveUserSchedules.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // loadStyleHistory
    builder
      .addCase(loadStyleHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(loadStyleHistory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // addToStyleHistory
    builder
      .addCase(addToStyleHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(addToStyleHistory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 액션 export
export const {
  updatePreferences,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  setSchedules,
  clearError,
  setNotFirstTime,
  setSyncStatus,
  resetUserState,
  clearStyleHistory,
} = userSlice.actions;

// 셀렉터들
export const selectUserState = (state: { user: UserState }) => state.user;
export const selectUserPreferences = (state: { user: UserState }) => state.user.preferences;
export const selectUserSchedules = (state: { user: UserState }) => state.user.schedules;
export const selectStyleHistory = (state: { user: UserState }) => state.user.history;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectIsFirstTime = (state: { user: UserState }) => state.user.isFirstTime;
export const selectSyncStatus = (state: { user: UserState }) => state.user.syncStatus;

// 계산된 셀렉터들
export const selectSchedulesForDate = (state: { user: UserState }, dateString: string) => {
  return state.user.schedules.filter(schedule => {
    const scheduleDate = schedule.date || new Date().toISOString().split('T')[0];
    return scheduleDate === dateString;
  }).sort((a, b) => {
    const timeA = a.time.replace(':', '');
    const timeB = b.time.replace(':', '');
    return timeA.localeCompare(timeB);
  });
};

export const selectTodaySchedules = (state: { user: UserState }) => {
  const today = new Date().toISOString().split('T')[0];
  return selectSchedulesForDate(state, today);
};

export const selectUpcomingSchedules = (state: { user: UserState }, days: number = 7) => {
  const now = new Date();
  const upcoming = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const daySchedules = selectSchedulesForDate(state, dateString);
    if (daySchedules.length > 0) {
      upcoming.push({
        date: dateString,
        schedules: daySchedules,
      });
    }
  }
  
  return upcoming;
};

export const selectStylePreferenceSummary = (state: { user: UserState }) => {
  const prefs = state.user.preferences;
  return {
    primaryStyle: prefs.stylePreference,
    colors: prefs.preferredColors.length,
    avoidedColors: prefs.avoidColors.length,
    notifications: prefs.notifications,
    language: prefs.language,
  };
};

export const selectRecentHistory = (state: { user: UserState }, limit: number = 10) => {
  return state.user.history.slice(0, limit);
};

export default userSlice.reducer;