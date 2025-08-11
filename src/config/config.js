export const CONFIG = {
  // API 설정
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  
  // Supabase 설정
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // 앱 설정
  APP_NAME: 'StyleWeather',
  VERSION: '1.0.0',
  
  // 기본값
  DEFAULT_LOCATION: {
    latitude: 37.5665,
    longitude: 126.9780,
    city: 'Seoul'
  },
  
  // 스타일 옵션
  STYLE_OPTIONS: [
    { id: 'casual', name: '캐주얼', emoji: '👕' },
    { id: 'business', name: '비즈니스', emoji: '👔' },
    { id: 'formal', name: '포멀', emoji: '🤵' },
    { id: 'sporty', name: '스포티', emoji: '🏃‍♂️' },
    { id: 'trendy', name: '트렌디', emoji: '✨' }
  ],
  
  // 날씨 아이콘 매핑
  WEATHER_ICONS: {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  }
};