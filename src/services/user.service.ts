// User service layer - business logic for user operations

import { userApi, UserProfile } from '../api/endpoints';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

class UserService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await userApi.getProfile();
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch profile');
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error as ApiError;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    console.log('Updating profile with data:', data);
    try {
      const response = await userApi.updateProfile(data);
      
      if (response.success && response.data) {
        logger.info('Profile updated successfully', { userId: response.data.id });
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error as ApiError;
    }
  }
}

export const userService = new UserService();

