// API endpoint definitions and request/response types

import { apiClient } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import { ApiResponse } from '../types';
import {
  HomePageData,
  AreasServedResponse,
  Category,
  Review,
  Area,
  Plan,
} from '../types/home.types';

// Time Slot types
export interface TimeSlot {
  id: string;
  displayText: string;
  startTime: string;
  endTime: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
    {
      console.log('>>>>>', API_ENDPOINTS.AUTH.REQUEST_OTP)
      return apiClient.post(API_ENDPOINTS.AUTH.REQUEST_OTP, data)},

  verifyOtp: (data: VerifyOtpDto): Promise<ApiResponse<VerifyOtpResponse>> =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data),

  refreshToken: (data: RefreshTokenDto): Promise<ApiResponse<RefreshTokenResponse>> =>
    apiClient.post(API_ENDPOINTS.AUTH.REFRESH, data),

  logout: (data?: LogoutDto): Promise<ApiResponse<void>> =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, data || {}),
};

// User endpoints
export interface UserProfile extends User {}

export interface Address {
  id?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userApi = {
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get(API_ENDPOINTS.USER.PROFILE),

  updateProfile: (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> =>
    apiClient.patch(API_ENDPOINTS.USER.UPDATE_PROFILE, data),

  addAddress: (data: Address): Promise<ApiResponse<Address>> =>
    apiClient.post(`${API_ENDPOINTS.USER.PROFILE}/addresses`, data),
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
  areaId?: string;
  rootOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetReviewsParams {
  limit?: number;
  offset?: number;
  city?: string;
}

export interface SearchAreasParams {
  name: string;
  limit?: number;
  offset?: number;
}

export interface GetPlansParams {
  includeInactive?: boolean;
}

export interface CreateOrderDto {
  planId: string;
  addressId: string;
  categoryId: string;
  areaId?: string; // Area ID for worker assignment
  slots?: number; // Number of slots (deprecated, use timeSlots array instead)
  timeSlots?: Array<{
    timeSlotId: string;
    slotDate: string; // ISO date string (YYYY-MM-DD)
  }>;
  meta?: {
    paymentMethod?: string;
    notes?: string;
  };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  status: string;
  rzp_key: string;
  currency: string;
  created_at: number;
}

export interface Order {
  id: string;
  userId: string;
  planId: string;
  addressId: string;
  categoryId: string;
  serviceId?: string | null;
  status: string;
  amount?: number;
  slots?: number;
  meta?: {
    notes?: string;
    paymentMethod?: string;
    razorpayOrder?: RazorpayOrder;
  };
  paymentGatewayTransactionId?: string;
  paymentGatewayResponse?: any;
  razorpayOrderId?: string;
  razorpayPaymentId?: string | null;
  paymentLink?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Related entities (populated when fetching user orders)
  plan?: Plan;
  category?: Category;
  address?: Address;
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

  searchAreas: (params: SearchAreasParams): Promise<ApiResponse<Area[]>> =>
    apiClient.get(API_ENDPOINTS.AREAS.SEARCH, { params }),

  getAreasByCategory: (categoryId: string): Promise<ApiResponse<Area[]>> =>
    apiClient.get(`${API_ENDPOINTS.AREAS.BY_CATEGORY}/${categoryId}`),

  getPlans: (params?: GetPlansParams): Promise<ApiResponse<Plan[]>> =>
    apiClient.get(API_ENDPOINTS.PLANS, { params }),

  getTimeSlots: (): Promise<ApiResponse<TimeSlot[]>> =>
    apiClient.get(API_ENDPOINTS.TIME_SLOTS),

  createOrder: (data: CreateOrderDto): Promise<ApiResponse<Order>> =>
    apiClient.post(API_ENDPOINTS.ORDERS, data),

  getOrder: (orderId: string, verify?: boolean): Promise<ApiResponse<Order>> =>
    apiClient.get(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
      params: verify ? { verify: 'true' } : undefined,
    }),
};

// Orders API
export const ordersApi = {
  getUserOrders: (): Promise<ApiResponse<Order[]>> =>
    apiClient.get(API_ENDPOINTS.ORDERS_ME),

  getOrderById: (orderId: string): Promise<ApiResponse<Order>> =>
    apiClient.get(`${API_ENDPOINTS.ORDERS}/${orderId}`),
};

