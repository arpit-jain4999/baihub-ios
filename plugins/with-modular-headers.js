const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add use_modular_headers! to iOS Podfile
 * This is required for Firebase Swift pods to work correctly
 */
function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      // Podfile is in ios/ directory
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      console.log('🔧 with-modular-headers plugin: Checking Podfile at:', podfilePath);

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

        // Check if use_modular_headers! is already added
        if (!podfileContent.includes('use_modular_headers!')) {
          // Find the target block and add use_modular_headers! after use_expo_modules!
          // Match any target name (baihubmobile or whatever Expo generates)
          podfileContent = podfileContent.replace(
            /(target ['"][^'"]+['"] do\n\s+use_expo_modules!)/,
            `$1\n  use_modular_headers!`
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added use_modular_headers! to Podfile');
        } else {
          console.log('✅ use_modular_headers! already in Podfile');
        }

        // Add use_frameworks! :linkage => :static (common GitHub fix for "no such module Expo")
        if (!podfileContent.includes('use_frameworks! :linkage => :static')) {
          // Add after use_native_modules! and before use_react_native!
          podfileContent = podfileContent.replace(
            /(config = use_native_modules!\(config_command\))/,
            `$1\n\n  # Use static frameworks to fix "no such module Expo" error\n  use_frameworks! :linkage => :static`
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added use_frameworks! :linkage => :static to Podfile');
        } else {
          console.log('✅ use_frameworks! :linkage => :static already in Podfile');
        }

        // Also add the architecture fix in post_install
        if (!podfileContent.includes('EXCLUDED_ARCHS[sdk=iphonesimulator*]')) {
          // Find the post_install block and add architecture fix
          const postInstallFix = `
    # Fix for Apple Silicon - exclude x86_64 architecture
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'x86_64'
        config.build_settings['ONLY_ACTIVE_ARCH'] = 'YES'
      end
    end
    
    # Ensure all targets build for arm64 only on simulator
    installer.pods_project.build_configurations.each do |config|
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'x86_64'
    end`;

          podfileContent = podfileContent.replace(
            /post_install do \|installer\|\n    react_native_post_install\(/,
            `post_install do |installer|\n    react_native_post_install(`
          );

          // Add before the final 'end' of post_install
          podfileContent = podfileContent.replace(
            /(\n  end\n)(end\n*$)/,
            `${postInstallFix}\n  end\n$2`
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added architecture fix to Podfile');
        }

        // Add CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES fix for Firebase
        if (!podfileContent.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
          const firebaseFix = `
    # Fix for Firebase non-modular header includes
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end`;

          // Add after react_native_post_install
          podfileContent = podfileContent.replace(
            /(react_native_post_install\([^)]+\))/,
            `$1${firebaseFix}`
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES fix to Podfile');
        } else {
          console.log('✅ CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES already in Podfile');
        }
      }

      return config;
    },
  ]);
}

module.exports = withModularHeaders;

