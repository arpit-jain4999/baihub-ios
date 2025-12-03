// Plans Selection Screen - Shows available plans for booking

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { homeApi } from '../../api/endpoints';
import { Plan } from '../../types/home.types';
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

type PlansSelectionRouteProp = RouteProp<RootStackParamList, 'PlansSelection'>;
type PlansSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlansSelection'
>;

// Format price to Indian Rupees
const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function PlansSelectionScreen() {
  const route = useRoute<PlansSelectionRouteProp>();
  const navigation = useNavigation<PlansSelectionNavigationProp>();
  const insets = useSafeAreaInsets();
  const { areaId, categoryId, areaName, categoryName, serviceId, timeSlots } = route.params;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homeApi.getPlans({ includeInactive: false });
      if (response.data) {
        setPlans(response.data);
      }
    } catch (err: any) {
      logger.error('Failed to fetch plans', err);
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePlanSelect = useCallback(async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      // Log analytics event
      await baihubAnalytics.logPlanCardClicked({
        area_id: areaId,
        area_name: areaName,
        service_id: categoryId,
        service_name: categoryName,
        came_from: categoryId ? 'area_wise_listing' : 'service_wise_listing',
        plan_id: planId,
        plan_amount: plan.price.amount,
        plan_discount: plan.price.discount,
        plan_total: plan.price.total,
        plan_title: plan.title,
        plan_description: plan.description,
      });
    }
    setSelectedPlan(planId);
  }, [plans, areaId, areaName, categoryId, categoryName]);

  const handleContinue = useCallback(async () => {
    if (!selectedPlan) {
      // Show error or toast
      return;
    }
    const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);
    if (selectedPlanData) {
      // Log analytics event
      await baihubAnalytics.logPlanContinueClicked({
        area_id: areaId,
        area_name: areaName,
        service_id: categoryId,
        service_name: categoryName,
        came_from: categoryId ? 'area_wise_listing' : 'service_wise_listing',
        plan_id: selectedPlan,
        plan_amount: selectedPlanData.price.amount,
        plan_discount: selectedPlanData.price.discount,
        plan_total: selectedPlanData.price.total,
        plan_title: selectedPlanData.title,
        plan_description: selectedPlanData.description,
        selected_slots_ids: timeSlots.map(s => s.id),
        selected_slots_titles: timeSlots.map(s => s.displayText),
      });
      
      logger.info('Plan selected', {
        planId: selectedPlan,
        areaId,
        categoryId,
        timeSlots,
        plan: selectedPlanData,
      });
      // Navigate to checkout screen
      navigation.navigate('Checkout', {
        areaId,
        categoryId,
        areaName,
        categoryName,
        serviceId,
        timeSlots,
        plan: selectedPlanData,
      });
    }
  }, [selectedPlan, plans, areaId, categoryId, areaName, categoryName, serviceId, timeSlots, navigation]);

  const handleRetry = useCallback(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Build summary text: "Service name • Area • Time slots"
  const timeSlotsText = timeSlots.length > 0 
    ? timeSlots.length === 1 
      ? timeSlots[0].displayText 
      : `${timeSlots.length} slots selected`
    : 'Time slots';
  const summaryText = [
    categoryName || 'Service',
    areaName || 'Area',
    timeSlotsText,
  ]
    .filter(Boolean)
    .join(' • ');

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Choose a plan
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f9cb00" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Choose a plan
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button
            mode="contained"
            onPress={handleRetry}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

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
          Choose a plan
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Summary: Service • Area • Time slot */}
      <Text variant="bodySmall" style={styles.summary}>
        {summaryText}
      </Text>

      {/* Scrollable Plans List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
              ]}
              onPress={() => handlePlanSelect(plan.id)}
              activeOpacity={0.7}
            >
              <View style={styles.planContent}>
                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text variant="titleLarge" style={styles.planName}>
                      {plan.title}
                    </Text>
                    {plan.description && (
                      <Text variant="bodyMedium" style={styles.planDetails}>
                        {plan.description}
                      </Text>
                    )}
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <View style={styles.checkmarkCircle}>
                        <Icon name="check" size={20} color="#ffffff" />
                      </View>
                    </View>
                  )}
                </View>

                {/* Plan Price */}
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Text variant="titleMedium" style={styles.price}>
                      {formatPrice(plan.price.total)}
                    </Text>
                    {plan.price.discount > 0 && (
                      <Text variant="bodySmall" style={styles.originalPrice}>
                        {formatPrice(plan.price.amount)}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={styles.duration}>
                      / month
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {plans.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="package-variant" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No plans available
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedPlan}
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueButtonDisabled,
          ]}
          contentStyle={styles.continueButtonContent}
          labelStyle={styles.continueButtonLabel}
        >
          Continue to checkout
        </Button>
      </View>
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
  summary: {
    color: '#666666',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for sticky button
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 3,
  },
  planCardSelected: {
    borderColor: '#f9cb00',
    borderWidth: 2,
    backgroundColor: '#fffef5',
    // Enhanced shadow when selected
    shadowOpacity: 0.15,
    elevation: 4,
  },
  planContent: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  planDetails: {
    color: '#666666',
    marginBottom: 2,
  },
  planFeatures: {
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  checkmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  originalPrice: {
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  duration: {
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#999999',
    marginTop: 16,
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
  continueButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
  continueButtonLabel: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#b00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#f9cb00',
  },
});

