// Axios client configuration with interceptors and token refresh

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV, STORAGE_KEYS, API_ENDPOINTS } from '../utils/constants';
import { Storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { ApiResponse, ApiError } from '../types';

interface QueuedRequest {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('ENV.API_BASE_URL', ENV.API_BASE_URL);

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token to requests
        const token = await Storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });

        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with automatic token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        logger.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip refresh for auth endpoints
          if (
            originalRequest.url?.includes('/auth/otp') ||
            originalRequest.url?.includes('/auth/refresh')
          ) {
            const apiError: ApiError = {
              message: error.response?.data?.message || error.message || 'An error occurred',
              statusCode: error.response?.status,
              errors: error.response?.data?.errors,
            };
            return Promise.reject(apiError);
          }

          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await Storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Call refresh token endpoint
            const response = await axios.post(
              `${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
              { refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            const { access_token, refresh_token } = response.data.data;

            // Update stored tokens (token rotation)
            await Storage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
            await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);

            // Update authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            // Process queued requests
            this.processQueue(null, access_token);

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and process queue
            this.processQueue(refreshError, null);
            await Storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            await Storage.removeItem(STORAGE_KEYS.USER_DATA);
            logger.error('Token refresh failed:', refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          statusCode: error.response?.status,
          errors: error.response?.data?.errors,
        };

        logger.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, apiError);

        return Promise.reject(apiError);
      }
    );
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

