# Google Analytics Events Tracking Guide

## 📍 Where Events Are Currently Being Logged

### 1. **RootNavigator.tsx** (`src/navigation/RootNavigator.tsx`)
   - **App Open Event**: Logged when app starts
     ```typescript
     analyticsService.logAppOpen(); // Line 28
     ```
   
   - **Screen View Events**: Automatically logged on every screen navigation
     ```typescript
     await analyticsService.logScreenView(currentRouteName); // Line 43
     ```
     - Tracks all screen transitions automatically
     - Event name: `screen_view`
     - Parameters: `screen_name`, `screen_class`

### 2. **Analytics Service** (`src/services/analytics.service.ts`)
   This is the central service that wraps Firebase Analytics. All events go through here.

## 🔍 How to Check/Verify Analytics Events

### Method 1: Firebase Console (Production Data)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **baihub-app-rn**
3. Navigate to **Analytics** → **Events** (in the left sidebar)
4. View real-time events or historical data
5. You can see:
   - Event names
   - Event parameters
   - Event counts
   - User engagement metrics

### Method 2: DebugView (Real-time Testing) ⭐ RECOMMENDED FOR DEVELOPMENT

#### For Android:
1. **Enable Debug Mode** in your app:
   ```bash
   # Run this command while your app is running
   adb shell setprop debug.firebase.analytics.app com.baihub.app
   ```

2. **View Debug Events**:
   - Go to Firebase Console → Analytics → DebugView
   - Events appear in real-time (within seconds)
   - You'll see all events with full parameters

3. **Disable Debug Mode** (when done testing):
   ```bash
   adb shell setprop debug.firebase.analytics.app .none.
   ```

#### For iOS (if needed later):
```bash
# Enable debug mode
xcrun simctl launch --console-pty <device-id> com.baihub.app --FIRDebugEnabled
```

### Method 3: Android Logcat (Local Debugging)
View analytics logs directly in your terminal:
```bash
# Filter for Firebase Analytics logs
adb logcat | grep -i "firebase\|analytics"

# Or more specific
adb logcat | grep -E "FA|FirebaseAnalytics"
```

### Method 4: Add Console Logging (Development Only)
The analytics service already logs to console in development mode. Check your Metro bundler output or terminal for:
```
[INFO] Analytics: Screen view logged: HomeScreen
[INFO] Analytics: Event logged: app_open
```

## 📊 Currently Tracked Events

### Automatic Events:
1. **`app_open`** - When app starts
2. **`screen_view`** - Every screen navigation
   - Parameters: `screen_name`, `screen_class`

### Available but Not Yet Implemented:
The analytics service has these methods ready, but they're not being called yet:
- `logLogin()` - User login
- `logSignUp()` - User signup
- `logPurchase()` - Purchase completion
- `logAddToCart()` - Add service to cart
- `logBeginCheckout()` - Start checkout
- `logSearch()` - Search queries
- `logViewItem()` - View service/item details
- `logSelectContent()` - Select category/banner
- `setUserId()` - Set user ID for tracking
- `setUserProperty()` - Set user properties

## 🚀 Quick Test: Verify Analytics is Working

1. **Enable Debug Mode**:
   ```bash
   adb shell setprop debug.firebase.analytics.app com.baihub.app
   ```

2. **Open Firebase Console**:
   - Go to: https://console.firebase.google.com/project/baihub-app-rn/analytics/debugview
   - Keep this tab open

3. **Use Your App**:
   - Open the app
   - Navigate between screens
   - You should see events appearing in DebugView within 5-10 seconds

4. **Expected Events**:
   - `app_open` - When app launches
   - `screen_view` - For each screen you visit
     - `screen_name`: "HomeScreen", "ProfileScreen", etc.

## 📝 Project Information

- **Project ID**: `baihub-app-rn`
- **Package Name**: `com.baihub.app`
- **Firebase Project Number**: `327231273268`

## 🔧 Troubleshooting

### Events Not Showing Up?
1. **Check Internet Connection**: Analytics requires network
2. **Verify Firebase Setup**: Ensure `google-services.json` is correct
3. **Check Debug Mode**: Make sure debug mode is enabled for testing
4. **Wait for Processing**: Production events can take 24-48 hours to appear
5. **Check Logs**: Look for analytics errors in logcat

### Common Issues:
- **"Analytics error"**: Check if Firebase SDK is properly initialized
- **No events in DebugView**: Ensure debug mode is enabled and app is running
- **Events delayed**: Production events are batched and sent periodically

## 📚 Next Steps: Add More Events

To track more user actions, add analytics calls in your screens:

```typescript
// Example: Track category selection
import { analyticsService } from '../services/analytics.service';

const handleCategoryPress = (category: Category) => {
  analyticsService.logSelectContent('category', category.id);
  // ... rest of your code
};

// Example: Track login
analyticsService.logLogin('phone');

// Example: Track purchase
analyticsService.logPurchase({
  value: 500,
  currency: 'INR',
  transaction_id: 'order_123',
});
```


