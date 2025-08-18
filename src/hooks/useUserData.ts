import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loadUserPreferences,
  saveUserPreferences,
  loadUserSchedules,
  saveUserSchedules,
  loadStyleHistory,
  updatePreferences,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  setSchedules,
  clearError,
  selectUserPreferences,
  selectUserSchedules,
  selectStyleHistory,
  selectUserLoading,
  selectUserError,
  selectIsFirstTime,
  selectSchedulesForDate,
  selectTodaySchedules,
  selectUpcomingSchedules,
  selectRecentHistory,
} from '../store/slices/userSlice';
import type { UserPreferences, Schedule, StyleRecommendation } from '../types';

interface UseUserDataReturn {
  // 상태
  preferences: UserPreferences;
  schedules: Schedule[];
  history: StyleRecommendation[];
  loading: boolean;
  error: string | null;
  isFirstTime: boolean;
  
  // 계산된 데이터
  todaySchedules: Schedule[];
  upcomingSchedules: any[];
  recentHistory: StyleRecommendation[];
  
  // 액션
  loadUserData: () => Promise<void>;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  savePreferences: () => Promise<void>;
  addNewSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateExistingSchedule: (id: string, updates: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
  saveAllSchedules: () => Promise<void>;
  getSchedulesForDate: (date: string) => Schedule[];
  clearUserError: () => void;
  resetUserData: () => void;
}

export const useUserData = (): UseUserDataReturn => {
  const dispatch = useAppDispatch();
  
  // 상태 선택
  const preferences = useAppSelector(selectUserPreferences);
  const schedules = useAppSelector(selectUserSchedules);
  const history = useAppSelector(selectStyleHistory);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);
  const isFirstTime = useAppSelector(selectIsFirstTime);
  
  // 계산된 데이터
  const todaySchedules = useAppSelector(selectTodaySchedules);
  const upcomingSchedules = useAppSelector(state => selectUpcomingSchedules(state, 7));
  const recentHistory = useAppSelector(state => selectRecentHistory(state, 10));

  // 전체 사용자 데이터 로드
  const loadUserData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(loadUserPreferences()),
        dispatch(loadUserSchedules()),
        dispatch(loadStyleHistory()),
      ]);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, [dispatch]);

  // 사용자 설정 업데이트 (로컬 상태만)
  const updateUserPreferences = useCallback((updates: Partial<UserPreferences>) => {
    dispatch(updatePreferences(updates));
  }, [dispatch]);

  // 사용자 설정 저장
  const savePreferences = useCallback(async () => {
    try {
      await dispatch(saveUserPreferences(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [dispatch, preferences]);

  // 새 일정 추가
  const addNewSchedule = useCallback((schedule: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString(),
    };
    dispatch(addSchedule(newSchedule));
  }, [dispatch]);

  // 기존 일정 업데이트
  const updateExistingSchedule = useCallback((id: string, updates: Partial<Schedule>) => {
    dispatch(updateSchedule({ id, updates }));
  }, [dispatch]);

  // 일정 삭제
  const removeSchedule = useCallback((id: string) => {
    dispatch(deleteSchedule(id));
  }, [dispatch]);

  // 모든 일정 저장
  const saveAllSchedules = useCallback(async () => {
    try {
      await dispatch(saveUserSchedules(schedules));
    } catch (error) {
      console.error('Failed to save schedules:', error);
    }
  }, [dispatch, schedules]);

  // 특정 날짜의 일정 가져오기
  const getSchedulesForDate = useCallback((date: string) => {
    return schedules.filter(schedule => {
      const scheduleDate = schedule.date || new Date().toISOString().split('T')[0];
      return scheduleDate === date;
    }).sort((a, b) => {
      const timeA = a.time.replace(':', '');
      const timeB = b.time.replace(':', '');
      return timeA.localeCompare(timeB);
    });
  }, [schedules]);

  // 에러 클리어
  const clearUserError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 사용자 데이터 초기화 (로그아웃 등에서 사용)
  const resetUserData = useCallback(() => {
    // 실제로는 사용자 확인 후 실행되어야 함
    console.warn('Resetting all user data...');
    // dispatch(resetUserState());
  }, []);

  // 앱 시작시 사용자 데이터 로드
  useEffect(() => {
    if (isFirstTime) {
      console.log('Loading user data on first launch...');
      loadUserData();
    }
  }, [isFirstTime, loadUserData]);

  // 설정 변경시 자동 저장 (디바운스 적용 필요)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isFirstTime) {
      timeoutId = setTimeout(() => {
        console.log('Auto-saving preferences...');
        savePreferences();
      }, 2000); // 2초 디바운스
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [preferences, isFirstTime, savePreferences]);

  // 일정 변경시 자동 저장
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isFirstTime && schedules.length > 0) {
      timeoutId = setTimeout(() => {
        console.log('Auto-saving schedules...');
        saveAllSchedules();
      }, 1000); // 1초 디바운스
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [schedules, isFirstTime, saveAllSchedules]);

  return {
    // 상태
    preferences,
    schedules,
    history,
    loading,
    error,
    isFirstTime,
    
    // 계산된 데이터
    todaySchedules,
    upcomingSchedules,
    recentHistory,
    
    // 액션
    loadUserData,
    updateUserPreferences,
    savePreferences,
    addNewSchedule,
    updateExistingSchedule,
    removeSchedule,
    saveAllSchedules,
    getSchedulesForDate,
    clearUserError,
    resetUserData,
  };
};