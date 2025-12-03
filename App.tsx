// Main App component with providers

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { lightTheme } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { remoteConfigService } from './src/services/remoteConfig.service';
import { analyticsService } from './src/services/analytics.service';
import { logger } from './src/utils/logger';

export default function App() {
  useEffect(() => {
    // Initialize services on app startup
    const initializeServices = async () => {
      try {
        // Initialize Analytics first
        await analyticsService.initialize();
        
        // Initialize and fetch Remote Config
        await remoteConfigService.initialize();
        await remoteConfigService.fetchAndActivate();
        logger.info('App: Services initialized successfully');
      } catch (error) {
        logger.error('App: Failed to initialize services', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={lightTheme}>
          <RootNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
