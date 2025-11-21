// Zustand store for OTP-based authentication state

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, AuthState } from '../services/auth.service';
import { RequestOtpDto, VerifyOtpDto, RequestOtpResponse, User } from '../api/endpoints';
import { Storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { logger } from '../utils/logger';

interface AuthStore extends AuthState {
  isLoading: boolean;
  error: string | null;
  otpRequested: boolean;
  phoneNumber: string | null;
  isNewUser: boolean;
  requestOtp: (params: RequestOtpDto) => Promise<RequestOtpResponse>;
  verifyOtp: (params: VerifyOtpDto) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  resetOtpState: () => void;
  setNewUserComplete: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      otpRequested: false,
      phoneNumber: null,
      isNewUser: false,

      requestOtp: async (params: RequestOtpDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.requestOtp(params);
          // Store isNewUser from requestOtp response
          set({
            otpRequested: true,
            phoneNumber: params.phoneNumber,
            isNewUser: response.isNewUser || false,
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to send OTP',
            otpRequested: false,
            isNewUser: false,
          });
          throw error;
        }
      },

      verifyOtp: async (params: VerifyOtpDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyOtp(params);
          // Use isNewUser from requestOtp (stored in state)
          const isNewUser = get().isNewUser;
          
          set({
            isAuthenticated: !isNewUser, // Only set authenticated if not a new user
            user: response.user,
            token: response.access_token,
            isLoading: false,
            error: null,
            otpRequested: false,
            phoneNumber: null,
            // Keep isNewUser state for navigation decision
          });
          
          return { isNewUser };
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Invalid OTP',
            isAuthenticated: false,
            user: null,
            token: null,
            isNewUser: false,
          });
          throw error;
        }
      },
      
      setNewUserComplete: async () => {
        // Refresh user data from storage
        const userJson = await Storage.getItem<string>(STORAGE_KEYS.USER_DATA);
        let updatedUser: User | null = null;
        if (userJson) {
          try {
            updatedUser = JSON.parse(userJson);
          } catch (error) {
            logger.error('Error parsing user data:', error);
          }
        }
        
        set({
          isAuthenticated: true,
          isNewUser: false,
          user: updatedUser,
        });
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
            otpRequested: false,
            phoneNumber: null,
            isNewUser: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Logout failed',
          });
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const authState = await authService.getStoredAuth();
          set({
            ...authState,
            isLoading: false,
            otpRequested: false,
            phoneNumber: null,
            isNewUser: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
        }
      },

      clearError: () => set({ error: null }),

      resetOtpState: () =>
        set({
          otpRequested: false,
          phoneNumber: null,
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

