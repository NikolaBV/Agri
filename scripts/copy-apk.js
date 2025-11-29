/**
 * Helper script to copy the built APK to the apk folder
 * Usage: node scripts/copy-apk.js
 */

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const destPath = path.join(__dirname, '..', 'apk', 'app-release.apk');
const destDir = path.join(__dirname, '..', 'apk');

// Check if source file exists
if (!fs.existsSync(sourcePath)) {
  console.error('❌ APK not found at:', sourcePath);
  console.error('   Make sure you have built the APK first with:');
  console.error('   cd android && gradlew.bat assembleRelease (Windows)');
  console.error('   cd android && ./gradlew assembleRelease (macOS/Linux)');
  process.exit(1);
}

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(sourcePath, destPath);
  const stats = fs.statSync(destPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ APK copied successfully!');
  console.log(`   From: ${sourcePath}`);
  console.log(`   To: ${destPath}`);
  console.log(`   Size: ${fileSizeInMB} MB`);
  
  if (stats.size > 60 * 1024 * 1024) {
    console.warn('⚠️  Warning: APK size exceeds 60 MB limit!');
  }
} catch (error) {
  console.error('❌ Error copying APK:', error.message);
  process.exit(1);
}


