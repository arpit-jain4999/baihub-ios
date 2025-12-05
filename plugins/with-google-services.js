const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to copy Firebase config files during prebuild
 * - google-services.json → android/app/
 * - GoogleService-Info.plist → ios/[project-name]/
 * 
 * This ensures the files persist across prebuild --clean operations
 * and works even if @react-native-firebase/app plugin doesn't handle it automatically
 */
const withGoogleServices = (config) => {
  // Handle Android: Copy google-services.json
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidAppPath = config.modRequest.platformProjectRoot;
      const sourceFile = path.join(projectRoot, 'google-services.json');
      const targetFile = path.join(androidAppPath, 'app', 'google-services.json');

      // Check if source file exists
      if (!fs.existsSync(sourceFile)) {
        console.warn(
          '⚠️  google-services.json not found in project root. Skipping Android copy.'
        );
        return config;
      }

      // Ensure target directory exists
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy the file
      fs.copyFileSync(sourceFile, targetFile);
      console.log('✅ Copied google-services.json to android/app/');

      return config;
    },
  ]);

  // Handle iOS: Copy GoogleService-Info.plist
  config = withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const iosProjectPath = modConfig.modRequest.platformProjectRoot;
      const sourceFile = path.join(projectRoot, 'GoogleService-Info.plist');
      
      // Get expo config safely - it might be in different places depending on context
      const expoConfig = modConfig.expo || config.expo || {};
      
      // Find the iOS project folder (usually matches slug without dashes)
      // Try common patterns: slug without dashes, bundle ID last part, or 'baihubmobile'
      const slug = expoConfig.slug || 'baihub-mobile';
      const bundleId = expoConfig.ios?.bundleIdentifier || 'com.baihub.app';
      
      let projectName = slug.replace(/-/g, '') || 
                       bundleId.split('.').pop() || 
                       'baihubmobile';
      
      // Check if the folder exists, if not try alternative names
      const possibleNames = [
        projectName,
        'baihubmobile', // Known folder name
        slug.replace(/-/g, ''),
      ].filter(Boolean);
      
      let targetFile = null;
      for (const name of possibleNames) {
        const testPath = path.join(iosProjectPath, name);
        if (fs.existsSync(testPath)) {
          projectName = name;
          targetFile = path.join(testPath, 'GoogleService-Info.plist');
          break;
        }
      }
      
      // If no folder found, use the first possible name (will be created during prebuild)
      if (!targetFile) {
        projectName = possibleNames[0] || 'baihubmobile';
        targetFile = path.join(iosProjectPath, projectName, 'GoogleService-Info.plist');
      }

      // Check if source file exists
      if (!fs.existsSync(sourceFile)) {
        console.warn(
          '⚠️  GoogleService-Info.plist not found in project root. Skipping iOS copy.'
        );
        return config;
      }

      // Ensure target directory exists
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy the file
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✅ Copied GoogleService-Info.plist to ios/${projectName}/`);

      return modConfig;
    },
  ]);

  return config;
};

module.exports = withGoogleServices;

