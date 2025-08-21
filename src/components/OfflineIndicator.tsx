import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface OfflineIndicatorProps {
  style?: any;
  showWhenOnline?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = memo(({ 
  style, 
  showWhenOnline = false 
}) => {
  const { isOnline, isOffline, connectionType } = useNetworkStatus();
  const { isSyncing, pendingItems, syncOfflineQueue } = useOfflineSync();

  // 메모화된 표시 상태 계산
  const shouldShow = useMemo(() => {
    return isOffline || (showWhenOnline && isOnline) || pendingItems > 0 || isSyncing;
  }, [isOffline, isOnline, showWhenOnline, pendingItems, isSyncing]);

  // 메모화된 상태 정보
  const statusInfo = useMemo(() => {
    if (isSyncing) {
      return {
        backgroundColor: '#FEF3C7',
        textColor: '#92400E',
        icon: '🔄',
        message: `동기화 중... (${pendingItems}개 대기)`,
        showSyncButton: false,
      };
    }

    if (isOffline) {
      return {
        backgroundColor: '#FEE2E2',
        textColor: '#991B1B',
        icon: '📡',
        message: pendingItems > 0 
          ? `오프라인 모드 (${pendingItems}개 대기 중)`
          : '오프라인 모드',
        showSyncButton: false,
      };
    }

    if (pendingItems > 0) {
      return {
        backgroundColor: '#DBEAFE',
        textColor: '#1E40AF',
        icon: '📤',
        message: `${pendingItems}개 항목이 동기화 대기 중`,
        showSyncButton: true,
      };
    }

    if (showWhenOnline && isOnline) {
      return {
        backgroundColor: '#D1FAE5',
        textColor: '#065F46',
        icon: '✅',
        message: `온라인 (${connectionType})`,
        showSyncButton: false,
      };
    }

    return null;
  }, [isSyncing, isOffline, isOnline, pendingItems, connectionType, showWhenOnline]);

  const handleSyncPress = () => {
    if (isOnline && !isSyncing) {
      syncOfflineQueue();
    }
  };

  if (!shouldShow || !statusInfo) {
    return null;
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: statusInfo.backgroundColor }, 
      style
    ]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{statusInfo.icon}</Text>
        <Text style={[styles.message, { color: statusInfo.textColor }]}>
          {statusInfo.message}
        </Text>
      </View>
      
      {statusInfo.showSyncButton && (
        <TouchableOpacity 
          style={[styles.syncButton, { borderColor: statusInfo.textColor }]}
          onPress={handleSyncPress}
          disabled={isSyncing}
        >
          <Text style={[styles.syncButtonText, { color: statusInfo.textColor }]}>
            동기화
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
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
  },
  syncButton: {
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    marginLeft: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  syncButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
});

OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator;