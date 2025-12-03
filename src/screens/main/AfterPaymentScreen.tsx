// After Payment Screen - Shows order confirmation

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { homeApi, Order } from '../../api/endpoints';
import { logger } from '../../utils/logger';
import { baihubAnalytics } from '../../services/baihub-analytics.service';
import { useRef } from 'react';

type AfterPaymentRouteProp = RouteProp<RootStackParamList, 'AfterPayment'>;
type AfterPaymentNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AfterPayment'>;

// Format price to Indian Rupees
const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function AfterPaymentScreen() {
  const route = useRoute<AfterPaymentRouteProp>();
  const navigation = useNavigation<AfterPaymentNavigationProp>();
  const insets = useSafeAreaInsets();
  const { orderId, paymentId } = route.params;

  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLoggedThankYouVisit = useRef(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Log thank_you_screen_visit when order is loaded
  useEffect(() => {
    if (order && !hasLoggedThankYouVisit.current) {
      hasLoggedThankYouVisit.current = true;
      baihubAnalytics.logThankYouScreenVisit({
        order_id: order.id,
        order_status: order.status,
        order_amount: order.meta?.razorpayOrder?.amount ? order.meta.razorpayOrder.amount / 100 : 0,
        payment_id: paymentId || order.razorpayPaymentId || '',
      });
    }
  }, [order, paymentId]);

  const fetchOrderDetails = async (verify: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      // Only verify on initial load if order is pending (to avoid unnecessary API calls)
      const response = await homeApi.getOrder(orderId, verify);
      if (response.data) {
        setOrder(response.data);
        logger.info('Order details fetched', response.data);
      }
    } catch (err: any) {
      logger.error('Failed to fetch order details', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true);
      setError(null);
      
      // Log analytics event - fetch_order_status_clicked
      await baihubAnalytics.logFetchOrderStatusClicked({
        order_id: orderId,
        order_status: order?.status || '',
      });
      
      // Pass verify=true query parameter to trigger Razorpay verification
      const response = await homeApi.getOrder(orderId, true);
      if (response.data) {
        setOrder(response.data);
        logger.info('Order status checked', response.data);
        
        // Log analytics event - order_status_fetched
        await baihubAnalytics.logOrderStatusFetched({
          order_id: orderId,
          order_status: response.data.status,
          order_amount: response.data.meta?.razorpayOrder?.amount ? response.data.meta.razorpayOrder.amount / 100 : 0,
          payment_id: response.data.razorpayPaymentId || '',
        });
        
        // Show success message if status changed to SUCCESS
        if (response.data.status === 'SUCCESS') {
          // Status will automatically update the UI
        }
      }
    } catch (err: any) {
      logger.error('Failed to check order status', err);
      alert(err.message || 'Failed to check order status. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleBackToHome = async () => {
    // Log analytics event - back_to_home_screen_clicked
    await baihubAnalytics.logBackToHomeScreenClicked({
      order_id: orderId,
      order_status: order?.status || '',
      
    });
    
    // Navigate to home screen (assumes 'Main' is the home tab navigator)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleContactUs = async () => {
    const whatsappUrl = 'https://api.whatsapp.com/send/?phone=919810468163&text=Hello+need+to+enquire+about+the+services.&type=phone_number&app_absent=0';
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        logger.error('WhatsApp URL not supported');
        alert('Unable to open WhatsApp. Please contact us at +91 9810468163');
      }
    } catch (err) {
      logger.error('Failed to open WhatsApp', err);
      alert('Unable to open WhatsApp. Please contact us at +91 9810468163');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f9cb00" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.content}>
          <Text variant="titleLarge" style={styles.errorText}>
            Unable to load order details
          </Text>
          <Button
            mode="contained"
            onPress={handleBackToHome}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Back to Home
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isSuccess = order.status === 'SUCCESS' || order.status === 'COMPLETED';
  const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED';
  
  // Check if this is a free order (no payment required)
  // Free orders have: amount = 0/null, OR isFreePlan flag, OR no razorpayOrderId (and status is SUCCESS)
  // Check if this is a free order (no payment required)
  // Free orders have: amount = 0/null, OR meta.isFreePlan flag, OR no razorpayOrderId (and SUCCESS)
  const isFreeOrder =
    (order.amount === 0 || order.amount === null) ||
    (typeof order.meta === 'object' && !!(order.meta as any).isFreePlan) ||
    (!order.razorpayOrderId && order.status === 'SUCCESS');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 24) }]}>
        {/* Success Screen */}
        {isSuccess && (
          <>
            <Image
              source={require('../../../assets/payment-success.jpeg')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text variant="displaySmall" style={styles.successTitle}>
              {isFreeOrder ? 'Order Successful!' : 'Payment Successful!'}
            </Text>
            
            {/* Amount Paid - Only show for paid orders */}
            {!isFreeOrder && order.meta?.razorpayOrder?.amount && (
              <View style={styles.amountContainer}>
                <Text variant="bodyLarge" style={styles.amountLabel}>
                  Amount Paid
                </Text>
                <Text variant="headlineLarge" style={styles.amountValue}>
                  {formatPrice(order.meta.razorpayOrder.amount / 100)}
                </Text>
              </View>
            )}

            {/* Show Order ID for free orders, Payment ID for paid orders */}
            {isFreeOrder && order.id && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Order ID:
                </Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {order.id}
                </Text>
              </View>
            )}

            {!isFreeOrder && (paymentId || order.razorpayPaymentId) && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Payment ID:
                </Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {paymentId || order.razorpayPaymentId}
                </Text>
              </View>
            )}

            <Text variant="bodyLarge" style={styles.confirmationText}>
              Thank you. You will receive a confirmation shortly.
            </Text>

            <Button
              mode="contained"
              onPress={handleBackToHome}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Back to Home
            </Button>
          </>
        )}

        {/* Failed Screen */}
        {isFailed && (
          <>
            <Image
              source={require('../../../assets/payment-failed.jpeg')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text variant="displaySmall" style={styles.failedTitle}>
              {isFreeOrder ? 'Order Failed' : 'Payment Failed'}
            </Text>
            
            <Text variant="bodyLarge" style={styles.failedText}>
              {isFreeOrder 
                ? "We're sorry, your order could not be processed. Please try again or contact our support team for assistance."
                : "We're sorry, your payment could not be processed. Please try again or contact our support team for assistance."}
            </Text>

            <Button
              mode="contained"
              onPress={handleContactUs}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="whatsapp"
            >
              Contact Us
            </Button>

            <Button
              mode="outlined"
              onPress={handleBackToHome}
              style={[styles.button, styles.secondaryButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.secondaryButtonLabel}
            >
              Back to Home
            </Button>
          </>
        )}

        {/* Processing/Other Status Screen */}
        {!isSuccess && !isFailed && (
          <>
            <Image
              source={require('../../../assets/payment-success.jpeg')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text variant="displaySmall" style={styles.pendingTitle}>
              Payment Processing
            </Text>
            
            <Text variant="bodyLarge" style={styles.pendingText}>
              Your payment is being processed. This usually takes a few moments.
            </Text>

            {orderId && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Order ID:
                </Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {orderId}
                </Text>
              </View>
            )}

            {order.razorpayOrderId && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Payment ID:
                </Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {order.razorpayOrderId}
                </Text>
              </View>
            )}

            <Text variant="bodyMedium" style={styles.statusHint}>
              Status: {order.status}
            </Text>

            <Button
              mode="contained"
              onPress={handleCheckStatus}
              disabled={checkingStatus}
              loading={checkingStatus}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon={checkingStatus ? undefined : () => <Icon name="refresh" size={20} color="#000" />}
            >
              {checkingStatus ? 'Checking...' : 'Check Status'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleBackToHome}
              style={[styles.button, styles.secondaryButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.secondaryButtonLabel}
            >
              Back to Home
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 32,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 24,
  },
  failedTitle: {
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  pendingTitle: {
    fontWeight: 'bold',
    color: '#ff9800',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  pendingText: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  statusHint: {
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
  },
  amountLabel: {
    color: '#666666',
    marginBottom: 8,
  },
  amountValue: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  detailLabel: {
    color: '#666666',
    marginRight: 8,
  },
  detailValue: {
    color: '#000000',
    fontWeight: '600',
  },
  confirmationText: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  failedText: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#f9cb00',
    borderRadius: 8,
    width: '100%',
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#f9cb00',
    borderWidth: 2,
  },
  secondaryButtonLabel: {
    color: '#f9cb00',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


