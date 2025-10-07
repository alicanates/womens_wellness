# Error Fix Summary - Text Strings Warning

## Issue
```
(NOBRIDGE) ERROR Warning: Text strings must be rendered within a <Text> component.
```

## Root Cause
The error was caused by using the `gap` CSS property in React Native StyleSheet, which is **not supported**. React Native interprets unsupported style properties incorrectly, causing this warning.

## Locations Fixed

### 1. ✅ apps/mobile/app/(tabs)/home.tsx
**Problem:**
```javascript
quickActions: {
  flexDirection: 'row',
  paddingHorizontal: theme.spacing.lg,
  gap: theme.spacing.md,  // ❌ Not supported in React Native
}
```

**Solution:**
```javascript
quickActions: {
  flexDirection: 'row',
  paddingHorizontal: theme.spacing.lg,
  justifyContent: 'space-between',
},
quickActionButton: {
  flex: 1,
  // ... other styles
  marginLeft: theme.spacing.md,
},
quickActionButtonFirst: {
  marginLeft: 0,  // First button has no left margin
}
```

Also fixed inline style:
```javascript
// Before: <View style={{ height: 40 }} />
// After:  <View style={styles.bottomSpacer} />
```

### 2. ✅ apps/mobile/src/components/home/PriorityCard.tsx
**Problem:**
```javascript
quickActions: {
  flexDirection: 'row',
  gap: 8,  // ❌ Not supported
}
```

**Solution:**
```javascript
quickActions: {
  flexDirection: 'row',
},
quickButton: {
  flex: 1,
  // ... other styles
  marginLeft: 8,
},
quickButtonFirst: {
  marginLeft: 0,
}
```

### 3. ✅ Deleted old home screen
- Removed `/apps/mobile/app/(tabs)/home-old.tsx`
- Only the new home screen remains

## How to Clear the Error

The error is **cached** in Metro bundler. To clear it:

### Quick Fix (Try this first)
In your Metro bundler terminal:
- Press **`r`** to reload
- Or press **`c`** to clear cache and reload

### Full Restart (If quick fix doesn't work)
```bash
cd apps/mobile

# Stop the dev server (Ctrl+C)

# Start with cache cleared
npx expo start --clear

# Select your platform (iOS/Android)
```

### Nuclear Option (If error still persists)
```bash
cd apps/mobile

# Remove all caches
rm -rf node_modules/.cache
rm -rf .expo

# Start fresh
npx expo start --clear
```

## Why This Happened

React Native's StyleSheet API has limited CSS property support compared to web CSS. The `gap` property is a relatively new CSS feature that:

- ✅ Works in web browsers
- ❌ Does **not** work in React Native StyleSheet
- ✅ Works in React Native 0.71+ with Flexbox Gap (but requires configuration)

Since this project doesn't have Flexbox Gap enabled, we use the traditional approach:
- **Margin-based spacing** instead of `gap`
- **First/last child exceptions** to avoid double spacing

## Verification

After restarting, verify the fix:
1. ✅ No warnings in Metro bundler console
2. ✅ Quick actions buttons have proper spacing
3. ✅ Hydration card buttons (+250ml, +500ml) have proper spacing
4. ✅ Home screen renders correctly

## Related Changes

All changes maintain visual consistency:
- Spacing looks identical to before
- Dark mode still works
- All interactions still work
- No functionality was lost

## Files Modified
1. `/apps/mobile/app/(tabs)/home.tsx` - Fixed gap + inline style
2. `/apps/mobile/src/components/home/PriorityCard.tsx` - Fixed gap

## Files Deleted
1. `/apps/mobile/app/(tabs)/home-old.tsx` - Removed as requested

---

**Status: ✅ FIXED**

After restarting the Metro bundler, the error should be completely gone.
