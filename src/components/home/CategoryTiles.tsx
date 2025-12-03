// Category Tiles component

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Category } from '../../types/home.types';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

interface CategoryTilesProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  categories,
  onCategoryPress,
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  console.log('categories', categories);


  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Browse Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.tile}
            onPress={async () => {
              onCategoryPress?.(category);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {category.displayImage?.imageUrl ? (
                <Image 
                  source={{ uri: category.displayImage.imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : category.icon ? (
                <Icon name={category.icon} size={32} color="#f9cb00" />
              ) : (
                <Icon name="folder" size={32} color="#f9cb00" />
              )}
            </View>
            <Text variant="bodyMedium" style={styles.name} numberOfLines={2}>
              {category.name}
            </Text>
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
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  scrollContent: {
    paddingRight: 16,
  },
  tile: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f9cb0020',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 12,
  },
});









