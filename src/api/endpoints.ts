// API endpoint definitions and request/response types

import { apiClient } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse } from '../types';
import {
  HomePageData,
  AreasServedResponse,
  Category,
  Review,
} from '../types/home.types';

// Auth endpoints - OTP based
export interface RequestOtpDto {
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface RequestOtpResponse {
  message?: string;
  userExists: boolean;
  isActive: boolean;
  hasPhoneNumber: boolean;
  isNewUser: boolean;
}

export interface VerifyOtpDto {
  phoneNumber?: string;
  email?: string;
  otp: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  language?: string;
  roles: string[] | Role[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export const authApi = {
  requestOtp: (data: RequestOtpDto): Promise<ApiResponse<RequestOtpResponse>> =>
    apiClient.post(API_ENDPOINTS.AUTH.REQUEST_OTP, data),

  verifyOtp: (data: VerifyOtpDto): Promise<ApiResponse<VerifyOtpResponse>> =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data),

  refreshToken: (data: RefreshTokenDto): Promise<ApiResponse<RefreshTokenResponse>> =>
    apiClient.post(API_ENDPOINTS.AUTH.REFRESH, data),

  logout: (data?: LogoutDto): Promise<ApiResponse<void>> =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, data || {}),
};

// User endpoints
export interface UserProfile extends User {}

export const userApi = {
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get(API_ENDPOINTS.USER.PROFILE),

  updateProfile: (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> =>
    apiClient.patch(API_ENDPOINTS.USER.UPDATE_PROFILE, data),
};

// Home page endpoints
export interface GetHomePageParams {
  city?: string;
  limit?: number;
  testimonialLimit?: number;
}

export interface GetAreasServedParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetCategoriesParams {
  rootOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetReviewsParams {
  limit?: number;
  offset?: number;
  city?: string;
}

export const homeApi = {
  getHomePage: (params?: GetHomePageParams): Promise<ApiResponse<HomePageData>> =>
    apiClient.get(API_ENDPOINTS.HOME.MAIN, { params }),

  getAreasServed: (params?: GetAreasServedParams): Promise<ApiResponse<AreasServedResponse>> =>
    apiClient.get(API_ENDPOINTS.HOME.AREAS_SERVED, { params }),

  getCategories: (params?: GetCategoriesParams): Promise<ApiResponse<Category[]>> =>
    apiClient.get(API_ENDPOINTS.CATEGORIES, { params }),

  getReviews: (params?: GetReviewsParams): Promise<ApiResponse<Review[]>> =>
    apiClient.get(API_ENDPOINTS.REVIEWS, { params }),
};

