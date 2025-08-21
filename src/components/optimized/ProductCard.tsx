import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import type { RealProduct } from '../../services/RealProductService';

interface ProductCardProps {
  product: RealProduct;
  onPress?: (product: RealProduct) => void;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onPress, compact = false }) => {
  const handlePress = () => {
    console.log('ProductCard 클릭됨:', product.name, product.productUrl);
    if (onPress) {
      console.log('onPress 콜백 실행');
      onPress(product);
    } else {
      console.log('기본 링크 열기 실행');
      // 기본 동작: 상품 링크로 이동
      handleOpenProduct();
    }
  };

  const handleOpenProduct = async () => {
    console.log('handleOpenProduct 시작');
    try {
      const url = product.affiliate?.trackingUrl || product.productUrl;
      console.log('열려는 URL:', url);
      
      if (!url) {
        console.log('URL이 없음');
        Alert.alert('오류', '상품 링크가 없습니다.');
        return;
      }
      
      // 웹에서는 window.open 사용
      if (typeof window !== 'undefined') {
        console.log('웹 환경: window.open 사용');
        window.open(url, '_blank');
        return;
      }
      
      // 모바일에서는 Linking 사용
      console.log('모바일 환경: Linking.openURL 사용');
      const supported = await Linking.canOpenURL(url);
      console.log('URL 지원 여부:', supported);
      
      if (supported) {
        await Linking.openURL(url);
        console.log('링크 열기 성공');
      } else {
        console.log('링크 지원 안됨');
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('상품 링크 열기 실패:', error);
      Alert.alert('오류', `링크를 열 수 없습니다: ${error}`);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const cardStyle = compact ? styles.compactCard : styles.card;
  const imageStyle = compact ? styles.compactImage : styles.image;

  return (
    <TouchableOpacity 
      style={cardStyle}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* 상품 이미지 */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.imageUrl }}
          style={imageStyle}
          resizeMode="cover"
        />
        
        {/* 추천 뱃지 */}
        <View style={styles.recommendBadge}>
          <Text style={styles.recommendText}>추천</Text>
        </View>
        
        {/* 쇼핑몰 로고 */}
        <View style={styles.mallBadge}>
          <Text style={styles.mallText}>{product.mallName}</Text>
        </View>
      </View>

      {/* 상품 정보 */}
      <View style={styles.productInfo}>
        {/* 브랜드명 */}
        <Text style={styles.brandName} numberOfLines={1}>{product.brand}</Text>
        
        {/* 상품명 */}
        <Text style={styles.productName} numberOfLines={compact ? 1 : 2}>
          {product.name}
        </Text>

        {/* 가격 확인 버튼 */}
        <View style={styles.priceContainer}>
          <TouchableOpacity style={styles.priceButton} onPress={handlePress}>
            <Text style={styles.priceButtonText}>💰 가격 확인하기</Text>
          </TouchableOpacity>
        </View>

        {/* 브랜드 정보만 표시 */}
        {!compact && (
          <View style={styles.brandContainer}>
            <Text style={styles.brandInfo}>{product.brand} 공식</Text>
          </View>
        )}

        {/* 색상 옵션 */}
        {!compact && product.colors.length > 0 && (
          <View style={styles.colorContainer}>
            {product.colors.slice(0, 4).map((color, index) => (
              <View key={index} style={styles.colorDot}>
                <Text style={styles.colorText}>{color}</Text>
              </View>
            ))}
            {product.colors.length > 4 && (
              <Text style={styles.moreColors}>+{product.colors.length - 4}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  brandName: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    marginBottom: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
    width: 160,
    ...SHADOWS.sm,
  },
  colorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorDot: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: 2,
    marginRight: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  colorText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs - 2,
  },
  compactCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
    width: 140,
    ...SHADOWS.xs,
  },
  compactImage: {
    height: 160,
    width: '100%',
  },
  currentPrice: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    left: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    position: 'absolute',
    top: SPACING.xs,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  image: {
    height: 200,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
  },
  mallBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    position: 'absolute',
    right: SPACING.xs,
    top: SPACING.xs,
  },
  mallText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs - 2,
    fontWeight: '500',
  },
  moreColors: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.xs,
  },
  originalPrice: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
    textDecorationLine: 'line-through',
  },
  priceContainer: {
    marginBottom: SPACING.xs,
  },
  priceButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  priceButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  brandContainer: {
    marginBottom: SPACING.xs,
  },
  brandInfo: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  recommendBadge: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.sm,
    left: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    position: 'absolute',
    top: SPACING.xs,
  },
  recommendText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  rating: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  reviewCount: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
  },
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;