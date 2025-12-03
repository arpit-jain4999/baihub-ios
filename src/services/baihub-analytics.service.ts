import { analyticsService } from './analytics.service';
import { useAuthStore } from '../store';
import { logger } from '../utils/logger';

/**
 * BaiHub Analytics Service
 * Centralized service for logging all BaiHub-specific analytics events
 * Based on baihub-events-v1.csv specification
 */

interface UserContext {
  user_id?: string;
  phone_number?: string;
}

/**
 * Helper function to get current user context
 */
const getUserContext = (): UserContext => {
  const { user } = useAuthStore.getState();
  return {
    user_id: user?.id,
    phone_number: user?.phoneNumber,
  };
};

/**
 * Helper function to clean parameters for Firebase Analytics
 * Removes undefined/null values and ensures proper types
 */
const cleanParams = (params: { [key: string]: any }): { [key: string]: string | number | boolean } => {
  const cleaned: { [key: string]: string | number | boolean } = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }
    
    // Convert arrays to comma-separated strings
    if (Array.isArray(value)) {
      cleaned[key] = value.join(',');
    }
    // Keep strings, numbers, and booleans as-is
    else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    }
    // Convert other types to strings
    else {
      cleaned[key] = String(value);
    }
  }
  
  return cleaned;
};

class BaiHubAnalyticsService {
  /**
   * Log event: get_started_clicked
   * Trigger: Splash screen
   */
  async logGetStartedClicked(): Promise<void> {
    await analyticsService.logEvent('get_started_clicked', {});
  }

  /**
   * Log event: otp_requested
   * Trigger: Login screen
   * Properties: phone_number, user_type (old/new), screen (login)
   */
  async logOtpRequested(params: {
    phone_number: string;
    user_type: 'old' | 'new';
    screen?: string;
  }): Promise<void> {
    await analyticsService.logEvent('otp_requested', cleanParams({
      phone_number: params.phone_number,
      user_type: params.user_type,
      screen: params.screen || 'login',
    }));
  }

