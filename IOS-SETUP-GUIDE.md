# iOS Testing Setup Guide for BaiHub Mobile

## Prerequisites Status
✅ macOS 15.3.1  
✅ Xcode installed at `/Applications/Xcode.app`  
✅ CocoaPods 1.16.2 installed  
⚠️  Xcode command line tools need configuration

---

## Step 1: Configure Xcode Command Line Tools (Required)

Run this command in your terminal:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Then verify:
```bash
xcodebuild -version
```

You should see Xcode version information.

---

## Step 2: Accept Xcode License (Required)

```bash
sudo xcodebuild -license accept
```

---

## Step 3: Check iOS Simulators

Open Xcode and go to:
```
Xcode → Settings → Platforms → iOS
```

Download iOS simulators if not already installed (recommended: iOS 17+).

Or via command line:
```bash
xcodebuild -downloadPlatform iOS
```

---

## Step 4: Add iOS Configuration to app.config.js

Open `app.config.js` and ensure the iOS section is configured:

```javascript
ios: {
  bundleIdentifier: 'com.baihub.app',
  supportsTablet: true,
  infoPlist: {
    NSLocationWhenInUseUsageDescription: 'This app needs access to your location to automatically detect your city.',
    NSLocationAlwaysUsageDescription: 'This app needs access to your location to automatically detect your city.',
  },
  googleServicesFile: './GoogleService-Info.plist',  // Add this for Firebase
},
```

---

## Step 5: Get Firebase iOS Configuration

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your **BaiHub project**
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click **Add app** → Select **iOS**
6. Enter iOS bundle ID: `com.baihub.app`
7. Download `GoogleService-Info.plist`
8. Save it to: `/Users/aj/code/baihub-mobile/GoogleService-Info.plist`

---

## Step 6: Update app.config.js with iOS Firebase

Add the `googleServicesFile` path in the iOS section:

```javascript
module.exports = {
  expo: {
    // ... existing config
    ios: {
      bundleIdentifier: 'com.baihub.app',
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'This app needs access to your location to automatically detect your city.',
        NSLocationAlwaysUsageDescription: 'This app needs access to your location to automatically detect your city.',
      },
      googleServicesFile: './GoogleService-Info.plist',  // Add this
    },
    // ... rest of config
  }
};
```

---

## Step 7: Generate iOS Native Project

From your project directory:

```bash
cd /Users/aj/code/baihub-mobile
npx expo prebuild --platform ios --clean
```

This will create the `ios/` directory with all necessary files.

---

## Step 8: Install iOS Dependencies (CocoaPods)

```bash
cd ios
pod install
cd ..
```

This installs all iOS native dependencies including Firebase.

---

## Step 9: Build and Run on iOS Simulator

Option A: Using Expo CLI (Recommended):
```bash
npx expo run:ios
```

Option B: Using Xcode (for debugging):
```bash
open ios/baihubmobile.xcworkspace
```
Then press ▶️ Run button in Xcode.

---

## Step 10: Enable Firebase DebugView for iOS

Once the app is running, enable DebugView:

```bash
# Find your simulator device ID
xcrun simctl list devices | grep Booted

# Enable DebugView (replace DEVICE_ID with actual ID)
xcrun simctl spawn booted log config --mode "level:debug" --subsystem com.google.firebase.analytics
```

Or add to Xcode scheme:
1. Product → Scheme → Edit Scheme
2. Run → Arguments
3. Add argument: `-FIRDebugEnabled`

---

## Quick Command Summary

Once everything is set up, use these commands:

### First Time Setup:
```bash
# 1. Configure Xcode
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 2. Accept license
sudo xcodebuild -license accept

# 3. Generate iOS project
cd /Users/aj/code/baihub-mobile
npx expo prebuild --platform ios --clean

# 4. Install dependencies
cd ios && pod install && cd ..

# 5. Run on simulator
npx expo run:ios
```

### Subsequent Runs:
```bash
cd /Users/aj/code/baihub-mobile
npx expo run:ios
```

---

## Testing Analytics on iOS

1. **Open Firebase Console** → DebugView
2. **Run your app** on iOS simulator
3. **Navigate through app** and trigger events
4. **Check DebugView** for real-time events

Your custom events should appear immediately:
- `app_open`
- `area_card_clicked`
- `area_selected`
- `pay_now_clicked`
- etc.

---

## Troubleshooting

### Issue: "Command line tools not found"
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
xcodebuild -runFirstLaunch
```

### Issue: "No simulators available"
Open Xcode → Settings → Platforms → Download iOS platform

### Issue: "CocoaPods error"
```bash
cd ios
pod repo update
pod install --repo-update
cd ..
```

### Issue: "Firebase not initialized"
1. Verify `GoogleService-Info.plist` exists in project root
2. Check `app.config.js` has `googleServicesFile` configured
3. Re-run `npx expo prebuild --platform ios --clean`

### Issue: "Module not found"
```bash
# Clean and rebuild
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install && cd ..
npx expo run:ios --no-build-cache
```

---

## iOS vs Android Differences

| Feature | Android | iOS |
|---------|---------|-----|
| **Config File** | `google-services.json` | `GoogleService-Info.plist` |
| **Bundle ID** | `com.baihub.app` | `com.baihub.app` |
| **Package Manager** | Gradle | CocoaPods |
| **Build Output** | APK/AAB | IPA |
| **Simulator** | Android Emulator | iOS Simulator |
| **Analytics Delay** | 24-48h (same) | 24-48h (same) |
| **DebugView** | `adb setprop` | Xcode scheme arg |

---

## Current Status

✅ Environment ready (macOS, CocoaPods)  
⏳ Need to configure Xcode command line tools  
⏳ Need to download GoogleService-Info.plist from Firebase  
⏳ Need to generate iOS project  
⏳ Need to install iOS dependencies  
⏳ Ready to test on iOS simulator

---

## Next Steps

1. **Run Step 1** to configure Xcode
2. **Run Step 5** to get Firebase iOS config
3. **Run Steps 6-9** to build and run
4. **Test your app** on iOS simulator

Let me know when you complete Step 1 and 5, and I'll help you with the rest!

