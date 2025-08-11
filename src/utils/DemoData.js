// 데모 및 테스트용 더미 데이터

export const DEMO_WEATHER_DATA = {
  sunny: {
    temperature: 25,
    feelsLike: 27,
    humidity: 45,
    description: '맑음',
    icon: '01d',
    windSpeed: 2.5,
    city: '서울',
    country: 'KR',
    timestamp: Date.now()
  },
  cloudy: {
    temperature: 18,
    feelsLike: 16,
    humidity: 65,
    description: '구름많음',
    icon: '03d',
    windSpeed: 3.2,
    city: '서울',
    country: 'KR',
    timestamp: Date.now()
  },
  rainy: {
    temperature: 15,
    feelsLike: 13,
    humidity: 85,
    description: '비',
    icon: '10d',
    windSpeed: 4.1,
    city: '서울',
    country: 'KR',
    timestamp: Date.now()
  },
  cold: {
    temperature: 3,
    feelsLike: -1,
    humidity: 55,
    description: '흐림',
    icon: '04d',
    windSpeed: 5.2,
    city: '서울',
    country: 'KR',
    timestamp: Date.now()
  }
};

export const DEMO_SCHEDULES = [
  {
    id: 'demo1',
    title: '중요한 프레젠테이션',
    time: '09:00',
    type: 'business',
    location: '본사 회의실',
    description: '신제품 런칭 프레젠테이션',
    recommendedStyle: {
      top: '깔끔한 와이셔츠',
      bottom: '정장 바지',
      outer: '네이비 블레이저',
      shoes: '블랙 옥스포드 구두',
      accessories: '시계, 넥타이'
    }
  },
  {
    id: 'demo2',
    title: '친구들과 카페 모임',
    time: '14:00',
    type: 'casual',
    location: '홍대 스타벅스',
    description: '오랜만에 만나는 대학 친구들',
    recommendedStyle: {
      top: '부드러운 니트',
      bottom: '편안한 청바지',
      outer: '가디건',
      shoes: '화이트 스니커즈',
      accessories: '크로스백'
    }
  },
  {
    id: 'demo3',
    title: '연인과 저녁 데이트',
    time: '19:30',
    type: 'date',
    location: '한강공원',
    description: '야경 보며 산책하기',
    recommendedStyle: {
      top: '세련된 블라우스',
      bottom: '플레어 스커트',
      outer: '트렌치 코트',
      shoes: '로우힐 펌프스',
      accessories: '목걸이, 작은 핸드백'
    }
  },
  {
    id: 'demo4',
    title: '헬스장 운동',
    time: '07:00',
    type: 'exercise',
    location: '집 근처 헬스장',
    description: '아침 운동 루틴',
    recommendedStyle: {
      top: '기능성 운동복',
      bottom: '레깅스',
      outer: '후드 집업',
      shoes: '런닝화',
      accessories: '운동용 물병, 수건'
    }
  }
];

export const DEMO_RECOMMENDATIONS = {
  summer_casual: {
    top: '린넨 반팔 셔츠',
    bottom: '코튼 반바지',
    outer: '',
    shoes: '캔버스 스니커즈',
    accessories: '선글라스, 가벼운 토트백',
    reason: '더운 날씨에 적합한 통풍이 잘 되는 소재로 구성했습니다. 린넨 소재는 시원하고 캐주얼한 분위기를 연출할 수 있어요.',
    confidence: 0.9
  },
  winter_business: {
    top: '울 스웨터',
    bottom: '울 정장 바지',
    outer: '롱 코트',
    shoes: '가죽 옥스포드 구두',
    accessories: '가죽 서류가방, 목도리',
    reason: '추운 날씨의 비즈니스 미팅에 적합한 따뜻하면서도 격식 있는 스타일입니다. 울 소재로 보온성과 전문성을 동시에 확보했어요.',
    confidence: 0.85
  },
  rainy_day: {
    top: '방수 재킷',
    bottom: '다크 진',
    outer: '트렌치 코트',
    shoes: '방수 부츠',
    accessories: '우산, 방수 백팩',
    reason: '비오는 날에 최적화된 방수 기능성 아이템들로 구성했습니다. 실용성을 중시하면서도 스타일을 놓치지 않았어요.',
    confidence: 0.88
  }
};

export const DEMO_USER_PROFILES = {
  male_office_worker: {
    gender: 'male',
    ageRange: '20-29',
    occupation: '직장인',
    stylePreference: 'business',
    notifications: true,
    weatherAlerts: true,
    autoRecommendation: true
  },
  female_student: {
    gender: 'female',
    ageRange: '20-29',
    occupation: '학생',
    stylePreference: 'casual',
    notifications: true,
    weatherAlerts: false,
    autoRecommendation: true
  },
  male_freelancer: {
    gender: 'male',
    ageRange: '30-39',
    occupation: '프리랜서',
    stylePreference: 'trendy',
    notifications: false,
    weatherAlerts: true,
    autoRecommendation: true
  }
};

