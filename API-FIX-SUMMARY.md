# BaiHub Mobile - Network Error Fix

**Updated:** December 1, 2025 10:58 AM  
**API URL:** https://api.baihub.com

## ✅ What Was Fixed

### 1. Added Network Security Configuration
Created `android/app/src/main/res/xml/network_security_config.xml`:
- Allows HTTPS connections to api.baihub.com
- Properly configured SSL certificate trust
- Allows HTTP for local development (localhost, 172.20.10.12)

### 2. Updated AndroidManifest.xml
- Added `android:networkSecurityConfig="@xml/network_security_config"`
- Added `android:usesCleartextTraffic="true"` for development flexibility

### 3. Enhanced API Client Headers
Updated `src/api/client.ts`:
- Added `User-Agent: BaiHub-Mobile/1.0`
- Added `Accept: application/json`
- Kept `ngrok-skip-browser-warning` for compatibility

### 4. Rebuilt APK
- New API URL: `https://api.baihub.com`
- All optimizations enabled
- Fresh build completed

## 📊 API Server Status

Testing: `https://api.baihub.com`

```bash
curl -I https://api.baihub.com
# Response: HTTP 403 Forbidden
```

**What this means:**
- ✅ Server is ONLINE and reachable
- ✅ SSL/HTTPS is working
- ⚠️  Server is returning 403 (likely CORS or auth issue)

## 🔍 Possible Causes of 403

1. **CORS not configured** - Backend rejecting mobile app requests
2. **Authentication required** - API needs auth token for all endpoints
3. **Rate limiting** - Too many requests or IP blocked
4. **Server configuration** - Blocking requests without proper origin

## 🛠️ Backend CORS Fix Required

Your backend needs CORS enabled for mobile app requests.

### Express.js
```javascript
const cors = require('cors');

app.use(cors({
  origin: '*', // Allow all (for development)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'Accept'],
  credentials: true
}));
```

### NestJS
```typescript
app.enableCors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,User-Agent,Accept',
  credentials: true,
});
```

## 📱 Testing Instructions

### Step 1: Install Updated APK
```bash
# Connect your device
adb devices

# Install APK
cd ~/Desktop/BaiHub-APKs
adb install -r BaiHub-v1.0-universal.apk
```

### Step 2: Monitor App Logs
```bash
# Watch for network errors
adb logcat | grep -E "ReactNativeJS|okhttp|network|ApiClient|ERROR"
```

### Step 3: Test API from Device Browser
1. Open Chrome on your Android device
2. Go to: `https://api.baihub.com`
3. If browser works but app doesn't → CORS issue
4. If browser also fails → Server/network issue

## 🐛 Debugging Common Errors

### "Network Error"
- **Cause:** Cannot connect to server
- **Solution:** Check if `https://api.baihub.com` is accessible
- **Test:** `curl https://api.baihub.com`

### "403 Forbidden"  
- **Cause:** Server rejecting requests
- **Solution:** Enable CORS on backend
- **Test:** Check backend CORS configuration

### "Timeout"
- **Cause:** Server too slow or unreachable
- **Solution:** Increase timeout or optimize backend
- **Current timeout:** 30000ms (30 seconds)

### "SSL Error"
- **Cause:** Invalid SSL certificate
- **Solution:** Verify certificate is valid
- **Test:** `curl -I https://api.baihub.com`

## 📋 Quick Test Commands

```bash
# Test API connectivity
curl -I https://api.baihub.com

# Test with headers (like the app)
curl -H "User-Agent: BaiHub-Mobile/1.0" \
     -H "Accept: application/json" \
     https://api.baihub.com

# Test specific endpoint
curl -X POST https://api.baihub.com/auth/otp \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: BaiHub-Mobile/1.0' \
  -d '{"phoneNumber":"+911234567890"}'

# View app logs
adb logcat | grep -i "network\|api\|error"
```

## 🔧 Files Changed

1. **app.config.js**
   - `API_BASE_URL`: `https://api.baihub.com`

2. **android/app/src/main/res/xml/network_security_config.xml**
   - NEW: Network security configuration

3. **android/app/src/main/AndroidManifest.xml**
   - Added network security config
   - Enabled cleartext traffic

4. **src/api/client.ts**
   - Added User-Agent header
   - Added Accept header

## 📦 Updated APKs

All APKs rebuilt and ready on Desktop:

```
~/Desktop/BaiHub-APKs/
├── BaiHub-v1.0-universal.apk (58 MB)
├── BaiHub-v1.0-arm64.apk (23 MB)
└── BaiHub-v1.0-armv7.apk (18 MB)
```

## ⚡ Next Steps

1. **Enable CORS on your backend** (most important!)
2. Install the updated APK
3. Test the app
4. Check logcat for specific errors
5. Share the exact error message if still failing

## 🆘 If Still Not Working

Run these diagnostic commands and share output:

```bash
# 1. Check if API is reachable
curl -I https://api.baihub.com

# 2. Install and test
adb install -r BaiHub-v1.0-universal.apk

# 3. Watch logs while testing
adb logcat | grep -E "network|api|error" > app-logs.txt
```

## 💡 Backend Requirements

Your backend MUST:
- ✅ Be accessible from internet
- ✅ Have valid SSL certificate
- ✅ Have CORS enabled
- ✅ Accept custom headers (User-Agent, etc.)
- ✅ Handle OPTIONS preflight requests
- ✅ Return proper JSON responses

---

**Status:** APK rebuilt with all network fixes applied  
**Ready to test!** 🚀











