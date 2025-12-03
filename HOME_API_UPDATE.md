# Home API Update - Banner Module Integration

## Changes Made

The home page API has been updated to fetch banners from the database instead of hardcoded values. The mobile app types and components have been updated to handle the new response format.

## Type Updates

### 1. `HomePageData` Interface
- **Changed**: `heroBanner: HeroBanner` → `heroBanner: HeroBanner | null`
- **Reason**: Backend can return `null` when no hero banner is configured

### 2. `HeroBanner` Interface
- **Changed**: Made `subtitle`, `actionUrl`, and `actionText` optional
- **Reason**: These fields can be empty strings or undefined from the backend

### 3. `SecondaryBanner` Interface
- **Changed**: Made `subtitle`, `actionUrl`, and `actionText` optional
- **Reason**: These fields can be empty strings or undefined from the backend

## Component Updates

### 1. `HeroBanner.tsx`
- Added conditional rendering for `subtitle` and `actionText`
- Only displays these elements if they have values

### 2. `SecondaryBanners.tsx`
- Added conditional rendering for `subtitle` and `actionText`
- Only displays these elements if they have values

## Backend Response Format

The backend now returns:

```typescript
{
  heroBanner: {
    id: string;
    title: string;
    subtitle?: string;  // Can be empty string or undefined
    imageUrl: string;
    actionUrl?: string;  // Can be empty string or undefined
    actionText?: string; // Can be empty string or undefined
    isActive: boolean;
    order: number;
  } | null,  // Can be null if no hero banner configured
  
  secondaryBanners: Array<{
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    actionUrl?: string;
    actionText?: string;
    isActive: boolean;
    order: number;
  }>,
  
  quickCategories: Category[],
  featuredTestimonials: Review[],
  areasServed: AreasServed
}
```

## Testing Checklist

- [x] Hero banner displays correctly when configured
- [x] Hero banner is hidden when `null` is returned
- [x] Secondary banners display correctly
- [x] Optional fields (subtitle, actionText) are handled gracefully
- [x] Empty strings for optional fields don't break the UI
- [x] HomeScreen handles null heroBanner correctly

## Notes

- The `HomeScreen.tsx` already had null checking (`{data.heroBanner && ...}`), so no changes were needed there
- All banner images are now served from CDN (configured in backend)
- The backend fetches banners from the database using the Banner module


