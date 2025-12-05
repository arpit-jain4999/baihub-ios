#!/usr/bin/env node

/**
 * Fixes Android adaptive icon by scaling content to fit within safe zone
 * Android adaptive icons crop outer 17% on each side (safe zone = 66%)
 * This script scales the icon to 66% and centers it on a 1024x1024 canvas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CANVAS_SIZE = 1024;
const SAFE_ZONE_RATIO = 0.66;
const ICON_SIZE = Math.round(CANVAS_SIZE * SAFE_ZONE_RATIO); // ~675px
const PADDING = Math.round((CANVAS_SIZE - ICON_SIZE) / 2); // ~174px on each side

// Read backgroundColor from app.config.js
const appConfigPath = path.join(__dirname, '../app.config.js');
const appConfig = require(appConfigPath);
const backgroundColor = appConfig.expo.android.adaptiveIcon.backgroundColor || '#ffffff';
// Convert hex to RGB (e.g., #ffcc00 -> (255, 204, 0))
const bgColorHex = backgroundColor.replace('#', '');
const bgR = parseInt(bgColorHex.substring(0, 2), 16);
const bgG = parseInt(bgColorHex.substring(2, 4), 16);
const bgB = parseInt(bgColorHex.substring(4, 6), 16);

const inputIcon = path.join(__dirname, '../assets/adaptive-icon.png');
const outputIcon = path.join(__dirname, '../assets/adaptive-icon-fixed.png');
const finalIcon = path.join(__dirname, '../assets/adaptive-icon.png');

console.log('🔧 Fixing Android adaptive icon...');
console.log(`   Canvas size: ${CANVAS_SIZE}x${CANVAS_SIZE}px`);
console.log(`   Safe zone: ${ICON_SIZE}x${ICON_SIZE}px (66%)`);
console.log(`   Padding: ${PADDING}px on each side`);
console.log(`   Background color: ${backgroundColor} (RGB: ${bgR}, ${bgG}, ${bgB})`);
console.log('');

// Check if input exists
if (!fs.existsSync(inputIcon)) {
  console.error(`❌ Icon not found: ${inputIcon}`);
  process.exit(1);
}

try {
  // Step 1: Resize the icon to safe zone size (66% of canvas)
  console.log('📐 Step 1: Resizing icon to safe zone size...');
  execSync(`sips -z ${ICON_SIZE} ${ICON_SIZE} "${inputIcon}" --out "${outputIcon}"`, { stdio: 'inherit' });
  
  // Step 2: Create a 1024x1024 canvas with white background (matching backgroundColor in app.config.js)
  console.log('🎨 Step 2: Creating canvas with padding...');
  
  // Create a temporary white canvas
  const tempCanvas = path.join(__dirname, '../assets/temp-canvas.png');
  execSync(`sips -z ${CANVAS_SIZE} ${CANVAS_SIZE} --setProperty format png --padToHeightWidth ${CANVAS_SIZE} ${CANVAS_SIZE} --padColor FFFFFF "${inputIcon}" --out "${tempCanvas}"`, { stdio: 'inherit' });
  
  // Step 3: Composite the resized icon onto the center of the canvas
  console.log('🔲 Step 3: Centering icon on canvas...');
  
  // Use sips to composite (this is a workaround - sips doesn't have great compositing)
  // Instead, we'll create a script that uses ImageMagick if available, or provide manual instructions
  
  // For now, let's try a different approach: create the icon with proper padding using sips
  // We'll resize to fit within safe zone and add padding
  
  // Actually, sips can't do compositing well. Let's use a Python script with PIL if available
  const pythonScript = `
from PIL import Image
import sys

# Open the icon
icon = Image.open("${inputIcon.replace(/\\/g, '/')}")
icon = icon.convert("RGBA")

# Resize to safe zone size
icon_resized = icon.resize((${ICON_SIZE}, ${ICON_SIZE}), Image.Resampling.LANCZOS)

# Create canvas with SOLID background color (no transparency)
canvas = Image.new("RGB", (${CANVAS_SIZE}, ${CANVAS_SIZE}), (${bgR}, ${bgG}, ${bgB}))

# Convert resized icon to RGB if it has transparency, then paste
if icon_resized.mode == 'RGBA':
    # Create a background for the icon itself with the specified color
    icon_bg = Image.new("RGB", (${ICON_SIZE}, ${ICON_SIZE}), (${bgR}, ${bgG}, ${bgB}))
    # Paste icon on background (handles transparency)
    icon_bg.paste(icon_resized, (0, 0), icon_resized)
    icon_resized = icon_bg
else:
    icon_resized = icon_resized.convert("RGB")

# Paste resized icon in center
x_offset = ${PADDING}
y_offset = ${PADDING}
canvas.paste(icon_resized, (x_offset, y_offset))

# Save as RGB (no alpha channel) to ensure solid background
canvas.save("${finalIcon.replace(/\\/g, '/')}", "PNG")
print("✅ Icon fixed successfully with solid background color (${backgroundColor})!")
`;

  const pythonScriptPath = path.join(__dirname, '../temp_fix_icon.py');
  fs.writeFileSync(pythonScriptPath, pythonScript);
  
  try {
    execSync(`python3 "${pythonScriptPath}"`, { stdio: 'inherit' });
    fs.unlinkSync(pythonScriptPath);
    if (fs.existsSync(tempCanvas)) fs.unlinkSync(tempCanvas);
    if (fs.existsSync(outputIcon)) fs.unlinkSync(outputIcon);
    console.log('');
    console.log('✅ Adaptive icon fixed! The icon content is now within the safe zone.');
    console.log(`   File: ${finalIcon}`);
  } catch (e) {
    // Python/PIL not available, provide manual instructions
    console.log('');
    console.log('⚠️  Python/PIL not available. Manual fix required:');
    console.log('');
    console.log('📝 Instructions:');
    console.log(`   1. Open ${inputIcon} in an image editor (Photoshop, GIMP, Figma, etc.)`);
    console.log(`   2. Create a new image: ${CANVAS_SIZE}x${CANVAS_SIZE}px with white background`);
    console.log(`   3. Resize your icon to ${ICON_SIZE}x${ICON_SIZE}px (66% of canvas)`);
    console.log(`   4. Center it on the canvas (${PADDING}px padding on all sides)`);
    console.log(`   5. Save as: ${finalIcon}`);
    console.log('');
    console.log('💡 Alternative: Install Python PIL:');
    console.log('   pip3 install Pillow');
    console.log('   Then run this script again.');
    
    // Clean up
    if (fs.existsSync(pythonScriptPath)) fs.unlinkSync(pythonScriptPath);
    if (fs.existsSync(tempCanvas)) fs.unlinkSync(tempCanvas);
    if (fs.existsSync(outputIcon)) fs.unlinkSync(outputIcon);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

