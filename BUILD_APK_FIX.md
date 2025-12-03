# Fix Metro Build Error - Build Standalone APK

## The Problem
- Metro bundler error: "same wifi" connection issue
- App trying to connect to development server
- Need standalone APK that works without Metro

## The Solution

### Step 1: Update API URL in app.config.js

Make sure your production API URL is set:

```javascript
// app.config.js
extra: {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.baihub.co.in', // ✅ Production
  // NOT: 'http://localhost:8000' or 'http://10.0.2.2:3000' ❌
}
```

### Step 2: Build the Standalone APK

Run this command:

```bash
cd /Users/aj/code/baihub-mobile
npm run build:apk
```

This will:
1. Export and bundle all JavaScript code (no Metro needed)
2. Build release APK with all code embedded
3. Create standalone APK at: `android/app/build/outputs/apk/release/app-release.apk`

### Step 3: Find Your APK

```bash
# The APK will be here:
android/app/build/outputs/apk/release/app-release.apk
```

## Alternative: Manual Build

If the npm script doesn't work:

```bash
# 1. Export bundle
npx expo export --platform android

# 2. Build APK
cd android
./gradlew clean
./gradlew assembleRelease

# 3. APK location
# android/app/build/outputs/apk/release/app-release.apk
```

## Why This Works

- `expo export` bundles all JavaScript into the app
- `assembleRelease` creates a production APK
- No Metro connection needed - everything is embedded
- Works on any device without WiFi connection to dev server

## Important Notes

1. **API URL**: Must be production URL, not localhost
2. **File Size**: APK will be 30-50MB (includes all JS code)
3. **Signing**: Uses debug keystore by default (fine for testing)
4. **Sharing**: Upload APK to Google Drive/Dropbox for sharing

## Troubleshooting

### If build fails:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### If APK still tries Metro:
- Check `app.config.js` has production API URL
- Rebuild: `npm run build:apk`
- Make sure you're building `release` variant, not `debug`

### If you see "Metro bundler" errors:
- You're building debug variant - use `assembleRelease` instead
- Make sure `bundleCommand = "export:embed"` in `android/app/build.gradle` (already set)

## Quick Command Reference

```bash
# Build standalone APK (recommended)
npm run build:apk

# Or step by step
npm run build:bundle    # Export JS bundle
npm run android:apk     # Build APK

# Find APK
ls -lh android/app/build/outputs/apk/release/app-release.apk
```


