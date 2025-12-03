// Hero Banner component

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { HeroBanner as HeroBannerType } from '../../types/home.types';

interface HeroBannerProps {
  banner: HeroBannerType;
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
// Banner dimensions: 420px * 200px
// Calculate height based on aspect ratio to maintain full width
const BANNER_ASPECT_RATIO = 200 / 420; // height / width
const bannerHeight = screenWidth * BANNER_ASPECT_RATIO;

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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: bannerHeight,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});









