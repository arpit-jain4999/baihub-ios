# Firebase Remote Config Setup Guide

## ✅ Integration Complete!

Firebase Remote Config has been successfully integrated into your BaiHub mobile app with environment-based feature flags.

---

## 📋 What Was Done

### 1. **Package Installation**
- ✅ Installed `@react-native-firebase/remote-config`

### 2. **Environment Configuration**
- ✅ Added `APP_ENVIRONMENT` to `.env` file (values: `dev` or `production`)
- ✅ Updated `app.config.js` to expose `APP_ENVIRONMENT`
- ✅ Updated `constants.ts` to use `APP_ENVIRONMENT`

### 3. **Remote Config Service**
- ✅ Created `src/services/remoteConfig.service.ts`
- ✅ Initialized in `App.tsx` on app startup
- ✅ Supports environment-based feature flags

---

## 🚀 Firebase Console Setup

### Step 1: Access Remote Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **baihub-app-rn**
3. In the left sidebar, navigate to **Engage** → **Remote Config**

### Step 2: Add Parameter

Click **Add parameter** and configure:

```
Parameter key: is_payment_flow_enabled

Default value:
{
  "dev": "true",
  "production": "false"
}

Description: Controls whether payment flow is enabled based on environment
```

### Step 3: Configure Conditions (Optional)

You can also create conditions based on:
- App version
- User in segment
- Country/Region
- Custom user properties

### Step 4: Publish Changes

1. Click **Publish changes** button
2. Add a description (e.g., "Added payment flow feature flag")
3. Click **Publish**

---

## 💻 Usage in Your Code

### Check if Payment Flow is Enabled

```typescript
import { remoteConfigService } from '../services/remoteConfig.service';

// In any component or screen
const isPaymentEnabled = remoteConfigService.getIsPaymentFlowEnabled();

if (isPaymentEnabled) {
  // Show payment UI
  console.log('Payment flow is enabled');
} else {
  // Hide or disable payment features
  console.log('Payment flow is disabled');
}
```

### Example: Conditional Rendering

```typescript
import { remoteConfigService } from '../../services/remoteConfig.service';

const CheckoutScreen = () => {
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const enabled = remoteConfigService.getIsPaymentFlowEnabled();
      setIsPaymentEnabled(enabled);
    };
    
    checkPaymentStatus();
  }, []);

  return (
    <View>
      {isPaymentEnabled ? (
        <PaymentButton onPress={handlePayment} />
      ) : (
        <Text>Payment is currently unavailable</Text>
      )}
    </View>
  );
};
```

### Example: Navigation Guard

```typescript
import { remoteConfigService } from '../services/remoteConfig.service';

const handleProceedToPayment = () => {
  if (!remoteConfigService.getIsPaymentFlowEnabled()) {
    Alert.alert(
      'Feature Unavailable',
      'Payment processing is currently disabled. Please try again later.',
      [{ text: 'OK' }]
    );
    return;
  }

  navigation.navigate('Checkout');
};
```

---

## 🎯 How It Works

### Environment-Based Feature Flags

The Remote Config parameter `is_payment_flow_enabled` contains a JSON object:

```json
{
  "dev": "true",
  "production": "false"
}
```

The service automatically picks the correct value based on `APP_ENVIRONMENT`:

- **Development** (`APP_ENVIRONMENT=dev`): Payment flow **enabled**
- **Production** (`APP_ENVIRONMENT=production`): Payment flow **disabled**

### Switching Environments

Update `.env` file:

```bash
# For development
APP_ENVIRONMENT=dev

# For production
APP_ENVIRONMENT=production
```

Then rebuild the app.

---

## 🔧 Additional Remote Config Methods

### Get String Value

```typescript
const welcomeMessage = remoteConfigService.getString('welcome_message', 'Welcome!');
```

### Get Boolean Value

```typescript
const isFeatureEnabled = remoteConfigService.getBoolean('new_feature_enabled', false);
```

### Get Number Value

```typescript
const maxRetries = remoteConfigService.getNumber('max_retry_attempts', 3);
```

### Get JSON Object

```typescript
interface AppConfig {
  theme: string;
  showAds: boolean;
}

const config = remoteConfigService.getJSON<AppConfig>('app_config', {
  theme: 'light',
  showAds: false,
});
```

### Get All Values

```typescript
const allConfigs = remoteConfigService.getAllValues();
console.log('All Remote Config values:', allConfigs);
```

### Manual Fetch

