const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Expo config plugin to remove AD_ID permission from AndroidManifest.xml
 * This ensures the app doesn't declare advertising ID usage even if dependencies add it
 * 
 * This plugin MUST run AFTER all other plugins (especially Firebase plugins)
 * to ensure it removes the permission after dependencies add it.
 */
const withRemoveAdId = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest) {
      return config;
    }

    const AD_ID_PERMISSION = 'com.google.android.gms.permission.AD_ID';

    // Remove from uses-permission array
    if (manifest['uses-permission']) {
      const permissions = Array.isArray(manifest['uses-permission']) 
        ? manifest['uses-permission'] 
        : [manifest['uses-permission']];
      
      manifest['uses-permission'] = permissions.filter((permission) => {
        const name = permission.$?.['android:name'] || permission.$?.['android:name'];
        const shouldKeep = name !== AD_ID_PERMISSION;
        if (!shouldKeep) {
          console.log('✅ Removed AD_ID permission from uses-permission');
        }
        return shouldKeep;
      });
    }

    // Remove from uses-permission-sdk-23 array (for Android 13+)
    if (manifest['uses-permission-sdk-23']) {
      const permissions = Array.isArray(manifest['uses-permission-sdk-23']) 
        ? manifest['uses-permission-sdk-23'] 
        : [manifest['uses-permission-sdk-23']];
      
      manifest['uses-permission-sdk-23'] = permissions.filter((permission) => {
        const name = permission.$?.['android:name'] || permission.$?.['android:name'];
        const shouldKeep = name !== AD_ID_PERMISSION;
        if (!shouldKeep) {
          console.log('✅ Removed AD_ID permission from uses-permission-sdk-23');
        }
        return shouldKeep;
      });
    }

    // Also ensure it's not in the application tag
    if (manifest.application && manifest.application[0]) {
      const application = manifest.application[0];
      if (application['uses-permission']) {
        const permissions = Array.isArray(application['uses-permission']) 
          ? application['uses-permission'] 
          : [application['uses-permission']];
        
        application['uses-permission'] = permissions.filter((permission) => {
          const name = permission.$?.['android:name'] || permission.$?.['android:name'];
          return name !== AD_ID_PERMISSION;
        });
      }
    }

    return config;
  });
};

module.exports = withRemoveAdId;

