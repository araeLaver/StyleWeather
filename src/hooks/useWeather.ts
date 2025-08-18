import { useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCurrentWeather,
  fetchWeatherForecast,
  refreshWeatherData,
  setLocation,
  clearError,
  selectCurrentWeather,
  selectWeatherForecast,
  selectWeatherLoading,
  selectWeatherError,
  selectWeatherLocation,
  selectWeatherRefreshing,
  selectLastUpdated,
  selectIsWeatherStale,
  selectHasWeatherData,
} from '../store/slices/weatherSlice';
import { CONFIG } from '../config/config';
import type { WeatherData } from '../types';

interface UseWeatherReturn {
  // 상태
  currentWeather: WeatherData | null;
  forecast: any[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  lastUpdated: number | null;
  isStale: boolean;
  hasData: boolean;
  location: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
  };
  
  // 액션
  loadWeather: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  clearWeatherError: () => void;
  requestLocationPermission: () => Promise<boolean>;
}

export const useWeather = (): UseWeatherReturn => {
  const dispatch = useAppDispatch();
  
  // 상태 선택
  const currentWeather = useAppSelector(selectCurrentWeather);
  const forecast = useAppSelector(selectWeatherForecast);
  const loading = useAppSelector(selectWeatherLoading);
  const error = useAppSelector(selectWeatherError);
  const refreshing = useAppSelector(selectWeatherRefreshing);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const isStale = useAppSelector(selectIsWeatherStale);
  const hasData = useAppSelector(selectHasWeatherData);
  const location = useAppSelector(selectWeatherLocation);

  // 위치 권한 요청
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }, []);

  // 현재 위치 가져오기 (웹과 모바일 호환)
  const getCurrentLocation = useCallback(async () => {
    try {
      // 웹에서는 브라우저의 geolocation API 사용
      if (typeof window !== 'undefined' && navigator.geolocation) {
        return new Promise<{latitude: number, longitude: number}>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              dispatch(setLocation({ latitude, longitude }));
              resolve({ latitude, longitude });
            },
            (error) => {
              console.warn('Browser geolocation failed:', error);
              resolve({
                latitude: CONFIG.DEFAULT_LOCATION.latitude,
                longitude: CONFIG.DEFAULT_LOCATION.longitude,
              });
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 5 * 60 * 1000
            }
          );
        });
      }
      
      // 모바일에서는 Expo Location 사용
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        console.warn('Location permission denied, using default location');
        return {
          latitude: CONFIG.DEFAULT_LOCATION.latitude,
          longitude: CONFIG.DEFAULT_LOCATION.longitude,
        };
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 5 * 60 * 1000, // 5분 캐시
      });
      
      const { latitude, longitude } = locationResult.coords;
      
      // Redux에 위치 저장
      dispatch(setLocation({ latitude, longitude }));
      
      return { latitude, longitude };
    } catch (error) {
      console.error('Failed to get location:', error);
      // 오류 시 기본 위치 사용
      return {
        latitude: CONFIG.DEFAULT_LOCATION.latitude,
        longitude: CONFIG.DEFAULT_LOCATION.longitude,
      };
    }
  }, [dispatch, requestLocationPermission]);

  // 날씨 데이터 로드
  const loadWeather = useCallback(async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      
      // 현재 날씨와 예보를 병렬로 가져오기
      await Promise.all([
        dispatch(fetchCurrentWeather({ latitude, longitude })),
        dispatch(fetchWeatherForecast({ latitude, longitude })),
      ]);
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  }, [dispatch, getCurrentLocation]);

  // 날씨 새로고침
  const refreshWeather = useCallback(async () => {
    try {
      let coords = { 
        latitude: location.latitude, 
        longitude: location.longitude 
      };
      
      // 위치 정보가 없으면 현재 위치를 다시 가져옴
      if (!coords.latitude || !coords.longitude) {
        coords = await getCurrentLocation();
      }
      
      await dispatch(refreshWeatherData({
        latitude: coords.latitude!,
        longitude: coords.longitude!,
      }));
    } catch (error) {
      console.error('Failed to refresh weather:', error);
    }
  }, [dispatch, location, getCurrentLocation]);

  // 에러 클리어
  const clearWeatherError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 자동 새로고침 (날씨가 너무 오래된 경우)
  useEffect(() => {
    if (hasData && isStale && !loading && !refreshing) {
      console.log('Weather data is stale, auto-refreshing...');
      refreshWeather();
    }
  }, [hasData, isStale, loading, refreshing, refreshWeather]);

  // 앱 시작시 날씨 로드
  useEffect(() => {
    if (!hasData && !loading) {
      console.log('Loading initial weather data...');
      loadWeather();
    }
  }, [hasData, loading, loadWeather]);

  return {
    // 상태
    currentWeather,
    forecast,
    loading,
    error,
    refreshing,
    lastUpdated,
    isStale,
    hasData,
    location,
    
    // 액션
    loadWeather,
    refreshWeather,
    clearWeatherError,
    requestLocationPermission,
  };
};