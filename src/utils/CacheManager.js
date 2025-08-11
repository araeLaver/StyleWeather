import AsyncStorage from 'react-native-async-storage/async-storage';

class CacheManager {
  constructor() {
    this.CACHE_PREFIX = 'StyleWeather_Cache_';
    this.DEFAULT_EXPIRE_TIME = 10 * 60 * 1000; // 10분 (밀리초)
  }

  // 캐시 키 생성
  _generateCacheKey(key) {
    return `${this.CACHE_PREFIX}${key}`;
  }

  // 데이터 캐시에 저장
  async set(key, data, expireTimeMs = this.DEFAULT_EXPIRE_TIME) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expireTime: expireTimeMs
      };

      const cacheKey = this._generateCacheKey(key);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      console.log(`Cache stored for key: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // 캐시에서 데이터 조회
  async get(key) {
    try {
      const cacheKey = this._generateCacheKey(key);
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        return null;
      }

      const cachedData = JSON.parse(cachedString);
      const currentTime = Date.now();
      
      // 캐시 만료 확인
      if (currentTime - cachedData.timestamp > cachedData.expireTime) {
        console.log(`Cache expired for key: ${key}`);
        await this.remove(key);
        return null;
      }

      console.log(`Cache hit for key: ${key}`);
      return cachedData.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // 특정 키의 캐시 삭제
  async remove(key) {
    try {
      const cacheKey = this._generateCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
      console.log(`Cache removed for key: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  // 모든 캐시 삭제
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length} cache entries`);
      }
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // 만료된 캐시 정리
  async clearExpired() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const currentTime = Date.now();
      const expiredKeys = [];

      for (const key of cacheKeys) {
        try {
          const cachedString = await AsyncStorage.getItem(key);
          if (cachedString) {
            const cachedData = JSON.parse(cachedString);
            if (currentTime - cachedData.timestamp > cachedData.expireTime) {
              expiredKeys.push(key);
            }
          }
        } catch (error) {
          // 파싱 에러 시 해당 키도 삭제
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        console.log(`Cleared ${expiredKeys.length} expired cache entries`);
      }

      return expiredKeys.length;
    } catch (error) {
      console.error('Cache clearExpired error:', error);
      return 0;
    }
  }

  // 캐시 상태 조회
  async getStatus() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const currentTime = Date.now();
      
      let totalSize = 0;
      let expiredCount = 0;
      let validCount = 0;

      for (const key of cacheKeys) {
        try {
          const cachedString = await AsyncStorage.getItem(key);
          if (cachedString) {
            totalSize += cachedString.length;
            const cachedData = JSON.parse(cachedString);
            
            if (currentTime - cachedData.timestamp > cachedData.expireTime) {
              expiredCount++;
            } else {
              validCount++;
            }
          }
        } catch (error) {
          expiredCount++;
        }
      }

      return {
        totalEntries: cacheKeys.length,
        validEntries: validCount,
        expiredEntries: expiredCount,
        totalSize: totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
      };
    } catch (error) {
      console.error('Cache getStatus error:', error);
      return null;
    }
  }

  // 위치 기반 날씨 캐시 키 생성 (날씨 서비스용)
  generateWeatherCacheKey(latitude, longitude) {
    const lat = Math.round(latitude * 100) / 100; // 소수점 2자리
    const lng = Math.round(longitude * 100) / 100;
    return `weather_${lat}_${lng}`;
  }

  // AI 추천 캐시 키 생성 (AI 서비스용)
  generateRecommendationCacheKey(weatherData, userPreferences) {
    const weatherKey = `${weatherData.temperature}_${weatherData.description}`;
    const userKey = `${userPreferences.gender}_${userPreferences.stylePreference}`;
    return `recommendation_${weatherKey}_${userKey}`;
  }
}

export default new CacheManager();