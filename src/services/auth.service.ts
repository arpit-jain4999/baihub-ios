// Auth service layer - OTP-based authentication

import {
  authApi,
  RequestOtpDto,
  RequestOtpResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  User,
  RefreshTokenResponse,
} from '../api/endpoints';
import { Storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

class AuthService {
  /**
   * Request OTP for login/registration
   */
  async requestOtp(params: RequestOtpDto): Promise<RequestOtpResponse> {
    try {
      const response = await authApi.requestOtp(params);

      if (response.success && response.data) {
        logger.info('OTP requested successfully', {
          phoneNumber: "+91"+params.phoneNumber,
          isNewUser: response.data.isNewUser,
        });
        return response.data;
      }

      throw new Error(response.message || 'Failed to request OTP');
    } catch (error: any) {
      logger.error('Request OTP error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to send OTP. Please try again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }

  /**
   * Verify OTP and get JWT tokens
   */
  async verifyOtp(params: VerifyOtpDto): Promise<VerifyOtpResponse> {
    try {
      const response = await authApi.verifyOtp(params);

      if (response.success && response.data) {
        const { access_token, refresh_token, user } = response.data;

        // Store tokens securely
        await Storage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
        await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
        await Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        logger.info('OTP verified successfully', { userId: user.id });
        return response.data;
      }

      throw new Error(response.message || 'OTP verification failed');
    } catch (error: any) {
      logger.error('Verify OTP error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Invalid OTP. Please try again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await authApi.refreshToken({ refreshToken });

      if (response.success && response.data) {
        const { access_token, refresh_token, user } = response.data;

        // Update stored tokens (token rotation)
        await Storage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
        await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
        await Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        logger.info('Token refreshed successfully');
        return response.data;
      }

      throw new Error(response.message || 'Token refresh failed');
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      // If refresh fails, clear all tokens
      await this.logout();
      const message =
        error.response?.data?.message ||
        error.message ||
        'Session expired. Please login again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }

  /**
   * Logout - clear stored tokens
   */
  /**
   * Logout - revoke refresh token and clear stored tokens
   * @param logoutAllDevices - If true, revokes all tokens for the user (logout from all devices)
   */
  async logout(logoutAllDevices: boolean = false): Promise<void> {
    const refreshToken = await Storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);

    try {
      if (logoutAllDevices) {
        // Logout from all devices - don't send refreshToken
        await authApi.logout({});
      } else if (refreshToken) {
        // Single device logout - send refreshToken
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      // Ignore errors during logout - still clear local storage
      logger.error('Error revoking token:', error);
    } finally {
      // Always clear local storage regardless of API call result
      await Storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.USER_DATA);
      logger.info('User logged out');
    }
  }

  /**
   * Get stored authentication state
   */
  async getStoredAuth(): Promise<AuthState> {
    const [token, userJson] = await Promise.all([
      Storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN),
      Storage.getItem<string>(STORAGE_KEYS.USER_DATA),
    ]);

    let user: User | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch (error) {
        logger.error('Error parsing stored user data:', error);
      }
    }

    return {
      isAuthenticated: !!token && !!user,
      token,
      user,
    };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const refreshToken = await Storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
    return !!refreshToken; // Check refresh token as it has longer expiration
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await Storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    const userJson = await Storage.getItem<string>(STORAGE_KEYS.USER_DATA);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      logger.error('Error parsing stored user data:', error);
      return null;
    }
  }
}

export const authService = new AuthService();

