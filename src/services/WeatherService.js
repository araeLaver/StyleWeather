import axios from 'axios';
import { CONFIG } from '../config/config';
import CacheManager from '../utils/CacheManager';

class WeatherService {
  constructor() {
    this.baseURL = CONFIG.OPENWEATHER_BASE_URL;
    this.apiKey = CONFIG.OPENWEATHER_API_KEY;
  }

  async getCurrentWeather(latitude, longitude, useCache = true) {
    try {
      // API 키 확인
      if (!this.apiKey) {
        console.error('No API key found');
        throw new Error('API 키가 설정되지 않았습니다.');
      }

      // 캐시 확인
      if (useCache) {
        const cacheKey = CacheManager.generateWeatherCacheKey(latitude, longitude);
        const cachedWeather = await CacheManager.get(cacheKey);
        
        if (cachedWeather) {
          console.log('Weather data loaded from cache');
          return cachedWeather;
        }
      }

      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric',
          lang: 'kr'
        },
        timeout: CONFIG.API_TIMEOUT
      });

      const weatherData = {
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        windSpeed: response.data.wind.speed,
        city: response.data.name,
        country: response.data.sys.country,
        timestamp: Date.now()
      };

      // 캐시에 저장
      if (useCache) {
        const cacheKey = CacheManager.generateWeatherCacheKey(latitude, longitude);
        await CacheManager.set(cacheKey, weatherData, CONFIG.CACHE_DURATION);
      }

      return weatherData;
    } catch (error) {
      console.error('Weather API Error:', error);
      
      // 네트워크 오류시 오래된 캐시라도 반환 시도
      if (useCache && error.code === 'NETWORK_ERROR') {
        const cacheKey = CacheManager.generateWeatherCacheKey(latitude, longitude);
        const oldCachedWeather = await CacheManager.get(cacheKey);
        if (oldCachedWeather) {
          console.log('Returning stale weather data due to network error');
          return { ...oldCachedWeather, isStale: true };
        }
      }
      
      throw new Error(
        error.response?.status === 401 
          ? 'API 키가 유효하지 않습니다.' 
          : error.code === 'NETWORK_ERROR' 
          ? '인터넷 연결을 확인해주세요.' 
          : '날씨 정보를 가져올 수 없습니다.'
      );
    }
  }

  async getWeatherForecast(latitude, longitude, days = 5) {
    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric',
          lang: 'kr'
        }
      });

      // 5일 예보 데이터를 가공
      const forecasts = response.data.list.slice(0, days * 8).map(item => ({
        datetime: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      }));

      return forecasts;
    } catch (error) {
      console.error('Weather Forecast API Error:', error);
      throw new Error('날씨 예보 정보를 가져올 수 없습니다.');
    }
  }

  // 날씨 기반 옷차림 추천 로직
  getClothingRecommendation(temperature, weatherCondition, humidity) {
    const recommendation = [];

    // 온도 기반 추천
    if (temperature >= 28) {
      recommendation.push('민소매', '반팔', '반바지', '원피스', '샌들');
    } else if (temperature >= 23) {
      recommendation.push('반팔', '얇은 셔츠', '면바지', '스니커즈');
    } else if (temperature >= 18) {
      recommendation.push('긴팔', '가디건', '청바지', '운동화');
    } else if (temperature >= 10) {
      recommendation.push('스웨터', '재킷', '청바지', '부츠');
    } else if (temperature >= 5) {
      recommendation.push('코트', '니트', '두꺼운 바지', '따뜻한 신발');
    } else {
      recommendation.push('패딩', '두꺼운 코트', '목도리', '장갑', '털모자');
    }

    // 날씨 조건 기반 추가 추천
    if (weatherCondition.includes('rain') || weatherCondition.includes('비')) {
      recommendation.push('우산', '방수 재킷', '장화');
    }

    if (weatherCondition.includes('snow') || weatherCondition.includes('눈')) {
      recommendation.push('방한화', '방수 아우터', '장갑');
    }

    if (humidity > 70) {
      recommendation.push('통풍 잘되는 옷', '면 소재');
    }

    return recommendation;
  }

  // 더미 날씨 데이터 생성
  getMockWeatherData() {
    const mockWeathers = [
      {
        temperature: 22,
        feelsLike: 24,
        humidity: 65,
        description: '맑음',
        icon: '01d',
        windSpeed: 2.1,
        city: '서울',
        country: 'KR',
        timestamp: Date.now(),
        isMock: true
      },
      {
        temperature: 18,
        feelsLike: 16,
        humidity: 72,
        description: '구름많음',
        icon: '03d',
        windSpeed: 3.2,
        city: '서울',
        country: 'KR',
        timestamp: Date.now(),
        isMock: true
      },
      {
        temperature: 26,
        feelsLike: 28,
        humidity: 58,
        description: '화창함',
        icon: '01d',
        windSpeed: 1.5,
        city: '서울',
        country: 'KR',
        timestamp: Date.now(),
        isMock: true
      }
    ];

    // 시간대에 따라 다른 날씨 반환
    const hour = new Date().getHours();
    const index = hour % mockWeathers.length;
    
    return mockWeathers[index];
  }
}

export default new WeatherService();