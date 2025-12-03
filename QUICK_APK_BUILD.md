# Quick APK Build Guide

## Problem
Metro bundler error - app trying to connect over WiFi. Need standalone APK.

## Solution: Build Release APK

### Method 1: Using npm script (Easiest)

```bash
cd /Users/aj/code/baihub-mobile
npm run build:apk
```

This will:
1. Export and bundle all JavaScript code
2. Build the release APK
3. Output: `android/app/build/outputs/apk/release/app-release.apk`

### Method 2: Manual Steps

1. **Export the bundle**:
```bash
cd /Users/aj/code/baihub-mobile
npx expo export --platform android
```

2. **Build the APK**:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

3. **Find your APK**:
```bash
# APK location
android/app/build/outputs/apk/release/app-release.apk
```

### Method 3: Using Expo Run (Alternative)

```bash
cd /Users/aj/code/baihub-mobile
npx expo run:android --variant release
```

## Important: Check API URL

Before building, make sure your `app.config.js` has the production API URL:

```javascript
extra: {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.baihub.co.in', // ✅ Production URL
  // NOT: 'http://localhost:8000' ❌
}
```

## After Build

1. **APK Location**: `android/app/build/outputs/apk/release/app-release.apk`
2. **Share**: Upload to Google Drive, email, or any file sharing service
3. **Install**: Users need to enable "Install from Unknown Sources" on Android

## Troubleshooting

### If build fails:
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### If APK still tries to connect to Metro:
- Check `app.config.js` - ensure no localhost URLs
- Rebuild: `npm run build:apk`
- Check network permissions in AndroidManifest.xml

### If you get signing errors:
The debug keystore is used by default. For production, you'll need to create a release keystore (see Android docs).

## File Size
The standalone APK will be larger (typically 30-50MB) because it includes all JavaScript code bundled.


