import { CONFIG } from '../config/config';
import { ERROR_MESSAGES, API_ENDPOINTS } from '../constants';
import CacheManager from '../utils/CacheManager';
import { weatherApiClient } from '../utils/ApiClient';
import type { WeatherData, WeatherForecast, ApiResponse } from '../types';

// OpenWeatherMap API 응답 타입 정의
interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
  dt: number;
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
}

class WeatherService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = CONFIG.OPENWEATHER_API_KEY || '';
  }

  /**
   * 현재 날씨 정보 가져오기
   * @param latitude 위도
   * @param longitude 경도
   * @param useCache 캐시 사용 여부 (기본값: true)
   * @returns Promise<WeatherData>
   */
  /**
   * 데모/개발용 모크 데이터 생성
   */
  private generateMockWeatherData(latitude: number, longitude: number): WeatherData {
    const mockData: WeatherData = {
      temperature: 22,
      feelsLike: 25,
      description: '맑음',
      humidity: 60,
      windSpeed: 3.2,
      icon: '01d',
      city: '서울',
      country: 'KR',
      timestamp: Date.now(),
      isMock: true,
      isStale: false
    };
    
    console.log('🧪 Mock weather data generated for demo purposes');
    return mockData;
  }

  /**
   * 데모/개발용 모크 예보 데이터 생성
   */
  private generateMockForecastData(days: number = 5): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const baseDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      forecasts.push({
        datetime: date,
        temperature: Math.round(20 + Math.random() * 10),
        description: ['맑음', '구름 조금', '흐림', '비', '눈'][Math.floor(Math.random() * 5)],
        icon: ['01d', '02d', '03d', '10d', '13d'][Math.floor(Math.random() * 5)],
        humidity: Math.round(50 + Math.random() * 30),
        windSpeed: Math.round(Math.random() * 5 * 10) / 10
      });
    }
    
    console.log('🧪 Mock forecast data generated for demo purposes');
    return forecasts;
  }

  /**
   * API 키가 데모용인지 확인
   */
  private isDemoApiKey(): boolean {
    return !this.apiKey || 
           this.apiKey === 'demo_openweather_key_for_testing' ||
           this.apiKey === 'your_openweather_api_key_here' ||
           this.apiKey.startsWith('demo_');
  }

  async getCurrentWeather(
    latitude: number,
    longitude: number,
    useCache: boolean = true
  ): Promise<WeatherData> {
    try {
      // API 키 확인
      if (!this.apiKey) {
        throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
      }

      // 데모 API 키인 경우 모크 데이터 반환
      if (this.isDemoApiKey()) {
        console.log('🧪 Using mock data - demo API key detected');
        return this.generateMockWeatherData(latitude, longitude);
      }

      // 캐시 확인
      if (useCache) {
        const cacheKey = CacheManager.generateWeatherCacheKey(latitude, longitude);
        const cachedWeather = await CacheManager.get(cacheKey);
        
        if (cachedWeather) {
          console.log('Weather data loaded from cache');
          return cachedWeather as WeatherData;
        }
      }

      // API 요청
      const response = await weatherApiClient.get<OpenWeatherResponse>(
        API_ENDPOINTS.OPENWEATHER.WEATHER,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: this.apiKey,
            units: 'metric',
            lang: 'kr'
          }
        }
      );

      if (response.error) {
        throw this.createWeatherError(response.error);
      }

      if (!response.data) {
        throw new Error(ERROR_MESSAGES.WEATHER_FETCH_FAILED);
      }

      // 데이터 변환
      const weatherData: WeatherData = this.transformWeatherData(response.data);

      // 캐시에 저장
      if (useCache) {
        const cacheKey = CacheManager.generateWeatherCacheKey(latitude, longitude);
        await CacheManager.set(cacheKey, weatherData, CONFIG.CACHE_DURATION);
      }

      return weatherData;
    } catch (error) {
      console.error('Weather API Error:', error);
      
      // 네트워크 오류시 오래된 캐시라도 반환 시도
      if (useCache && this.isNetworkError(error)) {
        const cacheKey = CacheManager.generateWeatherCacheKey(latitude, longitude);
        const oldCachedWeather = await CacheManager.get(cacheKey);
        if (oldCachedWeather) {
          console.log('Returning stale weather data due to network error');
          return { ...oldCachedWeather as WeatherData, isStale: true };
        }
      }
      
      throw error;
    }
  }

  /**
   * 날씨 예보 정보 가져오기
   * @param latitude 위도
   * @param longitude 경도
   * @param days 예보 일수 (기본값: 5일)
   * @returns Promise<WeatherForecast[]>
   */
  async getWeatherForecast(
    latitude: number,
    longitude: number,
    days: number = 5
  ): Promise<WeatherForecast[]> {
    try {
      // API 키 확인
      if (!this.apiKey) {
        throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
      }

      // 데모 API 키인 경우 모크 데이터 반환
      if (this.isDemoApiKey()) {
        console.log('🧪 Using mock forecast data - demo API key detected');
        return this.generateMockForecastData(days);
      }

      const response = await weatherApiClient.get<OpenWeatherForecastResponse>(
        API_ENDPOINTS.OPENWEATHER.FORECAST,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: this.apiKey,
            units: 'metric',
            lang: 'kr'
          }
        }
      );

      if (response.error) {
        throw this.createWeatherError(response.error);
      }

      if (!response.data) {
        throw new Error('날씨 예보 정보를 가져올 수 없습니다.');
      }

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
      throw error;
    }
  }

  /**
   * 날씨 기반 옷차림 추천 로직 (기본 추천)
   * @param temperature 온도
   * @param weatherCondition 날씨 조건
   * @param humidity 습도
   * @returns string[] 추천 아이템 배열
   */
  getClothingRecommendation(
    temperature: number,
    weatherCondition: string,
    humidity: number
  ): string[] {
    const recommendation: string[] = [];

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

  /**
   * 더미 날씨 데이터 생성 (개발/테스트용)
   * @returns WeatherData 더미 날씨 데이터
   */
  getMockWeatherData(): WeatherData {
    const mockWeathers: WeatherData[] = [
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

  /**
   * OpenWeather API 응답을 내부 WeatherData 형태로 변환
   * @param data OpenWeather API 응답 데이터
   * @returns WeatherData 변환된 날씨 데이터
   */
  private transformWeatherData(data: OpenWeatherResponse): WeatherData {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      city: data.name,
      country: data.sys.country,
      timestamp: Date.now()
    };
  }

  /**
   * API 에러를 사용자 친화적인 에러로 변환
   * @param error API 에러 객체
   * @returns Error 변환된 에러
   */
  private createWeatherError(error: any): Error {
    if (error.code === 'HTTP_401') {
      return new Error(ERROR_MESSAGES.API_KEY_INVALID);
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    
    if (error.code === 'TIMEOUT') {
      return new Error('날씨 정보 요청 시간이 초과되었습니다.');
    }
    
    return new Error(error.message || ERROR_MESSAGES.WEATHER_FETCH_FAILED);
  }

  /**
   * 네트워크 에러인지 확인
   * @param error 에러 객체
   * @returns boolean 네트워크 에러 여부
   */
  private isNetworkError(error: any): boolean {
    return error.code === 'NETWORK_ERROR' || 
           error.message?.includes('Network') || 
           error.message?.includes('ECONNREFUSED') ||
           error.message?.includes('ENOTFOUND');
  }

  /**
   * API 키 유효성 검사
   * @returns Promise<boolean> API 키 유효성 여부
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // 서울 좌표로 간단한 테스트 요청
      const response = await weatherApiClient.get<OpenWeatherResponse>(
        API_ENDPOINTS.OPENWEATHER.WEATHER,
        {
          params: {
            lat: 37.5665,
            lon: 126.9780,
            appid: this.apiKey,
            units: 'metric'
          }
        }
      );

      return !response.error;
    } catch {
      return false;
    }
  }

  /**
   * 서비스 상태 확인
   * @returns Promise<boolean> 서비스 이용 가능 여부
   */
  async checkServiceStatus(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    return await this.validateApiKey();
  }
}

// 싱글톤 인스턴스 export
export default new WeatherService();