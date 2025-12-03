// Area Selection Screen - Shows areas for a selected category with search

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput as RNTextInput,
  Image,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { homeApi } from '../../api/endpoints';
import { Area, AreaServed } from '../../types/home.types';
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';
import { useDebounce } from '../../hooks/useDebounce';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

type AreaSelectionRouteProp = RouteProp<RootStackParamList, 'AreaSelection'>;
type AreaSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AreaSelection'
>;

export default function AreaSelectionScreen() {
  const route = useRoute<AreaSelectionRouteProp>();
  const navigation = useNavigation<AreaSelectionNavigationProp>();
  const insets = useSafeAreaInsets();
  const { categoryId, categoryName } = route.params;

  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch areas by category on mount
  const fetchAreasByCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (categoryId) {
        const response = await homeApi.getAreasByCategory(categoryId);
        if (response.data) {
          setAreas(response.data);
        }
      } else {
        // If no categoryId, fetch all areas served
        const response = await homeApi.getAreasServed();
        if (response.data && response.data.cities) {
          // Map AreaServed to Area format
          const mappedAreas: Area[] = response.data.cities
            .filter((area: AreaServed) => area.id && area.isActive)
            .map((area: AreaServed) => ({
              id: area.id!,
              name: area.name,
              isActive: area.isActive,
              serviceCount: area.serviceCount,
              createdAt: area.createdAt,
            }));
          setAreas(mappedAreas);
        }
      }
    } catch (err: any) {
      logger.error('Failed to fetch areas', err);
      setError(err.message || 'Failed to load areas');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Search areas when debounced query changes
  const searchAreas = useCallback(async (query: string) => {
    if (!query.trim()) {
      // If search is empty, fetch areas
      fetchAreasByCategory();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const response = await homeApi.searchAreas({ name: query });
      if (response.data) {
        setAreas(response.data);
      }
    } catch (err: any) {
      logger.error('Failed to search areas', err);
      setError(err.message || 'Failed to search areas');
    } finally {
      setIsSearching(false);
    }
  }, [fetchAreasByCategory]);

  // Initial load
  useEffect(() => {
    fetchAreasByCategory();
  }, [fetchAreasByCategory]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      return; // Wait for debounce
    }
    if (debouncedSearchQuery.trim()) {
      // Log analytics event when user searches
      baihubAnalytics.logAreaSearched({
        area_searched: debouncedSearchQuery,
        areas_available: areas.length,
      });
    }
    searchAreas(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchQuery, searchAreas, areas.length]);

  const handleAreaSelect = useCallback(async (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (area) {
      // Log analytics event
      await baihubAnalytics.logAreaCardClicked({
        area_id: areaId,
        area_name: area.name,
        screen: categoryId ? 'service_wise_listing' : 'home',
        service_id: categoryId,
        service_name: categoryName,
      });
    }
    setSelectedArea(areaId);
  }, [areas, categoryId, categoryName]);

  const handleContinue = useCallback(async () => {
    if (!selectedArea) {
      // Show error or toast
      return;
    }
    const selectedAreaData = areas.find((area) => area.id === selectedArea);
    if (selectedAreaData) {
      // Log analytics event
      await baihubAnalytics.logAreaSelected({
        area_id: selectedArea,
        area_name: selectedAreaData.name,
        screen: categoryId ? 'service_wise_listing' : 'home',
        service_id: categoryId,
        service_name: categoryName,
      });
      
      // If categoryId is already provided (from home page), skip ServicesListing
      // and go directly to TimeSlotSelection
      if (categoryId) {
        navigation.navigate('TimeSlotSelection', {
          areaId: selectedArea,
          categoryId,
          areaName: selectedAreaData.name,
          categoryName,
          serviceId: route.params.serviceId, // Pass serviceId if available
        });
      } else {
        // If no categoryId (from hero banner), navigate to services listing first
        navigation.navigate('ServicesListing', {
          areaId: selectedArea,
          categoryId: '', // Will be selected in ServicesListing
          areaName: selectedAreaData.name,
          categoryName: '',
        });
      }
    }
  }, [selectedArea, areas, categoryId, categoryName, navigation, route.params.serviceId]);

  const handleRetry = useCallback(() => {
    if (searchQuery.trim()) {
      searchAreas(searchQuery);
    } else {
      fetchAreasByCategory();
    }
  }, [searchQuery, searchAreas, fetchAreasByCategory]);


  const isLoading = loading || isSearching;

  if (loading && !searchQuery) {
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
            Where do you live?
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f9cb00" />
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
          Where do you live?
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Subtitle */}
      <Text variant="bodySmall" style={styles.subtitle}>
        We currently serve selected societies/buildings.
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search your society/building"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading Indicator for Search */}
      {isSearching && (
        <View style={styles.searchLoadingContainer}>
          <ActivityIndicator size="small" color="#f9cb00" />
          <Text variant="bodySmall" style={styles.searchLoadingText}>
            Searching...
          </Text>
        </View>
      )}

      {/* Scrollable Areas List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text variant="bodyLarge" style={styles.errorText}>
              {error}
            </Text>
            <Button
              mode="outlined"
              onPress={handleRetry}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        )}

        {!error && areas.length > 0 && (
          <>
            {areas.map((area) => {
              const isSelected = selectedArea === area.id;

              return (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.areaCard,
                    isSelected && styles.areaCardSelected,
                  ]}
                  onPress={() => handleAreaSelect(area.id)}
                  activeOpacity={0.7}
                >
                  {/* Area Image or Icon */}
                  {area.displayImage?.imageUrl ? (
                    <View style={styles.areaImageContainer}>
                      <Image 
                        source={{ uri: area.displayImage.imageUrl }} 
                        style={styles.areaImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}

                  <View style={styles.areaInfo}>
                    <Text variant="titleMedium" style={styles.areaName}>
                      {area.name}
                    </Text>
                    {area.state && (
                      <Text variant="bodySmall" style={styles.areaDescription}>
                        {area.state}
                      </Text>
                    )}
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
          </>
        )}

        {!error && !isLoading && areas.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="map-marker-off" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              {searchQuery.trim()
                ? 'No areas found matching your search'
                : 'No areas available for this category'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {selectedArea ? (
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.continueButtonContent}
            labelStyle={styles.continueButtonLabel}
          >
            Continue
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            contentStyle={styles.cancelButtonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
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
    marginBottom: 12,
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 0,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
    marginLeft: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  searchLoadingText: {
    marginLeft: 8,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for sticky button
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 3,
  },
  areaCardSelected: {
    borderColor: '#f9cb00',
    borderWidth: 2,
    backgroundColor: '#fffef5',
    // Enhanced shadow when selected
    shadowOpacity: 0.15,
    elevation: 4,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  areaDescription: {
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
    textAlign: 'center',
  },
  errorContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    borderColor: '#f9cb00',
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
    paddingVertical: 12,
  },
  continueButtonLabel: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  cancelButtonContent: {
    paddingVertical: 12,
  },
  cancelButtonLabel: {
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
  areaImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  areaImage: {
    width: '100%',
    height: '100%',
  },
});

