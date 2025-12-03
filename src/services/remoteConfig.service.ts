import remoteConfig from '@react-native-firebase/remote-config';
import { logger } from '../utils/logger';
import { ENV } from '../utils/constants';

/**
 * Remote Config Service - Firebase Remote Config wrapper
 * Manages feature flags and dynamic configuration
 */
class RemoteConfigService {
  private initialized = false;
  private defaultConfig = {
    is_payment_flow_enabled: JSON.stringify({
      dev: 'true',
      production: 'false',
    }),
  };

  /**
   * Initialize Remote Config with default values and fetch settings
   */
  async initialize(): Promise<void> {
    try {
    if (this.initialized) {
      logger.info('RemoteConfig: Already initialized');
      return;
    }

      // Set default values
      await remoteConfig().setDefaults(this.defaultConfig);

      // Set config settings
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000, // 1 hour in production, instant in dev
      });

      // Fetch and activate
      await this.fetchAndActivate();

      this.initialized = true;
      logger.info('RemoteConfig: Initialized successfully');
    } catch (error) {
      logger.error('RemoteConfig: Initialization error', error);
      throw error;
    }
  }

  /**
   * Fetch and activate remote config values
   */
  async fetchAndActivate(): Promise<boolean> {
    try {
      const activated = await remoteConfig().fetchAndActivate();
        
        if (activated) {
        logger.info('RemoteConfig: Configs were activated');
        } else {
        logger.info('RemoteConfig: Configs were already activated');
        }
        
        return activated;
    } catch (error) {
      logger.error('RemoteConfig: Fetch and activate error', error);
      return false;
    }
  }

  /**
   * Get payment flow enabled status based on current environment
   */
  getIsPaymentFlowEnabled(): boolean {
    try {
      const configValue = remoteConfig().getValue('is_payment_flow_enabled');
      const configString = configValue.asString();
      
      logger.info(`RemoteConfig: is_payment_flow_enabled raw value: ${configString}`);

      // Parse the JSON config
      const parsedConfig = JSON.parse(configString) as {
        dev: string;
        production: string;
      };

      // Get value based on current environment
      const currentEnv = ENV.APP_ENVIRONMENT;
      const isEnabled = parsedConfig[currentEnv] === 'true';

      logger.info(`RemoteConfig: Payment flow enabled for ${currentEnv}: ${isEnabled}`);

      return isEnabled;
    } catch (error) {
      logger.error('RemoteConfig: Error getting payment flow status', error);
      // Return safe default based on environment
      return ENV.APP_ENVIRONMENT === 'dev';
    }
  }

  /**
   * Get a string value from remote config
   */
  getString(key: string, defaultValue: string = ''): string {
    try {
      return remoteConfig().getValue(key).asString() || defaultValue;
    } catch (error) {
      logger.error(`RemoteConfig: Error getting string value for ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Get a boolean value from remote config
   */
  getBoolean(key: string, defaultValue: boolean = false): boolean {
    try {
      return remoteConfig().getValue(key).asBoolean();
    } catch (error) {
      logger.error(`RemoteConfig: Error getting boolean value for ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Get a number value from remote config
   */
  getNumber(key: string, defaultValue: number = 0): number {
    try {
      return remoteConfig().getValue(key).asNumber();
    } catch (error) {
      logger.error(`RemoteConfig: Error getting number value for ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Get a JSON object from remote config
   */
  getJSON<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const value = remoteConfig().getValue(key).asString();
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`RemoteConfig: Error getting JSON value for ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Get all config values
   */
  getAllValues(): Record<string, any> {
    try {
      const allValues = remoteConfig().getAll();
      const result: Record<string, any> = {};
      
      Object.keys(allValues).forEach((key) => {
        result[key] = allValues[key].asString();
      });
      
      return result;
    } catch (error) {
      logger.error('RemoteConfig: Error getting all values', error);
      return {};
    }
  }

  /**
   * Get last fetch time
   */
  getLastFetchTime(): Date {
    try {
      // @ts-ignore - lastFetchTime exists but may not be in types
      const lastFetchTime = remoteConfig().lastFetchTime ?? 0;
      return new Date(lastFetchTime);
    } catch (error) {
      logger.error('RemoteConfig: Error getting last fetch time', error);
      return new Date(0);
    }
  }

  /**
   * Get fetch status
   */
  getFetchStatus(): string {
    try {
      const status = remoteConfig().lastFetchStatus;
      return status;
    } catch (error) {
      logger.error('RemoteConfig: Error getting fetch status', error);
      return 'unknown';
    }
  }

  /**
   * Reset to default values (for testing)
   */
  async reset(): Promise<void> {
    try {
      await remoteConfig().setDefaults(this.defaultConfig);
      logger.info('RemoteConfig: Reset to defaults');
    } catch (error) {
      logger.error('RemoteConfig: Error resetting', error);
    }
  }
}

// Export singleton instance
export const remoteConfigService = new RemoteConfigService();
