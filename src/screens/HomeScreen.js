import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import * as Location from 'expo-location';
import WeatherService from '../services/WeatherService';
import AIRecommendationService from '../services/AIRecommendationService';
import { CONFIG } from '../config/config';

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadWeatherAndRecommendation();
  }, []);

  const loadWeatherAndRecommendation = async () => {
    try {
      setLoading(true);
      
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한', '날씨 정보를 위해 위치 권한이 필요합니다.');
        // 기본 위치 사용 (서울)
        await loadWeatherData(
          CONFIG.DEFAULT_LOCATION.latitude,
          CONFIG.DEFAULT_LOCATION.longitude
        );
        return;
      }

      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      await loadWeatherData(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error('위치 또는 날씨 정보 로딩 실패:', error);
      Alert.alert('오류', '날씨 정보를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async (latitude, longitude) => {
    try {
      const weatherData = await WeatherService.getCurrentWeather(latitude, longitude);
      setWeather(weatherData);

      // AI 추천 받기 (현재는 기본 사용자 설정으로)
      const defaultUserPreferences = {
        gender: 'male',
        ageRange: '20-30',
        occupation: '직장인',
        stylePreference: 'casual'
      };

      const aiRecommendation = await AIRecommendationService.getStyleRecommendation(
        weatherData,
        [], // 일정 데이터 (향후 구현)
        defaultUserPreferences
      );

      setRecommendation(aiRecommendation);
    } catch (error) {
      console.error('날씨 데이터 로딩 실패:', error);
      Alert.alert('오류', error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherAndRecommendation();
    setRefreshing(false);
  };

  const getWeatherIcon = (iconCode) => {
    return CONFIG.WEATHER_ICONS[iconCode] || '🌤️';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>날씨 정보를 가져오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>StyleWeather</Text>
        <Text style={styles.subtitle}>오늘의 코디 추천</Text>
      </View>

      {/* 날씨 정보 */}
      {weather && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherIcon}>
              {getWeatherIcon(weather.icon)}
            </Text>
            <View style={styles.weatherInfo}>
              <Text style={styles.temperature}>{weather.temperature}°C</Text>
              <Text style={styles.weatherDescription}>{weather.description}</Text>
              <Text style={styles.location}>{weather.city}</Text>
            </View>
          </View>
          
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherDetail}>체감온도: {weather.feelsLike}°C</Text>
            <Text style={styles.weatherDetail}>습도: {weather.humidity}%</Text>
            <Text style={styles.weatherDetail}>바람: {weather.windSpeed}m/s</Text>
          </View>
        </View>
      )}

      {/* 오늘의 추천 */}
      {recommendation && (
        <View style={styles.recommendationCard}>
          <Text style={styles.cardTitle}>📱 오늘의 코디 추천</Text>
          
          <View style={styles.outfitGrid}>
            {recommendation.top && (
              <View style={styles.outfitItem}>
                <Text style={styles.outfitCategory}>상의</Text>
                <Text style={styles.outfitText}>{recommendation.top}</Text>
              </View>
            )}
            
            {recommendation.bottom && (
              <View style={styles.outfitItem}>
                <Text style={styles.outfitCategory}>하의</Text>
                <Text style={styles.outfitText}>{recommendation.bottom}</Text>
              </View>
            )}
            
            {recommendation.outer && (
              <View style={styles.outfitItem}>
                <Text style={styles.outfitCategory}>아우터</Text>
                <Text style={styles.outfitText}>{recommendation.outer}</Text>
              </View>
            )}
            
            {recommendation.shoes && (
              <View style={styles.outfitItem}>
                <Text style={styles.outfitCategory}>신발</Text>
                <Text style={styles.outfitText}>{recommendation.shoes}</Text>
              </View>
            )}
          </View>

          {recommendation.reason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonTitle}>추천 이유:</Text>
              <Text style={styles.reasonText}>{recommendation.reason}</Text>
            </View>
          )}

          {/* 피드백 버튼 */}
          <View style={styles.feedbackContainer}>
            <TouchableOpacity style={styles.feedbackButton}>
              <Text style={styles.feedbackButtonText}>👍 좋아요</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackButton}>
              <Text style={styles.feedbackButtonText}>👎 별로예요</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 하단 액션 버튼들 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={styles.actionButtonText}>📅 일정 확인</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={loadWeatherAndRecommendation}
        >
          <Text style={styles.actionButtonText}>🔄 다시 추천</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    backgroundColor: '#2d3748',
    padding: 20,
    paddingTop: 50,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#4a5568',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  weatherDetail: {
    fontSize: 12,
    color: '#718096',
  },
  recommendationCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitItem: {
    width: '48%',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  outfitCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 4,
  },
  outfitText: {
    fontSize: 14,
    color: '#2d3748',
  },
  reasonContainer: {
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  feedbackButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#4a5568',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4299e1',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;