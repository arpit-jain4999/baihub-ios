# Onboarding Splash Screens - Design Specification

## Overview
Three-screen carousel splash/onboarding flow for non-authenticated users. Screens auto-loop with a pagination indicator.

---

## 🎨 Design Guidelines

### Layout Specifications
- **Screen Size:** 412 × 917 pixels (mobile)
- **Top Logo:** 72px height, centered horizontally, 69px from top
- **Illustration Area:** Center of screen (134-587px from top)
- **Bottom Sheet:** 270px height, starts at 648px from top
- **Bottom Sheet Radius:** 40px (top-left and top-right)
- **Button:** 72px height × 306px width, 20px border radius
- **Button Position:** 803.5px from top, centered

### Typography
- **Font Family:** Inter
- **Title:** 
  - Font: Inter Bold
  - Size: 18px
  - Color: #000000 (Black)
  - Alignment: Center
- **Description:**
  - Font: Inter Light
  - Size: 12px
  - Color: #000000 (Black)
  - Alignment: Center
  - Width: 252px
- **Button Text:**
  - Font: Inter Regular
  - Size: 20px
  - Color: #FFCC00 (Yellow)
  - Text: "Get Started"

### Spacing
- Bottom sheet padding: 40px top
- Title to description gap: 14px
- Description to button gap: 54px
- Pagination indicator: 335.5px from top center

---

## 🎨 Color Palette

### Primary Colors
```
Background Yellow: #FFCC00
Bottom Sheet Cream: #FFFAE6
Button Black: #000000
Button Text Yellow: #FFCC00
```

### Text Colors
```
Heading: #000000 (Black)
Body Text: #000000 (Black)
```

### Pagination Indicators
```
Active Dot: #000000 (Black) - 59px × 4px rounded
Inactive Dot: #FFFFFF (White) - 4px × 4px circular
Dot Spacing: 13px gap
```

### Shadows
```
Bottom Sheet Shadow: 
  - offset: 0px, -16px
  - blur: 48px
  - color: rgba(0, 0, 0, 0.16)
```

---

## 📸 Assets Required

### Logo
- **File:** `logo (8) 1`
- **Size:** 200px × 72px
- **Position:** Top center, 69px from top
- **Source:** http://localhost:3845/assets/a8304e6ebb588f998b4b86d9303852fd5444a39f.png

### Background Shape
- **File:** `80836 copy 1`
- **Purpose:** Decorative circular background behind illustration
- **Opacity:** 48%
- **Treatment:** Rotated at different angles per screen
- **Source:** http://localhost:3845/assets/aad964b9e65b3acb5aba408d5f365b0e7f23578f.png

### Screen 1 Illustration
- **File:** `Gemini_Generated_Image_xiacfbxiacfbxiac 1`
- **Size:** 310px × 399px
- **Content:** Helper with house icon and check marks
- **Source:** http://localhost:3845/assets/158c341cc5edc527ee4ad7f5b1000b1876715594.png

### Screen 2 Illustration
- **File:** `Gemini_Generated_Image_nevvz7nevvz7nevv copy 1`
- **Size:** 381px × 386px
- **Content:** Helper with "30" number showing OK gesture
- **Source:** http://localhost:3845/assets/6417b4863e8fbc1b47f6194184dfb4a0465435c5.png

### Screen 3 Illustration
- **File:** `Gemini_Generated_Image_yd87c9yd87c9yd87 1`
- **Size:** 308px × 385px
- **Content:** Helper with clock showing punctuality
- **Source:** http://localhost:3845/assets/3748e0627ac5729bd70b5d153ed2918a6a0fde89.png

---

## 📝 Content Copy

### Screen 1: Trusted Helpers
**Title:** "Trusted Helpers"

**Description:** "Guaranteed service continuity. We ensure your helper's attendance or provide an immediate, quality backup."

**Key Message:** Reliability and backup support

### Screen 2: 30-Day Service
**Title:** "30-Day Uninterrupted Service."

**Description:** "Guaranteed service continuity. We ensure your helper's attendance or provide an immediate, quality backup."

**Key Message:** Extended service commitment

### Screen 3: Reliability
**Title:** "Reliable Help, Always On Time."

**Description:** "Your perfect helper is ready to start when you are, from just ₹99/ day."

**Key Message:** Punctuality and affordability

---

## 🎯 Interaction Patterns

### Auto-Play Carousel
- **Duration:** 3 seconds per screen
- **Transition:** Smooth slide animation
- **Loop:** Infinite loop back to Screen 1
- **Pagination:** Bottom center, updates with current screen

