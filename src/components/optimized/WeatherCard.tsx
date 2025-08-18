import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, WEATHER_ICONS } from '../../constants';
import { useThemeContext } from '../ThemeProvider';
import type { WeatherData } from '../../types';

interface WeatherCardProps {
  weather: WeatherData;
  showDetails?: boolean;
  style?: any;
}

// 온도에 따른 색상 계산 (메모화됨)
const getTempColorStyle = (temp: number) => {
  if (temp >= 30) return { color: COLORS.error }; // 매우 더움 - 빨강
  if (temp >= 25) return { color: '#FF9500' }; // 더움 - 주황
  if (temp >= 20) return { color: COLORS.success }; // 적당 - 초록
  if (temp >= 10) return { color: COLORS.info }; // 시원 - 파랑
  if (temp >= 0) return { color: '#5856D6' };  // 추움 - 보라
  return { color: '#AF52DE' }; // 매우 추움 - 자주
};

// 날씨 배경색 계산 (메모화됨)
const getWeatherBackground = (weatherCode: string) => {
  if (weatherCode?.includes('01')) return '#87CEEB'; // 맑음
  if (weatherCode?.includes('02') || weatherCode?.includes('03')) return '#B0C4DE'; // 구름
  if (weatherCode?.includes('04')) return '#778899'; // 흐림
  if (weatherCode?.includes('09') || weatherCode?.includes('10')) return '#696969'; // 비
  if (weatherCode?.includes('11')) return '#2F4F4F'; // 천둥
  if (weatherCode?.includes('13')) return '#F0F8FF'; // 눈
  return COLORS.primary; // 기본
};

const WeatherCard: React.FC<WeatherCardProps> = memo(({ weather, showDetails = true, style }) => {
  // 테마 컨텍스트
  const { colors, isDarkMode } = useThemeContext();

  // 메모화된 계산값들
  const temperatureStyle = useMemo(() => getTempColorStyle(weather.temperature), [weather.temperature]);
  
  const feelsLikeStyle = useMemo(() => getTempColorStyle(weather.feelsLike), [weather.feelsLike]);
  
  const weatherIcon = useMemo(() => WEATHER_ICONS[weather.icon] || '🌤️', [weather.icon]);
  
  const backgroundColor = useMemo(() => getWeatherBackground(weather.icon), [weather.icon]);
  
  const lastUpdated = useMemo(() => {
    if (!weather.timestamp) return '';
    return new Date(weather.timestamp).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [weather.timestamp]);

  const isStaleData = useMemo(() => {
    if (!weather.timestamp) return false;
    return Date.now() - weather.timestamp > 10 * 60 * 1000; // 10분 이상
  }, [weather.timestamp]);

  // 날씨 상세 정보 배열 (메모화)
  const weatherDetails = useMemo(() => [
    {
      icon: '🌡️',
      label: '체감온도',
      value: `${weather.feelsLike}°C`,
      style: feelsLikeStyle,
    },
    {
      icon: '💧',
      label: '습도',
      value: `${weather.humidity}%`,
      style: { color: colors.text.primary },
    },
    {
      icon: '💨',
      label: '바람',
      value: `${weather.windSpeed}m/s`,
      style: { color: colors.text.primary },
    },
    {
      icon: '🕐',
      label: '업데이트',
      value: lastUpdated,
      style: { color: isStaleData ? COLORS.warning : colors.text.primary },
    },
  ], [weather.feelsLike, weather.humidity, weather.windSpeed, lastUpdated, isStaleData, feelsLikeStyle]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.primary }, style]}>
      {/* 메인 날씨 정보 */}
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.mainInfo}>
          <Text style={styles.weatherIcon}>{weatherIcon}</Text>
          <View style={styles.temperatureContainer}>
            <Text style={[styles.temperature, temperatureStyle]}>
              {weather.temperature}°C
            </Text>
            <Text style={[styles.description, { color: 'rgba(255, 255, 255, 0.9)' }]}>{weather.description}</Text>
            <Text style={[styles.location, { color: 'rgba(255, 255, 255, 0.8)' }]}>📍 {weather.city}</Text>
            {weather.isStale && (
              <Text style={[styles.staleIndicator, { color: COLORS.warning }]}>⚠️ 데이터가 오래됨</Text>
            )}
          </View>
        </View>
      </View>

      {/* 상세 정보 */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailsTitle, { color: colors.text.primary }]}>상세 날씨</Text>
          <View style={styles.detailsGrid}>
            {weatherDetails.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <Text style={styles.detailIcon}>{detail.icon}</Text>
                <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>{detail.label}</Text>
                <Text style={[styles.detailValue, detail.style]}>
                  {detail.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mock 데이터 표시 */}
      {weather.isMock && (
        <View style={[styles.mockIndicator, { backgroundColor: colors.surface.secondary }]}>
          <Text style={[styles.mockText, { color: colors.text.secondary }]}>🧪 테스트 데이터</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  header: {
    padding: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 64,
    marginRight: SPACING.md,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  staleIndicator: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  detailsContainer: {
    padding: SPACING.lg,
  },
  detailsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  mockIndicator: {
    backgroundColor: COLORS.warning,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  mockText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

WeatherCard.displayName = 'WeatherCard';

export default WeatherCard;