// Profile screen

import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Card, Avatar, Button, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store';
import { useNavigation } from '@react-navigation/native';

const SUPPORT_WHATSAPP_NUMBER = '919810468183';
const SUPPORT_MESSAGE = 'Hello! I need help';
const TERMS_URL = 'https://www.baihub.co.in/terms-and-conditions';
const PRIVACY_URL = 'https://www.baihub.co.in/privacy-policy';
const ABOUT_URL = 'https://www.baihub.co.in/about';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();

  const handleHelpSupport = async () => {
    const whatsappUrl = `whatsapp://send?phone=${SUPPORT_WHATSAPP_NUMBER}&text=${encodeURIComponent(SUPPORT_MESSAGE)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web WhatsApp
        const webUrl = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert(
        'Unable to open WhatsApp',
        'Please make sure WhatsApp is installed on your device.',
        [{ text: 'OK' }]
      );
    }
  };

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link.');
    }
  };

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
            {user?.phoneNumber?.substring(0, 3) + " " + user?.phoneNumber?.substring(3, 14)}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Orders' as never)}
            icon="clipboard-list"
            style={styles.menuItem}
            textColor="#000000"
          >
            My Orders
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={handleHelpSupport}
            icon="help-circle"
            style={styles.menuItem}
            textColor="#000000"
          >
            Help & Support
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={() => openUrl(ABOUT_URL)}
            icon="information"
            style={styles.menuItem}
            textColor="#000000"
          >
            About
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={() => openUrl(TERMS_URL)}
            icon="file-document-outline"
            style={styles.menuItem}
            textColor="#000000"
          >
            Terms & Conditions
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={() => openUrl(PRIVACY_URL)}
            icon="shield-lock-outline"
            style={styles.menuItem}
            textColor="#000000"
          >
            Privacy Policy
          </Button>
          <Divider />
          <Button
            mode="text"
            onPress={logout}
            icon="logout"
            style={styles.menuItem}
            textColor="#000000"
          >
            Logout
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
    alignItems: "flex-start",
  },
});

