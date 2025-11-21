// Hero Banner component

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text as RNText } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { HeroBanner as HeroBannerType } from '../../types/home.types';

interface HeroBannerProps {
  banner: HeroBannerType;
  onPress?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banner, onPress }) => {
  if (!banner.isActive) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: banner.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            {banner.title}
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            {banner.subtitle}
          </Text>
          <Button
            mode="contained"
            onPress={onPress}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {banner.actionText}
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#f9cb00',
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});



