import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useThemeContext } from '../ThemeProvider';
import type { StyleRecommendation } from '../../types';

interface RecommendationCardProps {
  recommendation: StyleRecommendation;
  onFeedback?: (type: 'like' | 'dislike') => void;
  onRefresh?: () => void;
  loading?: boolean;
  style?: any;
  userGender?: 'male' | 'female' | 'other';
}

// 성별별 아이템 정보 정의
const OUTFIT_ITEMS = {
  male: [
    { key: 'top', label: '👔 상의', icon: '👔' },
    { key: 'bottom', label: '👖 하의', icon: '👖' },
    { key: 'outer', label: '🧥 아우터', icon: '🧥' },
    { key: 'shoes', label: '👞 신발', icon: '👞' },
    { key: 'accessories', label: '👜 액세서리', icon: '⌚' }
  ],
  female: [
    { key: 'top', label: '👚 상의', icon: '👚' },
    { key: 'bottom', label: '👗 하의', icon: '👗' },
    { key: 'outer', label: '🧥 아우터', icon: '🧥' },
    { key: 'shoes', label: '👠 신발', icon: '👠' },
    { key: 'accessories', label: '💎 액세서리', icon: '💎' }
  ],
  other: [
    { key: 'top', label: '👕 상의', icon: '👕' },
    { key: 'bottom', label: '👖 하의', icon: '👖' },
    { key: 'outer', label: '🧥 아우터', icon: '🧥' },
    { key: 'shoes', label: '👟 신발', icon: '👟' },
    { key: 'accessories', label: '👜 액세서리', icon: '💎' }
  ]
} as const;

