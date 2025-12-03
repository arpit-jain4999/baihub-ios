// Navigation type definitions

import type { NavigatorScreenParams } from '@react-navigation/native';
import { Plan } from '../types/home.types';

export type AuthStackParamList = {
  OnboardingSplash: undefined;
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  UserDetails: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Profile: undefined;
  Settings: undefined;
  Orders: undefined;
  AreaSelection: { categoryId?: string; categoryName?: string; serviceId?: string };
  ServicesListing: { areaId: string; categoryId: string; areaName?: string; categoryName?: string; serviceId?: string };
  TimeSlotSelection: { areaId: string; categoryId: string; areaName?: string; categoryName?: string; serviceId?: string };
  PlansSelection: { areaId: string; categoryId: string; areaName?: string; categoryName?: string; serviceId?: string; timeSlots: Array<{ id: string; displayText: string; startTime: string; endTime: string }> };
  Checkout: { areaId: string; categoryId: string; areaName?: string; categoryName?: string; serviceId?: string; timeSlots: Array<{ id: string; displayText: string; startTime: string; endTime: string }>; plan: Plan };
  AfterPayment: { orderId: string; paymentId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

