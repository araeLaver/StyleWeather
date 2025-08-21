import React, { memo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  RefreshControl,
  Linking
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import ProductCard from './ProductCard';
import type { WeatherBasedRecommendation, RealProduct } from '../../services/RealProductService';

interface ShoppingRecommendationCardProps {
  recommendation: WeatherBasedRecommendation;
  onRefresh?: () => void;
  onProductPress?: (product: RealProduct) => void;
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

  const handleProductPress = (product: RealProduct) => {
    console.log('ShoppingRecommendationCard handleProductPress:', product.name);
    if (onProductPress) {
      console.log('onProductPress 콜백 실행');
      onProductPress(product);
    } else {
      console.log('기본 상품 클릭 처리');
      // 기본 동작: 상품 상세 페이지로 이동하거나 외부 링크 열기
      Alert.alert(
        product.name,
        `${product.brand}의 상품입니다.\n가격: ${product.price.toLocaleString()}원\n\n${product.mallName}에서 확인하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: () => {
              console.log('사용자가 확인 선택 - 상품 페이지로 이동');
              openProductLink(product);
            }
          }
        ]
      );
    }
  };

  const openProductLink = async (product: RealProduct) => {
    try {
      const url = product.affiliate?.trackingUrl || product.productUrl;
      console.log('상품 링크 열기:', url);
      
      if (!url) {
        Alert.alert('오류', '상품 링크가 없습니다.');
        return;
      }
      
      // 웹 환경
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
        return;
      }
      
      // 모바일 환경
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('상품 링크 열기 실패:', error);
      Alert.alert('오류', '링크를 열 수 없습니다.');
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
              {recommendation.products.length}개 상품
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
  actionContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginVertical: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  expandButton: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  expandButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  keywordTag: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  keywordText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  keywordsContainer: {
    marginBottom: SPACING.md,
  },
  mallLinkButton: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  mallLinkText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  mallLinksContainer: {
    marginBottom: SPACING.md,
  },
  mallLinksTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  moreProductsCard: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    width: 100,
  },
  moreProductsIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  moreProductsText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  productsContainer: {
    marginBottom: SPACING.md,
  },
  productsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  productsScroll: {
    marginVertical: SPACING.sm,
  },
  productsTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  reasonContainer: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  reasonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  refreshIcon: {
    fontSize: 20,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statsText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
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
});

ShoppingRecommendationCard.displayName = 'ShoppingRecommendationCard';

export default ShoppingRecommendationCard;