// Address Bottom Sheet Component

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { userApi, Address } from '../../api/endpoints';
import { logger } from '../../utils/logger';
import { API_ENDPOINTS } from '@/utils';

interface AddressBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (address: Address) => void;
  areaId: string;
}

export const AddressBottomSheet: React.FC<AddressBottomSheetProps> = ({
  visible,
  onClose,
  onSuccess,
  areaId,
}) => {
  const insets = useSafeAreaInsets();
  const [flatNumber, setFlatNumber] = useState('');
  const [towerBuilding, setTowerBuilding] = useState('');
  const [societyLocality, setSocietyLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    if (!flatNumber.trim()) {
      setError('Flat No. / House Number is required');
      return false;
    }
    if (!towerBuilding.trim()) {
      setError('Tower No. / Building is required');
      return false;
    }
    if (!societyLocality.trim()) {
      setError('Society / Locality is required');
      return false;
    }
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    if (!state.trim()) {
      setError('State is required');
      return false;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      setError('Valid 6-digit pincode is required');
      return false;
    }
    return true;
  }, [flatNumber, towerBuilding, societyLocality, city, state, pincode]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const addressData: Address = {
        addressLine1: flatNumber,
        addressLine2: towerBuilding,
        city: city,
        state: state,
        country: 'India',
        pincode: pincode,
        landmark: societyLocality,
        isDefault: false,
        label: 'Home',
      };

      const response = await userApi.addAddress(addressData);
      logger.info('Address added successfully', `${API_ENDPOINTS.USER.PROFILE}/addresses`);
      if (response.data) {
        logger.info('Address added successfully', response.data);
        onSuccess(response.data);
        // Reset form
        setFlatNumber('');
        setTowerBuilding('');
        setSocietyLocality('');
        setCity('');
        setState('');
        setPincode('');
        onClose();
      }
    } catch (err: any) {
      logger.error('Failed to add address', err);
      setError(err.message || 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [flatNumber, towerBuilding, societyLocality, city, state, pincode, areaId, validateForm, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.bottomSheet}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                Add Address
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Form - Scrollable */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {error && (
                <View style={styles.errorContainer}>
                  <Text variant="bodySmall" style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              )}

              <TextInput
                label="Flat No. / House Number"
                value={flatNumber}
                onChangeText={setFlatNumber}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
              />

              <TextInput
                label="Tower No. / Building"
                value={towerBuilding}
                onChangeText={setTowerBuilding}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
              />

              <TextInput
                label="Society / Locality"
                value={societyLocality}
                onChangeText={setSocietyLocality}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />

              <TextInput
                label="City"
                value={city}
                onChangeText={setCity}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />

              <TextInput
                label="State"
                value={state}
                onChangeText={setState}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />

              <TextInput
                label="Pincode"
                value={pincode}
                onChangeText={(text) => {
                  const numericOnly = text.replace(/[^0-9]/g, '');
                  if (numericOnly.length <= 6) {
                    setPincode(numericOnly);
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
              />
            </ScrollView>

            {/* Sticky Save Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.submitButtonLabel}
              >
                Save Address
              </Button>
            </View>
          </View>
      </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    maxHeight: '95%',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    height: '85%',
    flexDirection: 'column',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#b00020',
  },
  footer: {
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
  submitButton: {
    backgroundColor: '#f9cb00',
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