  /**
   * Log event: verify_otp_clicked
   * Trigger: Otp screen
   * Properties: phone_number, user_type, screen (otp_screen)
   */
  async logVerifyOtpClicked(params: {
    phone_number: string;
    user_type?: 'old' | 'new';
    screen?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('verify_otp_clicked', cleanParams({
      phone_number: params.phone_number || context.phone_number,
      user_type: params.user_type,
      screen: params.screen || 'otp_screen',
    }));
  }

  /**
   * Log event: resend_otp_clicked
   * Trigger: Otp screen
   * Properties: phone_number, user_type, screen (otp_screen)
   */
  async logResendOtpClicked(params: {
    phone_number: string;
    user_type?: 'old' | 'new';
    screen?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('resend_otp_clicked', cleanParams({
      phone_number: params.phone_number || context.phone_number,
      user_type: params.user_type,
      screen: params.screen || 'otp_screen',
    }));
  }

  /**
   * Log event: onboarding_details_filled
   * Trigger: Onboarding form
   * Properties: phone_number, screen (otp_screen), user_location
   */
  async logOnboardingDetailsFilled(params: {
    phone_number: string;
    screen?: string;
    user_location?: string;
  }): Promise<void> {
    await analyticsService.logEvent('onboarding_details_filled', cleanParams({
      phone_number: params.phone_number,
      screen: params.screen || 'otp_screen',
      user_location: params.user_location,
    }));
  }

  /**
   * Log event: home_page_visited
   * Trigger: When user visits home page for the first time
   * Properties: user_id, phone_number
   */
  async logHomePageVisited(): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('home_page_visited', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
    }));
  }

  /**
   * Log event: hero_banner_clicked
   * Trigger: When user clicks on hero banner of home page
   * Properties: user_id, phone_number, banner_url, banner_title
   */
  async logHeroBannerClicked(params: {
    banner_url?: string;
    banner_title?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('hero_banner_clicked', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      banner_url: params.banner_url,
      banner_title: params.banner_title,
    }));
  }

  /**
   * Log event: service_card_clicked
   * Trigger: When user clicks on service cards on area wise service listing page
   * Properties: user_id, service_id, service_name, screen (home/area_wise_listing), area_name, area_id, phone_number
   */
  async logServiceCardClicked(params: {
    service_id: string;
    service_name: string;
    screen?: 'home' | 'area_wise_listing';
    area_name?: string;
    area_id?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('service_card_clicked', cleanParams({
      user_id: context.user_id,
      service_id: params.service_id,
      service_name: params.service_name,
      screen: params.screen || 'home',
      area_name: params.area_name,
      area_id: params.area_id,
      phone_number: context.phone_number,
    }));
  }

  /**
   * Log event: service_selected
   * Trigger: When user clicks on service card either on home screen or continue button on area wise service listing Screen
   * Properties: user_id, service_id, service_name, screen (home/area_wise_listing), area_name, area_id, phone_number
   */
  async logServiceSelected(params: {
    service_id: string;
    service_name: string;
    screen?: 'home' | 'area_wise_listing';
    area_name?: string;
    area_id?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('service_selected', cleanParams({
      user_id: context.user_id,
      service_id: params.service_id,
      service_name: params.service_name,
      screen: params.screen || 'home',
      area_name: params.area_name,
      area_id: params.area_id,
      phone_number: context.phone_number,
    }));
  }

  /**
   * Log event: area_card_clicked
   * Trigger: When user clicks on area cards on service wise area listing page
   * Properties: user_id, phone_number, area_id, area_name, screen (home/service_wise_listing), service_id, service_name
   */
  async logAreaCardClicked(params: {
    area_id: string;
    area_name: string;
    screen?: 'home' | 'service_wise_listing';
    service_id?: string;
    service_name?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('area_card_clicked', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      area_id: params.area_id,
      area_name: params.area_name,
      screen: params.screen || 'home',
      service_id: params.service_id,
      service_name: params.service_name,
    }));
  }

  /**
   * Log event: area_selected
   * Trigger: When user clicks on area card either on home screen or continue button on service wise area listing screen
   * Properties: user_id, area_id, area_name, screen (home/service_wise_listing), service_id, service_name, phone_number
   */
  async logAreaSelected(params: {
    area_id: string;
    area_name: string;
    screen?: 'home' | 'service_wise_listing';
    service_id?: string;
    service_name?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('area_selected', cleanParams({
      user_id: context.user_id,
      area_id: params.area_id,
      area_name: params.area_name,
      screen: params.screen || 'home',
      service_id: params.service_id,
      service_name: params.service_name,
      phone_number: context.phone_number,
    }));
  }

  /**
   * Log event: area_searched
   * Trigger: When user searches any area from the service wise area listing screen
   * Properties: user_id, area_searched, user_location, areas_available, phone_number
   */
  async logAreaSearched(params: {
    area_searched: string;
    user_location?: string;
    areas_available?: number;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('area_searched', cleanParams({
      user_id: context.user_id,
      area_searched: params.area_searched,
      user_location: params.user_location,
      areas_available: params.areas_available,
      phone_number: context.phone_number,
    }));
  }

  /**
   * Log event: slot_clicked
   * Trigger: When user clicks on slot
   * Properties: user_id, phone_number, slot_start_time, slot_title, slot_end_time, slot_id, slot_selected (true/false)
   */
  async logSlotClicked(params: {
    selected_service_id?: string;
    selected_service_name?: string;
    selected_area_id?: string;
    selected_area_name?: string;
    slot_start_time: string;
    slot_title: string;
    slot_end_time: string;
    slot_id: string;
    slot_selected: boolean;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('slot_clicked', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      slot_start_time: params.slot_start_time,
      slot_title: params.slot_title,
      slot_end_time: params.slot_end_time,
      slot_id: params.slot_id,
      slot_selected: params.slot_selected,
      selected_service_id: params.selected_service_id,
      selected_service_name: params.selected_service_name,
      selected_area_id: params.selected_area_id,
      selected_area_name: params.selected_area_name,
    }));
  }

  /**
   * Log event: slot_continue_clicked
   * Trigger: When user clicks continue on slot selection
   * Properties: user_id, phone_number, selected_slots_title, selected_slots_id, total_selected_slots
   */
  async logSlotContinueClicked(params: {
    selected_slots_title: string[];
    selected_slots_id: string[];
    total_selected_slots: number;
    selected_service_id?: string;
    selected_service_name?: string;
    selected_area_id?: string;
    selected_area_name?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('slot_continue_clicked', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      selected_slots_title: params.selected_slots_title.join(','),
      selected_slots_id: params.selected_slots_id.join(','),
      total_selected_slots: params.total_selected_slots,
      selected_service_id: params.selected_service_id,
      selected_service_name: params.selected_service_name,
      selected_area_id: params.selected_area_id,
      selected_area_name: params.selected_area_name,
    }));
  }

  /**
   * Log event: plan_card_clicked
   * Trigger: When user clicks on plan card
   * Properties: user_id, area_id, area_name, service_id, service_name, came_from, plan_id, plan_amount, plan_discount, plan_total, plan_title, plan_description
   */
  async logPlanCardClicked(params: {
    area_id?: string;
    area_name?: string;
    service_id?: string;
    service_name?: string;
    came_from?: 'area_wise_listing' | 'service_wise_listing';
    plan_id: string;
    plan_amount: number;
    plan_discount?: number;
    plan_total: number;
    plan_title: string;
    plan_description?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('plan_card_clicked', cleanParams({
      user_id: context.user_id,
      area_id: params.area_id,
      area_name: params.area_name,
      service_id: params.service_id,
      service_name: params.service_name,
      came_from: params.came_from,
      plan_id: params.plan_id,
      plan_amount: params.plan_amount,
      plan_discount: params.plan_discount,
      plan_total: params.plan_total,
      plan_title: params.plan_title,
      plan_description: params.plan_description,
    }));
  }

  /**
   * Log event: plan_continue_clicked
   * Trigger: When user clicks continue on plan selection
   * Properties: user_id, area_id, area_name, service_id, service_name, came_from, plan_id, plan_amount, plan_discount, plan_total, plan_title, plan_description, selected_slots_ids, selected_slots_titles
   */
  async logPlanContinueClicked(params: {
    area_id?: string;
    area_name?: string;
    service_id?: string;
    service_name?: string;
    came_from?: 'area_wise_listing' | 'service_wise_listing';
    plan_id: string;
    plan_amount: number;
    plan_discount?: number;
    plan_total: number;
    plan_title: string;
    plan_description?: string;
    selected_slots_ids: string[];
    selected_slots_titles: string[];
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('plan_continue_clicked', cleanParams({
      user_id: context.user_id,
      area_id: params.area_id,
      area_name: params.area_name,
      service_id: params.service_id,
      service_name: params.service_name,
      came_from: params.came_from,
      plan_id: params.plan_id,
      plan_amount: params.plan_amount,
      plan_discount: params.plan_discount,
      plan_total: params.plan_total,
      plan_title: params.plan_title,
      plan_description: params.plan_description,
      selected_slots_ids: params.selected_slots_ids.join(','),
      selected_slots_titles: params.selected_slots_titles.join(','),
    }));
  }

  /**
   * Log event: buy_now_clicked
   * Trigger: When user clicks on continue on checkout screen and address pop up opens
   * Properties: user_id, area_id, area_name, service_id, service_name, came_from, plan_id, plan_amount, plan_discount, plan_total, plan_title, plan_description, selected_slots_ids, selected_slots_titles
   */
  async logBuyNowClicked(params: {
    area_id?: string;
    area_name?: string;
    service_id?: string;
    service_name?: string;
    came_from?: 'area_wise_listing' | 'service_wise_listing';
    plan_id: string;
    plan_amount: number;
    plan_discount?: number;
    plan_total: number;
    plan_title: string;
    plan_description?: string;
    selected_slots_ids: string[];
    selected_slots_titles: string[];
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('buy_now_clicked', cleanParams({
      user_id: context.user_id,
      area_id: params.area_id,
      area_name: params.area_name,
      service_id: params.service_id,
      service_name: params.service_name,
      came_from: params.came_from,
      plan_id: params.plan_id,
      plan_amount: params.plan_amount,
      plan_discount: params.plan_discount,
      plan_total: params.plan_total,
      plan_title: params.plan_title,
      plan_description: params.plan_description,
      selected_slots_ids: params.selected_slots_ids.join(','),
      selected_slots_titles: params.selected_slots_titles.join(','),
    }));
  }

  /**
   * Log event: pay_now_clicked
   * Trigger: When user clicks on continue button from address pop up (when Razorpay checkout opens)
   * Properties: user_id, area_id, area_name, service_id, service_name, came_from, plan_id, plan_amount, plan_discount, plan_total, plan_title, plan_description, selected_slots_ids, selected_slots_titles, order_total, order_id, user_address
   */
  async logPayNowClicked(params: {
    area_id?: string;
    area_name?: string;
    service_id?: string;
    service_name?: string;
    came_from?: 'area_wise_listing' | 'service_wise_listing';
    plan_id: string;
    plan_amount: number;
    plan_discount?: number;
    plan_total: number;
    plan_title: string;
    plan_description?: string;
    selected_slots_ids: string[];
    selected_slots_titles: string[];
    order_total: number;
    order_id: string;
    user_address?: string;
  }): Promise<void> {
    try {
      const context = getUserContext();
      const eventParams = cleanParams({
        user_id: context.user_id,
        area_id: params.area_id,
        area_name: params.area_name,
        service_id: params.service_id,
        service_name: params.service_name,
        came_from: params.came_from,
        plan_id: params.plan_id,
        plan_amount: params.plan_amount,
        plan_discount: params.plan_discount,
        plan_total: params.plan_total,
        plan_title: params.plan_title,
        plan_description: params.plan_description,
        selected_slots_ids: params.selected_slots_ids.join(','),
        selected_slots_titles: params.selected_slots_titles.join(','),
        order_total: params.order_total,
        order_id: params.order_id,
        user_address: params.user_address,
      });
      
      await analyticsService.logEvent('pay_now_clicked', eventParams);
      logger.info('BaiHub Analytics: pay_now_clicked event logged successfully', {
        order_id: params.order_id,
        plan_id: params.plan_id,
      });
    } catch (error: any) {
      logger.error('BaiHub Analytics: Failed to log pay_now_clicked event', {
        error: error?.message || String(error),
        stack: error?.stack,
        params: {
          order_id: params.order_id,
          plan_id: params.plan_id,
        },
      });
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Log event: thank_you_screen_visit
   * Trigger: When user lands on after payment screen post successful order
   * Properties: user_id, phone_number, order_id, order_status, order_amount, payment_id
   */
  async logThankYouScreenVisit(params: {
    order_id: string;
    order_status: string;
    order_amount: number;
    payment_id?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('thank_you_screen_visit', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      order_id: params.order_id,
      order_status: params.order_status,
      order_amount: params.order_amount,
      payment_id: params.payment_id,
    }));
  }

  /**
   * Log event: fetch_order_status_clicked
   * Trigger: When user clicks on fetch order status button in case of pending order state
   * Properties: user_id, phone_number, order_id, order_status
   */
  async logFetchOrderStatusClicked(params: {
    order_id: string;
    order_status: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('fetch_order_status_clicked', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      order_id: params.order_id,
      order_status: params.order_status,
    }));
  }

  /**
   * Log event: order_status_fetched
   * Trigger: When API gives response in case when user forcefully fetches the order status on after payment page
   * Properties: user_id, phone_number, order_id, order_status, order_amount, payment_id
   */
  async logOrderStatusFetched(params: {
    order_id: string;
    order_status: string;
    order_amount?: number;
    payment_id?: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('order_status_fetched', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      order_id: params.order_id,
      order_status: params.order_status,
      order_amount: params.order_amount,
      payment_id: params.payment_id,
    }));
  }

  /**
   * Log event: back_to_home_screen_clicked
   * Trigger: Back to home clicked on after payment screen
   * Properties: user_id, phone_number, order_id, order_status
   */
  async logBackToHomeScreenClicked(params: {
    order_id: string;
    order_status: string;
  }): Promise<void> {
    const context = getUserContext();
    await analyticsService.logEvent('back_to_home_screen_clicked', cleanParams({
      user_id: context.user_id,
      phone_number: context.phone_number,
      order_id: params.order_id,
      order_status: params.order_status,
    }));
  }
}

// Export singleton instance
export const baihubAnalytics = new BaiHubAnalyticsService();

