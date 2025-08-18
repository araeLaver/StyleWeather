import { useEffect, useCallback, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import OfflineManager from '../utils/OfflineManager';
import { useAppDispatch } from '../store';
import { syncOfflineData } from '../store/slices/appSlice';

interface UseOfflineSyncReturn {
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: number | null;
  pendingItems: number;
  syncOfflineQueue: () => Promise<void>;
  clearOfflineQueue: () => Promise<void>;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const { isOnline } = useNetworkStatus();
  const dispatch = useAppDispatch();
  const offlineManager = OfflineManager.getInstance();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [pendingItems, setPendingItems] = useState(0);

  // 오프라인 큐의 대기 중인 항목 수 업데이트
  const updatePendingItems = useCallback(async () => {
    try {
      const queue = await offlineManager.getOfflineQueue();
      setPendingItems(queue.length);
    } catch (error) {
      console.error('Failed to update pending items count:', error);
    }
  }, [offlineManager]);

  // 오프라인 큐 동기화
  const syncOfflineQueue = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing) {
      console.log('Cannot sync: offline or already syncing');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncProgress(0);

      const queue = await offlineManager.getOfflineQueue();
      
      if (queue.length === 0) {
        console.log('No items to sync');
        setIsSyncing(false);
        return;
      }

      console.log(`Starting sync of ${queue.length} items`);

      let syncedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        setSyncProgress(((i + 1) / queue.length) * 100);

        try {
          // Redux를 통해 실제 동기화 실행
          const result = await dispatch(syncOfflineData(item)).unwrap();
          
          if (result.success) {
            await offlineManager.removeFromOfflineQueue(item.id);
            syncedCount++;
            console.log(`Successfully synced item: ${item.id}`);
          } else {
            // 재시도 카운트 증가
            const shouldRetry = await offlineManager.incrementRetryCount(item.id);
            if (shouldRetry) {
              failedCount++;
              console.log(`Failed to sync item ${item.id}, will retry later`);
            } else {
              console.log(`Max retries reached for item ${item.id}, removing from queue`);
            }
          }
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          const shouldRetry = await offlineManager.incrementRetryCount(item.id);
          if (shouldRetry) {
            failedCount++;
          }
        }

        // 잠시 대기 (API 제한 방지)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Sync completed: ${syncedCount} success, ${failedCount} failed`);
      setLastSyncTime(Date.now());
      
      // 대기 중인 항목 수 업데이트
      await updatePendingItems();

    } catch (error) {
      console.error('Failed to sync offline queue:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isOnline, isSyncing, dispatch, offlineManager, updatePendingItems]);

  // 오프라인 큐 클리어
  const clearOfflineQueue = useCallback(async (): Promise<void> => {
    try {
      await offlineManager.clearOfflineQueue();
      setPendingItems(0);
      console.log('Offline queue cleared');
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }, [offlineManager]);

  // 온라인 상태가 될 때 자동 동기화
  useEffect(() => {
    if (isOnline && !isSyncing) {
      console.log('Network is online, checking for offline items to sync');
      updatePendingItems().then(() => {
        // 대기 중인 항목이 있으면 자동 동기화
        if (pendingItems > 0) {
          console.log(`Auto-syncing ${pendingItems} offline items`);
          syncOfflineQueue();
        }
      });
    }
  }, [isOnline, isSyncing, updatePendingItems, pendingItems, syncOfflineQueue]);

  // 앱 시작시 대기 중인 항목 수 확인
  useEffect(() => {
    updatePendingItems();
  }, [updatePendingItems]);

  // 주기적으로 대기 중인 항목 수 업데이트 (5분마다)
  useEffect(() => {
    const interval = setInterval(updatePendingItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updatePendingItems]);

  return {
    isSyncing,
    syncProgress,
    lastSyncTime,
    pendingItems,
    syncOfflineQueue,
    clearOfflineQueue,
  };
};