# BaiHub Mobile

A scalable React Native application built with Expo, TypeScript, and modern architecture patterns.

## Architecture

This project follows a clean, scalable architecture with clear separation of concerns:

```
src/
├── api/              # API layer - HTTP client and endpoints
│   ├── client.ts     # Axios configuration with interceptors
│   └── endpoints.ts  # API endpoint definitions
├── services/         # Service layer - Business logic
│   ├── auth.service.ts
│   └── user.service.ts
├── store/            # State management (Zustand)
│   ├── auth.store.ts
│   └── index.ts
├── navigation/        # Navigation configuration
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainNavigator.tsx
│   └── types.ts
├── screens/          # Screen components
│   ├── auth/
│   └── main/
├── components/       # Reusable components
│   └── common/
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
│   ├── constants.ts
│   ├── storage.ts
│   ├── logger.ts
│   └── validation.ts
├── types/           # TypeScript type definitions
└── theme/           # Theme configuration
```

## Features

- ✅ **API Layer**: Axios-based HTTP client with interceptors for auth and error handling
- ✅ **Service Layer**: Business logic separated from API calls
- ✅ **State Management**: Zustand for lightweight, performant state management
- ✅ **Navigation**: React Navigation with TypeScript support
- ✅ **UI Library**: React Native Paper (Material Design)
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Storage**: AsyncStorage utilities for data persistence
- ✅ **Logging**: Centralized logging utility
- ✅ **Validation**: Reusable validation utilities

## Dependencies

### Core
- `expo` - Expo framework
- `react` & `react-native` - React and React Native
- `typescript` - TypeScript support

### Navigation
- `@react-navigation/native` - Navigation library
- `@react-navigation/native-stack` - Stack navigator
- `@react-navigation/bottom-tabs` - Bottom tab navigator
- `react-native-screens` - Native screen components
- `react-native-safe-area-context` - Safe area handling
- `react-native-gesture-handler` - Gesture handling

### UI & Design
- `react-native-paper` - Material Design component library
- `react-native-vector-icons` - Icon library

### Networking & State
- `axios` - HTTP client
- `zustand` - State management
- `@react-native-async-storage/async-storage` - Local storage

### Utilities
- `expo-constants` - Environment variables
- `react-native-reanimated` - Animations

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Environment Configuration

Create an `app.config.js` file in the root directory to configure environment variables:

```javascript
export default {
  expo: {
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
      API_TIMEOUT: process.env.API_TIMEOUT || '30000',
      ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    },
  },
};
```

## Project Structure

### API Layer (`src/api/`)
- `client.ts`: Axios instance with interceptors for authentication and error handling
- `endpoints.ts`: API endpoint definitions with TypeScript types

### Service Layer (`src/services/`)
- Business logic separated from API calls
- Handles data transformation and error handling
- Manages storage operations

### State Management (`src/store/`)
- Zustand stores for global state
- Persisted state with AsyncStorage
- Type-safe state management

### Navigation (`src/navigation/`)
- Root navigator with authentication flow
- Stack and tab navigators
- TypeScript navigation types

### Components (`src/components/`)
- Reusable UI components
- Common components like Button, Input, etc.

### Utils (`src/utils/`)
- Constants and configuration
- Storage utilities
- Logger utility
- Validation helpers

## Code Style

- TypeScript strict mode enabled
- ESLint configured for code quality
- Consistent file structure and naming conventions

## License

Private









