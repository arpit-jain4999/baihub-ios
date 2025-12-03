# Building Standalone APK - Guide

## Problem
The app is trying to connect to Metro bundler over WiFi, which fails when building a shareable APK. We need a standalone APK with all JavaScript bundled.

## Solution: Build Production APK

### Option 1: Using EAS Build (Recommended - Cloud Build)

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure EAS Build**:
```bash
eas build:configure
```

4. **Build APK for Android**:
```bash
eas build --platform android --profile production
```

This will:
- Build the APK in the cloud
- Bundle all JavaScript code
- Create a standalone APK that doesn't need Metro
- Provide a download link

### Option 2: Local Build (Alternative)

1. **Build the bundle first**:
```bash
cd /Users/aj/code/baihub-mobile
npx expo export --platform android
```

2. **Build the APK**:
```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Option 3: Using Expo CLI (Simplest)

1. **Build APK directly**:
```bash
npx expo build:android -t apk
```

Note: This requires Expo account and may have limitations.

## Quick Fix: Update Build Script

Add this to `package.json`:

```json
{
  "scripts": {
    "build:apk": "cd android && ./gradlew assembleRelease",
    "build:bundle": "npx expo export --platform android",
    "build:full": "npm run build:bundle && npm run build:apk"
  }
}
```

## Important Notes

1. **API Base URL**: Make sure `API_BASE_URL` in `app.config.js` points to your production server, not localhost
2. **Environment**: Set `ENVIRONMENT=production` in your build
3. **Metro Config**: The current metro config should work fine for production builds
4. **Bundle Size**: The APK will include all JavaScript code, so it will be larger than dev builds

## Troubleshooting

### If build fails with Metro errors:
- Make sure you're building release variant: `--variant release`
- Check that `bundleCommand = "export:embed"` is set in `android/app/build.gradle`
- Ensure no dev-only code is running

### If APK still tries to connect to Metro:
- Check `app.config.js` - ensure no dev URLs
- Verify `ENVIRONMENT` is set to `production`
- Rebuild from scratch: `cd android && ./gradlew clean && ./gradlew assembleRelease`

## APK Location After Build

- **EAS Build**: Download from Expo dashboard
- **Local Build**: `android/app/build/outputs/apk/release/app-release.apk`
- **Gradle Build**: `android/app/build/outputs/apk/release/app-release.apk`


