// Expo app configuration with environment variables

module.exports = {
  expo: {
    name: 'Baihub',
    slug: 'baihub-mobile',
    version: '1.0.1',
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
      bundleIdentifier: 'com.baihub.app',
      supportsTablet: true,
      buildNumber: '1',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'This app needs access to your location to automatically detect your city. You can enter your city manually if you prefer not to share your location.',
        ITSAppUsesNonExemptEncryption: false,
      },
      googleServicesFile: './GoogleService-Info.plist',
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffcc00', // Matches the yellow background in your image
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
      package: 'com.baihub.app',
      googleServicesFile: './google-services.json',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    extra: {
      // Production API URL - used in release builds
      // For local development, override via .env file (not committed)
      API_BASE_URL: process.env.API_BASE_URL || 'https://api.baihub.co.in',
      API_TIMEOUT: process.env.API_TIMEOUT || '30000',
      // Default to production for release builds
      ENVIRONMENT: process.env.ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
      "eas": {
        "projectId": "63f0b4db-fe4e-4bdb-a279-20135f9e3b50"
      }
    },
    plugins: [
      '@react-native-firebase/app',
      './plugins/with-google-services.js',
      './plugins/with-modular-headers.js',
    ],
  },
};

