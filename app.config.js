// Expo app configuration with environment variables

module.exports = {
  expo: {
    name: 'baihub-mobile',
    slug: 'baihub-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'This app needs access to your location to automatically detect your city.',
        NSLocationAlwaysUsageDescription: 'This app needs access to your location to automatically detect your city.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
      package: 'com.arpit_jain49.baihubmobile',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://10.0.2.2:3000',
      API_TIMEOUT: process.env.API_TIMEOUT || '30000',
      ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    },
  },
};

