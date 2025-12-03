// Time Slot Selection Screen - Shows available time slots for booking

import React, { useState, useCallback, useEffect } from 'react';
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
import { RootStackParamList } from '../../navigation/types';
import { logger } from '../../utils/logger';
import { homeApi, TimeSlot } from '../../api/endpoints';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

type TimeSlotSelectionRouteProp = RouteProp<RootStackParamList, 'TimeSlotSelection'>;
type TimeSlotSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TimeSlotSelection'
>;

export default function TimeSlotSelectionScreen() {
  const route = useRoute<TimeSlotSelectionRouteProp>();
  const navigation = useNavigation<TimeSlotSelectionNavigationProp>();
  const insets = useSafeAreaInsets();
  const { areaId, categoryId, areaName, categoryName, serviceId } = route.params;

  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await homeApi.getTimeSlots();
      if (response.data) {
        // Sort by order field
        const sortedSlots = [...response.data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setTimeSlots(sortedSlots);
      }
    } catch (err: any) {
      logger.error('Failed to fetch time slots', err);
      setError(err.message || 'Failed to load time slots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const handleSlotSelect = useCallback(async (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot) {
      const isCurrentlySelected = selectedSlots.has(slotId);
      // Log analytics event
      await baihubAnalytics.logSlotClicked({
        slot_start_time: slot.startTime || '',
        slot_title: slot.displayText,
        slot_end_time: slot.endTime || '',
        slot_id: slotId,
        slot_selected: !isCurrentlySelected,
        selected_service_id: categoryId,
        selected_service_name: categoryName,
        selected_area_id: areaId,
        selected_area_name: areaName,
      });
    }
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  }, [timeSlots, selectedSlots]);

  const handleContinue = useCallback(async () => {
    if (selectedSlots.size === 0) {
      // Show error or toast
      return;
    }
    const selectedSlotData = timeSlots
      .filter((slot) => selectedSlots.has(slot.id))
      .map((slot) => ({
        id: slot.id,
        displayText: slot.displayText,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
    
    if (selectedSlotData.length > 0) {
      // Log analytics event
      await baihubAnalytics.logSlotContinueClicked({
        selected_slots_title: selectedSlotData.map(s => s.displayText),
        selected_slots_id: selectedSlotData.map(s => s.id),
        total_selected_slots: selectedSlotData.length,
        selected_service_id: categoryId,
        selected_service_name: categoryName,
        selected_area_id: areaId,
        selected_area_name: areaName,
      });
      
      logger.info('Time slots selected', {
        slotIds: Array.from(selectedSlots),
        count: selectedSlots.size,
        areaId,
        categoryId,
        serviceId,
        slots: selectedSlotData,
      });
      // Navigate to plans selection screen
      navigation.navigate('PlansSelection', {
        areaId,
        categoryId,
        areaName,
        categoryName,
        serviceId,
        timeSlots: selectedSlotData,
      });
    }
  }, [selectedSlots, timeSlots, areaId, categoryId, areaName, categoryName, serviceId, navigation]);

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
          Pick time slots
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text variant="bodySmall" style={styles.subtitle}>
          Select multiple time slots for your service
        </Text>
        {selectedSlots.size > 0 && (
          <Text variant="bodySmall" style={styles.selectedCount}>
            {selectedSlots.size} slot{selectedSlots.size > 1 ? 's' : ''} selected
          </Text>
        )}
      </View>

      {/* Scrollable Time Slots */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f9cb00" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading time slots...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text variant="bodyMedium" style={styles.errorText}>
              {error}
            </Text>
            <Button mode="contained" onPress={fetchTimeSlots} style={styles.retryButton}>
              Retry
            </Button>
          </View>
        ) : (
          <View style={styles.slotsContainer}>
            {timeSlots.map((slot) => {
              const isSelected = selectedSlots.has(slot.id);

              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => handleSlotSelect(slot.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.slotChip,
                      isSelected && styles.slotChipSelected,
                    ]}
                  >
                    {isSelected && (
                      <Icon name="check-circle" size={20} color="#000" style={styles.checkIcon} />
                    )}
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.slotTextSelected,
                      ]}
                    >
                      {slot.displayText}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={selectedSlots.size === 0}
          style={[
            styles.continueButton,
            selectedSlots.size === 0 && styles.continueButtonDisabled,
          ]}
          contentStyle={styles.continueButtonContent}
          labelStyle={styles.continueButtonLabel}
        >
          Continue {selectedSlots.size > 0 && `(${selectedSlots.size})`}
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
  subtitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 4,
  },
  selectedCount: {
    color: '#f9cb00',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for sticky button
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotChip: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  checkIcon: {
    marginRight: -4,
  },
  slotChipSelected: {
    backgroundColor: '#f9cb00',
    borderColor: '#f9cb00',
    borderWidth: 1,
    // Enhanced shadow when selected
    shadowOpacity: 0.15,
    elevation: 3,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  slotTextSelected: {
    color: '#000000',
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f9cb00',
  },
});
