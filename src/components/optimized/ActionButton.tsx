import React, { memo, useMemo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: any;
  textStyle?: any;
}

const ActionButton: React.FC<ActionButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle
}) => {
  // 메모화된 스타일 계산
  const variantStyles = useMemo(() => {
    const isDisabled = disabled || loading;
    
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: isDisabled ? COLORS.gray[100] : COLORS.gray[200],
          borderColor: 'transparent',
          textColor: isDisabled ? COLORS.text.disabled : COLORS.text.primary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: isDisabled ? COLORS.gray[300] : COLORS.primary,
          textColor: isDisabled ? COLORS.text.disabled : COLORS.primary,
        };
      case 'danger':
        return {
          backgroundColor: isDisabled ? COLORS.gray[100] : COLORS.error,
          borderColor: 'transparent',
          textColor: isDisabled ? COLORS.text.disabled : COLORS.white,
        };
      case 'success':
        return {
          backgroundColor: isDisabled ? COLORS.gray[100] : COLORS.success,
          borderColor: 'transparent',
          textColor: isDisabled ? COLORS.text.disabled : COLORS.white,
        };
      case 'warning':
        return {
          backgroundColor: isDisabled ? COLORS.gray[100] : COLORS.warning,
          borderColor: 'transparent',
          textColor: isDisabled ? COLORS.text.disabled : COLORS.white,
        };
      case 'primary':
      default:
        return {
          backgroundColor: isDisabled ? COLORS.gray[100] : COLORS.primary,
          borderColor: 'transparent',
          textColor: isDisabled ? COLORS.text.disabled : COLORS.white,
        };
    }
  }, [variant, disabled, loading]);

  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          fontSize: FONT_SIZES.sm,
          borderRadius: BORDER_RADIUS.sm,
        };
      case 'large':
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          fontSize: FONT_SIZES.lg,
          borderRadius: BORDER_RADIUS.lg,
        };
      case 'medium':
      default:
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          fontSize: FONT_SIZES.base,
          borderRadius: BORDER_RADIUS.md,
        };
    }
  }, [size]);

  const buttonStyle = useMemo(() => ({
    backgroundColor: variantStyles.backgroundColor,
    borderColor: variantStyles.borderColor,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: sizeStyles.borderRadius,
    width: fullWidth ? '100%' : 'auto',
  }), [variantStyles, sizeStyles, fullWidth]);

  const buttonTextStyle = useMemo(() => ({
    color: variantStyles.textColor,
    fontSize: sizeStyles.fontSize,
  }), [variantStyles.textColor, sizeStyles.fontSize]);

  const spinnerColor = useMemo(() => {
    return variant === 'outline' ? COLORS.primary : 
           variantStyles.textColor === COLORS.white ? COLORS.white : COLORS.primary;
  }, [variant, variantStyles.textColor]);

  const spinnerSize = useMemo(() => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  }, [size]);

  // 메모화된 press 핸들러
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [onPress, disabled, loading]);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        variant === 'outline' && styles.outlineButton,
        disabled && styles.disabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={disabled || loading ? 1 : 0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size={spinnerSize} 
            color={spinnerColor}
            style={styles.spinner}
          />
        ) : (
          icon && <Text style={[styles.icon, { color: variantStyles.textColor }]}>{icon}</Text>
        )}
        
        <Text style={[
          styles.text, 
          buttonTextStyle, 
          loading && styles.loadingText,
          textStyle
        ]}>
          {loading ? '처리 중...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
    ...SHADOWS.none,
  },
  icon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  loadingText: {
    marginLeft: SPACING.sm,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  spinner: {
    marginRight: SPACING.sm,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

ActionButton.displayName = 'ActionButton';

export default ActionButton;