const RecommendationCard: React.FC<RecommendationCardProps> = memo(({
  recommendation,
  onFeedback,
  onRefresh,
  loading = false,
  style,
  userGender = 'male'
}) => {
  // 테마 컨텍스트
  const { colors, isDarkMode } = useThemeContext();
  // 신뢰도 표시 계산 (메모화)
  const confidencePercentage = useMemo(() => {
    if (!recommendation.confidence) return null;
    return Math.round(recommendation.confidence * 100);
  }, [recommendation.confidence]);

  // 성별에 따른 아이템 선택 및 필터링 (메모화)
  const visibleItems = useMemo(() => {
    const genderItems = OUTFIT_ITEMS[userGender] || OUTFIT_ITEMS.other;
    return genderItems.filter(item => {
      const value = recommendation[item.key as keyof StyleRecommendation];
      return value && typeof value === 'string' && value.trim().length > 0;
    });
  }, [recommendation, userGender]);

  // 추천 완성도 계산 (메모화)
  const completeness = useMemo(() => {
    const requiredItems = ['top', 'bottom', 'shoes'];
    const hasRequired = requiredItems.every(key => 
      recommendation[key as keyof StyleRecommendation]
    );
    const genderItems = OUTFIT_ITEMS[userGender] || OUTFIT_ITEMS.other;
    return {
      hasRequired,
      totalItems: visibleItems.length,
      score: Math.round((visibleItems.length / genderItems.length) * 100)
    };
  }, [recommendation, visibleItems, userGender]);

  // 성별에 따른 제목 생성
  const genderTitle = useMemo(() => {
    const titles = {
      male: '🧑 남성 코디 추천',
      female: '👩 여성 코디 추천', 
      other: '👤 스타일 추천'
    };
    return titles[userGender] || titles.other;
  }, [userGender]);


  // 피드백 핸들러 (메모화)
  const handleLike = useCallback(() => {
    console.log('마음에 든다 버튼 클릭됨');
    onFeedback?.('like');
    Alert.alert(
      '피드백 감사합니다!',
      '💖 마음에 든다니 기뻐요! 오늘도 멋진 하루 보내세요! 😊',
      [{ text: '감사해요', style: 'default' }]
    );
  }, [onFeedback]);

  const handleDislike = useCallback(() => {
    console.log('🎆 다른 추천 버튼 클릭됨');
    onFeedback?.('dislike');
    onRefresh?.();
    Alert.alert(
      '새로운 추천을 준비했어요!',
      '🎆 더 마음에 드는 스타일로 추천했어요!',
      [{ text: '고마워요', style: 'default' }]
    );
  }, [onFeedback, onRefresh]);

  const handleRefresh = useCallback(() => {
    if (loading) return;
    console.log('새 추천 요청 시작...');
    onRefresh?.();
  }, [onRefresh, loading]);

  // 생성 시간 표시 (메모화)
  const generatedTime = useMemo(() => {
    if (!recommendation.timestamp) return null;
    return new Date(recommendation.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [recommendation.timestamp]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.primary }, style]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{genderTitle}</Text>
          {generatedTime && (
            <Text style={[styles.timestamp, { color: colors.text.secondary }]}>{generatedTime} 생성</Text>
          )}
        </View>
        
        {confidencePercentage && (
          <View style={[styles.confidenceBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.confidenceText}>
              {confidencePercentage}% 매칭
            </Text>
          </View>
        )}
      </View>

      {/* 완성도 표시 */}
      <View style={styles.completenessContainer}>
        <View style={[styles.completenessBar, { backgroundColor: colors.surface.secondary }]}>
          <View 
            style={[
              styles.completenessProgress, 
              { width: `${completeness.score}%`, backgroundColor: colors.primary }
            ]} 
          />
        </View>
        <Text style={[styles.completenessText, { color: colors.text.secondary }]}>
          {completeness.totalItems}개 아이템 ({completeness.score}% 완성)
        </Text>
      </View>

      {/* 아이템 그리드 */}
      <View style={styles.outfitGrid}>
        {visibleItems.map((item, index) => {
          const value = recommendation[item.key as keyof StyleRecommendation] as string;
          return (
            <View key={item.key} style={[styles.outfitItem, { backgroundColor: colors.background.primary }]}>
              <Text style={styles.outfitIcon}>{item.icon}</Text>
              <Text style={[styles.outfitCategory, { color: colors.text.secondary }]}>{item.label}</Text>
              <Text style={[styles.outfitText, { color: colors.text.primary }]} numberOfLines={2}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 추천 이유 */}
      {recommendation.reason && (
        <View style={[styles.reasonContainer, { backgroundColor: colors.surface.secondary }]}>
          <Text style={[styles.reasonTitle, { color: colors.text.primary }]}>💡 추천 이유</Text>
          <Text style={[styles.reasonText, { color: colors.text.secondary }]}>{recommendation.reason}</Text>
        </View>
      )}

      {/* 피드백 섹션 */}
      <View style={styles.feedbackSection}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, { color: colors.text.inverse }]}>💖 마음에 들어요</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={handleDislike}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: colors.text.inverse }]}>🎆 다른 추천</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 필수 아이템 누락 경고 */}
      {!completeness.hasRequired && (
        <View style={[styles.warningContainer, { backgroundColor: colors.surface.secondary }]}>
          <Text style={[styles.warningText, { color: COLORS.warning }]}>
            ⚠️ 기본 아이템(상의, 하의, 신발)이 누락되었습니다.
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: 2,
    minWidth: '30%',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  actionButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'space-between',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[300],
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: COLORS.text.secondary,
  },
  completenessBar: {
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.sm,
    height: 4,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  completenessContainer: {
    marginBottom: SPACING.lg,
  },
  completenessProgress: {
    backgroundColor: COLORS.primary,
    height: '100%',
  },
  completenessText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  confidenceBadge: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  confidenceText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  dislikeButton: {
    backgroundColor: '#FEE2E2',
    borderColor: COLORS.error,
  },
  feedbackSection: {
    borderTopColor: COLORS.gray[200],
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  feedbackTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  likeButton: {
    backgroundColor: '#D1FAE5',
    borderColor: COLORS.success,
  },
  outfitCategory: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  outfitIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  outfitItem: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    marginBottom: SPACING.md,
    minHeight: 100,
    padding: SPACING.md,
    width: '48%',
  },
  outfitText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  reasonContainer: {
    backgroundColor: '#FEF3C7',
    borderLeftColor: COLORS.warning,
    borderLeftWidth: 4,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  reasonText: {
    color: '#92400E',
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  reasonTitle: {
    color: '#92400E',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  refreshButton: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  timestamp: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  warningText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});

RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;