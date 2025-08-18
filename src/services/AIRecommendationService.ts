import { CONFIG } from '../config/config';
import { ERROR_MESSAGES, API_ENDPOINTS } from '../constants';
import { openaiApiClient } from '../utils/ApiClient';
import type { WeatherData, StyleRecommendation, UserPreferences, Schedule, ApiResponse } from '../types';

// OpenAI API 요청 타입
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens: number;
  temperature: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

class AIRecommendationService {
  private readonly apiKey: string;
  private readonly model: string = 'gpt-3.5-turbo';
  private readonly maxTokens: number = 300;
  private readonly temperature: number = 0.7;

  constructor() {
    this.apiKey = CONFIG.OPENAI_API_KEY || '';
  }

  /**
   * API 키가 데모용인지 확인
   */
  private isDemoApiKey(): boolean {
    return !this.apiKey || 
           this.apiKey === 'demo_openai_key_for_testing' ||
           this.apiKey === 'your_openai_api_key_here' ||
           this.apiKey.startsWith('demo_');
  }

  /**
   * 스타일 추천 생성 (AI 또는 기본 로직)
   * @param weatherData 날씨 데이터
   * @param scheduleData 일정 데이터
   * @param userPreferences 사용자 선호도
   * @param forceAI AI 강제 사용 (기본값: false)
   * @returns Promise<StyleRecommendation>
   */
  async getStyleRecommendation(
    weatherData: WeatherData,
    scheduleData: Schedule[],
    userPreferences: UserPreferences,
    forceAI: boolean = false
  ): Promise<StyleRecommendation> {
    try {
      // 데모 API 키인 경우 AI 호출 스킵
      if (this.isDemoApiKey()) {
        console.log('🧪 Demo API key detected, using basic recommendation logic');
      } else if (this.apiKey && (forceAI || Math.random() > 0.3)) {
        console.log('🤖 Attempting AI recommendation...');
        return await this.getAIRecommendation(weatherData, scheduleData, userPreferences);
      }
    } catch (error) {
      console.warn('AI recommendation failed, falling back to basic logic:', error);
    }

    // AI 실패 시 기본 추천 로직 사용
    console.log('🔄 Using basic recommendation logic');
    return this.getBasicRecommendation(weatherData, scheduleData, userPreferences);
  }

  /**
   * AI 기반 스타일 추천
   * @param weatherData 날씨 데이터
   * @param scheduleData 일정 데이터
   * @param userPreferences 사용자 선호도
   * @returns Promise<StyleRecommendation>
   */
  private async getAIRecommendation(
    weatherData: WeatherData,
    scheduleData: Schedule[],
    userPreferences: UserPreferences
  ): Promise<StyleRecommendation> {
    if (!this.apiKey) {
      throw new Error(ERROR_MESSAGES.API_KEY_MISSING + ' (OpenAI)');
    }

    const prompt = this.buildPrompt(weatherData, scheduleData, userPreferences);
    
    const requestData: OpenAIRequest = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(userPreferences)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature
    };

    const response = await openaiApiClient.post<OpenAIResponse>(
      API_ENDPOINTS.OPENAI.CHAT,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.error) {
      throw this.createAIError(response.error);
    }

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const recommendation = this.parseAIResponse(response.data.choices[0].message.content);
    
    // 사용량 로깅 (개발 모드)
    if (CONFIG.APP_ENV === 'development' && response.data.usage) {
      console.log('🤖 AI API Usage:', response.data.usage);
    }

