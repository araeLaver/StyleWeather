import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { CONFIG } from '../config/config';
import { APP_CONSTANTS, ERROR_MESSAGES } from '../constants';
import type { ApiError, ApiResponse } from '../types';

// 재시도 설정 인터페이스
interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// 기본 재시도 설정
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: APP_CONSTANTS.MAX_RETRY_ATTEMPTS,
  delay: APP_CONSTANTS.RETRY_DELAY,
  backoffMultiplier: 2,
  retryCondition: (error: AxiosError) => {
    // 네트워크 에러나 5xx 서버 에러인 경우 재시도
    return !error.response || (error.response.status >= 500);
  },
};

// HTTP 상태 코드별 에러 메시지 매핑
const STATUS_ERROR_MAP: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근이 거부되었습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 내부 오류가 발생했습니다.',
  502: '게이트웨이 오류입니다.',
  503: '서비스를 사용할 수 없습니다.',
  504: '게이트웨이 시간 초과입니다.',
};

// API 클라이언트 클래스
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(baseURL: string, timeout: number = CONFIG.API_TIMEOUT, retryConfig?: Partial<RetryConfig>) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 요청 로깅 (개발 모드에서만)
        if (CONFIG.APP_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // 응답 로깅 (개발 모드에서만)
        if (CONFIG.APP_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const originalRequest = error.config;
    
    // 재시도 로직 실행
    if (originalRequest && this.shouldRetry(error, originalRequest)) {
      return this.retryRequest(originalRequest, error);
    }

    // 에러 로깅
    this.logError(error);
    
    // 커스텀 에러 객체 생성
    const apiError = this.createApiError(error);
    
    throw apiError;
  }

  private shouldRetry(error: AxiosError, originalRequest: any): boolean {
    // 이미 재시도 정보가 있는지 확인
    const retryCount = originalRequest._retryCount || 0;
    
    // 최대 재시도 횟수 확인
    if (retryCount >= this.retryConfig.maxAttempts) {
      return false;
    }

    // 재시도 조건 확인
    return this.retryConfig.retryCondition ? this.retryConfig.retryCondition(error) : true;
  }

  private async retryRequest(originalRequest: any, error: AxiosError): Promise<never> {
    const retryCount = originalRequest._retryCount || 0;
    originalRequest._retryCount = retryCount + 1;

    // 백오프 지연 계산
    const delay = this.retryConfig.delay * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
    
    console.warn(`🔄 Retrying request (attempt ${retryCount + 1}/${this.retryConfig.maxAttempts}) after ${delay}ms:`, {
      url: originalRequest.url,
      error: error.message,
    });

    // 지연 후 재시도
    await this.sleep(delay);
    return this.axiosInstance.request(originalRequest);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logError(error: AxiosError): void {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    };

    console.error('❌ API Error:', errorInfo);
    
    // 프로덕션에서는 에러 추적 서비스로 전송 (예: Sentry)
    if (CONFIG.APP_ENV === 'production' && CONFIG.SENTRY_DSN) {
      // TODO: Sentry 에러 리포팅 구현
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private createApiError(error: AxiosError): ApiError {
    let message = ERROR_MESSAGES.UNEXPECTED_ERROR;
    let code = 'UNKNOWN_ERROR';
    let status: number | undefined;

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      message = '요청 시간이 초과되었습니다.';
      code = 'TIMEOUT';
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
      code = 'NETWORK_ERROR';
    } else if (error.response) {
      status = error.response.status;
      message = STATUS_ERROR_MAP[status] || ERROR_MESSAGES.UNEXPECTED_ERROR;
      code = `HTTP_${status}`;
      
      // 서버에서 제공하는 에러 메시지가 있으면 사용
      if (error.response.data && typeof error.response.data === 'object') {
        const serverError = error.response.data as any;
        if (serverError.message) {
          message = serverError.message;
        } else if (serverError.error) {
          message = serverError.error;
        }
      }
    }

    return { message, code, status };
  }

  // 공통 GET 요청
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return { data: response.data, loading: false };
    } catch (error) {
      return { error: error as ApiError, loading: false };
    }
  }

  // 공통 POST 요청
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return { data: response.data, loading: false };
    } catch (error) {
      return { error: error as ApiError, loading: false };
    }
  }

  // 공통 PUT 요청
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return { data: response.data, loading: false };
    } catch (error) {
      return { error: error as ApiError, loading: false };
    }
  }

  // 공통 DELETE 요청
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return { data: response.data, loading: false };
    } catch (error) {
      return { error: error as ApiError, loading: false };
    }
  }

  // 원시 Axios 인스턴스 접근 (필요한 경우)
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // 인터셉터 추가 (런타임에 추가 인터셉터가 필요한 경우)
  addRequestInterceptor(
    onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  }

  addResponseInterceptor(
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
  }
}

// 기본 API 클라이언트 인스턴스들
export const weatherApiClient = new ApiClient(CONFIG.OPENWEATHER_BASE_URL);
export const openaiApiClient = new ApiClient(CONFIG.OPENAI_BASE_URL);

// 커스텀 훅을 위한 API 상태 관리
export class ApiStateManager<T> {
  private _data: T | null = null;
  private _loading = false;
  private _error: ApiError | null = null;
  private _listeners: Set<() => void> = new Set();

  get data(): T | null {
    return this._data;
  }

  get loading(): boolean {
    return this._loading;
  }

  get error(): ApiError | null {
    return this._error;
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private notify(): void {
    this._listeners.forEach(listener => listener());
  }

  setLoading(loading: boolean): void {
    this._loading = loading;
    this.notify();
  }

  setData(data: T | null): void {
    this._data = data;
    this._error = null;
    this._loading = false;
    this.notify();
  }

  setError(error: ApiError): void {
    this._error = error;
    this._data = null;
    this._loading = false;
    this.notify();
  }

  reset(): void {
    this._data = null;
    this._loading = false;
    this._error = null;
    this.notify();
  }
}