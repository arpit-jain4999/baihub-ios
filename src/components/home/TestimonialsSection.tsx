// Testimonials Section component

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Review } from '../../types/home.types';

interface TestimonialsSectionProps {
  testimonials: Review[];
  onViewAll?: () => void;
  onTestimonialPress?: (review: Review) => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onViewAll,
  onTestimonialPress,
}) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color="#f9cb00"
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          What Our Customers Say
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text variant="bodyMedium" style={styles.viewAll}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            style={styles.card}
            onPress={() => onTestimonialPress?.(testimonial)}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.ratingContainer}>
                {renderStars(testimonial.rating)}
              </View>
              <Text variant="bodyMedium" style={styles.comment} numberOfLines={4}>
                "{testimonial.comment}"
              </Text>
              <View style={styles.userInfo}>
                <Avatar.Text
                  size={32}
                  label={`${testimonial.user.firstName.charAt(0)}${testimonial.user.lastName.charAt(0)}`}
                  style={styles.avatar}
                />
                <View style={styles.userDetails}>
                  <Text variant="bodySmall" style={styles.userName}>
                    {testimonial.user.firstName} {testimonial.user.lastName}
                  </Text>
                  <Text variant="bodySmall" style={styles.location}>
                    {testimonial.location}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
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
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    width: 280,
    marginRight: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  comment: {
    marginBottom: 16,
    color: '#000000',
    lineHeight: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#f9cb00',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  location: {
    color: '#666666',
    fontSize: 12,
  },
});



