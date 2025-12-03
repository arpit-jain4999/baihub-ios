// Checkout Screen - Payment and address selection

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Plan } from '../../types/home.types';
import { Address, Order } from '../../api/endpoints';
import { logger } from '../../utils/logger';
import { AddressBottomSheet } from '../../components/common/AddressBottomSheet';
import { homeApi } from '../../api/endpoints';
import RazorpayCheckout from 'react-native-razorpay';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Checkout'
>;

// Format price to Indian Rupees
const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function CheckoutScreen() {
  const route = useRoute<CheckoutRouteProp>();
  const navigation = useNavigation<CheckoutNavigationProp>();
  const insets = useSafeAreaInsets();
  const { areaId, categoryId, areaName, categoryName, serviceId, timeSlots, plan } = route.params;

  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const openRazorpayCheckout = useCallback(
    async (order: Order) => {
      if (!order.meta?.razorpayOrder) {
        logger.error('Razorpay order details missing');
        alert('Payment details not available. Please try again.');
        return;
      }

      const razorpayOrder = order.meta.razorpayOrder;

      // TODO: get these from your logged-in user profile
      const userName = 'Arpit Jain';
      const userEmail = 'arpit@example.com';
      const userPhone = '9999999999';

      const options: any = {
        description: `Payment for ${categoryName}`,
        currency: razorpayOrder.currency || 'INR',
        key: razorpayOrder.rzp_key,              // ✅ from backend
        amount: razorpayOrder.amount.toString(), // ✅ paise as string
        name: 'BaiHub',
        order_id: razorpayOrder.id,              // ✅ "order_xxx"
        prefill: {
          email: userEmail,
          contact: userPhone,
          name: userName,
        },
        theme: { color: '#f9cb00' },
      };

      logger.info('Razorpay options', JSON.stringify(options));
      logger.info('Razorpay order', JSON.stringify(razorpayOrder));
      logger.info('Order full', JSON.stringify(order));

      // Log analytics event - pay_now_clicked (when Razorpay checkout opens)
      try {
        logger.info('Logging pay_now_clicked event', {
          order_id: order.id,
          plan_id: plan.id,
          area_id: areaId,
        });
        await baihubAnalytics.logPayNowClicked({
          area_id: areaId,
          area_name: areaName,
          service_id: categoryId,
          service_name: categoryName,
          came_from: categoryId ? 'area_wise_listing' : 'service_wise_listing',
          plan_id: plan.id,
          plan_amount: plan.price.amount,
          plan_discount: plan.price.discount,
          plan_total: plan.price.total,
          plan_title: plan.title,
          plan_description: plan.description,
          selected_slots_ids: timeSlots.map(s => s.id),
          selected_slots_titles: timeSlots.map(s => s.displayText),
          order_total: razorpayOrder.amount / 100, // Convert from paise to rupees
          order_id: order.id,
          user_address: savedAddress ? `${savedAddress.addressLine1}, ${savedAddress.city}` : undefined,
        });
        logger.info('pay_now_clicked event logged successfully');
      } catch (error: any) {
        logger.error('Failed to log pay_now_clicked event', {
          error: error?.message || String(error),
          stack: error?.stack,
        });
      }

      try {
        const razorpayResponse = await RazorpayCheckout.open(options);
        logger.info('Razorpay payment success', razorpayResponse);

        navigation.navigate('AfterPayment', {
          orderId: order.id,
          paymentId: razorpayResponse.razorpay_payment_id,
        });
      } catch (error: any) {
        logger.error('Razorpay payment error', {
          raw: error,
          message: error?.message,
          description: error?.description,
          code: error?.code,
        });

        if (error?.code === 'NETWORK_ERROR') {
          alert('Network error. Please check your internet connection.');
        } else if (error?.code === 'INVALID_OPTIONS') {
          alert('Invalid payment options. Please contact support.');
        } else if (error?.description) {
          if (error.description !== 'User closed the checkout form') {
            alert(error.description || 'Payment failed. Please try again.');
          }
        } else if (error?.message) {
          alert(error.message);
        }
      }
    },
    [categoryName, navigation, areaId, areaName, categoryId, plan, timeSlots, savedAddress]
  );

  const processOrder = useCallback(async (address: Address) => {
    if (!address.id) {
      logger.error('Address ID is missing');
      alert('Address ID is missing. Please try again.');
      return;
    }

    try {
      setProcessingOrder(true);
      
      // Format today's date as YYYY-MM-DD for the slots
      const today = new Date();
      const slotDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Build time slots array from selected slots
      const orderTimeSlots = timeSlots.map((slot) => ({
        timeSlotId: slot.id, // Time slot ID from route params (now from backend)
        slotDate: slotDate, // Today's date (can be updated to allow date selection)
      }));
      
      // Build notes with all selected time slots
      const timeSlotsText = timeSlots.map(s => s.displayText).join(', ');
      
      const orderData = {
        planId: plan.id,
        addressId: address.id,
        categoryId: categoryId,
        areaId: areaId, // Include areaId from route params
        serviceId: serviceId, // Include serviceId if provided
        timeSlots: orderTimeSlots,
        slots: timeSlots.length, // Number of slots selected
        meta: {
          paymentMethod: 'card',
          notes: `Service: ${categoryName}, Area: ${areaName}, Time slots: ${timeSlotsText}`,
        },
      };

      const response = await homeApi.createOrder(orderData);
      if (response.data) {
        logger.info('Order created successfully', response.data);
        
        // Check if this is a free plan (no Razorpay order needed)
        if (response.data.status === 'SUCCESS' && !response.data.meta?.razorpayOrder) {
          // Free plan - navigate directly to success screen
          navigation.navigate('AfterPayment', {
            orderId: response.data.id,
            paymentId: undefined, // No payment for free plans
          });
        } else if (response.data.meta?.razorpayOrder) {
          // Paid plan - open Razorpay checkout
          await openRazorpayCheckout(response.data);
        } else {
          throw new Error('Order created but payment details not available');
        }
      } else {
        throw new Error('Order creation failed');
      }
    } catch (err: any) {
      logger.error('Failed to create order', err);
      // Show error to user
      alert(err.message || 'Failed to process order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  }, [plan.id, categoryId, categoryName, areaName, areaId, serviceId, timeSlots, openRazorpayCheckout, navigation]);

  const handleContinuePayment = useCallback(async () => {
    // Log analytics event - buy_now_clicked (when address popup opens)
    await baihubAnalytics.logBuyNowClicked({
      area_id: areaId,
      area_name: areaName,
      service_id: categoryId,
      service_name: categoryName,
      came_from: categoryId ? 'area_wise_listing' : 'service_wise_listing',
      plan_id: plan.id,
      plan_amount: plan.price.amount,
      plan_discount: plan.price.discount,
      plan_total: plan.price.total,
      plan_title: plan.title,
      plan_description: plan.description,
      selected_slots_ids: timeSlots.map(s => s.id),
      selected_slots_titles: timeSlots.map(s => s.displayText),
    });
    
    if (savedAddress) {
      // Address already saved, process order directly
      processOrder(savedAddress);
    } else {
      // Show address sheet first
      setShowAddressSheet(true);
    }
  }, [savedAddress, processOrder, areaId, areaName, categoryId, categoryName, plan, timeSlots]);

  const handleAddressSuccess = useCallback(
    async (address: Address) => {
      setSavedAddress(address);
      logger.info('Address saved, processing order', { address });
      // Process order after address is saved
      processOrder(address);
    },
    [processOrder]
  );

  const handleCloseAddressSheet = useCallback(() => {
    setShowAddressSheet(false);
  }, []);

  // Calculate price breakdown
  const originalPrice = plan.price.amount;
  const discount = plan.price.discount;
  const total = plan.price.total;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Checkout
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Selected */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Service
          </Text>
          <View style={styles.infoCard}>
            <Text variant="bodyLarge" style={styles.infoText}>
              {categoryName || 'Service'}
            </Text>
            <Text variant="bodyMedium" style={styles.infoSubtext}>
              {areaName} • {timeSlots.length === 1 ? timeSlots[0].displayText : `${timeSlots.length} slots`}
            </Text>
          </View>
        </View>

        {/* Plan Selected */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Plan
          </Text>
          <View style={styles.infoCard}>
            <Text variant="bodyLarge" style={styles.infoText}>
              {plan.title}
            </Text>
            {plan.description && (
              <Text variant="bodyMedium" style={styles.infoSubtext}>
                {plan.description}
              </Text>
            )}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Price Breakdown
          </Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text variant="bodyLarge" style={styles.priceLabel}>
                Price
              </Text>
              <Text variant="bodyLarge" style={styles.priceValue}>
                {formatPrice(originalPrice)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.priceRow}>
                <Text variant="bodyMedium" style={styles.priceLabel}>
                  Discount
                </Text>
                <Text variant="bodyMedium" style={styles.discountValue}>
                  -{formatPrice(discount)}
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total
              </Text>
              <Text variant="titleLarge" style={styles.totalValue}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Address Section */}
        {savedAddress && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Delivery Address
            </Text>
            <View style={styles.infoCard}>
              <Text variant="bodyMedium" style={styles.addressText}>
                {savedAddress.addressLine1}
                {savedAddress.addressLine2 && `, ${savedAddress.addressLine2}`}
              </Text>
              <Text variant="bodyMedium" style={styles.addressText}>
                {savedAddress.landmark}
              </Text>
              <Text variant="bodyMedium" style={styles.addressText}>
                {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Continue Payment Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          mode="contained"
          onPress={handleContinuePayment}
          loading={processingOrder}
          disabled={processingOrder}
          style={styles.continueButton}
          contentStyle={styles.continueButtonContent}
          labelStyle={styles.continueButtonLabel}
        >
          {processingOrder ? 'Processing...' : 'Continue Payment'}
        </Button>
      </View>

      {/* Address Bottom Sheet */}
      <AddressBottomSheet
        visible={showAddressSheet}
        onClose={handleCloseAddressSheet}
        onSuccess={handleAddressSuccess}
        areaId={areaId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for sticky button
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  infoText: {
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  infoSubtext: {
    color: '#666666',
  },
  priceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 0,
  },
  priceLabel: {
    color: '#666666',
  },
  priceValue: {
    color: '#000000',
    fontWeight: '500',
  },
  discountValue: {
    color: '#4caf50',
    fontWeight: '500',
  },
  totalLabel: {
    color: '#000000',
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#000000',
    fontWeight: 'bold',
  },
  addressText: {
    color: '#000000',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueButton: {
    backgroundColor: '#f9cb00',
    borderRadius: 8,
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
  continueButtonLabel: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


