#!/bin/bash

echo "=========================================="
echo "BaiHub API Connectivity Test"
echo "=========================================="
echo ""

# Test 1: Basic connectivity
echo "Test 1: Checking if API is reachable..."
if curl -s -I https://api.baihub.com | head -1; then
    echo "✓ Server is ONLINE"
else
    echo "✗ Server is OFFLINE or unreachable"
fi
echo ""

# Test 2: Full response
echo "Test 2: Testing API response..."
curl -s -I -H "User-Agent: BaiHub-Mobile/1.0" \
     -H "Accept: application/json" \
     https://api.baihub.com | head -10
echo ""

# Test 3: Check if device is connected
echo "Test 3: Checking connected devices..."
adb devices
echo ""

# Test 4: Install APK option
echo "=========================================="
echo "To install APK on connected device:"
echo "  adb install -r BaiHub-v1.0-universal.apk"
echo ""
echo "To view app logs in real-time:"
echo "  adb logcat | grep -E 'ReactNativeJS|okhttp|network|ApiClient'"
echo ""
echo "To test a specific API endpoint:"
echo "  curl -X POST https://api.baihub.com/auth/otp \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'User-Agent: BaiHub-Mobile/1.0' \\"
echo "    -d '{\"phoneNumber\":\"+911234567890\"}'"
echo "=========================================="











