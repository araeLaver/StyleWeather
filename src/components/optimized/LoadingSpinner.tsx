import React, { memo, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  message = '로딩 중...',
  size = 'medium',
  color = COLORS.primary,
  style
}) => {
  // 애니메이션 값
  const spinValue = useMemo(() => new Animated.Value(0), []);
  const fadeValue = useMemo(() => new Animated.Value(0.3), []);

  // 메모화된 스타일 계산
  const spinnerSize = useMemo(() => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 60;
      default: return 40;
    }
  }, [size]);

  const textSize = useMemo(() => {
    switch (size) {
      case 'small': return FONT_SIZES.xs;
      case 'large': return FONT_SIZES.lg;
      default: return FONT_SIZES.base;
    }
  }, [size]);

  const containerPadding = useMemo(() => {
    switch (size) {
      case 'small': return SPACING.sm;
      case 'large': return SPACING.xl;
      default: return SPACING.lg;
    }
  }, [size]);

  // 메모화된 애니메이션 스타일
  const spinStyle = useMemo(() => ({
    transform: [{
      rotate: spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      })
    }]
  }), [spinValue]);

  const fadeStyle = useMemo(() => ({
    opacity: fadeValue
  }), [fadeValue]);

  const spinnerStyle = useMemo(() => ({
    width: spinnerSize,
    height: spinnerSize,
    borderRadius: spinnerSize / 2,
    borderWidth: Math.max(2, spinnerSize / 10),
    borderColor: color + '30', // 30% opacity
    borderTopColor: color,
  }), [spinnerSize, color]);

  // 애니메이션 시작
  useEffect(() => {
    // 회전 애니메이션
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // 페이드 애니메이션
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    fadeAnimation.start();

    return () => {
      spinAnimation.stop();
      fadeAnimation.stop();
    };
  }, [spinValue, fadeValue]);

  return (
    <View style={[styles.container, { padding: containerPadding }, style]}>
      <Animated.View style={[spinnerStyle, spinStyle]} />
      {message && (
        <Animated.Text 
          style={[
            styles.message, 
            { fontSize: textSize, color }, 
            fadeStyle
          ]}
        >
          {message}
        </Animated.Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: SPACING.md,
    fontWeight: '500',
    textAlign: 'center',
  },
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;