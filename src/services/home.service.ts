// Home service layer - business logic for home page operations

import { homeApi, GetHomePageParams, GetAreasServedParams, GetCategoriesParams, GetReviewsParams } from '../api/endpoints';
import { HomePageData, AreasServedResponse, Category, Review } from '../types/home.types';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

class HomeService {
  /**
   * Get home page data
   */
  async getHomePage(params?: GetHomePageParams): Promise<HomePageData> {
    try {
      const response = await homeApi.getHomePage(params);

      if (response.success && response.data) {
        logger.info('Home page data fetched successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch home page data');
    } catch (error: any) {
      logger.error('Get home page error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load home page. Please try again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }

  /**
   * Get areas served
   */
  async getAreasServed(params?: GetAreasServedParams): Promise<AreasServedResponse> {
    try {
      const response = await homeApi.getAreasServed(params);

      if (response.success && response.data) {
        logger.info('Areas served data fetched successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch areas served');
    } catch (error: any) {
      logger.error('Get areas served error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load areas. Please try again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }

  /**
   * Get categories
   */
  async getCategories(params?: GetCategoriesParams): Promise<Category[]> {
    try {
      const response = await homeApi.getCategories(params);

      if (response.success && response.data) {
        logger.info('Categories fetched successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch categories');
    } catch (error: any) {
      logger.error('Get categories error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load categories. Please try again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }

  /**
   * Get reviews/testimonials
   */
  async getReviews(params?: GetReviewsParams): Promise<Review[]> {
    try {
      const response = await homeApi.getReviews(params);

      if (response.success && response.data) {
        logger.info('Reviews fetched successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch reviews');
    } catch (error: any) {
      logger.error('Get reviews error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load reviews. Please try again.';
      throw new Error(Array.isArray(message) ? message[0] : message);
    }
  }
}

export const homeService = new HomeService();









