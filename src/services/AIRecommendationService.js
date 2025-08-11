import axios from 'axios';
import { CONFIG } from '../config/config';

class AIRecommendationService {
  constructor() {
    this.apiKey = CONFIG.OPENAI_API_KEY;
    this.baseURL = CONFIG.OPENAI_BASE_URL;
  }

  async getStyleRecommendation(weatherData, scheduleData, userPreferences) {
    try {
      const prompt = this.buildPrompt(weatherData, scheduleData, userPreferences);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '당신은 전문 스타일리스트입니다. 날씨와 일정을 고려하여 적절한 옷차림을 추천해주세요.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseAIResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      // AI 서비스 실패 시 기본 추천 로직 사용
      return this.getBasicRecommendation(weatherData, scheduleData, userPreferences);
    }
  }

  buildPrompt(weatherData, scheduleData, userPreferences) {
    const { temperature, description, humidity } = weatherData;
    const { gender, ageRange, occupation, stylePreference } = userPreferences;
    
    let prompt = `오늘의 옷차림 추천을 부탁드립니다.

날씨 정보:
- 온도: ${temperature}°C
- 날씨: ${description}
- 습도: ${humidity}%

사용자 정보:
- 성별: ${gender}
- 연령대: ${ageRange}
- 직업: ${occupation}
- 선호 스타일: ${stylePreference}`;

    if (scheduleData && scheduleData.length > 0) {
      prompt += `\n\n오늘의 일정:`;
      scheduleData.forEach((schedule, index) => {
        prompt += `\n${index + 1}. ${schedule.time}: ${schedule.title} (${schedule.type})`;
      });
    }

    prompt += `\n\n위 정보를 바탕으로 다음 형식으로 답변해주세요:
1. 상의: (구체적인 아이템)
2. 하의: (구체적인 아이템)  
3. 아우터: (필요시)
4. 신발: (구체적인 아이템)
5. 액세서리: (필요시)
6. 추천 이유: (간단한 설명)`;

    return prompt;
  }

  parseAIResponse(aiResponse) {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    const recommendation = {
      top: '',
      bottom: '',
      outer: '',
      shoes: '',
      accessories: '',
      reason: '',
      confidence: 0.8
    };

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.includes('상의:')) {
        recommendation.top = cleanLine.replace(/^\d+\.\s*상의:\s*/, '').trim();
      } else if (cleanLine.includes('하의:')) {
        recommendation.bottom = cleanLine.replace(/^\d+\.\s*하의:\s*/, '').trim();
      } else if (cleanLine.includes('아우터:')) {
        recommendation.outer = cleanLine.replace(/^\d+\.\s*아우터:\s*/, '').trim();
      } else if (cleanLine.includes('신발:')) {
        recommendation.shoes = cleanLine.replace(/^\d+\.\s*신발:\s*/, '').trim();
      } else if (cleanLine.includes('액세서리:')) {
        recommendation.accessories = cleanLine.replace(/^\d+\.\s*액세서리:\s*/, '').trim();
      } else if (cleanLine.includes('추천 이유:')) {
        recommendation.reason = cleanLine.replace(/^\d+\.\s*추천 이유:\s*/, '').trim();
      }
    });

    return recommendation;
  }

  // AI 서비스 실패 시 사용할 기본 추천 로직
  getBasicRecommendation(weatherData, scheduleData, userPreferences) {
    const { temperature, description } = weatherData;
    const { stylePreference, gender } = userPreferences;

    let recommendation = {
      top: '',
      bottom: '',
      outer: '',
      shoes: '',
      accessories: '',
      reason: '기본 추천 시스템',
      confidence: 0.6
    };

    // 온도별 기본 추천
    if (temperature >= 25) {
      recommendation.top = gender === 'male' ? '반팔 티셔츠' : '블라우스';
      recommendation.bottom = gender === 'male' ? '반바지' : '스커트';
      recommendation.shoes = '샌들';
    } else if (temperature >= 20) {
      recommendation.top = '긴팔 셔츠';
      recommendation.bottom = '청바지';
      recommendation.shoes = '운동화';
    } else if (temperature >= 15) {
      recommendation.top = '스웨터';
      recommendation.bottom = '청바지';
      recommendation.outer = '가디건';
      recommendation.shoes = '운동화';
    } else {
      recommendation.top = '니트';
      recommendation.bottom = '두꺼운 바지';
      recommendation.outer = '코트';
      recommendation.shoes = '부츠';
    }

    // 비 오는 날 추가 아이템
    if (description.includes('비') || description.includes('rain')) {
      recommendation.accessories = '우산, 방수 재킷';
    }

    // 스타일별 조정
    if (stylePreference === 'business') {
      recommendation.top = gender === 'male' ? '와이셔츠' : '블라우스';
      recommendation.bottom = gender === 'male' ? '정장 바지' : '스커트';
      recommendation.shoes = gender === 'male' ? '구두' : '펌프스';
      recommendation.outer = '재킷';
    }

    return recommendation;
  }
}

export default new AIRecommendationService();