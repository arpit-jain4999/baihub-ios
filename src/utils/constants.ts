// Application constants

import Constants from 'expo-constants';

// Get environment variables with fallbacks for web compatibility
const getEnvVar = (key: string, defaultValue: string): string => {
  // Try expo config first
  const expoValue = Constants.expoConfig?.extra?.[key];
  if (expoValue) return expoValue;
  
  // Fallback to process.env for Node.js/web environments
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  
  return defaultValue;
};

export const ENV = {
  API_BASE_URL: getEnvVar('API_BASE_URL', 'http://10.0.2.2:3000'),
  API_TIMEOUT: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),
  ENVIRONMENT: (getEnvVar('ENVIRONMENT', 'development') as 'development' | 'staging' | 'production'),
};

export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/auth/otp/request',
    VERIFY_OTP: '/auth/otp/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
  },
  HOME: {
    MAIN: '/home',
    AREAS_SERVED: '/areas-served',
  },
  CATEGORIES: '/categories',
  REVIEWS: '/reviews',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
} as const;

