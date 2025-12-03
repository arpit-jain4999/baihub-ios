# Firebase Analytics Integration Guide

## ✅ Successfully Integrated!

Firebase Analytics has been successfully integrated into your BaiHub mobile app and is working perfectly!

---

## 📋 What Was Done

### 1. **Gradle Configuration**
- ✅ Added Google Services plugin to `android/build.gradle`
- ✅ Applied Google Services plugin to `android/app/build.gradle`
- ✅ Added Firebase BoM and Analytics dependencies

### 2. **React Native Packages**
- ✅ Installed `@react-native-firebase/app`
- ✅ Installed `@react-native-firebase/analytics`

### 3. **Analytics Service**
- ✅ Created `src/services/analytics.service.ts` with comprehensive tracking methods
- ✅ Integrated automatic screen view tracking in navigation
- ✅ Added app open tracking

### 4. **Configuration Files**
- ✅ Google Services JSON already configured with package: `com.baihub.app`
- ✅ Firebase Analytics initialized and verified in logs

---

## 🚀 Usage Examples

### Import the Service

```typescript
import { analyticsService } from '../services/analytics.service';
```

### Track Screen Views (Automatic)

Screen views are **automatically tracked** when users navigate between screens. No manual code needed!

### Track Custom Events

```typescript
// Track when user views a service
await analyticsService.logEvent('view_service_details', {
  service_id: 'service-123',
  service_name: 'AC Repair',
  category: 'home-services',
});

// Track when user selects a plan
await analyticsService.logEvent('select_plan', {
  plan_id: 'plan-456',
  plan_name: 'Premium Service',
  price: 999,
  duration: '1 hour',
});

// Track search queries
await analyticsService.logSearch('AC repair near me');
```

### Track User Authentication

```typescript
// In LoginScreen.tsx after successful login
await analyticsService.logLogin('phone');
await analyticsService.setUserId(user.id);
await analyticsService.setUserProperties({
  user_type: 'customer',
  city: user.city,
  registration_date: user.createdAt,
});

// In RegisterScreen.tsx after successful signup
await analyticsService.logSignUp('phone');
```

### Track E-commerce Events

```typescript
// When user views service details
await analyticsService.logViewItem({
  item_id: serviceId,
  item_name: serviceName,
  item_category: category,
  price: price,
});

// When user selects a service
await analyticsService.logAddToCart({
  value: price,
  currency: 'INR',
  items: [{
    item_id: serviceId,
    item_name: serviceName,
    item_category: category,
    price: price,
    quantity: 1,
  }],
});

// When user starts checkout
await analyticsService.logBeginCheckout({
  value: totalAmount,
  currency: 'INR',
  items: [{
    item_id: serviceId,
    item_name: serviceName,
  }],
});

// After successful payment
await analyticsService.logPurchase({
  value: totalAmount,
  currency: 'INR',
  transaction_id: orderId,
  items: [{
    item_id: serviceId,
    item_name: serviceName,
    item_category: category,
    price: price,
    quantity: 1,
  }],
});
```

### Track Button/Content Selection

```typescript
// Track when user taps on a category
await analyticsService.logSelectContent('category', categoryId);

// Track when user taps on a banner
await analyticsService.logSelectContent('banner', bannerId);
```

---

## 🎯 Recommended Tracking Points

### HomeScreen.tsx
```typescript
// Track when user taps on category
const handleCategoryPress = async (categoryId: string) => {
  await analyticsService.logEvent('select_category', {
    category_id: categoryId,
    category_name: categoryName,
  });
  // Navigate...
};

// Track when user taps on banner
const handleBannerPress = async (bannerId: string) => {
  await analyticsService.logEvent('select_banner', {
    banner_id: bannerId,
    banner_title: bannerTitle,
  });
  // Navigate...
};
```

### ServicesListingScreen.tsx
```typescript
// Track when user views services
useEffect(() => {
  analyticsService.logEvent('view_services_list', {
    category: category,
    area: selectedArea,
  });
}, []);

// Track when user selects a service
const handleServiceSelect = async (service: Service) => {
  await analyticsService.logViewItem({
    item_id: service.id,
    item_name: service.name,
    item_category: category,
    price: service.price,
  });
  // Navigate...
};
```

### CheckoutScreen.tsx
```typescript
// On screen mount
useEffect(() => {
  analyticsService.logBeginCheckout({
    value: totalAmount,
    currency: 'INR',
    items: [{
      item_id: serviceId,
      item_name: serviceName,
    }],
  });
}, []);

// After successful payment
const handlePaymentSuccess = async (orderId: string) => {
  await analyticsService.logPurchase({
    value: totalAmount,
    currency: 'INR',
    transaction_id: orderId,
    items: bookingItems,
  });
  // Navigate...
};
```

---

## 📊 Viewing Analytics Data

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **baihub-app-rn**
3. Navigate to **Analytics** > **Dashboard**
4. View real-time events in **Analytics** > **DebugView** (see below)

### Enable Debug Mode

For development, enable debug mode to see events in real-time:

```bash
# Enable debug mode
adb shell setprop debug.firebase.analytics.app com.baihub.app

# View verbose logs
adb shell setprop log.tag.FA VERBOSE

# View logs in real-time
adb logcat -s FA:V RNFB:V ReactNativeJS:I
```

### Disable Debug Mode

```bash
# Disable debug mode
adb shell setprop debug.firebase.analytics.app .none.
```

---

## 🔍 Event Naming Best Practices

1. **Use snake_case**: `view_service`, not `viewService`
2. **Be descriptive**: `select_premium_plan`, not `click`
3. **Keep consistent**: Use same parameter names across events
4. **Don't include PII**: Never log passwords, emails, phone numbers, etc.

---

## 📈 Key Metrics to Track

### User Engagement
- Screen views (automatic)
- App open events
- Session duration (automatic)
- User retention (automatic)

### Business Metrics
- Service views
- Service selections
- Checkout starts
- Purchase completions
- Revenue (from purchase events)

### User Behavior
- Search queries
- Category preferences
- Area selections
- Plan selections
- Payment success/failure rates

---

## 🔐 Privacy & GDPR Compliance

If you need to disable analytics for users who opt-out:

```typescript
// Disable analytics
await analyticsService.setAnalyticsCollectionEnabled(false);

// Enable analytics
await analyticsService.setAnalyticsCollectionEnabled(true);
```

---

## ✅ Verification

Firebase Analytics is **confirmed working** based on these log entries:

```
FA: App measurement initialized, version: 145001
FA: To enable debug logging run: adb shell setprop log.tag.FA VERBOSE
FA: Tag Manager is not found and thus will not be used
Analytics "App open logged"
```

---

## 📚 Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [React Native Firebase Docs](https://rnfirebase.io/analytics/usage)
- [Google Analytics Events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Firebase Console](https://console.firebase.google.com/)

---

## 🎉 You're All Set!

Firebase Analytics is now integrated and tracking events. Start adding tracking to your key user flows and watch your analytics data come in!

For questions or issues, refer to the React Native Firebase documentation or check the logs.









