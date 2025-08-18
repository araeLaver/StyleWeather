import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import appSlice from './slices/appSlice';
import weatherSlice from './slices/weatherSlice';
import userSlice from './slices/userSlice';
import recommendationSlice from './slices/recommendationSlice';
import type { RootState } from '../types';

// Redux store 설정
export const store = configureStore({
  reducer: {
    app: appSlice,
    weather: weatherSlice,
    user: userSlice,
    recommendations: recommendationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Date 객체와 함수들을 무시
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['weather.forecast.datetime', 'recommendations.current.timestamp'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 타입 정의
export type AppDispatch = typeof store.dispatch;
export type AppRootState = ReturnType<typeof store.getState>;

// 타입이 적용된 훅들
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;

// 스토어의 현재 상태를 가져오는 헬퍼
export const getStoreState = (): AppRootState => store.getState();

export default store;