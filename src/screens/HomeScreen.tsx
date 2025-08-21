import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { useWeather } from '../hooks/useWeather';
import { useRecommendations } from '../hooks/useRecommendations';
import { useUserData } from '../hooks/useUserData';
import { useThemeContext } from '../components/ThemeProvider';
import WeatherCard from '../components/optimized/WeatherCard';
import RecommendationCard from '../components/optimized/RecommendationCard';
import OfflineIndicator from '../components/OfflineIndicator';
import type { NavigationProp } from '@react-navigation/native';
import type { Schedule, WeatherData } from '../types';
import type { WeatherBasedRecommendation } from '../services/RealProductService';
import RealProductService from '../services/RealProductService';
import ShoppingRecommendationCard from '../components/optimized/ShoppingRecommendationCard';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

// 날씨 아이콘 코드를 이모지로 변환하는 함수
const getWeatherEmoji = (iconCode: string): string => {
  if (!iconCode) return '🌈';
  
  // OpenWeather 아이콘 코드를 이모지로 매핑
  if (iconCode.includes('01d')) return '☀️'; // 맑음 (낮)
  if (iconCode.includes('01n')) return '🌙'; // 맑음 (밤)
  if (iconCode.includes('02d')) return '⛅'; // 약간 구름 (낮)
  if (iconCode.includes('02n')) return '☁️'; // 약간 구름 (밤)
  if (iconCode.includes('03')) return '☁️'; // 구름 많음
  if (iconCode.includes('04')) return '☁️'; // 흐림
  if (iconCode.includes('09')) return '🌧️'; // 소나기
  if (iconCode.includes('10d')) return '🌦️'; // 비 (낮)
  if (iconCode.includes('10n')) return '🌧️'; // 비 (밤)
  if (iconCode.includes('11')) return '⛈️'; // 천둥번개
  if (iconCode.includes('13')) return '❄️'; // 눈
  if (iconCode.includes('50')) return '🌫️'; // 안개
  
  return '🌈'; // 기본값
};

