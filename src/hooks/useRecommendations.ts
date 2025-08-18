import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  generateStyleRecommendation,
  refreshRecommendation,
  submitRecommendationFeedback,
  clearError,
  clearRecommendation,
  selectCurrentRecommendation,
  selectRecommendationLoading,
  selectRecommendationError,
  selectLastGenerated,
  selectFeedbackCount,
  selectGenerationCount,
  selectRecommendationAge,
  selectIsRecommendationStale,
  selectHasRecommendation,
  selectRecommendationSummary,
  selectCanGenerateRecommendation,
} from '../store/slices/recommendationSlice';
import { addToStyleHistory } from '../store/slices/userSlice';
import { selectCurrentWeather } from '../store/slices/weatherSlice';
import { selectUserPreferences, selectTodaySchedules } from '../store/slices/userSlice';
import type { StyleRecommendation } from '../types';

interface UseRecommendationsReturn {
  // 상태
  current: StyleRecommendation | null;
  loading: boolean;
  error: string | null;
  lastGenerated: number | null;
  feedbackCount: { likes: number; dislikes: number };
  generationCount: number;
  age: number | null;
  isStale: boolean;
  hasRecommendation: boolean;
  summary: any;
  canGenerate: boolean;
  
  // 액션
  generateRecommendation: (forceAI?: boolean) => Promise<void>;
  refreshCurrentRecommendation: () => Promise<void>;
  submitFeedback: (type: 'like' | 'dislike', comment?: string) => Promise<void>;
  clearRecommendationError: () => void;
  clearCurrentRecommendation: () => void;
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const dispatch = useAppDispatch();
  
  // 상태 선택
  const current = useAppSelector(selectCurrentRecommendation);
  const loading = useAppSelector(selectRecommendationLoading);
  const error = useAppSelector(selectRecommendationError);
  const lastGenerated = useAppSelector(selectLastGenerated);
  const feedbackCount = useAppSelector(selectFeedbackCount);
  const generationCount = useAppSelector(selectGenerationCount);
  const age = useAppSelector(selectRecommendationAge);
  const isStale = useAppSelector(selectIsRecommendationStale);
  const hasRecommendation = useAppSelector(selectHasRecommendation);
  const summary = useAppSelector(selectRecommendationSummary);
  const canGenerate = useAppSelector(selectCanGenerateRecommendation);
  
  // 관련 데이터
  const weatherData = useAppSelector(selectCurrentWeather);
  const userPreferences = useAppSelector(selectUserPreferences);
  const todaySchedules = useAppSelector(selectTodaySchedules);

  // 추천 생성
  const generateRecommendation = useCallback(async (forceAI: boolean = false) => {
    if (!weatherData) {
      console.warn('Cannot generate recommendation: no weather data');
      return;
    }

    try {
      const result = await dispatch(generateStyleRecommendation({
        weatherData,
        scheduleData: todaySchedules,
        userPreferences,
        forceAI,
      }));

      // 성공시 히스토리에 추가
      if (generateStyleRecommendation.fulfilled.match(result)) {
        const recommendation = result.payload.recommendation;
        await dispatch(addToStyleHistory(recommendation));
      }
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    }
  }, [dispatch, weatherData, todaySchedules, userPreferences]);

  // 추천 새로고침
  const refreshCurrentRecommendation = useCallback(async () => {
    if (!weatherData) {
      console.warn('Cannot refresh recommendation: no weather data');
      return;
    }

    try {
      const result = await dispatch(refreshRecommendation({
        weatherData,
        scheduleData: todaySchedules,
        userPreferences,
      }));

      // 성공시 히스토리에 추가
      if (refreshRecommendation.fulfilled.match(result)) {
        const recommendation = result.payload.recommendation;
        await dispatch(addToStyleHistory(recommendation));
      }
    } catch (error) {
      console.error('Failed to refresh recommendation:', error);
    }
  }, [dispatch, weatherData, todaySchedules, userPreferences]);

  // 피드백 제출
  const submitFeedback = useCallback(async (type: 'like' | 'dislike', comment?: string) => {
    if (!current) {
      console.warn('Cannot submit feedback: no current recommendation');
      return;
    }

    try {
      await dispatch(submitRecommendationFeedback({
        type,
        recommendationId: current.timestamp?.toString(),
        comment,
      }));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, [dispatch, current]);

  // 에러 클리어
  const clearRecommendationError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 추천 클리어
  const clearCurrentRecommendation = useCallback(() => {
    dispatch(clearRecommendation());
  }, [dispatch]);

  // 자동 추천 생성 (날씨 데이터가 있고 추천이 없을 때)
  useEffect(() => {
    if (weatherData && !hasRecommendation && !loading && userPreferences.autoRecommendation) {
      console.log('Auto-generating recommendation...');
      generateRecommendation();
    }
  }, [weatherData, hasRecommendation, loading, userPreferences.autoRecommendation, generateRecommendation]);

  // 추천이 너무 오래된 경우 새로고침 제안
  useEffect(() => {
    if (hasRecommendation && isStale && !loading) {
      console.log('Recommendation is stale, consider refreshing');
      // UI에서 새로고침을 제안할 수 있음
    }
  }, [hasRecommendation, isStale, loading]);

  return {
    // 상태
    current,
    loading,
    error,
    lastGenerated,
    feedbackCount,
    generationCount,
    age,
    isStale,
    hasRecommendation,
    summary,
    canGenerate,
    
    // 액션
    generateRecommendation,
    refreshCurrentRecommendation,
    submitFeedback,
    clearRecommendationError,
    clearCurrentRecommendation,
  };
};