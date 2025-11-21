// Profile screen

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, Button, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={(user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.firstName || user?.email || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email || 'No email'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Settings' as never)}
            icon="cog"
            style={styles.menuItem}
          >
            Settings
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={() => {}}
            icon="help-circle"
            style={styles.menuItem}
          >
            Help & Support
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={() => {}}
            icon="information"
            style={styles.menuItem}
          >
            About
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 8,
  },
  email: {
    opacity: 0.7,
  },
  menuItem: {
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
});