```typescript
// Force fetch latest config
await remoteConfigService.fetchAndActivate();
```

### Get Fetch Status

```typescript
const status = remoteConfigService.getFetchStatus();
// Returns: 'success', 'failure', 'throttled', 'no_fetch_yet'

const lastFetch = remoteConfigService.getLastFetchTime();
console.log('Last fetched at:', lastFetch);
```

---

## 📊 Testing Remote Config

### 1. Debug Mode (View Real-Time Updates)

Enable debug mode for instant config updates:

```bash
# Android
adb shell setprop debug.firebase.remoteconfig.app com.baihub.app
```

### 2. Test Different Values

In Firebase Console:
1. Change the parameter value
2. Click **Publish changes**
3. In your app, call:
   ```typescript
   await remoteConfigService.fetchAndActivate();
   ```
4. Check the new value:
   ```typescript
   const isEnabled = remoteConfigService.getIsPaymentFlowEnabled();
   ```

### 3. Test Environment Switching

1. Update `.env`:
   ```bash
   APP_ENVIRONMENT=production
   ```
2. Rebuild and run the app
3. Check that payment flow is disabled

---

## 🔐 Default Values

Default values are set in the service to ensure the app works even without network:

```typescript
private defaultConfig = {
  is_payment_flow_enabled: JSON.stringify({
    dev: 'true',
    production: 'false',
  }),
};
```

If Remote Config fetch fails:
- **Development**: Payment flow is **enabled** by default
- **Production**: Payment flow is **disabled** by default

---

## ⚙️ Fetch Intervals

- **Development (`__DEV__`)**: Instant fetch (0 seconds)
- **Production**: 1 hour between fetches

This is configured in the service:

```typescript
minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000
```

---

## 📝 Best Practices

### 1. Always Provide Defaults

```typescript
const value = remoteConfigService.getString('key', 'default');
```

### 2. Use Type-Safe Methods

```typescript
// ✅ Good - type-safe
const config = remoteConfigService.getJSON<MyType>('config', defaultValue);

// ❌ Bad - no type safety
const config = JSON.parse(remoteConfigService.getString('config'));
```

### 3. Handle Errors Gracefully

```typescript
try {
  const isEnabled = remoteConfigService.getIsPaymentFlowEnabled();
  // Use the value
} catch (error) {
  // Fallback to safe default
  const isEnabled = ENV.APP_ENVIRONMENT === 'dev';
}
```

### 4. Cache Values in State

```typescript
// Don't call on every render
const [isEnabled, setIsEnabled] = useState(false);

useEffect(() => {
  setIsEnabled(remoteConfigService.getIsPaymentFlowEnabled());
}, []);
```

---

## 🎯 Common Use Cases

### Feature Flags

```typescript
const showNewUI = remoteConfigService.getBoolean('show_new_ui', false);
const enableChatSupport = remoteConfigService.getBoolean('enable_chat', true);
```

### A/B Testing

```typescript
const experimentVariant = remoteConfigService.getString('checkout_variant', 'control');

if (experimentVariant === 'variant_a') {
  // Show variant A
} else if (experimentVariant === 'variant_b') {
  // Show variant B
} else {
  // Show control
}
```

### Dynamic Configuration

```typescript
interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

const apiConfig = remoteConfigService.getJSON<APIConfig>('api_config', {
  baseURL: 'https://api.baihub.co.in',
  timeout: 30000,
  retries: 3,
});
```

### Maintenance Mode

```typescript
const isInMaintenance = remoteConfigService.getBoolean('maintenance_mode', false);

if (isInMaintenance) {
  return <MaintenanceScreen />;
}
```

---

## ✅ Verification

Check if Remote Config is working:

```typescript
// In any component
useEffect(() => {
  const logRemoteConfig = () => {
    console.log('=== Remote Config Status ===');
    console.log('Fetch Status:', remoteConfigService.getFetchStatus());
    console.log('Last Fetch:', remoteConfigService.getLastFetchTime());
    console.log('Payment Enabled:', remoteConfigService.getIsPaymentFlowEnabled());
    console.log('All Values:', remoteConfigService.getAllValues());
  };
  
  logRemoteConfig();
}, []);
```

---

## 🎉 You're All Set!

Firebase Remote Config is now integrated and ready to use! You can dynamically control features without deploying new app versions.

For more information:
- [Firebase Remote Config Docs](https://firebase.google.com/docs/remote-config)
- [React Native Firebase Remote Config](https://rnfirebase.io/remote-config/usage)









