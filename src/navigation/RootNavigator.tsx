// Root navigation setup

import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store';
import { analyticsService } from '../services/analytics.service';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AreaSelectionScreen from '../screens/main/AreaSelectionScreen';
import ServicesListingScreen from '../screens/main/ServicesListingScreen';
import TimeSlotSelectionScreen from '../screens/main/TimeSlotSelectionScreen';
import PlansSelectionScreen from '../screens/main/PlansSelectionScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import AfterPaymentScreen from '../screens/main/AfterPaymentScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isNewUser, initialize } = useAuthStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const routeNameRef = useRef<string>();

  useEffect(() => {
    initialize();
    // Log app open when app starts - wait a bit for Firebase to initialize
    // This is called after App.tsx initializes analytics, but add a small delay to be safe
    const timer = setTimeout(() => {
      analyticsService.logAppOpen().catch(() => {
        // Silently fail - analytics errors shouldn't break the app
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [initialize]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName && currentRouteName) {
          // Track screen view in Firebase Analytics
          try {
            await analyticsService.logScreenView(currentRouteName);
          } catch (error) {
            // Silently fail - analytics errors shouldn't break the app
            console.warn('Failed to log screen view:', error);
          }
        }

        // Save the current route name for next time
        routeNameRef.current = currentRouteName;
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && !isNewUser ? (
          <>
          <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="AreaSelection"
              component={AreaSelectionScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="ServicesListing"
              component={ServicesListingScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="TimeSlotSelection"
              component={TimeSlotSelectionScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="PlansSelection"
              component={PlansSelectionScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="AfterPayment"
              component={AfterPaymentScreen}
              options={{ presentation: 'card', headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

