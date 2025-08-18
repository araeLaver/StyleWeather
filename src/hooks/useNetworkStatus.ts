import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifiEnabled?: boolean;
  details: any;
}

interface UseNetworkStatusReturn {
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
  refreshNetworkStatus: () => Promise<void>;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
    details: null,
  });

  // 네트워크 상태 업데이트 핸들러
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const newStatus: NetworkStatus = {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifiEnabled: state.isWifiEnabled,
      details: state.details,
    };
    
    setNetworkStatus(newStatus);
    
    // 네트워크 상태 변화 로깅
    console.log('Network status changed:', {
      connected: state.isConnected,
      reachable: state.isInternetReachable,
      type: state.type,
    });

    // 오프라인에서 온라인으로 전환될 때
    if (state.isConnected && state.isInternetReachable) {
      console.log('Network is back online');
      // 여기서 대기 중인 요청들을 재시도할 수 있습니다
    }

    // 온라인에서 오프라인으로 전환될 때
    if (!state.isConnected || !state.isInternetReachable) {
      console.log('Network went offline');
      // 여기서 사용자에게 오프라인 상태를 알릴 수 있습니다
    }
  }, []);

  // 수동으로 네트워크 상태 새로고침
  const refreshNetworkStatus = useCallback(async (): Promise<void> => {
    try {
      const state = await NetInfo.fetch();
      handleNetworkChange(state);
    } catch (error) {
      console.error('Failed to refresh network status:', error);
    }
  }, [handleNetworkChange]);

  // 초기 설정 및 리스너 등록
  useEffect(() => {
    // 초기 네트워크 상태 가져오기
    NetInfo.fetch().then(handleNetworkChange);

    // 네트워크 상태 변화 리스너 등록
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  // 편의 속성들
  const isOnline = networkStatus.isConnected === true && networkStatus.isInternetReachable === true;
  const isOffline = networkStatus.isConnected === false || networkStatus.isInternetReachable === false;
  const connectionType = networkStatus.type;

  return {
    networkStatus,
    isOnline,
    isOffline,
    connectionType,
    refreshNetworkStatus,
  };
};