#!/bin/bash

# iOS Setup and Build Script for BaiHub Mobile
# This script sets up and builds the iOS app for testing

set -e

echo "🍎 BaiHub iOS Setup Script"
echo "============================"
echo ""

# Check if on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script must be run on macOS"
    exit 1
fi

# Step 1: Check Xcode
echo "Step 1: Checking Xcode..."
if ! xcodebuild -version &>/dev/null; then
    echo "⚠️  Xcode command line tools not configured properly"
    echo ""
    echo "Please run:"
    echo "  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    echo "  sudo xcodebuild -license accept"
    echo ""
    echo "Then run this script again."
    exit 1
fi

XCODE_VERSION=$(xcodebuild -version | head -1)
echo "✅ $XCODE_VERSION found"
echo ""

# Step 2: Check CocoaPods
echo "Step 2: Checking CocoaPods..."
if ! pod --version &>/dev/null; then
    echo "⚠️  CocoaPods not found. Installing..."
    sudo gem install cocoapods
fi
POD_VERSION=$(pod --version)
echo "✅ CocoaPods $POD_VERSION"
echo ""

# Step 3: Check Firebase iOS config
echo "Step 3: Checking Firebase configuration..."
if [ ! -f "GoogleService-Info.plist" ]; then
    echo "⚠️  GoogleService-Info.plist not found!"
    echo ""
    echo "📥 Please download it from Firebase:"
    echo "   1. Go to: https://console.firebase.google.com/"
    echo "   2. Select your BaiHub project"
    echo "   3. Project Settings → Your apps"
    echo "   4. Click iOS app (or add one if not exists)"
    echo "   5. Bundle ID: com.baihub.app"
    echo "   6. Download GoogleService-Info.plist"
    echo "   7. Save it to: $(pwd)/GoogleService-Info.plist"
    echo ""
    read -p "Press Enter after downloading GoogleService-Info.plist..."
    
    if [ ! -f "GoogleService-Info.plist" ]; then
        echo "❌ GoogleService-Info.plist still not found. Exiting."
        exit 1
    fi
fi
echo "✅ GoogleService-Info.plist found"
echo ""

# Step 4: Clean previous builds
echo "Step 4: Cleaning previous builds..."
if [ -d "ios" ]; then
    echo "Removing old iOS directory..."
    rm -rf ios
fi
echo "✅ Cleaned"
echo ""

# Step 5: Generate iOS project
echo "Step 5: Generating iOS native project..."
echo "⏱️  This may take 2-3 minutes..."
npx expo prebuild --platform ios --clean

if [ ! -d "ios" ]; then
    echo "❌ Failed to generate iOS project"
    exit 1
fi
echo "✅ iOS project generated"
echo ""

# Step 6: Install CocoaPods dependencies
echo "Step 6: Installing iOS dependencies..."
echo "⏱️  This may take 3-5 minutes..."
cd ios
pod install
cd ..
echo "✅ Dependencies installed"
echo ""

# Step 7: Check simulators
echo "Step 7: Checking iOS simulators..."
SIMULATORS=$(xcrun simctl list devices available | grep "iPhone" | head -5)
if [ -z "$SIMULATORS" ]; then
    echo "⚠️  No iPhone simulators found"
    echo "Please open Xcode and download iOS simulators:"
    echo "  Xcode → Settings → Platforms → iOS"
else
    echo "✅ Available simulators:"
    echo "$SIMULATORS" | head -3
fi
echo ""

# Success!
echo "🎉 iOS Setup Complete!"
echo ""
echo "📱 Next Steps:"
echo "=============="
echo ""
echo "To build and run on iOS simulator:"
echo "  npx expo run:ios"
echo ""
echo "To open in Xcode for debugging:"
echo "  open ios/baihubmobile.xcworkspace"
echo ""
echo "To enable Firebase DebugView, add to Xcode scheme:"
echo "  Product → Scheme → Edit Scheme → Run → Arguments"
echo "  Add: -FIRDebugEnabled"
echo ""
echo "📚 See IOS-SETUP-GUIDE.md for detailed instructions"

