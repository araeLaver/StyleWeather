import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import WeatherService from '../../services/WeatherService';
import type { WeatherData, WeatherForecast, ApiError } from '../../types';

// 날씨 상태 인터페이스
interface WeatherState {
  current: WeatherData | null;
  forecast: WeatherForecast[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
  };
  refreshing: boolean;
}

// 초기 상태
const initialState: WeatherState = {
  current: null,
  forecast: [],
  loading: false,
  error: null,
  lastUpdated: null,
  location: {
    latitude: null,
    longitude: null,
    city: null,
  },
  refreshing: false,
};

// 비동기 액션들

// 현재 날씨 가져오기
export const fetchCurrentWeather = createAsyncThunk(
  'weather/fetchCurrent',
  async (
    { latitude, longitude, useCache = true }: 
    { latitude: number; longitude: number; useCache?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const weatherData = await WeatherService.getCurrentWeather(latitude, longitude, useCache);
      return { weatherData, location: { latitude, longitude } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// 날씨 예보 가져오기
export const fetchWeatherForecast = createAsyncThunk(
  'weather/fetchForecast',
  async (
    { latitude, longitude, days = 5 }: 
    { latitude: number; longitude: number; days?: number },
    { rejectWithValue }
  ) => {
    try {
      const forecast = await WeatherService.getWeatherForecast(latitude, longitude, days);
      return forecast;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// 날씨 새로고침 (캐시 무시)
export const refreshWeatherData = createAsyncThunk(
  'weather/refresh',
  async (
    { latitude, longitude }: { latitude: number; longitude: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // 현재 날씨와 예보를 모두 새로 가져옴
      const [weatherResult, forecastResult] = await Promise.allSettled([
        dispatch(fetchCurrentWeather({ latitude, longitude, useCache: false })),
        dispatch(fetchWeatherForecast({ latitude, longitude }))
      ]);
      
      // 최소 하나의 요청이 성공하면 성공으로 간주
      if (weatherResult.status === 'fulfilled' || forecastResult.status === 'fulfilled') {
        return { refreshed: true };
      } else {
        throw new Error('날씨 정보를 새로고침할 수 없습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// 날씨 슬라이스 생성
const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    
    // 위치 설정
    setLocation: (state, action: PayloadAction<{
      latitude: number;
      longitude: number;
      city?: string;
    }>) => {
      state.location.latitude = action.payload.latitude;
      state.location.longitude = action.payload.longitude;
      if (action.payload.city) {
        state.location.city = action.payload.city;
      }
    },
    
    // 날씨 상태 초기화
    resetWeatherState: (state) => {
      Object.assign(state, initialState);
    },
    
    // 더미 데이터 설정 (개발/테스트용)
    setMockWeather: (state) => {
      state.current = WeatherService.getMockWeatherData();
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    // fetchCurrentWeather
    builder
      .addCase(fetchCurrentWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.weatherData;
        state.location.latitude = action.payload.location.latitude;
        state.location.longitude = action.payload.location.longitude;
        state.location.city = action.payload.weatherData.city;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchCurrentWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // fetchWeatherForecast
    builder
      .addCase(fetchWeatherForecast.pending, (state) => {
        // 예보만 로딩하는 경우는 전체 로딩 상태를 변경하지 않음
        if (!state.current) {
          state.loading = true;
        }
      })
      .addCase(fetchWeatherForecast.fulfilled, (state, action) => {
        state.forecast = action.payload;
        if (!state.current) {
          state.loading = false;
        }
      })
      .addCase(fetchWeatherForecast.rejected, (state, action) => {
        // 현재 날씨가 있으면 예보 에러는 무시
        if (!state.current) {
          state.loading = false;
          state.error = action.payload as string;
        }
      });
    
    // refreshWeatherData
    builder
      .addCase(refreshWeatherData.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshWeatherData.fulfilled, (state) => {
        state.refreshing = false;
        state.lastUpdated = Date.now();
      })
      .addCase(refreshWeatherData.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      });
  },
});

// 액션 export
export const {
  setLoading,
  clearError,
  setLocation,
  resetWeatherState,
  setMockWeather,
} = weatherSlice.actions;

// 셀렉터들
export const selectWeatherState = (state: { weather: WeatherState }) => state.weather;
export const selectCurrentWeather = (state: { weather: WeatherState }) => state.weather.current;
export const selectWeatherForecast = (state: { weather: WeatherState }) => state.weather.forecast;
export const selectWeatherLoading = (state: { weather: WeatherState }) => state.weather.loading;
export const selectWeatherError = (state: { weather: WeatherState }) => state.weather.error;
export const selectWeatherLocation = (state: { weather: WeatherState }) => state.weather.location;
export const selectWeatherRefreshing = (state: { weather: WeatherState }) => state.weather.refreshing;
export const selectLastUpdated = (state: { weather: WeatherState }) => state.weather.lastUpdated;

// 계산된 셀렉터들
export const selectWeatherDataAge = (state: { weather: WeatherState }) => {
  if (!state.weather.lastUpdated) return null;
  return Date.now() - state.weather.lastUpdated;
};

export const selectIsWeatherStale = (state: { weather: WeatherState }) => {
  const age = selectWeatherDataAge(state);
  return age ? age > 10 * 60 * 1000 : true; // 10분 이상이면 stale
};

export const selectHasWeatherData = (state: { weather: WeatherState }) => {
  return !!state.weather.current;
};

export const selectWeatherSummary = (state: { weather: WeatherState }) => {
  const current = state.weather.current;
  if (!current) return null;
  
  return {
    temperature: current.temperature,
    description: current.description,
    icon: current.icon,
    city: current.city,
    isStale: current.isStale || false,
  };
};

export default weatherSlice.reducer;