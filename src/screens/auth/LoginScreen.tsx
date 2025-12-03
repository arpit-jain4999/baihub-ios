// Login screen with phone number and OTP

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text as RNText,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store';
import { logger } from '../../utils/logger';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

export default function LoginScreen({ navigation }: any) {
  const { requestOtp } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digit characters
    const digitsOnly = text.replace(/\D/g, '');
    return digitsOnly;
  };

  const handleGetOTP = async () => {
    setError(null);

    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestOtp({ phoneNumber: "+91"+formattedPhone });
      logger.info('OTP requested successfully', { isNewUser: response.isNewUser });
      
      // Log analytics event
      await baihubAnalytics.logOtpRequested({
        phone_number: "+91"+formattedPhone,
        user_type: response.isNewUser ? 'new' : 'old',
        screen: 'login',
      });
      
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', { phoneNumber: formattedPhone });
    } catch (err: any) {
      logger.error('OTP request failed:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    logger.info(`Social login: ${provider}`);
    // TODO: Implement social login
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
        {/* Skip Button */}

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text variant="displaySmall" style={styles.welcomeTitle}>
            Welcome
          </Text>
          <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
            Please Login to your account
          </Text>
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputSection}>
          <RNText style={styles.inputLabel}>Phone Number</RNText>
          <TextInput
            mode="outlined"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError(null);
            }}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            style={styles.phoneInput}
            outlineStyle={styles.inputOutline}
            error={!!error}
            left={<TextInput.Icon icon="phone" />}
          />
          {error && (
            <RNText style={styles.errorText}>{error}</RNText>
          )}
        </View>

        {/* Get OTP Button */}
        <Button
          mode="contained"
          onPress={handleGetOTP}
          loading={isLoading}
          disabled={isLoading}
          style={styles.otpButton}
          contentStyle={styles.otpButtonContent}
          labelStyle={styles.otpButtonLabel}
        >
          Get OTP
        </Button>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <RNText style={styles.signUpText}>Don't have an account? </RNText>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <RNText style={styles.signUpLink}>Sign up</RNText>
          </TouchableOpacity>
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
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  skipText: {
    fontSize: 16,
    color: '#000000',
    marginRight: 4,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  phoneInput: {
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
  otpButton: {
    borderRadius: 8,
    backgroundColor: '#f9cb00',
    marginBottom: 32,
  },
  otpButtonContent: {
    paddingVertical: 12,
  },
  otpButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#666666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

