// Services Listing Screen - Shows services/categories for a selected area

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { homeApi } from '../../api/endpoints';
import { Category } from '../../types/home.types';
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

type ServicesListingRouteProp = RouteProp<RootStackParamList, 'ServicesListing'>;
type ServicesListingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ServicesListing'
>;

// Icon mapping for different service types
const getServiceIcon = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('maid') || name.includes('cleaning')) {
    return 'broom';
  }
  if (name.includes('cook') || name.includes('chef')) {
    return 'chef-hat';
  }
  if (name.includes('carpenter') || name.includes('repair')) {
    return 'hammer-wrench';
  }
  if (name.includes('deep')) {
    return 'sofa';
  }
  return 'toolbox';
};

// Format price to Indian Rupees
const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function ServicesListingScreen() {
  const route = useRoute<ServicesListingRouteProp>();
  const navigation = useNavigation<ServicesListingNavigationProp>();
  const insets = useSafeAreaInsets();
  const { areaId, categoryId, areaName, categoryName } = route.params;

  const [services, setServices] = useState<Category[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homeApi.getCategories({ areaId });
      if (response.data) {
        setServices(response.data);
      }
    } catch (err: any) {
      logger.error('Failed to fetch services', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceSelect = useCallback(async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      // Log analytics event
      await baihubAnalytics.logServiceCardClicked({
        service_id: serviceId,
        service_name: service.name,
        screen: 'area_wise_listing',
        area_name: areaName,
        area_id: areaId,
      });
    }
    setSelectedService(serviceId);
  }, [services, areaName, areaId]);

  const handleContinue = useCallback(async () => {
    if (!selectedService) {
      // Show error or toast
      return;
    }
    const service = services.find(s => s.id === selectedService);
    if (service) {
      // Log analytics event
      await baihubAnalytics.logServiceSelected({
        service_id: selectedService,
        service_name: service.name,
        screen: 'area_wise_listing',
        area_name: areaName,
        area_id: areaId,
      });
    }
    // Navigate to time slot selection screen
    logger.info('Continue with service', { 
      serviceId: selectedService,
      areaId,
      categoryId: selectedService, // Using selectedService as categoryId for now
    });
    navigation.navigate('TimeSlotSelection', {
      areaId,
      categoryId: selectedService, // The selected service is the category
      areaName,
      categoryName: services.find(s => s.id === selectedService)?.name,
      serviceId: selectedService, // Pass serviceId
    });
  }, [selectedService, areaId, areaName, services, navigation]);

  const handleRetry = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

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
            Choose a Service
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
            Choose a Service
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
          Choose a Service
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Subtitle */}
      <Text variant="bodyMedium" style={styles.subtitle}>
        Select what you want to book
      </Text>

      {/* Scrollable Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {services.map((service) => {
          const isSelected = selectedService === service.id;
          const iconName = getServiceIcon(service.name);
          // Mock price - in real app, this would come from the API response
          // Assuming the API will return a price field in the Category type
          const startingPrice = (service as any).startingPrice || service.order * 500 + 349;

          return (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                isSelected && styles.serviceCardSelected,
              ]}
              onPress={() => handleServiceSelect(service.id)}
              activeOpacity={0.7}
            >
              {/* Service Icon or Image */}
              <View style={styles.iconContainer}>
                {service.displayImage?.imageUrl ? (
                  <Image 
                    source={{ uri: service.displayImage.imageUrl }} 
                    style={styles.serviceImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon
                    name={iconName}
                    size={32}
                    color={isSelected ? '#f9cb00' : '#666'}
                  />
                )}
              </View>

              {/* Service Info */}
              <View style={styles.serviceInfo}>
                <Text variant="titleMedium" style={styles.serviceName}>
                  {service.name}
                </Text>
                <Text variant="bodySmall" style={styles.servicePrice}>
                  Starting {formatPrice(startingPrice)}
                </Text>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Icon name="check-circle" size={24} color="#f9cb00" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {services.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No services available in this area
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedService}
          style={[
            styles.continueButton,
            !selectedService && styles.continueButtonDisabled,
          ]}
          contentStyle={styles.continueButtonContent}
          labelStyle={styles.continueButtonLabel}
        >
          Continue
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
  subtitle: {
    color: '#666666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for sticky button
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
  },
  serviceCardSelected: {
    borderColor: '#f9cb00',
    borderWidth: 2,
    backgroundColor: '#fffef5',
  },
  iconContainer: {
    width: 56,
    height: 56,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  servicePrice: {
    color: '#666666',
  },
  selectedIndicator: {
    marginLeft: 8,
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

