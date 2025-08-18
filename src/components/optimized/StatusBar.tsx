import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

interface StatusBarProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
  onAction?: () => void;
  actionText?: string;
  persistent?: boolean;
  style?: any;
}

const StatusBar: React.FC<StatusBarProps> = memo(({
  type,
  message,
  onDismiss,
  onAction,
  actionText,
  persistent = false,
  style
}) => {
  // 메모화된 스타일 계산
  const statusConfig = useMemo(() => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#D1FAE5',
          borderColor: COLORS.success,
          textColor: '#065F46',
          icon: '✅'
        };
      case 'error':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: COLORS.error,
          textColor: '#991B1B',
          icon: '❌'
        };
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: COLORS.warning,
          textColor: '#92400E',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          backgroundColor: '#E0E7FF',
          borderColor: COLORS.info,
          textColor: '#3730A3',
          icon: 'ℹ️'
        };
    }
  }, [type]);

  const containerStyle = useMemo(() => ({
    backgroundColor: statusConfig.backgroundColor,
    borderLeftColor: statusConfig.borderColor,
  }), [statusConfig]);

  const textStyle = useMemo(() => ({
    color: statusConfig.textColor,
  }), [statusConfig]);

  const actionButtonStyle = useMemo(() => ({
    borderColor: statusConfig.borderColor,
  }), [statusConfig]);

  const actionTextStyle = useMemo(() => ({
    color: statusConfig.textColor,
  }), [statusConfig]);

  return (
    <View style={[styles.container, containerStyle, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{statusConfig.icon}</Text>
        <Text style={[styles.message, textStyle]}>{message}</Text>
      </View>
      
      <View style={styles.actions}>
        {onAction && actionText && (
          <TouchableOpacity 
            style={[styles.actionButton, actionButtonStyle]}
            onPress={onAction}
          >
            <Text style={[styles.actionText, actionTextStyle]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
        
        {!persistent && onDismiss && (
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={[styles.dismissText, textStyle]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  dismissButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  dismissText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;