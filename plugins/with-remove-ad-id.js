const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to remove AD_ID permission from AndroidManifest.xml
 * This ensures the app doesn't declare advertising ID usage even if dependencies add it
 */
const withRemoveAdId = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest) {
      return config;
    }

    // Find all uses-permission elements
    if (manifest['uses-permission']) {
      // Filter out the AD_ID permission
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (permission) => {
          const name = permission.$?.['android:name'];
          return name !== 'com.google.android.gms.permission.AD_ID';
        }
      );
    }

    // Also check for uses-permission-sdk-23 (for Android 13+)
    if (manifest['uses-permission-sdk-23']) {
      manifest['uses-permission-sdk-23'] = manifest['uses-permission-sdk-23'].filter(
        (permission) => {
          const name = permission.$?.['android:name'];
          return name !== 'com.google.android.gms.permission.AD_ID';
        }
      );
    }

    return config;
  });
};

module.exports = withRemoveAdId;

