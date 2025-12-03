const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to copy google-services.json to android/app/ during prebuild
 * This ensures the file persists across prebuild --clean operations
 */
const withGoogleServices = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const sourceFile = path.join(config.modRequest.projectRoot, 'google-services.json');
      const targetFile = path.join(projectRoot, 'app', 'google-services.json');

      // Check if source file exists
      if (!fs.existsSync(sourceFile)) {
        console.warn(
          '⚠️  google-services.json not found in project root. Skipping copy.'
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
};

module.exports = withGoogleServices;

