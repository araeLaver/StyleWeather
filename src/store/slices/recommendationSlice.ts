import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AIRecommendationService from '../../services/AIRecommendationService';
import type { StyleRecommendation, WeatherData, Schedule, UserPreferences } from '../../types';

// 추천 상태 인터페이스
interface RecommendationState {
  current: StyleRecommendation | null;
  loading: boolean;
  error: string | null;
  lastGenerated: number | null;
  feedbackCount: {
    likes: number;
    dislikes: number;
  };
  generationCount: number;
  preferences: {
    useAI: boolean;
    autoGenerate: boolean;
    saveToHistory: boolean;
  };
}

// 초기 상태
const initialState: RecommendationState = {
  current: null,
  loading: false,
  error: null,
  lastGenerated: null,
  feedbackCount: {
    likes: 0,
    dislikes: 0,
  },
  generationCount: 0,
  preferences: {
    useAI: true,
    autoGenerate: true,
    saveToHistory: true,
  },
};

// 비동기 액션들

// 스타일 추천 생성
export const generateStyleRecommendation = createAsyncThunk(
  'recommendations/generate',
  async (
    {
      weatherData,
      scheduleData,
      userPreferences,
      forceAI = false,
    }: {
      weatherData: WeatherData;
      scheduleData: Schedule[];
      userPreferences: UserPreferences;
      forceAI?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const recommendation = await AIRecommendationService.getStyleRecommendation(
        weatherData,
        scheduleData,
        userPreferences,
        forceAI
      );
      
      return {
        recommendation,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendation';
      return rejectWithValue(errorMessage);
    }
  }
);

// 새로운 추천 생성 (기존 추천 대체)
export const refreshRecommendation = createAsyncThunk(
  'recommendations/refresh',
  async (
    {
      weatherData,
      scheduleData,
      userPreferences,
    }: {
      weatherData: WeatherData;
      scheduleData: Schedule[];
      userPreferences: UserPreferences;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // 항상 새로운 추천 생성 (AI 강제 사용 시도)
      const result = await dispatch(generateStyleRecommendation({
        weatherData,
        scheduleData,
        userPreferences,
        forceAI: true,
      }));
      
      if (generateStyleRecommendation.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error('Failed to refresh recommendation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh';
      return rejectWithValue(errorMessage);
    }
  }
);

// 피드백 제출
export const submitRecommendationFeedback = createAsyncThunk(
  'recommendations/submitFeedback',
  async (
    {
      type,
      recommendationId,
      comment,
    }: {
      type: 'like' | 'dislike';
      recommendationId?: string;
      comment?: string;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      // 실제 구현에서는 서버로 피드백 전송
      // 현재는 로컬 상태만 업데이트
      console.log('Feedback submitted:', { type, recommendationId, comment });
      
      // 피드백 분석 등의 로직을 여기에 추가할 수 있음
      return { type, timestamp: Date.now() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback';
      return rejectWithValue(errorMessage);
    }
  }
);

// 추천 슬라이스 생성
const recommendationSlice = createSlice({
  name: 'recommendations',
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
    
    // 추천 클리어
    clearRecommendation: (state) => {
      state.current = null;
      state.error = null;
    },
    
    // 추천 설정 업데이트
    updatePreferences: (state, action: PayloadAction<Partial<RecommendationState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 피드백 카운트 리셋
    resetFeedbackCount: (state) => {
      state.feedbackCount = { likes: 0, dislikes: 0 };
    },
    
    // 추천 상태 초기화
    resetRecommendationState: (state) => {
      Object.assign(state, initialState);
    },
    
    // 수동으로 추천 설정 (테스트용)
    setRecommendation: (state, action: PayloadAction<StyleRecommendation>) => {
      state.current = action.payload;
      state.lastGenerated = Date.now();
      state.error = null;
    },
    
    // 생성 카운트 증가
    incrementGenerationCount: (state) => {
      state.generationCount += 1;
    },
  },
  extraReducers: (builder) => {
    // generateStyleRecommendation
    builder
      .addCase(generateStyleRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateStyleRecommendation.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.recommendation;
        state.lastGenerated = action.payload.timestamp;
        state.generationCount += 1;
        state.error = null;
      })
      .addCase(generateStyleRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // refreshRecommendation
    builder
      .addCase(refreshRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshRecommendation.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.recommendation;
        state.lastGenerated = action.payload.timestamp;
        state.generationCount += 1;
      })
      .addCase(refreshRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // submitRecommendationFeedback
    builder
      .addCase(submitRecommendationFeedback.fulfilled, (state, action) => {
        if (action.payload.type === 'like') {
          state.feedbackCount.likes += 1;
        } else {
          state.feedbackCount.dislikes += 1;
        }
      })
      .addCase(submitRecommendationFeedback.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 액션 export
export const {
  setLoading,
  clearError,
  clearRecommendation,
  updatePreferences,
  resetFeedbackCount,
  resetRecommendationState,
  setRecommendation,
  incrementGenerationCount,
} = recommendationSlice.actions;

// 셀렉터들
export const selectRecommendationState = (state: { recommendations: RecommendationState }) => state.recommendations;
export const selectCurrentRecommendation = (state: { recommendations: RecommendationState }) => state.recommendations.current;
export const selectRecommendationLoading = (state: { recommendations: RecommendationState }) => state.recommendations.loading;
export const selectRecommendationError = (state: { recommendations: RecommendationState }) => state.recommendations.error;
export const selectLastGenerated = (state: { recommendations: RecommendationState }) => state.recommendations.lastGenerated;
export const selectFeedbackCount = (state: { recommendations: RecommendationState }) => state.recommendations.feedbackCount;
export const selectGenerationCount = (state: { recommendations: RecommendationState }) => state.recommendations.generationCount;
export const selectRecommendationPreferences = (state: { recommendations: RecommendationState }) => state.recommendations.preferences;

// 계산된 셀렉터들
export const selectRecommendationAge = (state: { recommendations: RecommendationState }) => {
  if (!state.recommendations.lastGenerated) return null;
  return Date.now() - state.recommendations.lastGenerated;
};

export const selectIsRecommendationStale = (state: { recommendations: RecommendationState }) => {
  const age = selectRecommendationAge(state);
  return age ? age > 30 * 60 * 1000 : true; // 30분 이상이면 stale
};

export const selectHasRecommendation = (state: { recommendations: RecommendationState }) => {
  return !!state.recommendations.current;
};

export const selectRecommendationSummary = (state: { recommendations: RecommendationState }) => {
  const current = state.recommendations.current;
  if (!current) return null;
  
  return {
    hasTop: !!current.top,
    hasBottom: !!current.bottom,
    hasOuter: !!current.outer,
    hasShoes: !!current.shoes,
    hasAccessories: !!current.accessories,
    confidence: current.confidence || 0,
    reason: current.reason || '',
    isComplete: !!(current.top && current.bottom && current.shoes),
  };
};

export const selectFeedbackRatio = (state: { recommendations: RecommendationState }) => {
  const { likes, dislikes } = state.recommendations.feedbackCount;
  const total = likes + dislikes;
  
  if (total === 0) return null;
  
  return {
    likes,
    dislikes,
    total,
    likeRatio: likes / total,
    dislikeRatio: dislikes / total,
  };
};

export const selectCanGenerateRecommendation = (state: { recommendations: RecommendationState }) => {
  return !state.recommendations.loading;
};

export default recommendationSlice.reducer;