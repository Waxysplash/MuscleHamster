/**
 * Config plugin to fix React Native Firebase build issues with Expo SDK 54 + New Architecture
 *
 * Problem: Crashlytics and Analytics Swift pods don't define modules, causing build failures
 * when using New Architecture with modular headers.
 *
 * Solution: Set CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES
 * specifically for RNFBApp and RNFBCrashlytics targets.
 *
 * Reference:
 * - https://github.com/invertase/react-native-firebase/issues/8657
 * - https://github.com/expo/expo/issues/39607
 */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FIREBASE_FIX_CODE = `
  # Fix for React Native Firebase + New Architecture (Expo SDK 54)
  # Apply non-modular header fix specifically to Firebase pods
  installer.pods_project.targets.each do |target|
    if ['RNFBApp', 'RNFBCrashlytics', 'RNFBAuth', 'RNFBAnalytics'].include?(target.name)
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
  end
`;

function withFirebaseFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      // Check if Podfile exists
      if (!fs.existsSync(podfilePath)) {
        console.log('[withFirebaseFix] Podfile not found, skipping...');
        return config;
      }

      let podfileContents = fs.readFileSync(podfilePath, 'utf-8');

      // Check if the fix is already applied
      if (podfileContents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
        console.log('[withFirebaseFix] Fix already applied, skipping...');
        return config;
      }

      // Strategy: Find the post_install block and insert before its closing 'end'
      const lines = podfileContents.split('\n');
      let postInstallStartIndex = -1;
      let postInstallEndIndex = -1;
      let depth = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Find the start of post_install block
        if (line.match(/^\s*post_install\s+do\s+\|installer\|/)) {
          postInstallStartIndex = i;
          depth = 1;
          continue;
        }

        // If we're inside the post_install block, track nested blocks
        if (postInstallStartIndex !== -1 && depth > 0) {
          // Count 'do' keywords that start new blocks
          const doMatches = line.match(/\bdo\s*(\|[^|]*\|)?\s*$/g);
          if (doMatches) {
            depth += doMatches.length;
          }

          // Count closing 'end' keywords
          if (line.match(/^\s*end\s*$/)) {
            depth--;
            if (depth === 0) {
              postInstallEndIndex = i;
              break;
            }
          }
        }
      }

      if (postInstallStartIndex !== -1 && postInstallEndIndex !== -1) {
        // Insert our fix before the closing 'end'
        lines.splice(postInstallEndIndex, 0, FIREBASE_FIX_CODE);
        podfileContents = lines.join('\n');
        console.log('[withFirebaseFix] Successfully patched Podfile for Firebase targets');
      } else {
        console.warn('[withFirebaseFix] Could not find post_install block boundaries');
        return config;
      }

      fs.writeFileSync(podfilePath, podfileContents);
      return config;
    },
  ]);
}

module.exports = withFirebaseFix;
