// Secondary Banners component

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SecondaryBanner } from '../../types/home.types';

interface SecondaryBannersProps {
  banners: SecondaryBanner[];
  onBannerPress?: (banner: SecondaryBanner) => void;
}

export const SecondaryBanners: React.FC<SecondaryBannersProps> = ({
  banners,
  onBannerPress,
}) => {
  const activeBanners = banners.filter((banner) => banner.isActive);

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeBanners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.banner}
            onPress={() => onBannerPress?.(banner)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: banner.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <View style={styles.content}>
                <Text variant="titleLarge" style={styles.title}>
                  {banner.title}
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  {banner.subtitle}
                </Text>
                <Button
                  mode="contained"
                  onPress={() => onBannerPress?.(banner)}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  {banner.actionText}
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  banner: {
    width: 320,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 3,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#f9cb00',
  },
  buttonContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});



