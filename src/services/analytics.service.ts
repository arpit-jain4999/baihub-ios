import analytics from '@react-native-firebase/analytics';
import { logger } from '../utils/logger';

/**
 * Analytics Service - Firebase Analytics wrapper
 * Provides easy-to-use methods for tracking app events and user behavior
 * 
 * Note: React Native Firebase Analytics uses the default export pattern.
 * Firebase auto-initializes from google-services.json on native side.
 */
class AnalyticsService {
  private analyticsInitialized = false;
  private initPromise: Promise<void> | null = null;
  
  /**
   * Initialize analytics - should be called on app startup
   * Retries if Firebase isn't ready yet (native initialization can take time)
   */
  async initialize(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeWithRetry();
    return this.initPromise;
  }

  private async _initializeWithRetry(retries = 10, delay = 300): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        // React Native Firebase Analytics uses the default export
        // The analytics() function should auto-initialize from google-services.json
        // But native initialization can take time, so we retry
        const analyticsInstance = analytics();
        
        // Try to enable analytics collection to verify it's working
        await analyticsInstance.setAnalyticsCollectionEnabled(true);
        this.analyticsInitialized = true;
        logger.info('Analytics: Firebase Analytics initialized successfully');
        return;
      } catch (error: any) {
        const errorMessage = error?.message || String(error) || 'Unknown error';
        
        // If Firebase app isn't initialized yet, wait and retry
        if (errorMessage.includes('No Firebase App') || 
            errorMessage.includes('has been created') ||
            errorMessage.includes('getApp')) {
          if (i < retries - 1) {
            const waitTime = delay * (i + 1); // Linear backoff
            logger.warn(`Analytics: Firebase not ready, retrying in ${waitTime}ms (attempt ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            logger.error('Analytics: Firebase failed to initialize after all retries', {
              error: errorMessage,
              attempts: retries,
            });
          }
        } else {
          // Different error, log and break
          logger.error('Analytics: Failed to initialize Firebase Analytics', {
            error: errorMessage,
            stack: error?.stack,
            attempt: i + 1,
          });
          break;
        }
      }
    }
    
    // Don't block app startup if analytics fails
    this.analyticsInitialized = false;
    this.initPromise = null;
  }

  /**
   * Get analytics instance
   * React Native Firebase Analytics uses the default export pattern
   * Returns null if Firebase isn't ready (graceful degradation)
   */
  private getAnalyticsInstance() {
    try {
      // analytics() should work if Firebase is auto-initialized from google-services.json
      return analytics();
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Unknown error';
      
      // Only log if it's not the "not initialized" error (we'll retry)
      if (!errorMessage.includes('No Firebase App') && !errorMessage.includes('has been created')) {
        logger.error('Analytics: Failed to get analytics instance', {
          error: errorMessage,
          stack: error?.stack,
        });
      }
      return null;
    }
  }
  /**
   * Track screen views
   * @param screenName - Name of the screen being viewed
   * @param screenClass - Optional class/component name
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      // Validate screen name
      if (!screenName || typeof screenName !== 'string') {
        logger.error('Analytics: Invalid screen name provided', { screenName });
        return;
      }

      // Get analytics instance and log screen view
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) {
        return;
      }

      await analyticsInstance.logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      logger.info(`Analytics: Screen view logged: ${screenName}`);
    } catch (error: any) {
      // More detailed error logging
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorStack = error?.stack || '';
      logger.error(`Analytics: Error logging screen view - ${errorMessage}`, {
        screenName,
        screenClass,
        error: errorMessage,
        stack: errorStack,
      });
    }
  }

  /**
   * Track custom events
   * @param eventName - Name of the event
   * @param params - Optional event parameters
   */
  async logEvent(
    eventName: string,
    params?: { [key: string]: any }
  ): Promise<void> {
    try {
      // Validate event name
      if (!eventName || typeof eventName !== 'string') {
        logger.error('Analytics: Invalid event name provided', { eventName });
        return;
      }

      // Clean params - Firebase Analytics doesn't accept undefined/null values
      // Also convert arrays to strings (Firebase Analytics requirement)
      const cleanedParams = params ? Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : value,
          ])
      ) : undefined;

      // Get analytics instance and log event
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) {
        return;
      }

      await analyticsInstance.logEvent(eventName, cleanedParams);
      logger.info(`Analytics: Event logged: ${eventName}`, cleanedParams);
    } catch (error: any) {
      // More detailed error logging
      const errorMessage = error?.message || String(error) || 'Unknown error';
      const errorStack = error?.stack || '';
      logger.error(`Analytics: Error logging event - ${errorMessage}`, {
        eventName,
        params,
        error: errorMessage,
        stack: errorStack,
      });
    }
  }

  /**
   * Track user login
   * @param method - Login method (e.g., 'phone', 'email', 'google')
   */
  async logLogin(method: string = 'phone'): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logLogin({ method });
      logger.info(`Analytics: Login logged with method: ${method}`);
    } catch (error) {
      logger.error('Analytics: Error logging login', error);
    }
  }

  /**
   * Track user signup
   * @param method - Signup method (e.g., 'phone', 'email')
   */
  async logSignUp(method: string = 'phone'): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logSignUp({ method });
      logger.info(`Analytics: Signup logged with method: ${method}`);
    } catch (error) {
      logger.error('Analytics: Error logging signup', error);
    }
  }

  /**
   * Track purchases/bookings
   * @param params - Purchase details
   */
  async logPurchase(params: {
    value: number;
    currency: string;
    transaction_id?: string;
    items?: Array<{
      item_id: string;
      item_name: string;
      item_category?: string;
      price?: number;
      quantity?: number;
    }>;
  }): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logPurchase(params);
      logger.info('Analytics: Purchase logged', params);
    } catch (error) {
      logger.error('Analytics: Error logging purchase', error);
    }
  }

  /**
   * Track add to cart (service selection)
   * @param params - Cart item details
   */
  async logAddToCart(params: {
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      item_category?: string;
      price?: number;
      quantity?: number;
    }>;
  }): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logAddToCart(params);
      logger.info('Analytics: Add to cart logged', params);
    } catch (error) {
      logger.error('Analytics: Error logging add to cart', error);
    }
  }

  /**
   * Track begin checkout
   * @param params - Checkout details
   */
  async logBeginCheckout(params: {
    value: number;
    currency: string;
    items?: Array<{
      item_id: string;
      item_name: string;
    }>;
  }): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logBeginCheckout(params);
      logger.info('Analytics: Begin checkout logged', params);
    } catch (error) {
      logger.error('Analytics: Error logging begin checkout', error);
    }
  }

  /**
   * Track search queries
   * @param searchTerm - The search term
   */
  async logSearch(searchTerm: string): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logSearch({ search_term: searchTerm });
      logger.info(`Analytics: Search logged: ${searchTerm}`);
    } catch (error) {
      logger.error('Analytics: Error logging search', error);
    }
  }

  /**
   * Set user ID for tracking
   * @param userId - Unique user identifier (or null to clear)
   */
  async setUserId(userId: string | null): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.setUserId(userId);
      logger.info(`Analytics: User ID set: ${userId}`);
    } catch (error) {
      logger.error('Analytics: Error setting user ID', error);
    }
  }

  /**
   * Set a single user property
   * @param name - Property name
   * @param value - Property value
   */
  async setUserProperty(name: string, value: string): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.setUserProperty(name, value);
      logger.info(`Analytics: User property set: ${name} = ${value}`);
    } catch (error) {
      logger.error('Analytics: Error setting user property', error);
    }
  }

  /**
   * Set multiple user properties at once
   * @param properties - Object containing property name-value pairs
   */
  async setUserProperties(properties: {
    [key: string]: string;
  }): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      const promises = Object.entries(properties).map(([name, value]) =>
        analyticsInstance.setUserProperty(name, value)
      );
      await Promise.all(promises);
      logger.info('Analytics: User properties set', properties);
    } catch (error) {
      logger.error('Analytics: Error setting user properties', error);
    }
  }

  /**
   * Enable or disable analytics collection
   * @param enabled - Whether to enable analytics
   */
  async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.setAnalyticsCollectionEnabled(enabled);
      logger.info(`Analytics: Analytics collection ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      logger.error('Analytics: Error setting analytics collection', error);
    }
  }

  /**
   * Track app open
   */
  async logAppOpen(): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      // Using logEvent as logAppOpen is deprecated in v22+
      await analyticsInstance.logEvent('app_open');
      logger.info('Analytics: App open logged');
    } catch (error) {
      logger.error('Analytics: Error logging app open', error);
    }
  }

  /**
   * Track when user views an item/service
   * @param params - Item details
   */
  async logViewItem(params: {
    item_id: string;
    item_name: string;
    item_category?: string;
    price?: number;
  }): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logViewItem({
        items: [params],
      });
      logger.info('Analytics: View item logged', params);
    } catch (error) {
      logger.error('Analytics: Error logging view item', error);
    }
  }

  /**
   * Track when user selects content
   * @param contentType - Type of content
   * @param itemId - Item identifier
   */
  async logSelectContent(contentType: string, itemId: string): Promise<void> {
    try {
      const analyticsInstance = this.getAnalyticsInstance();
      if (!analyticsInstance) return;
      await analyticsInstance.logSelectContent({
        content_type: contentType,
        item_id: itemId,
      });
      logger.info(`Analytics: Select content logged: ${contentType} - ${itemId}`);
    } catch (error) {
      logger.error('Analytics: Error logging select content', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

