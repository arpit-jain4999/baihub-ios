# Manual Adaptive Icon Creation Guide

Since scripts might not run in Expo/EAS builds, here's how to manually create the adaptive icon:

## Requirements for `assets/adaptive-icon.png`:

1. **Canvas Size**: Exactly **1024x1024 pixels**
2. **Background Color**: **#ffcc00** (yellow) - must be baked into the image (no transparency)
3. **Safe Zone**: Your icon content (the person figure) must be within the center **676x676 pixels** (66% of canvas)
4. **Padding**: Leave **174 pixels** of padding on all sides (top, bottom, left, right)
5. **Format**: PNG, RGB (no alpha channel/transparency)

## Step-by-Step Instructions:

### Option 1: Using Photoshop/GIMP/Figma

1. **Create a new image**:
   - Size: 1024x1024 pixels
   - Background: Fill with color `#ffcc00` (RGB: 255, 204, 0)
   - Resolution: 72 DPI or higher

2. **Add your icon content**:
   - Open your original icon (the person figure with blue circle)
   - Resize it to **676x676 pixels maximum** (or smaller if you want more padding)
   - Center it on the 1024x1024 canvas
   - Ensure there's at least **174 pixels** of yellow background visible on all sides

3. **Export**:
   - Format: PNG
   - **Important**: Export as RGB (no alpha channel/transparency)
   - Save as: `assets/adaptive-icon.png`

### Option 2: Using Online Tools

1. Use a tool like [Canva](https://www.canva.com) or [Figma](https://www.figma.com)
2. Create a 1024x1024 canvas
3. Fill background with `#ffcc00`
4. Add your icon, resize to fit within center 676x676px area
5. Export as PNG (ensure no transparency)

### Visual Guide:

```
┌─────────────────────────────────────────┐
│ 174px padding (yellow #ffcc00)          │
│ ┌───────────────────────────────────┐   │
│ │ 174px padding                    │   │
│ │ ┌─────────────────────────────┐ │   │
│ │ │                             │ │   │
│ │ │   Your Icon Content         │ │   │
│ │ │   (max 676x676px)           │ │   │
│ │ │   (person figure)           │ │   │
│ │ │                             │ │   │
│ │ └─────────────────────────────┘ │   │
│ │ 174px padding                    │   │
│ └───────────────────────────────────┘   │
│ 174px padding                           │
└─────────────────────────────────────────┘
        1024x1024 pixels
```

## Why These Dimensions?

- **1024x1024**: Standard Android adaptive icon size
- **676x676 safe zone (66%)**: Android crops the outer 17% on each side, so only the center 66% is guaranteed visible
- **174px padding**: (1024 - 676) / 2 = 174px on each side
- **No transparency**: Android adaptive icons work best with solid backgrounds

## Verification:

After creating the icon, verify:
- ✅ File size: 1024x1024 pixels
- ✅ Background color: #ffcc00 (yellow)
- ✅ No transparency (RGB format, not RGBA)
- ✅ Icon content fits within center 676x676px area
- ✅ At least 174px yellow padding on all sides

## Testing:

After updating the icon:
1. Run `npx expo prebuild --platform android --clean`
2. Build and test on emulator/device
3. Check that the icon displays correctly without cropping

