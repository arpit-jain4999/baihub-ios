// Register screen

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Surface, TextInput } from 'react-native-paper';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store';
import { logger } from '../../utils/logger';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { requestOtp, isLoading, error } = useAuthStore();

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    // Registration is handled automatically through OTP flow
    // Redirect to login screen
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign up to get started
          </Text>

          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            error={!!errors.name}
            errorMessage={errors.name}
            left={<TextInput.Icon icon="account" />}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            errorMessage={errors.email}
            left={<TextInput.Icon icon="email" />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={!!errors.password}
            errorMessage={errors.password}
            left={<TextInput.Icon icon="lock" />}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            left={<TextInput.Icon icon="lock-check" />}
          />

          {error && (
            <Text variant="bodySmall" style={styles.errorText}>
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Sign Up
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
            labelStyle={styles.linkButtonLabel}
          >
            Already have an account? Sign In
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonLabel: {
    color: '#000000',
  },
  errorText: {
    color: '#b00020',
    marginTop: 8,
    textAlign: 'center',
  },
});

