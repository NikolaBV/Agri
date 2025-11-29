const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to enable cleartext traffic for Android
 * This is needed for HTTP connections in Android 9+ (API 28+)
 * This plugin:
 * 1. Creates network_security_config.xml to allow cleartext traffic
 * 2. Sets android:usesCleartextTraffic="true" in AndroidManifest.xml
 * 3. References the network security config in AndroidManifest.xml
 */
const withAndroidCleartextTraffic = (config) => {
  // Step 1: Create network_security_config.xml file
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );

      // Create xml directory if it doesn't exist
      if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, { recursive: true });
      }

      const networkSecurityConfigPath = path.join(resPath, 'network_security_config.xml');
      
      // Create network_security_config.xml with cleartext traffic allowed
      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.196</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
</network-security-config>`;

      fs.writeFileSync(networkSecurityConfigPath, networkSecurityConfig, 'utf8');
      console.log('✅ Created network_security_config.xml');

      return config;
    },
  ]);

  // Step 2: Ensure INTERNET permission is added (should be default, but just in case)
  config = AndroidConfig.Permissions.withPermissions(config, ['android.permission.INTERNET']);

  // Step 3: Modify AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const { application } = androidManifest;

    if (!application || !application[0]) {
      console.warn('⚠️ Could not find application element in AndroidManifest');
      return config;
    }

    const applicationElement = application[0];

    // Ensure $ object exists
    if (!applicationElement.$) {
      applicationElement.$ = {};
    }

    // Set usesCleartextTraffic to true
    applicationElement.$['android:usesCleartextTraffic'] = 'true';
    
    // Reference network security config
    applicationElement.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    
    console.log('✅ Set android:usesCleartextTraffic="true" and networkSecurityConfig in AndroidManifest');

    return config;
  });

  return config;
};

module.exports = withAndroidCleartextTraffic;

