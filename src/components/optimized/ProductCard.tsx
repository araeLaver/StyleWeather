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
import type { Product } from '../../types/shopping';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onPress, compact = false }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      // 기본 동작: 상품 링크로 이동
      handleOpenProduct();
    }
  };

  const handleOpenProduct = async () => {
    try {
      const url = product.affiliate?.trackingUrl || product.productUrl;
      
      // 웹에서는 window.open 사용
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
        return;
      }
      
      // 모바일에서는 Linking 사용
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
        
        {/* 할인 뱃지 */}
        {product.isOnSale && product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}%</Text>
          </View>
        )}
        
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

        {/* 가격 정보 */}
        <View style={styles.priceContainer}>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          <Text style={styles.currentPrice}>
            {formatPrice(product.price)}
          </Text>
        </View>

        {/* 평점 및 리뷰 */}
        {!compact && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
    width: 160,
    ...SHADOWS.sm,
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  compactImage: {
    width: '100%',
    height: 160,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  mallBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  mallText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs - 2,
    fontWeight: '500',
  },
  productInfo: {
    padding: SPACING.sm,
  },
  brandName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: SPACING.xs,
  },
  originalPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  rating: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  colorDot: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginRight: SPACING.xs,
    marginBottom: 2,
  },
  colorText: {
    fontSize: FONT_SIZES.xs - 2,
    color: COLORS.text.secondary,
  },
  moreColors: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;