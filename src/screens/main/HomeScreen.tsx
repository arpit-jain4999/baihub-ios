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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store';
import { useHomePage } from '../../hooks/useHomePage';
import { RootStackParamList } from '../../navigation/types';
import {
  HeroBanner,
  CategoryTiles,
  TestimonialsSection,
  SecondaryBanners,
  AreasServed,
} from '../../components/home';
import { Category, Review, SecondaryBanner } from '../../types/home.types';
import { baihubAnalytics } from '../../services/baihub-analytics.service';
import { useEffect, useRef } from 'react';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuthStore();
  const { data, loading, error, refresh } = useHomePage({
    city: user?.city,
    limit: 8,
    testimonialLimit: 5,
  });
  const hasLoggedHomeVisit = useRef(false);

  // Log home page visit on first mount
  useEffect(() => {
    if (!hasLoggedHomeVisit.current && !loading && data) {
      hasLoggedHomeVisit.current = true;
      baihubAnalytics.logHomePageVisited();
    }
  }, [loading, data]);

  const handleCategoryPress = useCallback(
    async (category: Category) => {
      // Log analytics event
      await baihubAnalytics.logServiceSelected({
        service_id: category.id,
        service_name: category.name,
        screen: 'home',
      });
      // Navigate to area selection for the selected category
      const rootNavigator = navigation.getParent() || navigation;
      (rootNavigator as any).navigate('AreaSelection', {
        categoryId: category.id,
        categoryName: category.name,
      });
    },
    [navigation]
  );

  const handleTestimonialPress = useCallback((review: Review) => {
    // Navigate to review details or service
    console.log('Testimonial pressed:', review);
  }, []);

  const handleBannerPress = useCallback((banner: SecondaryBanner) => {
    // Navigate based on actionUrl
    console.log('Banner pressed:', banner);
  }, []);

  const handleAreaPress = useCallback(
    async (areaId: string, areaName: string) => {
      // Log analytics event
      await baihubAnalytics.logAreaSelected({
        area_id: areaId,
        area_name: areaName,
        screen: 'home',
      });
      // Navigate to services listing for the selected area
      if (!areaId) {
        console.warn('Area ID is missing for:', areaName);
        return;
      }
      
      // Navigate using root navigator (ServicesListing is at root level)
      const rootNavigator = navigation.getParent() || navigation;
      (rootNavigator as any).navigate('ServicesListing', {
        areaId,
        areaName,
      });
    },
    [navigation]
  );

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
          onPress={async () => {
            // Log analytics event
            await baihubAnalytics.logHeroBannerClicked({
              banner_url: data.heroBanner?.imageUrl,
              banner_title: data.heroBanner?.title,
            });
            // Navigate to area selection (without categoryId) to start booking flow
            const rootNavigator = navigation.getParent() || navigation;
            (rootNavigator as any).navigate('AreaSelection', {});
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

