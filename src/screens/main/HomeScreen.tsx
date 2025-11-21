// Home screen with home page data

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuthStore } from '../../store';
import { useHomePage } from '../../hooks/useHomePage';
import {
  HeroBanner,
  CategoryTiles,
  TestimonialsSection,
  SecondaryBanners,
  AreasServed,
} from '../../components/home';
import { Category, Review, SecondaryBanner } from '../../types/home.types';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const { data, loading, error, refresh } = useHomePage({
    city: user?.city,
    limit: 8,
    testimonialLimit: 5,
  });

  const handleCategoryPress = useCallback((category: Category) => {
    // Navigate to category details
    console.log('Category pressed:', category);
    // navigation.navigate('CategoryDetails', { categoryId: category.id });
  }, []);

  const handleTestimonialPress = useCallback((review: Review) => {
    // Navigate to review details or service
    console.log('Testimonial pressed:', review);
  }, []);

  const handleBannerPress = useCallback((banner: SecondaryBanner) => {
    // Navigate based on actionUrl
    console.log('Banner pressed:', banner);
  }, []);

  const handleAreaPress = useCallback((areaName: string) => {
    // Filter by area or navigate to area services
    console.log('Area pressed:', areaName);
  }, []);

  const handleViewAllCategories = useCallback(() => {
    // Navigate to all categories
    console.log('View all categories');
    // navigation.navigate('Categories');
  }, []);

  const handleViewAllTestimonials = useCallback(() => {
    // Navigate to all testimonials
    console.log('View all testimonials');
    // navigation.navigate('Testimonials');
  }, []);

  const handleViewAllAreas = useCallback(() => {
    // Navigate to all areas
    console.log('View all areas');
    // navigation.navigate('AreasServed');
  }, []);

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f9cb00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={refresh}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge">No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor="#f9cb00"
        />
      }
    >
      {/* Hero Banner */}
      {data.heroBanner && (
        <HeroBanner
          banner={data.heroBanner}
          onPress={() => {
            // Handle hero banner press - could navigate based on actionUrl
            console.log('Hero banner pressed:', data.heroBanner.actionUrl);
          }}
        />
      )}

      {/* Quick Category Tiles */}
      {data.quickCategories && data.quickCategories.length > 0 && (
        <CategoryTiles
          categories={data.quickCategories}
          onCategoryPress={handleCategoryPress}
        />
      )}

      {/* Featured Testimonials */}
      {data.featuredTestimonials && data.featuredTestimonials.length > 0 && (
        <TestimonialsSection
          testimonials={data.featuredTestimonials}
          onTestimonialPress={handleTestimonialPress}
          onViewAll={handleViewAllTestimonials}
        />
      )}

      {/* Secondary Banners */}
      {data.secondaryBanners && data.secondaryBanners.length > 0 && (
        <SecondaryBanners
          banners={data.secondaryBanners}
          onBannerPress={handleBannerPress}
        />
      )}

      {/* Areas Served */}
      {data.areasServed && data.areasServed.cities.length > 0 && (
        <AreasServed
          areas={data.areasServed}
          onAreaPress={handleAreaPress}
          onViewAll={handleViewAllAreas}
        />
      )}

      {/* Debug: Logout button (remove in production) */}
      {__DEV__ && (
        <Button
          mode="outlined"
          onPress={logout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 24,
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
  logoutButton: {
    margin: 16,
    marginTop: 24,
  },
});

