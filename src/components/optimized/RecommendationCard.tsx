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
}

// 아이템 정보 정의 (메모화를 위해 컴포넌트 외부에 정의)
const OUTFIT_ITEMS = [
  { key: 'top', label: '👕 상의', icon: '👔' },
  { key: 'bottom', label: '👖 하의', icon: '👖' },
  { key: 'outer', label: '🧥 아우터', icon: '🧥' },
  { key: 'shoes', label: '👟 신발', icon: '👟' },
  { key: 'accessories', label: '👜 악세서리', icon: '💎' }
] as const;

const RecommendationCard: React.FC<RecommendationCardProps> = memo(({
  recommendation,
  onFeedback,
  onRefresh,
  loading = false,
  style
}) => {
  // 테마 컨텍스트
  const { colors, isDarkMode } = useThemeContext();
  // 신뢰도 표시 계산 (메모화)
  const confidencePercentage = useMemo(() => {
    if (!recommendation.confidence) return null;
    return Math.round(recommendation.confidence * 100);
  }, [recommendation.confidence]);

  // 표시할 아이템들만 필터링 (메모화)
  const visibleItems = useMemo(() => {
    return OUTFIT_ITEMS.filter(item => {
      const value = recommendation[item.key as keyof StyleRecommendation];
      return value && typeof value === 'string' && value.trim().length > 0;
    });
  }, [recommendation]);

  // 추천 완성도 계산 (메모화)
  const completeness = useMemo(() => {
    const requiredItems = ['top', 'bottom', 'shoes'];
    const hasRequired = requiredItems.every(key => 
      recommendation[key as keyof StyleRecommendation]
    );
    return {
      hasRequired,
      totalItems: visibleItems.length,
      score: Math.round((visibleItems.length / OUTFIT_ITEMS.length) * 100)
    };
  }, [recommendation, visibleItems]);

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
    console.log('다른 추천 버튼 클릭됨');
    onFeedback?.('dislike');
    // 싫어요 시 새로운 추천 자동 생성
    onRefresh?.();
    Alert.alert(
      '새로운 추천을 준비했어요!',
      '🎆 더 마음에 드는 스타일로 추천했어요!',
      [{ text: '고마워요', style: 'default' }]
    );
  }, [onFeedback]);

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
          <Text style={[styles.title, { color: colors.text.primary }]}>✨ AI 코디 추천</Text>
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
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
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
  completenessContainer: {
    marginBottom: SPACING.lg,
  },
  completenessBar: {
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  completenessProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  completenessText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  outfitItem: {
    width: '48%',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    minHeight: 100,
  },
  outfitIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  outfitCategory: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  outfitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  reasonContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  reasonTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: SPACING.xs,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: '#92400E',
    lineHeight: 20,
  },
  feedbackSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.md,
  },
  feedbackTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: '30%',
    marginHorizontal: 2,
  },
  likeButton: {
    backgroundColor: '#D1FAE5',
    borderColor: COLORS.success,
  },
  dislikeButton: {
    backgroundColor: '#FEE2E2',
    borderColor: COLORS.error,
  },
  refreshButton: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[300],
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  buttonTextDisabled: {
    color: COLORS.text.secondary,
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '600',
  },
});

RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;