#!/bin/bash

# Production APK Build Script (Optimized with ABI Splits)
# This script builds standalone production APKs with bundled assets
# Package: com.baihub.app
# 
# Optimizations:
# - ABI splits (separate APKs per architecture)
# - R8 code shrinking (~66% size reduction)
# - Resource shrinking
#
# Output: 4 APKs (arm64-v8a, armeabi-v7a, x86, x86_64)

set -e

echo "🚀 Starting Optimized Production APK Build..."
echo ""

# Set JAVA_HOME and ANDROID_HOME
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"

echo "✅ Environment configured"
echo "   JAVA_HOME: $JAVA_HOME"
echo "   ANDROID_HOME: $ANDROID_HOME"
echo ""

# Clean build directories
echo "🧹 Cleaning build cache..."
rm -rf android/app/build android/app/.cxx android/build

# Build optimized APKs
echo ""
echo "🔨 Building optimized APKs with ABI splits..."
echo "⏱️  This will take approximately 5-10 minutes..."
echo ""
cd android
./gradlew app:assembleRelease --no-daemon
cd ..

# Verify and display results
echo ""
echo "📊 Build Results:"
echo "================================"
echo ""

VERSION=$(grep "versionName" android/app/build.gradle | head -1 | cut -d'"' -f2)

if [ -f "android/app/build/outputs/apk/release/app-arm64-v8a-release.apk" ]; then
    echo "✅ Optimized APKs built successfully!"
    echo ""
    echo "📱 APK Files (ABI Split):"
    echo ""
    
    for apk in android/app/build/outputs/apk/release/app-*.apk; do
        if [ -f "$apk" ]; then
            SIZE=$(du -h "$apk" | cut -f1)
            ARCH=$(basename "$apk" | sed 's/app-//' | sed 's/-release.apk//')
            
            case $ARCH in
                "arm64-v8a")
                    DESC="Modern phones (2017+) - RECOMMENDED"
                    # Copy recommended APK to root
                    cp "$apk" "./baihub-production-v${VERSION}-arm64-v8a.apk"
                    ;;
                "armeabi-v7a")
                    DESC="Older ARM devices"
                    ;;
                "x86_64")
                    DESC="Emulators (64-bit)"
                    ;;
                "x86")
                    DESC="Emulators (32-bit)"
                    ;;
            esac
            
            printf "  %-15s: %4s  (%s)\n" "$ARCH" "$SIZE" "$DESC"
        fi
    done
    
    echo ""
    echo "💡 Size Reduction: ~66% (from 77 MB to 21-27 MB per architecture)"
    echo ""
    echo "📦 Recommended for distribution:"
    echo "   ./baihub-production-v${VERSION}-arm64-v8a.apk"
    echo ""
    echo "📚 See APK-SIZE-OPTIMIZATION-SUMMARY.md for details"
    echo ""
    echo "🎉 Ready for deployment!"
else
    echo "❌ APK build failed - APKs not found"
    exit 1
fi