export const DEMO_FEEDBACK_DATA = [
  {
    id: 'feedback1',
    recommendationId: 'rec1',
    feedbackType: 'like',
    specificItems: ['상의', '신발'],
    improvementSuggestions: '색상이 더 밝았으면 좋겠어요',
    weatherContext: DEMO_WEATHER_DATA.sunny,
    actualOutfitWorn: {
      top: '흰색 셔츠',
      bottom: '베이지 치노',
      shoes: '갈색 로퍼'
    }
  },
  {
    id: 'feedback2',
    recommendationId: 'rec2',
    feedbackType: 'love',
    specificItems: ['전체'],
    improvementSuggestions: '완벽해요!',
    weatherContext: DEMO_WEATHER_DATA.rainy,
    actualOutfitWorn: null
  }
];

export const DEMO_ANALYTICS_DATA = {
  totalRecommendations: 47,
  avgRating: 4.2,
  recommendationsThisMonth: 12,
  mostCommonWeather: '맑음',
  favoriteStyle: 'casual',
  usagePatterns: {
    morningUsage: 68,
    eveningUsage: 32,
    weekdayUsage: 75,
    weekendUsage: 25
  },
  topCategories: [
    { category: '상의', accuracy: 89 },
    { category: '하의', accuracy: 82 },
    { category: '신발', accuracy: 91 },
    { category: '아우터', accuracy: 78 }
  ]
};

// 데모 모드 관리 클래스
class DemoDataManager {
  constructor() {
    this.isDemoMode = false;
    this.currentWeatherScenario = 'sunny';
    this.currentUserProfile = 'male_office_worker';
  }

  // 데모 모드 활성화/비활성화
  setDemoMode(enabled) {
    this.isDemoMode = enabled;
    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // 데모 모드 상태 확인
  getDemoMode() {
    return this.isDemoMode;
  }

  // 현재 날씨 시나리오 설정
  setWeatherScenario(scenario) {
    if (DEMO_WEATHER_DATA[scenario]) {
      this.currentWeatherScenario = scenario;
      console.log(`Weather scenario set to: ${scenario}`);
      return true;
    }
    return false;
  }

  // 현재 날씨 데이터 조회 (데모 또는 실제)
  getCurrentWeatherData() {
    if (this.isDemoMode) {
      return {
        ...DEMO_WEATHER_DATA[this.currentWeatherScenario],
        isDemoData: true
      };
    }
    return null; // 실제 API 호출로 넘어감
  }

  // 사용자 프로필 설정
  setUserProfile(profileKey) {
    if (DEMO_USER_PROFILES[profileKey]) {
      this.currentUserProfile = profileKey;
      console.log(`User profile set to: ${profileKey}`);
      return true;
    }
    return false;
  }

  // 현재 사용자 프로필 조회
  getCurrentUserProfile() {
    if (this.isDemoMode) {
      return {
        ...DEMO_USER_PROFILES[this.currentUserProfile],
        isDemoData: true
      };
    }
    return null;
  }

  // 데모 추천 데이터 조회
  getDemoRecommendation(weatherScenario, userProfile) {
    const weather = DEMO_WEATHER_DATA[weatherScenario || this.currentWeatherScenario];
    const profile = DEMO_USER_PROFILES[userProfile || this.currentUserProfile];
    
    // 날씨와 프로필에 따른 추천 선택 로직
    let recommendationKey;
    
    if (weather.temperature > 25) {
      recommendationKey = 'summer_casual';
    } else if (weather.temperature < 10) {
      recommendationKey = 'winter_business';
    } else if (weather.description.includes('비')) {
      recommendationKey = 'rainy_day';
    } else {
      recommendationKey = 'summer_casual'; // 기본값
    }
    
    return {
      ...DEMO_RECOMMENDATIONS[recommendationKey],
      isDemoData: true,
      weatherContext: weather,
      userContext: profile
    };
  }

  // 데모 일정 데이터 조회
  getDemoSchedules() {
    if (this.isDemoMode) {
      return DEMO_SCHEDULES.map(schedule => ({
        ...schedule,
        isDemoData: true
      }));
    }
    return [];
  }

  // 데모 분석 데이터 조회
  getDemoAnalytics() {
    if (this.isDemoMode) {
      return {
        ...DEMO_ANALYTICS_DATA,
        isDemoData: true
      };
    }
    return null;
  }

  // 사용 가능한 시나리오 목록
  getAvailableScenarios() {
    return {
      weather: Object.keys(DEMO_WEATHER_DATA),
      userProfiles: Object.keys(DEMO_USER_PROFILES),
      recommendations: Object.keys(DEMO_RECOMMENDATIONS)
    };
  }

  // 랜덤 시나리오 설정
  setRandomScenario() {
    const weatherKeys = Object.keys(DEMO_WEATHER_DATA);
    const profileKeys = Object.keys(DEMO_USER_PROFILES);
    
    const randomWeather = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    const randomProfile = profileKeys[Math.floor(Math.random() * profileKeys.length)];
    
    this.setWeatherScenario(randomWeather);
    this.setUserProfile(randomProfile);
    
    return {
      weather: randomWeather,
      profile: randomProfile
    };
  }

  // 데모 데이터 상태 정보
  getStatus() {
    return {
      isDemoMode: this.isDemoMode,
      currentWeatherScenario: this.currentWeatherScenario,
      currentUserProfile: this.currentUserProfile,
      availableScenarios: this.getAvailableScenarios()
    };
  }
}

export default new DemoDataManager();