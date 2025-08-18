import React, { memo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  RefreshControl
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import ProductCard from './ProductCard';
import type { WeatherBasedRecommendation, Product } from '../../types/shopping';

interface ShoppingRecommendationCardProps {
  recommendation: WeatherBasedRecommendation;
  onRefresh?: () => void;
  onProductPress?: (product: Product) => void;
  loading?: boolean;
}

const ShoppingRecommendationCard: React.FC<ShoppingRecommendationCardProps> = memo(({
  recommendation,
  onRefresh,
  onProductPress,
  loading = false
}) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [expanded, setExpanded] = useState(false);

  const handleRefresh = () => {
    if (onRefresh) {
      // 애니메이션 효과
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      onRefresh();
    }
  };

  const handleProductPress = (product: Product) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
      // 기본 동작: 상품 상세 페이지로 이동하거나 외부 링크 열기
      Alert.alert(
        product.name,
        `${product.brand}의 상품입니다.\n가격: ${product.price.toLocaleString()}원\n\n${product.mallName}에서 확인하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: () => console.log('상품 페이지로 이동') }
        ]
      );
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleMallPress = (mallName: string) => {
    const mallUrls: { [key: string]: string } = {
      '무신사': 'https://www.musinsa.com',
      '지그재그': 'https://zigzag.kr',
      '에이블리': 'https://m.ably.co.kr'
    };
    
    const url = mallUrls[mallName] || `https://www.google.com/search?q=${mallName}+쇼핑몰`;
    
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const displayProducts = expanded ? recommendation.products : recommendation.products.slice(0, 4);
  const totalPrice = recommendation.products.reduce((sum, product) => sum + product.price, 0);
  const averageRating = recommendation.products.reduce((sum, product) => sum + product.rating, 0) / recommendation.products.length;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🛍️ 오늘의 스타일 추천</Text>
          <Text style={styles.subtitle}>
            {recommendation.weatherCondition} • {recommendation.temperature}°C
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          <Text style={styles.refreshIcon}>{loading ? '⏳' : '🔄'}</Text>
        </TouchableOpacity>
      </View>

      {/* 추천 이유 */}
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonText}>{recommendation.reason}</Text>
      </View>

      {/* 스타일 키워드 */}
      <View style={styles.keywordsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendation.styleKeywords.map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>#{keyword}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 상품 목록 */}
      <View style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>추천 상품</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              ⭐ {averageRating.toFixed(1)} • 총 {totalPrice.toLocaleString()}원
            </Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.productsScroll}
        >
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={handleProductPress}
              compact={true}
            />
          ))}
          
          {recommendation.products.length > 4 && !expanded && (
            <TouchableOpacity 
              style={styles.moreProductsCard}
              onPress={toggleExpanded}
            >
              <Text style={styles.moreProductsIcon}>👀</Text>
              <Text style={styles.moreProductsText}>
                +{recommendation.products.length - 4}개{'\n'}더보기
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* 전체보기 / 접기 버튼 */}
        {recommendation.products.length > 4 && (
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={toggleExpanded}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? '접기 ▲' : `전체 ${recommendation.products.length}개 보기 ▼`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 쇼핑몰 바로가기 */}
      <View style={styles.mallLinksContainer}>
        <Text style={styles.mallLinksTitle}>쇼핑몰 바로가기</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from(new Set(recommendation.products.map(p => p.mallName))).map((mallName, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.mallLinkButton}
              onPress={() => handleMallPress(mallName)}
            >
              <Text style={styles.mallLinkText}>{mallName} 〉</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 하단 액션 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 저장하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤 공유하기</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
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
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[50],
  },
  refreshIcon: {
    fontSize: 20,
  },
  reasonContainer: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  keywordsContainer: {
    marginBottom: SPACING.md,
  },
  keywordTag: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
  },
  keywordText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  productsContainer: {
    marginBottom: SPACING.md,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  productsTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  productsScroll: {
    marginVertical: SPACING.sm,
  },
  moreProductsCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    marginHorizontal: SPACING.xs,
  },
  moreProductsIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  moreProductsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  expandButton: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  expandButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  mallLinksContainer: {
    marginBottom: SPACING.md,
  },
  mallLinksTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  mallLinkButton: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.xs,
  },
  mallLinkText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
});

ShoppingRecommendationCard.displayName = 'ShoppingRecommendationCard';

export default ShoppingRecommendationCard;