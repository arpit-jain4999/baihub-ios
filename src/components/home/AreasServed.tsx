// Areas Served component

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AreasServed as AreasServedType } from '../../types/home.types';

interface AreasServedProps {
  areas: AreasServedType;
  onAreaPress?: (areaId: string, areaName: string) => void;
  onViewAll?: () => void;
}

export const AreasServed: React.FC<AreasServedProps> = ({
  areas,
  onAreaPress,
  onViewAll,
}) => {
  if (!areas || !areas.cities || areas.cities.length === 0) {
    return null;
  }

  // Show top 6 cities, rest can be viewed via "View All"
  const displayedCities = areas.cities.slice(0, 6);
  const hasMore = areas.cities.length > 6;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Areas We Serve
        </Text>
        {hasMore && onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text variant="bodyMedium" style={styles.viewAll}>
              View All ({areas.totalAreas})
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.grid}>
        {displayedCities.map((city, index) => (
          <TouchableOpacity
            key={city.id || index}
            style={styles.cityCard}
            onPress={() => onAreaPress?.(city.id || '', city.name)}
            activeOpacity={0.7}
          >
            {city.displayImage?.imageUrl ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: city.displayImage.imageUrl }} 
                  style={styles.areaImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <Icon name="map-marker" size={20} color="#f9cb00" />
            )}
            <Text variant="bodyMedium" style={styles.cityName}>
              {city.name}
            </Text>
            <Text variant="bodySmall" style={styles.serviceCount}>
              {city.serviceCount} services
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#000000',
  },
  viewAll: {
    color: '#f9cb00',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cityCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    alignItems: 'center',
  },
  cityName: {
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceCount: {
    color: '#666666',
    fontSize: 12,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  areaImage: {
    width: '100%',
    height: '100%',
  },
});








