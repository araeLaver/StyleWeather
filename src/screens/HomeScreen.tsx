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
import type { WeatherBasedRecommendation } from '../types/shopping';
import ShoppingService from '../services/ShoppingService';
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

  const handleNewRecommendation = useCallback(async () => {
    try {
      await refreshCurrentRecommendation();
      Alert.alert('성공', '🔄 새로운 추천을 생성했습니다!');
    } catch (error) {
      console.error('새 추천 실패:', error);
      Alert.alert('오류', '추천 생성에 실패했습니다. 다시 시도해주세요.');
    }
  }, [refreshCurrentRecommendation]);

  const handleRecommendationFeedback = useCallback(async (type: 'like' | 'dislike') => {
    await submitFeedback(type);
  }, [submitFeedback]);

  // 쇼핑 추천 초기 로드
  const loadShoppingRecommendations = useCallback(async () => {
    if (!currentWeather) return;
    
    try {
      setShoppingLoading(true);
      const recommendation = await ShoppingService.getWeatherBasedRecommendations(
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
    await loadShoppingRecommendations();
  }, [loadShoppingRecommendations]);

  const navigateToSchedule = useCallback(() => {
    navigation.navigate('Schedule');
  }, [navigation]);

  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const navigateToAnalytics = useCallback(() => {
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
    if (currentWeather && !recommendation && !loading && preferences.autoRecommendation) {
      generateRecommendation();
    }
  }, [currentWeather, recommendation, loading, preferences.autoRecommendation, generateRecommendation]);

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
      {recommendation && (
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
          <RecommendationCard 
            recommendation={recommendation}
            onFeedback={handleRecommendationFeedback}
            onRefresh={handleNewRecommendation}
            loading={recommendationLoading}
          />
        </Animated.View>
      )}

      {/* 쇼핑 추천 카드 */}
      {shoppingRecommendation && (
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
          <ShoppingRecommendationCard 
            recommendation={shoppingRecommendation}
            onRefresh={handleRefreshShopping}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
  },
  
  // === 헤더 스타일 ===
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS['2xl'],
    borderBottomRightRadius: BORDER_RADIUS['2xl'],
    ...SHADOWS.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  appTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  currentTime: {
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.white,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  currentDate: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  weatherSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    backdropFilter: 'blur(10px)',
  },
  weatherMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  temperatureSection: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  weatherSubInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
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
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  feelsLike: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.7)',
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
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scheduleSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  scheduleViewAllButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  scheduleViewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    fontWeight: '600',
  },
  noScheduleContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  noScheduleIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  noScheduleText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  addScheduleButton: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
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
    padding: SPACING.md,
    marginRight: SPACING.md,
    width: 140,
    ...SHADOWS.sm,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scheduleTime: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.info,
  },
  scheduleType: {
    fontSize: 16,
  },
  scheduleCardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  scheduleLocation: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  scheduleStylePreview: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.xs,
    padding: SPACING.xs,
  },
  scheduleStyleText: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  moreSchedulesCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
  },
  moreSchedulesText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },

  // === 기타 ===
  bottomPadding: {
    height: 30,
  },
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;