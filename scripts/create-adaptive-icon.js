#!/usr/bin/env node

/**
 * Creates an Android adaptive icon with proper safe zone padding
 * Android adaptive icons crop the outer 17% on each side, so the safe zone is 66%
 * This script scales the icon to 66% and centers it on a 1024x1024 canvas
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available (better quality)
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  sharp not available, using sips (macOS only)');
}

const ICON_SIZE = 1024; // Standard adaptive icon size
const SAFE_ZONE_RATIO = 0.66; // 66% safe zone
const ICON_SCALE = ICON_SIZE * SAFE_ZONE_RATIO; // ~675px

const inputIcon = path.join(__dirname, '../assets/icon.png');
const outputAdaptiveIcon = path.join(__dirname, '../assets/adaptive-icon.png');

async function createAdaptiveIconWithSharp() {
  const icon = sharp(inputIcon);
  const metadata = await icon.metadata();
  
  // Resize icon to safe zone size (66% of canvas)
  const resizedIcon = icon.resize(Math.round(ICON_SCALE), Math.round(ICON_SCALE), {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
  });

  // Create 1024x1024 canvas with transparent background
  const canvas = sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  // Composite: center the resized icon on the canvas
  const offsetX = Math.round((ICON_SIZE - ICON_SCALE) / 2);
  const offsetY = Math.round((ICON_SIZE - ICON_SCALE) / 2);

  await canvas
    .composite([{
      input: await resizedIcon.toBuffer(),
      left: offsetX,
      top: offsetY
    }])
    .png()
    .toFile(outputAdaptiveIcon);

  console.log('✅ Created adaptive-icon.png with safe zone padding');
  console.log(`   Icon scaled to ${Math.round(ICON_SCALE)}px (66% of ${ICON_SIZE}px)`);
  console.log(`   Centered with ${offsetX}px padding on each side`);
}

async function createAdaptiveIconWithSips() {
  // macOS sips approach - create a temporary resized icon, then composite
  const tempResized = path.join(__dirname, '../assets/temp-icon-resized.png');
  
  // Resize icon to safe zone size
  const { execSync } = require('child_process');
  execSync(`sips -z ${Math.round(ICON_SCALE)} ${Math.round(ICON_SCALE)} "${inputIcon}" --out "${tempResized}"`);
  
  console.log('⚠️  sips compositing is limited. For best results, install sharp:');
  console.log('   npm install --save-dev sharp');
  console.log('');
  console.log('📝 Manual approach:');
  console.log(`   1. Open ${inputIcon} in an image editor`);
  console.log(`   2. Create a new 1024x1024 transparent canvas`);
  console.log(`   3. Resize the icon to ~675px (66% of 1024px)`);
  console.log(`   4. Center it on the canvas`);
  console.log(`   5. Save as ${outputAdaptiveIcon}`);
  
  // Clean up temp file
  if (fs.existsSync(tempResized)) {
    fs.unlinkSync(tempResized);
  }
}

async function main() {
  if (!fs.existsSync(inputIcon)) {
    console.error(`❌ Icon not found: ${inputIcon}`);
    process.exit(1);
  }

  if (sharp) {
    await createAdaptiveIconWithSharp();
  } else {
    await createAdaptiveIconWithSips();
  }
}

main().catch(console.error);

