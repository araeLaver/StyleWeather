# 🌤️ StyleWeather - AI 옷차림 추천 앱

> 날씨와 일정을 고려한 맞춤형 코디네이트 추천 서비스

![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📱 앱 소개

StyleWeather는 매일 아침 옷 선택 고민을 해결해주는 **AI 기반 스마트 코디네이트 추천 앱**입니다.

### 🎯 주요 특징

- **🌡️ 실시간 날씨 연동**: 현재 위치의 날씨 정보 기반 추천
- **🤖 AI 맞춤 추천**: OpenAI GPT를 활용한 개인화된 스타일 제안
- **📅 일정별 코디**: 캘린더 연동으로 상황에 맞는 옷차림 추천
- **👤 개인화 설정**: 성별, 연령, 직업, 선호 스타일 기반 맞춤화
- **📱 직관적 UI**: 미니멀하고 사용하기 쉬운 인터페이스

## 🚀 시작하기

### 📋 필요 조건

- Node.js 16+ 
- npm 또는 yarn
- Expo CLI
- iOS/Android 시뮬레이터 또는 실제 디바이스

### 🔧 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/your-username/StyleWeather-App.git
cd StyleWeather-App
```

2. **의존성 설치**
```bash
npm install
# 또는
yarn install
```

3. **환경변수 설정**
```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 API 키들을 입력하세요:

```env
# OpenWeatherMap API Key (https://openweathermap.org/api)
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here

# OpenAI API Key (https://platform.openai.com/api-keys)  
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here

# Supabase 설정 (https://supabase.com)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
```

4. **앱 실행**
```bash
npm start
# 또는
npx expo start
```

## 🏗️ 프로젝트 구조

```
StyleWeather-App/
├── App.js                 # 메인 앱 컴포넌트
├── .env.example           # 환경변수 템플릿
├── package.json           # 프로젝트 의존성
└── src/
    ├── components/        # 재사용 가능한 컴포넌트
    ├── config/           # 앱 설정 및 상수
    │   └── config.js     # 환경변수 및 설정
    ├── screens/          # 화면 컴포넌트
    │   ├── HomeScreen.js      # 메인 홈 화면
    │   ├── ScheduleScreen.js  # 일정 관리 화면  
    │   └── SettingsScreen.js  # 설정 화면
    ├── services/         # 외부 API 서비스
    │   ├── WeatherService.js     # 날씨 API 연동
    │   └── AIRecommendationService.js # AI 추천 서비스
    └── utils/            # 유틸리티 함수
```

## 🔌 API 연동

### 1. OpenWeatherMap API
- **용도**: 실시간 날씨 정보 조회
- **발급**: https://openweathermap.org/api
- **무료**: 1000회/일 호출 가능

### 2. OpenAI API  
- **용도**: AI 기반 코디 추천
- **발급**: https://platform.openai.com/api-keys
- **비용**: 사용량 기반 과금

### 3. Supabase (선택사항)
- **용도**: 사용자 데이터 저장
- **발급**: https://supabase.com
- **무료**: 500MB 데이터베이스 제공

## 📱 주요 화면

### 🏠 홈 화면
- 현재 날씨 정보 표시
- 오늘의 추천 코디 출력
- 사용자 피드백 수집

### 📅 일정 화면  
- Google 캘린더 연동 (예정)
- 일정별 맞춤 코디 추천
- 상황별 스타일 가이드

### ⚙️ 설정 화면
- 개인정보 설정 (성별, 연령, 직업)
- 선호 스타일 선택
- 알림 설정 관리

## 🛠️ 개발 기술 스택

### Frontend
- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **Expo**: 빠른 개발 및 배포 환경
- **React Navigation**: 화면 네비게이션 관리
- **AsyncStorage**: 로컬 데이터 저장

### Backend & APIs
- **OpenWeatherMap**: 날씨 정보 API
- **OpenAI GPT**: AI 기반 추천 시스템
- **Supabase**: 백엔드 서비스 (데이터베이스, 인증)

### Development Tools
- **Axios**: HTTP 클라이언트
- **Expo Location**: 위치 정보 접근
- **React Native Safe Area Context**: 안전 영역 관리

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#2D3748` (다크 그레이)
- **Secondary**: `#4299E1` (블루)
- **Background**: `#F8F9FA` (라이트 그레이)
- **Text**: `#2D3748`, `#4A5568`, `#718096`

### 타이포그래피
- **헤더**: 18-24px, Bold
- **본문**: 14-16px, Regular
- **캡션**: 12px, Regular

## 🧪 테스트

```bash
# 유닛 테스트 실행 (예정)
npm test

# E2E 테스트 실행 (예정)  
npm run test:e2e
```

## 📦 빌드 및 배포

### iOS 빌드
```bash
npx expo build:ios
```

### Android 빌드  
```bash
npx expo build:android
```

### EAS Build (권장)
```bash
npx eas build --platform all
```

## 🛣️ 로드맵

### Phase 1 (완료) ✅
- [x] 기본 앱 구조 및 네비게이션
- [x] 날씨 API 연동
- [x] AI 추천 시스템 기본 구현
- [x] 사용자 설정 관리

### Phase 2 (계획)
- [ ] Google Calendar API 연동
- [ ] 사용자 인증 시스템
- [ ] 추천 히스토리 저장
- [ ] 푸시 알림 기능

### Phase 3 (계획)
- [ ] 개인 옷장 관리 기능
- [ ] 소셜 공유 기능
- [ ] 쇼핑몰 연동
- [ ] 프리미엄 구독 모델

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 감사의 말

- [OpenWeatherMap](https://openweathermap.org/) - 날씨 API 제공
- [OpenAI](https://openai.com/) - AI 추천 시스템
- [Expo](https://expo.dev/) - 개발 플랫폼 지원
- [React Native](https://reactnative.dev/) - 크로스 플랫폼 프레임워크

---

📱 **StyleWeather로 매일 아침이 더 편해집니다!**