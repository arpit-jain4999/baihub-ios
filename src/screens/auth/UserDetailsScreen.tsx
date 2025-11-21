// User Details Screen for new user registration

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text as RNText,
  Alert,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useAuthStore } from '../../store';
import { userService } from '../../services/user.service';
import { logger } from '../../utils/logger';
import { Storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Chinese', value: 'zh' },
];

export default function UserDetailsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    emailOrPhone?: string;
    city?: string;
    language?: string;
  }>({});

  useEffect(() => {
    // Pre-fill email or phone if available from user
    if (user?.email) {
      setEmailOrPhone(user.email);
    } else if (user?.phoneNumber) {
      setEmailOrPhone(user.phoneNumber);
    }
    
    // Pre-fill name if available
    if (user?.firstName) {
      setName(user.firstName);
    }
    
    // Pre-fill language if available
    if (user?.language) {
      setLanguage(user.language);
    }
    
    // Request location permission
    requestLocationPermission();
  }, [user]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionGranted(true);
        // Get current location and reverse geocode to get city
        await getCurrentCity();
      } else {
        setLocationPermissionGranted(false);
        Alert.alert(
          'Location Permission',
          'Location permission is required to automatically detect your city. You can enter it manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      logger.error('Location permission error:', error);
      setLocationPermissionGranted(false);
    }
  };

  const getCurrentCity = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const cityName = address.city || address.subregion || address.region;
        if (cityName) {
          setCity(cityName);
        }
      }
    } catch (error) {
      logger.error('Get current city error:', error);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or Phone is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!language) {
      newErrors.language = 'Language is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Determine if emailOrPhone is email or phone
      const isEmail = emailOrPhone.includes('@');
      
      const updateData: any = {
        firstName: name,
        city: city.trim(),
        language: language,
      };

      if (isEmail) {
        updateData.email = emailOrPhone.trim();
      } else {
        updateData.phoneNumber = emailOrPhone.trim();
      }

      const updatedUser = await userService.updateProfile(updateData);
      logger.info('User details updated successfully');
      
      // Update user in store
      const { setNewUserComplete, initialize } = useAuthStore.getState();
      
      // Update user data in store
      await Storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      // Mark new user flow as complete and refresh auth state
      setNewUserComplete();
      await initialize();
      
      // Navigation will be handled by RootNavigator based on auth state
    } catch (error: any) {
      logger.error('Update user details error:', error);
      Alert.alert('Error', error.message || 'Failed to update user details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#000" />
          <RNText style={styles.backText}>back</RNText>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputSection}>
            <RNText style={styles.inputLabel}>Name</RNText>
            <TextInput
              mode="outlined"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: undefined });
              }}
              placeholder="Enter your name"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.name && (
              <RNText style={styles.errorText}>{errors.name}</RNText>
            )}
          </View>

          {/* Email or Phone Field */}
          <View style={styles.inputSection}>
            <RNText style={styles.inputLabel}>Email or Phone</RNText>
            <TextInput
              mode="outlined"
              value={emailOrPhone}
              onChangeText={(text) => {
                setEmailOrPhone(text);
                setErrors({ ...errors, emailOrPhone: undefined });
              }}
              placeholder="Enter email or phone"
              keyboardType="default"
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.emailOrPhone}
              left={<TextInput.Icon icon="email" />}
            />
            {errors.emailOrPhone && (
              <RNText style={styles.errorText}>{errors.emailOrPhone}</RNText>
            )}
          </View>

          {/* City Field */}
          <View style={styles.inputSection}>
            <RNText style={styles.inputLabel}>City</RNText>
            <TextInput
              mode="outlined"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                setErrors({ ...errors, city: undefined });
              }}
              placeholder="Enter your city"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              error={!!errors.city}
              left={<TextInput.Icon icon="map-marker" />}
              right={
                <TextInput.Icon
                  icon={locationPermissionGranted ? 'check-circle' : 'map-marker-off'}
                  onPress={requestLocationPermission}
                />
              }
            />
            {errors.city && (
              <RNText style={styles.errorText}>{errors.city}</RNText>
            )}
          </View>

          {/* Language Field */}
          <View style={styles.inputSection}>
            <RNText style={styles.inputLabel}>Language</RNText>
            <TouchableOpacity
              onPress={() => setShowLanguagePicker(!showLanguagePicker)}
              style={styles.languageSelector}
            >
              <TextInput
                mode="outlined"
                value={language ? LANGUAGES.find((l) => l.value === language)?.label || language : ''}
                placeholder="Select language"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                error={!!errors.language}
                editable={false}
                left={<TextInput.Icon icon="translate" />}
                right={<TextInput.Icon icon="chevron-down" />}
              />
            </TouchableOpacity>
            {showLanguagePicker && (
              <View style={styles.languagePicker}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    style={[
                      styles.languageOption,
                      language === lang.value && styles.languageOptionSelected,
                    ]}
                    onPress={() => {
                      setLanguage(lang.value);
                      setShowLanguagePicker(false);
                      setErrors({ ...errors, language: undefined });
                    }}
                  >
                    <RNText
                      style={[
                        styles.languageOptionText,
                        language === lang.value && styles.languageOptionTextSelected,
                      ]}
                    >
                      {lang.label}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.language && (
              <RNText style={styles.errorText}>{errors.language}</RNText>
            )}
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
          >
            Login
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  formContainer: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  inputOutline: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  errorText: {
    color: '#b00020',
    fontSize: 12,
    marginTop: 8,
  },
  languageSelector: {
    width: '100%',
  },
  languagePicker: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    overflow: 'hidden',
  },
  languageOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  languageOptionSelected: {
    backgroundColor: '#f9cb00',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  languageOptionTextSelected: {
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 8,
    backgroundColor: '#f9cb00',
    marginTop: 16,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