### Pagination Indicator
- **Type:** Dots
- **Position:** Center, 160-161px from vertical center
- **Active State:** Black bar (59px wide)
- **Inactive State:** White dots (4px diameter)
- **Total Screens:** 3 dots/bars

### Get Started Button
- **Action:** Navigate to Login/Registration screen
- **Position:** Fixed at bottom of cream sheet
- **Height:** 72px
- **Width:** 306px
- **Border Radius:** 20px
- **Tap Area:** Entire button area

---

## 📐 Component Structure

```
OnboardingSplashScreen
├── Background (#FFCC00)
│   ├── Logo (Top Center)
│   ├── IllustrationArea (Center)
│   │   ├── BackgroundShape (Rotated, 48% opacity)
│   │   └── CharacterIllustration
│   └── PaginationDots (Center Bottom)
├── BottomSheet (#FFFAE6)
│   ├── Title (Inter Bold, 18px)
│   ├── Description (Inter Light, 12px)
│   └── GetStartedButton (Black bg, Yellow text)
```

---

## 🔄 Animation Specifications

### Screen Transitions
- **Type:** Horizontal slide
- **Duration:** 400ms
- **Easing:** ease-in-out
- **Direction:** Left to right

### Auto-Advance
- **Delay:** 3000ms (3 seconds)
- **Behavior:** Auto-advance to next screen
- **Loop:** Return to first screen after last

### Pagination Animation
- **Type:** Scale and fade
- **Duration:** 300ms
- **Active Bar:** Width animates from 4px to 59px

---

## 📱 Responsive Considerations

### Safe Areas
- Respect device safe area insets
- Maintain minimum 16px side padding
- Adjust bottom sheet height for smaller screens

### Different Screen Sizes
- Scale illustrations proportionally
- Maintain aspect ratios
- Keep text readable (minimum 12px)

---

## ♿ Accessibility

### Text Contrast
- Yellow on Black: ✅ WCAG AA compliant
- Black on Cream: ✅ WCAG AAA compliant

### Interactive Elements
- Button min height: 72px (exceeds 44px requirement)
- Button min width: 306px
- Clear tap target

### Screen Reader
- Provide alt text for illustrations
- Announce current page number
- Label "Get Started" button clearly

---

## 🚀 Implementation Notes

### React Native Components
- Use `react-native-reanimated` for smooth animations
- Use `react-native-pager-view` or custom FlatList for carousel
- Use `react-native-svg` if converting illustrations to SVG

### Performance
- Preload all three illustration images
- Use optimized image formats (WebP where supported)
- Cache images locally after first load

### State Management
- Track current screen index
- Handle auto-advance timer
- Pause auto-advance on user interaction
- Resume after 5 seconds of inactivity

---

## 📦 Assets Export Requirements

When exporting from Figma:
1. Logo: PNG @2x and @3x
2. Illustrations: PNG @2x and @3x (or SVG for better scaling)
3. Background shape: SVG preferred
4. Format: PNG-24 with transparency where needed
5. Compression: TinyPNG or similar

---

## ✅ Design Checklist

- [ ] All three screens designed
- [ ] Logo placed and sized correctly
- [ ] Illustrations optimized
- [ ] Colors match brand (#FFCC00 primary)
- [ ] Typography uses Inter font family
- [ ] Bottom sheet shadow applied
- [ ] Pagination indicator functional
- [ ] Button accessible (72px height)
- [ ] Copy reviewed and approved
- [ ] Assets exported at correct resolutions
- [ ] Animations specified
- [ ] Auto-advance timing set (3s)
- [ ] Accessibility considerations addressed

---

## 🎨 Figma Links

- **Screen 1:** [Trusted Helpers](https://www.figma.com/design/KR7CIVPouZWKLSGvocgGPd/Untitled?node-id=2-13&m=dev)
- **Screen 2:** [30-Day Service](https://www.figma.com/design/KR7CIVPouZWKLSGvocgGPd/Untitled?node-id=2-21&m=dev)
- **Screen 3:** [Reliability](https://www.figma.com/design/KR7CIVPouZWKLSGvocgGPd/Untitled?node-id=2-26&m=dev)

---

## 💡 Brand Values Communicated

1. **Trustworthiness** - "Trusted Helpers" with backup guarantee
2. **Reliability** - "30-Day Uninterrupted Service"
3. **Punctuality** - "Always On Time"
4. **Affordability** - "₹99/day" price point
5. **Quality** - Professional illustrations and polished UI

---

This specification provides everything needed to implement the onboarding splash screens in your React Native BaiHub mobile app.



