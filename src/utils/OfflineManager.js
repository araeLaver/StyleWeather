import NetInfo from 'react-native-netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineManager {
  constructor() {
    this.isConnected = true;
    this.listeners = [];
    this.OFFLINE_DATA_KEY = 'StyleWeather_OfflineData';
    this.PENDING_REQUESTS_KEY = 'StyleWeather_PendingRequests';
    
    this.initializeNetworkListener();
  }

  // 네트워크 상태 모니터링 초기화
  async initializeNetworkListener() {
    try {
      // 현재 네트워크 상태 확인
      const netInfoState = await NetInfo.fetch();
      this.isConnected = netInfoState.isConnected;

      // 네트워크 상태 변화 리스너
      NetInfo.addEventListener(state => {
        const wasConnected = this.isConnected;
        this.isConnected = state.isConnected;

        console.log('Network status changed:', {
          isConnected: this.isConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable
        });

        // 연결 상태가 변경되었을 때 리스너들에게 알림
        this.notifyListeners(this.isConnected, wasConnected);

        // 온라인 상태로 돌아왔을 때 대기 중인 요청 처리
        if (this.isConnected && !wasConnected) {
          this.processPendingRequests();
        }
      });

    } catch (error) {
      console.error('Network listener initialization failed:', error);
    }
  }

  // 네트워크 상태 변화 리스너 등록
  addNetworkListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // 리스너들에게 네트워크 상태 변화 알림
  notifyListeners(isConnected, wasConnected) {
    this.listeners.forEach(listener => {
      try {
        listener(isConnected, wasConnected);
      } catch (error) {
        console.error('Network listener callback error:', error);
      }
    });
  }

  // 현재 네트워크 연결 상태 확인
  getConnectionStatus() {
    return this.isConnected;
  }

  // 오프라인 데이터 저장
  async saveOfflineData(key, data) {
    try {
      const offlineData = await this.getOfflineData();
      offlineData[key] = {
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24시간 후 만료
      };

      await AsyncStorage.setItem(
        this.OFFLINE_DATA_KEY,
        JSON.stringify(offlineData)
      );

      console.log(`Offline data saved for key: ${key}`);
      return true;
    } catch (error) {
      console.error('Save offline data error:', error);
      return false;
    }
  }

  // 오프라인 데이터 조회
  async getOfflineData(key = null) {
    try {
      const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      const allData = dataString ? JSON.parse(dataString) : {};

      if (key) {
        const item = allData[key];
        if (item && item.expiresAt > Date.now()) {
          return item.data;
        }
        return null;
      }

      // 만료된 데이터 정리
      const currentTime = Date.now();
      const validData = {};
      
      Object.keys(allData).forEach(dataKey => {
        if (allData[dataKey].expiresAt > currentTime) {
          validData[dataKey] = allData[dataKey];
        }
      });

      return validData;
    } catch (error) {
      console.error('Get offline data error:', error);
      return key ? null : {};
    }
  }

  // 오프라인 데이터 삭제
  async removeOfflineData(key) {
    try {
      const offlineData = await this.getOfflineData();
      if (offlineData[key]) {
        delete offlineData[key];
        await AsyncStorage.setItem(
          this.OFFLINE_DATA_KEY,
          JSON.stringify(offlineData)
        );
        console.log(`Offline data removed for key: ${key}`);
      }
      return true;
    } catch (error) {
      console.error('Remove offline data error:', error);
      return false;
    }
  }

  // 대기 중인 요청 저장 (온라인 상태가 되면 실행할 요청들)
  async addPendingRequest(requestData) {
    try {
      const pendingRequests = await this.getPendingRequests();
      const requestId = Date.now().toString();
      
      pendingRequests[requestId] = {
        ...requestData,
        id: requestId,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3
      };

      await AsyncStorage.setItem(
        this.PENDING_REQUESTS_KEY,
        JSON.stringify(pendingRequests)
      );

      console.log(`Pending request added: ${requestId}`);
      return requestId;
    } catch (error) {
      console.error('Add pending request error:', error);
      return null;
    }
  }

  // 대기 중인 요청들 조회
  async getPendingRequests() {
    try {
      const requestsString = await AsyncStorage.getItem(this.PENDING_REQUESTS_KEY);
      return requestsString ? JSON.parse(requestsString) : {};
    } catch (error) {
      console.error('Get pending requests error:', error);
      return {};
    }
  }

  // 대기 중인 요청 처리 (온라인 상태가 될 때 실행)
  async processPendingRequests() {
    try {
      const pendingRequests = await this.getPendingRequests();
      const requestIds = Object.keys(pendingRequests);

      if (requestIds.length === 0) {
        return;
      }

      console.log(`Processing ${requestIds.length} pending requests...`);

      for (const requestId of requestIds) {
        const request = pendingRequests[requestId];
        
        try {
          // 요청 타입에 따라 처리
          await this.executeRequest(request);
          
          // 성공시 요청 제거
          delete pendingRequests[requestId];
          console.log(`Pending request ${requestId} processed successfully`);
          
        } catch (error) {
          console.error(`Pending request ${requestId} failed:`, error);
          
          // 재시도 횟수 증가
          request.retryCount = (request.retryCount || 0) + 1;
          
          if (request.retryCount >= request.maxRetries) {
            // 최대 재시도 횟수 초과시 제거
            delete pendingRequests[requestId];
            console.log(`Pending request ${requestId} exceeded max retries, removing`);
          } else {
            // 재시도를 위해 유지
            pendingRequests[requestId] = request;
          }
        }
      }

      // 업데이트된 대기 요청 목록 저장
      await AsyncStorage.setItem(
        this.PENDING_REQUESTS_KEY,
        JSON.stringify(pendingRequests)
      );

    } catch (error) {
      console.error('Process pending requests error:', error);
    }
  }

  // 실제 요청 실행
  async executeRequest(request) {
    switch (request.type) {
      case 'feedback':
        // 피드백 전송
        const DatabaseService = require('../services/DatabaseService').default;
        return await DatabaseService.saveFeedback(request.data);
        
      case 'analytics':
        // 분석 데이터 전송
        const AnalyticsService = require('../services/DatabaseService').default;
        return await AnalyticsService.logAnalytics(request.data);
        
      case 'user_update':
        // 사용자 정보 업데이트
        const UserService = require('../services/DatabaseService').default;
        return await UserService.updateUser(request.userId, request.data);
        
      default:
        console.warn(`Unknown request type: ${request.type}`);
        throw new Error(`Unsupported request type: ${request.type}`);
    }
  }

  // 오프라인 상태 확인 및 처리를 위한 래퍼 함수
  async handleRequest(requestFunction, fallbackData = null, cacheKey = null) {
    if (this.isConnected) {
      try {
        const result = await requestFunction();
        
        // 성공한 데이터를 오프라인 캐시에 저장
        if (cacheKey && result) {
          await this.saveOfflineData(cacheKey, result);
        }
        
        return { success: true, data: result, isOffline: false };
      } catch (error) {
        // 온라인 상태에서 요청 실패시 오프라인 데이터 사용
        if (cacheKey) {
          const cachedData = await this.getOfflineData(cacheKey);
          if (cachedData) {
            console.log('Using cached data due to request failure');
            return { success: true, data: cachedData, isOffline: true, isStale: true };
          }
        }
        
        throw error;
      }
    } else {
      // 오프라인 상태
      if (cacheKey) {
        const cachedData = await this.getOfflineData(cacheKey);
        if (cachedData) {
          return { success: true, data: cachedData, isOffline: true };
        }
      }
      
      if (fallbackData) {
        return { success: true, data: fallbackData, isOffline: true, isFallback: true };
      }
      
      throw new Error('오프라인 상태이며 캐시된 데이터가 없습니다.');
    }
  }

  // 오프라인 상태에서의 사용자 액션 처리
  async handleOfflineAction(actionType, actionData, userId = null) {
    if (this.isConnected) {
      // 온라인 상태면 바로 실행
      return true;
    }

    // 오프라인 상태면 대기 요청으로 추가
    const requestData = {
      type: actionType,
      data: actionData,
      userId: userId
    };

    const requestId = await this.addPendingRequest(requestData);
    return requestId !== null;
  }

  // 캐시 정리
  async clearExpiredCache() {
    try {
      const offlineData = await this.getOfflineData();
      let hasExpiredItems = false;

      Object.keys(offlineData).forEach(key => {
        if (offlineData[key].expiresAt <= Date.now()) {
          delete offlineData[key];
          hasExpiredItems = true;
        }
      });

      if (hasExpiredItems) {
        await AsyncStorage.setItem(
          this.OFFLINE_DATA_KEY,
          JSON.stringify(offlineData)
        );
        console.log('Expired offline cache cleared');
      }

      return true;
    } catch (error) {
      console.error('Clear expired cache error:', error);
      return false;
    }
  }

  // 오프라인 매니저 상태 정보
  async getStatus() {
    try {
      const offlineData = await this.getOfflineData();
      const pendingRequests = await this.getPendingRequests();

      return {
        isConnected: this.isConnected,
        cachedItems: Object.keys(offlineData).length,
        pendingRequests: Object.keys(pendingRequests).length,
        totalCacheSize: JSON.stringify(offlineData).length,
        totalPendingSize: JSON.stringify(pendingRequests).length
      };
    } catch (error) {
      console.error('Get offline manager status error:', error);
      return null;
    }
  }
}

export default new OfflineManager();