import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeatherData, StyleRecommendation, Schedule } from '../types';

interface CachedItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

interface OfflineQueue {
  id: string;
  type: 'weather' | 'recommendation' | 'schedule' | 'preference';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private readonly CACHE_PREFIX = 'CACHE_';
  private readonly OFFLINE_QUEUE_KEY = 'OFFLINE_QUEUE';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30분

  private constructor() {}

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // 캐시 관련 메서드들
  async setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const cachedItem: CachedItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        key,
      };

      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cachedItem)
      );

      console.log(`Cached data for key: ${key}`);
    } catch (error) {
      console.error(`Failed to cache data for key ${key}:`, error);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      
      if (!cachedData) {
        return null;
      }

      const cachedItem: CachedItem<T> = JSON.parse(cachedData);

      // 캐시 만료 확인
      if (Date.now() > cachedItem.expiresAt) {
        console.log(`Cache expired for key: ${key}`);
        await this.removeCache(key);
        return null;
      }

      console.log(`Retrieved cached data for key: ${key}`);
      return cachedItem.data;
    } catch (error) {
      console.error(`Failed to get cached data for key ${key}:`, error);
      return null;
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
      console.log(`Removed cache for key: ${key}`);
    } catch (error) {
      console.error(`Failed to remove cache for key ${key}:`, error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} cache items`);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  // 날씨 데이터 캐싱
  async cacheWeatherData(lat: number, lon: number, weatherData: WeatherData): Promise<void> {
    const key = `weather_${lat}_${lon}`;
    await this.setCache(key, weatherData, 10 * 60 * 1000); // 10분 TTL
  }

  async getCachedWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
    const key = `weather_${lat}_${lon}`;
    return this.getCache<WeatherData>(key);
  }

  // 추천 데이터 캐싱
  async cacheRecommendation(weatherData: WeatherData, recommendation: StyleRecommendation): Promise<void> {
    const key = `recommendation_${weatherData.temperature}_${weatherData.icon}_${weatherData.humidity}`;
    await this.setCache(key, recommendation, 60 * 60 * 1000); // 1시간 TTL
  }

  async getCachedRecommendation(weatherData: WeatherData): Promise<StyleRecommendation | null> {
    const key = `recommendation_${weatherData.temperature}_${weatherData.icon}_${weatherData.humidity}`;
    return this.getCache<StyleRecommendation>(key);
  }

  // 오프라인 큐 관리
  async addToOfflineQueue(item: Omit<OfflineQueue, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const newItem: OfflineQueue = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(newItem);
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('Added item to offline queue:', newItem);
    } catch (error) {
      console.error('Failed to add item to offline queue:', error);
    }
  }

  async getOfflineQueue(): Promise<OfflineQueue[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  }

  async removeFromOfflineQueue(itemId: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
      console.log('Removed item from offline queue:', itemId);
    } catch (error) {
      console.error('Failed to remove item from offline queue:', error);
    }
  }

  async incrementRetryCount(itemId: string): Promise<boolean> {
    try {
      const queue = await this.getOfflineQueue();
      const itemIndex = queue.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return false;
      }

      queue[itemIndex].retryCount += 1;
      
      // 최대 재시도 횟수 초과시 제거
      if (queue[itemIndex].retryCount >= this.MAX_RETRY_COUNT) {
        console.log(`Max retry count reached for item ${itemId}, removing from queue`);
        queue.splice(itemIndex, 1);
      }

      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      return queue[itemIndex]?.retryCount < this.MAX_RETRY_COUNT;
    } catch (error) {
      console.error('Failed to increment retry count:', error);
      return false;
    }
  }

  async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.OFFLINE_QUEUE_KEY);
      console.log('Cleared offline queue');
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }

  // 캐시 통계
  async getCacheStats(): Promise<{
    totalCacheItems: number;
    cacheSize: string;
    offlineQueueSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const queue = await this.getOfflineQueue();

      // 대략적인 캐시 크기 계산
      let totalSize = 0;
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return {
        totalCacheItems: cacheKeys.length,
        cacheSize: this.formatBytes(totalSize),
        offlineQueueSize: queue.length,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalCacheItems: 0,
        cacheSize: '0 B',
        offlineQueueSize: 0,
      };
    }
  }

  // 캐시 정리 (만료된 항목 제거)
  async cleanupExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const now = Date.now();
      let cleanedCount = 0;

      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          try {
            const cachedItem: CachedItem<any> = JSON.parse(data);
            if (now > cachedItem.expiresAt) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (parseError) {
            // 잘못된 캐시 데이터는 제거
            await AsyncStorage.removeItem(key);
            cleanedCount++;
          }
        }
      }

      console.log(`Cleaned up ${cleanedCount} expired cache items`);
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  // 스케줄 캐싱
  async cacheSchedules(schedules: Schedule[]): Promise<void> {
    await this.setCache('user_schedules', schedules, 24 * 60 * 60 * 1000); // 24시간 TTL
  }

  async getCachedSchedules(): Promise<Schedule[] | null> {
    return this.getCache<Schedule[]>('user_schedules');
  }

  // 사용자 설정 캐싱
  async cacheUserPreferences(preferences: any): Promise<void> {
    await this.setCache('user_preferences', preferences, 7 * 24 * 60 * 60 * 1000); // 7일 TTL
  }

  async getCachedUserPreferences(): Promise<any | null> {
    return this.getCache('user_preferences');
  }
}

export default OfflineManager;