    return recommendation;
  }

  /**
   * 기본 추천 로직 (AI 실패시 fallback)
   * @param weatherData 날씨 데이터
   * @param scheduleData 일정 데이터
   * @param userPreferences 사용자 선호도
   * @returns StyleRecommendation
   */
  private getBasicRecommendation(
    weatherData: WeatherData,
    scheduleData: Schedule[],
    userPreferences: UserPreferences
  ): StyleRecommendation {
    const { temperature, description } = weatherData;
    const { stylePreference, gender, weatherSensitivity } = userPreferences;

    // 온도 조정 (사용자 민감도 반영)
    const adjustedTemp = this.adjustTemperatureForSensitivity(temperature, weatherSensitivity);

    const recommendation: StyleRecommendation = {
      confidence: Math.random() * 0.3 + 0.6, // 0.6-0.9 랜덤
      timestamp: Date.now()
    };

    // 주요 일정이 있는지 확인
    const mainSchedule = this.getPrimarySchedule(scheduleData);
    const styleContext = mainSchedule?.type || stylePreference;

    // 온도별 기본 추천
    const clothingItems = this.getTemperatureBasedClothing(adjustedTemp, gender);
    
    // 스타일 컨텍스트에 따른 조정
    const adjustedItems = this.adjustForStyleContext(clothingItems, styleContext, gender);
    
    // 날씨 조건에 따른 추가 조정
    const weatherAdjustedItems = this.adjustForWeatherCondition(adjustedItems, description);

    // 결과 할당
    recommendation.top = weatherAdjustedItems.top;
    recommendation.bottom = weatherAdjustedItems.bottom;
    recommendation.outer = weatherAdjustedItems.outer;
    recommendation.shoes = weatherAdjustedItems.shoes;
    recommendation.accessories = weatherAdjustedItems.accessories;

    // 추천 이유 생성
    recommendation.reason = this.generateReasonText(adjustedTemp, description, styleContext, mainSchedule);

    return recommendation;
  }

  /**
   * 시스템 프롬프트 생성
   * @param userPreferences 사용자 선호도
   * @returns string 시스템 프롬프트
   */
  private getSystemPrompt(userPreferences: UserPreferences): string {
    return `당신은 전문적인 패션 스타일리스트입니다. 다음 사용자 정보를 고려하여 조언해주세요:
- 성별: ${userPreferences.gender}
- 연령대: ${userPreferences.ageRange}
- 직업: ${userPreferences.occupation}
- 선호 스타일: ${userPreferences.stylePreference}
- 체형: ${userPreferences.bodyType}
- 피부톤: ${userPreferences.skinTone}
- 선호 색상: ${userPreferences.preferredColors?.join(', ') || '지정 없음'}
- 피하는 색상: ${userPreferences.avoidColors?.join(', ') || '없음'}
- 날씨 민감도: ${userPreferences.weatherSensitivity}

실용적이면서도 스타일리시한 추천을 해주세요. 한국의 패션 트렌드와 문화를 고려해주세요.`;
  }

  /**
   * 사용자 프롬프트 생성
   * @param weatherData 날씨 데이터
   * @param scheduleData 일정 데이터
   * @param userPreferences 사용자 선호도
   * @returns string 프롬프트
   */
  private buildPrompt(
    weatherData: WeatherData,
    scheduleData: Schedule[],
    userPreferences: UserPreferences
  ): string {
    const { temperature, description, humidity, windSpeed } = weatherData;
    
    let prompt = `오늘의 옷차림 추천을 부탁드립니다.

날씨 정보:
- 온도: ${temperature}°C (체감: ${weatherData.feelsLike}°C)
- 날씨: ${description}
- 습도: ${humidity}%
- 바람: ${windSpeed}m/s`;

    if (scheduleData && scheduleData.length > 0) {
      prompt += `\n\n오늘의 일정:`;
      scheduleData.forEach((schedule, index) => {
        prompt += `\n${index + 1}. ${schedule.time}: ${schedule.title} (${schedule.type})`;
        if (schedule.location) {
          prompt += ` - 장소: ${schedule.location}`;
        }
      });
    }

    prompt += `\n\n다음 형식으로 답변해주세요:
1. 상의: (구체적인 아이템과 색상)
2. 하의: (구체적인 아이템과 색상)
3. 아우터: (필요시, 구체적인 아이템)
4. 신발: (구체적인 아이템)
5. 액세서리: (필요시, 구체적인 아이템들)
6. 추천 이유: (날씨와 일정을 고려한 간단한 설명)

실제 구매 가능한 아이템들로 구체적으로 추천해주세요.`;

    return prompt;
  }

  /**
   * AI 응답 파싱
   * @param aiResponse AI의 텍스트 응답
   * @returns StyleRecommendation 파싱된 추천
   */
  private parseAIResponse(aiResponse: string): StyleRecommendation {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    const recommendation: StyleRecommendation = {
      confidence: 0.9, // AI 추천은 높은 신뢰도
      timestamp: Date.now()
    };

    lines.forEach(line => {
      const cleanLine = line.trim();
      
      // 정규식을 사용해서 더 정확하게 파싱
      if (/^\d+\.\s*상의[:：]/i.test(cleanLine)) {
        recommendation.top = cleanLine.replace(/^\d+\.\s*상의[:：]\s*/i, '').trim();
      } else if (/^\d+\.\s*하의[:：]/i.test(cleanLine)) {
        recommendation.bottom = cleanLine.replace(/^\d+\.\s*하의[:：]\s*/i, '').trim();
      } else if (/^\d+\.\s*아우터[:：]/i.test(cleanLine)) {
        recommendation.outer = cleanLine.replace(/^\d+\.\s*아우터[:：]\s*/i, '').trim();
      } else if (/^\d+\.\s*신발[:：]/i.test(cleanLine)) {
        recommendation.shoes = cleanLine.replace(/^\d+\.\s*신발[:：]\s*/i, '').trim();
      } else if (/^\d+\.\s*액세서리[:：]/i.test(cleanLine)) {
        recommendation.accessories = cleanLine.replace(/^\d+\.\s*액세서리[:：]\s*/i, '').trim();
      } else if (/^\d+\.\s*추천\s*이유[:：]/i.test(cleanLine)) {
        recommendation.reason = cleanLine.replace(/^\d+\.\s*추천\s*이유[:：]\s*/i, '').trim();
      }
    });

    // 필수 필드가 비어있으면 기본값 설정
    if (!recommendation.top) recommendation.top = '편안한 상의';
    if (!recommendation.bottom) recommendation.bottom = '편안한 하의';
    if (!recommendation.shoes) recommendation.shoes = '편안한 신발';
    if (!recommendation.reason) recommendation.reason = 'AI가 날씨와 일정을 고려한 추천입니다.';

    return recommendation;
  }

  /**
   * 온도 기반 기본 옷차림 추천
   * @param temperature 조정된 온도
   * @param gender 성별
   * @returns ClothingItems 기본 옷차림
   */
  private getTemperatureBasedClothing(temperature: number, gender: string): any {
    const isMale = gender === 'male';
    
    if (temperature >= 25) {
      return {
        top: isMale ? ['반팔 티셔츠', '린넨 셔츠', '폴로 셔츠'][Math.floor(Math.random() * 3)] :
                     ['블라우스', '캐미솔', '반팔 원피스'][Math.floor(Math.random() * 3)],
        bottom: isMale ? ['반바지', '린넨 팬츠', '치노 반바지'][Math.floor(Math.random() * 3)] :
                        ['스커트', '숏팬츠', '린넨 팬츠'][Math.floor(Math.random() * 3)],
        shoes: ['샌들', '슬리퍼', '캔버스화'][Math.floor(Math.random() * 3)]
      };
    } else if (temperature >= 20) {
      return {
        top: ['긴팔 셔츠', '얇은 니트', '면 티셔츠'][Math.floor(Math.random() * 3)],
        bottom: ['청바지', '치노팬츠', '면바지'][Math.floor(Math.random() * 3)],
        outer: Math.random() > 0.5 ? ['가디건', '얇은 재킷'][Math.floor(Math.random() * 2)] : undefined,
        shoes: ['운동화', '로퍼', '플랫슈즈'][Math.floor(Math.random() * 3)]
      };
    } else if (temperature >= 15) {
      return {
        top: ['스웨터', '후드티', '맨투맨'][Math.floor(Math.random() * 3)],
        bottom: ['청바지', '슬랙스', '코듀로이 팬츠'][Math.floor(Math.random() * 3)],
        outer: ['가디건', '자켓', '바람막이'][Math.floor(Math.random() * 3)],
        shoes: ['운동화', '앵클부츠', '옥스퍼드화'][Math.floor(Math.random() * 3)]
      };
    } else {
      return {
        top: ['니트', '터틀넥', '두꺼운 스웨터'][Math.floor(Math.random() * 3)],
        bottom: ['두꺼운 바지', '기모 청바지', '울 팬츠'][Math.floor(Math.random() * 3)],
        outer: ['코트', '패딩', '트렌치코트'][Math.floor(Math.random() * 3)],
        shoes: ['부츠', '워커', '하이탑'][Math.floor(Math.random() * 3)],
        accessories: '목도리, 장갑'
      };
    }
  }

  /**
   * 날씨 민감도에 따른 온도 조정
   * @param temperature 실제 온도
   * @param sensitivity 민감도
   * @returns number 조정된 온도
   */
  private adjustTemperatureForSensitivity(temperature: number, sensitivity: string): number {
    switch (sensitivity) {
      case 'very_cold': return temperature - 3;
      case 'cold': return temperature - 1.5;
      case 'warm': return temperature + 1.5;
      case 'very_warm': return temperature + 3;
      default: return temperature;
    }
  }

  /**
   * 주요 일정 추출
   * @param schedules 일정 배열
   * @returns Schedule | null 주요 일정
   */
  private getPrimarySchedule(schedules: Schedule[]): Schedule | null {
    if (!schedules || schedules.length === 0) return null;
    
    // 비즈니스 > 포멀 > 기타 순서로 우선순위
    const priorities = ['business', 'formal', 'date', 'exercise', 'casual'];
    
    for (const priority of priorities) {
      const schedule = schedules.find(s => s.type === priority);
      if (schedule) return schedule;
    }
    
    return schedules[0];
  }

  /**
   * 스타일 컨텍스트에 따른 조정
   * @param items 기본 아이템들
   * @param styleContext 스타일 컨텍스트
   * @param gender 성별
   * @returns 조정된 아이템들
   */
  private adjustForStyleContext(items: any, styleContext: string, gender: string): any {
    const isMale = gender === 'male';
    
    switch (styleContext) {
      case 'business':
      case 'formal':
        return {
          ...items,
          top: isMale ? '정장 셔츠' : '블라우스',
          bottom: isMale ? '정장 바지' : '정장 스커트',
          shoes: isMale ? '구두' : '펌프스',
          outer: '재킷'
        };
      case 'exercise':
        return {
          ...items,
          top: '운동복 상의',
          bottom: '운동복 하의',
          shoes: '운동화',
          accessories: '수건, 물병'
        };
      default:
        return items;
    }
  }

  /**
   * 날씨 조건에 따른 추가 조정
   * @param items 아이템들
   * @param weatherDescription 날씨 설명
   * @returns 조정된 아이템들
   */
  private adjustForWeatherCondition(items: any, weatherDescription: string): any {
    const result = { ...items };
    
    if (weatherDescription.includes('비') || weatherDescription.includes('rain')) {
      result.accessories = result.accessories ? 
        `${result.accessories}, 우산, 방수 재킷` : 
        '우산, 방수 재킷';
    }
    
    if (weatherDescription.includes('눈') || weatherDescription.includes('snow')) {
      result.accessories = result.accessories ? 
        `${result.accessories}, 장갑, 방한화` : 
        '장갑, 방한화';
    }
    
    return result;
  }

  /**
   * 추천 이유 텍스트 생성
   * @param temperature 온도
   * @param weather 날씨
   * @param style 스타일
   * @param schedule 주요 일정
   * @returns string 추천 이유
   */
  private generateReasonText(
    temperature: number,
    weather: string,
    style: string,
    schedule: Schedule | null
  ): string {
    const tempReason = temperature >= 25 ? '더운 날씨' :
                      temperature >= 20 ? '따뜻한 날씨' :
                      temperature >= 15 ? '선선한 날씨' : '추운 날씨';
    
    const styleReason = schedule ? 
      `${schedule.title} 일정` : 
      `${style} 스타일`;
    
    return `${tempReason}와 ${styleReason}을 고려한 실용적인 추천입니다.`;
  }

  /**
   * AI 에러를 사용자 친화적인 에러로 변환
   * @param error API 에러
   * @returns Error 변환된 에러
   */
  private createAIError(error: any): Error {
    if (error.code === 'HTTP_401') {
      return new Error('OpenAI API 키가 유효하지 않습니다.');
    }
    
    if (error.code === 'HTTP_429') {
      return new Error('AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    
    return new Error(error.message || ERROR_MESSAGES.AI_RECOMMENDATION_FAILED);
  }

  /**
   * API 키 유효성 검사
   * @returns Promise<boolean> API 키 유효성 여부
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await openaiApiClient.post<OpenAIResponse>(
        API_ENDPOINTS.OPENAI.CHAT,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
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
    return this.apiKey ? await this.validateApiKey() : false;
  }
}

// 싱글톤 인스턴스 export
export default new AIRecommendationService();