const HomeScreen: React.FC<HomeScreenProps> = memo(({ navigation }) => {
  // 로컬 상태
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [shoppingRecommendation, setShoppingRecommendation] = useState<WeatherBasedRecommendation | null>(null);
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [mockRecommendationIndex, setMockRecommendationIndex] = useState(0);

  // 테마 컨텍스트
  const { colors, isDarkMode } = useThemeContext();

  // Redux 상태 및 액션
  const { 
    currentWeather, 
    loading: weatherLoading, 
    error: weatherError,
    loadWeather,
    refreshWeather 
  } = useWeather();
  
  const { 
    current: recommendation, 
    loading: recommendationLoading, 
    error: recommendationError,
    generateRecommendation,
    refreshCurrentRecommendation,
    submitFeedback 
  } = useRecommendations();
  
  const { 
    preferences, 
    todaySchedules, 
    loading: userDataLoading 
  } = useUserData();

  // 메모화된 계산값
  const loading = useMemo(() => 
    weatherLoading || recommendationLoading || userDataLoading,
    [weatherLoading, recommendationLoading, userDataLoading]
  );

  const timeGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 6) return '🌙 늦은 밤';
    if (hour < 12) return '🌅 좋은 아침';
    if (hour < 17) return '☀️ 좋은 오후';
    if (hour < 21) return '🌆 좋은 저녁';
    return '🌙 늦은 저녁';
  }, [currentTime]);

  const weatherBackground = useMemo(() => {
    if (!currentWeather?.icon) return COLORS.primary;
    const weatherCode = currentWeather.icon;
    if (weatherCode.includes('01')) return '#87CEEB'; // 맑음
    if (weatherCode.includes('02') || weatherCode.includes('03')) return '#B0C4DE'; // 구름
    if (weatherCode.includes('04')) return '#778899'; // 흐림
    if (weatherCode.includes('09') || weatherCode.includes('10')) return '#696969'; // 비
    if (weatherCode.includes('11')) return '#2F4F4F'; // 천둥
    if (weatherCode.includes('13')) return '#F0F8FF'; // 눈
    return COLORS.primary; // 기본
  }, [currentWeather?.icon]);

  const temperatureStyle = useMemo(() => {
    if (!currentWeather?.temperature) return { color: COLORS.text.primary };
    const temp = currentWeather.temperature;
    if (temp >= 30) return { color: COLORS.error }; // 매우 더움 - 빨강
    if (temp >= 25) return { color: '#FF9500' }; // 더움 - 주황
    if (temp >= 20) return { color: COLORS.success }; // 적당 - 초록
    if (temp >= 10) return { color: COLORS.info }; // 시원 - 파랑
    if (temp >= 0) return { color: '#5856D6' };  // 추움 - 보라
    return { color: '#AF52DE' }; // 매우 추움 - 자주
  }, [currentWeather?.temperature]);

  const displaySchedules = useMemo(() => 
    todaySchedules.slice(0, 5),
    [todaySchedules]
  );

  // 메모화된 콜백
  const loadLocationAndWeather = useCallback(async () => {
    try {
      await loadWeather();
    } catch (error) {
      console.error('날씨 정보 로딩 실패:', error);
      Alert.alert('오류', '날씨 정보를 가져올 수 없습니다.');
    }
  }, [loadWeather]);

  const onRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refreshWeather(),
        loadLocationAndWeather()
      ]);
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  }, [refreshWeather, loadLocationAndWeather]);

  // 여러 Mock 추천 데이터
  const mockRecommendations = useMemo(() => [
    {
      top: '유니클로 에어리즘 UV 컷 티셔츠',
      bottom: '리바이스 511 슬림핏 청바지', 
      outer: '스파오 가벼운 린넨 가디건',
      shoes: '아디다스 스탠스미스 스니커즈',
      accessories: '심플한 실버 시계',
      reason: '오늘의 날씨에 맞는 시원하고 편안한 코디를 추천합니다.',
      confidence: 0.85,
      timestamp: Date.now(),
      weatherCondition: currentWeather?.description || '맑음',
      temperature: currentWeather?.temperature || 22,
      occasion: 'casual'
    },
    {
      top: '지오다노 코튼 블렌드 셔츠',
      bottom: '유니클로 치노 팬츠',
      outer: '탑텐 베이직 블레이저',
      shoes: '나이키 에어맥스 스니커즈', 
      accessories: '가죽 벨트',
      reason: '비즈니스 캐주얼에 적합한 깔끔한 스타일입니다.',
      confidence: 0.78,
      timestamp: Date.now(),
      weatherCondition: currentWeather?.description || '맑음',
      temperature: currentWeather?.temperature || 22,
      occasion: 'business'
    },
    {
      top: '스파오 오버핏 니트',
      bottom: '지오다노 데님 팬츠',
      outer: '에잇세컨즈 코듀로이 자켓',
      shoes: '컨버스 척테일러 스니커즈',
      accessories: '베레모, 크로스백',
      reason: '트렌디하고 개성있는 스트릿 스타일을 제안합니다.',
      confidence: 0.82,
      timestamp: Date.now(),
      weatherCondition: currentWeather?.description || '맑음', 
      temperature: currentWeather?.temperature || 22,
      occasion: 'date'
    }
  ], [currentWeather]);

  const handleNewRecommendation = useCallback(async () => {
    try {
      console.log('🔄 새로운 추천 생성 중...');
      // Mock 추천 인덱스 변경
      setMockRecommendationIndex(prev => (prev + 1) % mockRecommendations.length);
      Alert.alert('성공', '🔄 새로운 추천을 생성했습니다!');
    } catch (error) {
      console.error('새 추천 실패:', error);
      Alert.alert('오류', '추천 생성에 실패했습니다. 다시 시도해주세요.');
    }
  }, [mockRecommendations.length]);

  const handleRecommendationFeedback = useCallback(async (type: 'like' | 'dislike') => {
    await submitFeedback(type);
  }, [submitFeedback]);

  // 쇼핑 추천 초기 로드
  const loadShoppingRecommendations = useCallback(async () => {
    if (!currentWeather || !preferences) return;
    
    try {
      setShoppingLoading(true);
      const recommendation = await RealProductService.getWeatherBasedRecommendations(
        currentWeather,
        preferences
      );
      setShoppingRecommendation(recommendation);
    } catch (error) {
      console.error('쇼핑 추천 로드 실패:', error);
    } finally {
      setShoppingLoading(false);
    }
  }, [currentWeather, preferences]);

  // 쇼핑 추천 새로고침
  const handleRefreshShopping = useCallback(async () => {
    console.log('쇼핑 추천 새로고침 버튼 클릭됨');
    await loadShoppingRecommendations();
  }, [loadShoppingRecommendations]);

  // 상품 클릭 핸들러
  const handleProductPress = useCallback(async (product: any) => {
    console.log('HomeScreen 상품 클릭:', product.name, product.productUrl);
    try {
      const url = product.affiliate?.trackingUrl || product.productUrl;
      console.log('HomeScreen에서 열려는 URL:', url);
      
      if (!url) {
        Alert.alert('오류', '상품 링크가 없습니다.');
        return;
      }
      
      // 웹 환경에서는 window.open 사용
      if (typeof window !== 'undefined' && window.open) {
        console.log('window.open으로 링크 열기');
        window.open(url, '_blank');
        return;
      }
      
      // 모바일 환경에서는 Linking 사용
      const { Linking } = require('react-native');
      console.log('Linking.openURL로 링크 열기');
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log('링크 열기 성공');
      } else {
        console.log('URL 지원 안됨:', url);
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('상품 링크 열기 실패:', error);
      Alert.alert('오류', `링크를 열 수 없습니다: ${error}`);
    }
  }, []);

  const navigateToSchedule = useCallback(() => {
    console.log('일정 페이지 이동 버튼 클릭됨');
    navigation.navigate('Schedule');
  }, [navigation]);

  const navigateToSettings = useCallback(() => {
    console.log('설정 페이지 이동 버튼 클릭됨');
    navigation.navigate('Settings');
  }, [navigation]);

  const navigateToAnalytics = useCallback(() => {
    console.log('분석 페이지 이동 버튼 클릭됨');
    navigation.navigate('Analytics');
  }, [navigation]);

  // Effects
  useEffect(() => {
    loadLocationAndWeather();
    
    // 시간 업데이트
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    return () => clearInterval(timeInterval);
  }, [loadLocationAndWeather, fadeAnim, slideAnim]);

  // 자동 추천 생성
  useEffect(() => {
    if (currentWeather && !recommendation && !loading && preferences?.autoRecommendation) {
      generateRecommendation();
    }
  }, [currentWeather, recommendation, loading, preferences?.autoRecommendation, generateRecommendation]);

  // 쇼핑 추천 자동 로드
  useEffect(() => {
    if (currentWeather && !shoppingLoading) {
      loadShoppingRecommendations();
    }
  }, [currentWeather, loadShoppingRecommendations, shoppingLoading]);

  if (loading && !currentWeather) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>날씨 정보를 가져오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* 오프라인 인디케이터 */}
      <OfflineIndicator />
      
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
      {/* 동적 헤더 */}
      <Animated.View 
        style={[
          styles.header,
          {
            backgroundColor: weatherBackground,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <Text style={[styles.greetingText, { color: 'rgba(255, 255, 255, 0.9)' }]}>{timeGreeting}</Text>
            <Text style={[styles.appTitle, { color: colors.white }]}>StyleWeather</Text>
          </View>
          <View style={styles.dateTimeSection}>
            <Text style={[styles.currentTime, { color: colors.white }]}>
              {currentTime.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
            <Text style={[styles.currentDate, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {currentTime.toLocaleDateString('ko-KR', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
              })}
            </Text>
          </View>
        </View>

        {/* 현재 날씨 요약 */}
        {currentWeather && (
          <View style={styles.weatherSummary}>
            <View style={styles.weatherMainInfo}>
              <Text style={styles.weatherIcon}>
                {getWeatherEmoji(currentWeather.icon)}
              </Text>
              <View style={styles.temperatureSection}>
                <Text style={[styles.mainTemperature, temperatureStyle]}>
                  {currentWeather.temperature}°
                </Text>
                <Text style={[styles.weatherDescription, { color: 'rgba(255, 255, 255, 0.9)' }]}>{currentWeather.description}</Text>
              </View>
            </View>
            <View style={styles.weatherSubInfo}>
              <Text style={[styles.location, { color: 'rgba(255, 255, 255, 0.8)' }]}>📍 {currentWeather.city}</Text>
              <Text style={[styles.feelsLike, { color: 'rgba(255, 255, 255, 0.7)' }]}>체감 {currentWeather.feelsLike}°C</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* 추천 카드 */}
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <RecommendationCard 
          recommendation={recommendation || mockRecommendations[mockRecommendationIndex]}
          onFeedback={handleRecommendationFeedback}
          onRefresh={handleNewRecommendation}
          loading={recommendationLoading}
          userGender={preferences?.gender || 'male'}
        />
      </Animated.View>

      {/* 쇼핑 추천 카드 */}
      {shoppingRecommendation && (
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
          <ShoppingRecommendationCard 
            recommendation={shoppingRecommendation}
            onRefresh={handleRefreshShopping}
            onProductPress={handleProductPress}
            loading={shoppingLoading}
          />
        </Animated.View>
      )}

      {/* 오늘의 스케줄 */}
      <Animated.View 
        style={[styles.scheduleSection, { opacity: fadeAnim }]}
      >
        <View style={styles.scheduleSectionHeader}>
          <Text style={styles.scheduleSectionTitle}>📅 오늘의 일정</Text>
          <TouchableOpacity
            onPress={navigateToSchedule}
            style={styles.scheduleViewAllButton}
          >
            <Text style={styles.scheduleViewAllText}>전체보기 〉</Text>
          </TouchableOpacity>
        </View>
        
        {todaySchedules.length === 0 ? (
          <View style={styles.noScheduleContainer}>
            <Text style={styles.noScheduleIcon}>📝</Text>
            <Text style={styles.noScheduleText}>오늘 일정이 없습니다</Text>
            <TouchableOpacity
              style={styles.addScheduleButton}
              onPress={navigateToSchedule}
            >
              <Text style={styles.addScheduleButtonText}>일정 추가하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            style={styles.scheduleHorizontalScroll}
            showsHorizontalScrollIndicator={false}
          >
            {displaySchedules.map((schedule: Schedule, index: number) => (
              <View key={schedule.id || index} style={styles.scheduleCard}>
                <View style={styles.scheduleCardHeader}>
                  <Text style={styles.scheduleTime}>{schedule.time}</Text>
                  <Text style={styles.scheduleType}>
                    {schedule.type === 'business' ? '💼' :
                     schedule.type === 'casual' ? '☕' :
                     schedule.type === 'date' ? '💕' :
                     schedule.type === 'exercise' ? '🏃‍♂️' :
                     schedule.type === 'formal' ? '🎩' : '📅'}
                  </Text>
                </View>
                <Text style={styles.scheduleCardTitle} numberOfLines={2}>
                  {schedule.title}
                </Text>
                {schedule.location && (
                  <Text style={styles.scheduleLocation} numberOfLines={1}>
                    📍 {schedule.location}
                  </Text>
                )}
                {schedule.recommendedStyle && (
                  <View style={styles.scheduleStylePreview}>
                    <Text style={styles.scheduleStyleText} numberOfLines={1}>
                      👔 {schedule.recommendedStyle.top || '코디 추천'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            
            {todaySchedules.length > 5 && (
              <TouchableOpacity
                style={styles.moreSchedulesCard}
                onPress={navigateToSchedule}
              >
                <Text style={styles.moreSchedulesText}>
                  +{todaySchedules.length - 5}개{'\n'}더보기
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* 퀵 액션 버튼들 */}
      <Animated.View 
        style={[styles.actionSection, { opacity: fadeAnim }]}
      >
        <Text style={styles.actionSectionTitle}>⚡ 빠른 액션</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.scheduleButton]}
            onPress={navigateToSchedule}
          >
            <Text style={styles.actionButtonIcon}>📅</Text>
            <Text style={styles.actionButtonText}>일정 확인</Text>
            <Text style={styles.actionButtonSubtext}>오늘의 스케줄</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.refreshButton]}
            onPress={handleNewRecommendation}
            disabled={recommendationLoading}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.actionButtonText}>
              {recommendationLoading ? '생성 중...' : '새 추천'}
            </Text>
            <Text style={styles.actionButtonSubtext}>다시 받기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.settingsButton]}
            onPress={navigateToSettings}
          >
            <Text style={styles.actionButtonIcon}>⚙️</Text>
            <Text style={styles.actionButtonText}>설정</Text>
            <Text style={styles.actionButtonSubtext}>스타일 조정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.analyticsButton]}
            onPress={navigateToAnalytics}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>통계</Text>
            <Text style={styles.actionButtonSubtext}>분석 결과</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

        {/* 하단 여백 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
  },
  
  // === 헤더 스타일 ===
  header: {
    borderBottomLeftRadius: BORDER_RADIUS['2xl'],
    borderBottomRightRadius: BORDER_RADIUS['2xl'],
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    ...SHADOWS.md,
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  titleSection: {
    flex: 1,
  },
  dateTimeSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  appTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  currentTime: {
    color: COLORS.white,
    fontSize: FONT_SIZES['3xl'],
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  currentDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  weatherSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  weatherMainInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  temperatureSection: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  weatherSubInfo: {
    alignItems: 'center',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
  },
  weatherIcon: {
    fontSize: 72,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  mainTemperature: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  weatherDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    marginTop: 2,
  },
  location: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  feelsLike: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },

  // === 카드 공통 스타일 ===
  cardContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },

  // === 액션 섹션 ===
  actionSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  actionSectionTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  scheduleButton: {
    backgroundColor: COLORS.info,
  },
  refreshButton: {
    backgroundColor: '#8B5CF6',
  },
  settingsButton: {
    backgroundColor: COLORS.gray[600],
  },
  analyticsButton: {
    backgroundColor: COLORS.warning,
  },
  actionButtonIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },

  // === 스케줄 섹션 ===
  scheduleSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  scheduleSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  scheduleSectionTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  scheduleViewAllButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  scheduleViewAllText: {
    color: COLORS.info,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  noScheduleContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },
  noScheduleIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  noScheduleText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.md,
  },
  addScheduleButton: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  addScheduleButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  scheduleHorizontalScroll: {
    flexDirection: 'row',
  },
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    padding: SPACING.md,
    width: 140,
    ...SHADOWS.sm,
  },
  scheduleCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  scheduleTime: {
    color: COLORS.info,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  scheduleType: {
    fontSize: 16,
  },
  scheduleCardTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  scheduleLocation: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.xs,
  },
  scheduleStylePreview: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.xs,
    padding: SPACING.xs,
  },
  scheduleStyleText: {
    color: COLORS.gray[600],
    fontSize: FONT_SIZES.xs - 1,
    textAlign: 'center',
  },
  moreSchedulesCard: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    padding: SPACING.md,
    width: 80,
  },
  moreSchedulesText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
  },

  // === 기타 ===
  bottomPadding: {
    height: 30,
  },
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;