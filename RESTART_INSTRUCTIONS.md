# How to Restart the Mobile App

## The error you're seeing is cached. Follow these steps to clear it:

### Option 1: Quick Restart (Recommended)
```bash
# In your terminal where the mobile app is running:
# 1. Press 'r' to reload the app
# 2. If that doesn't work, press 'Shift+R' for a full reload

# Or press 'c' to clear cache and reload
```

### Option 2: Full Restart
```bash
# 1. Stop the current dev server (Ctrl+C in the terminal)

# 2. Clear Metro cache
cd apps/mobile
npx expo start --clear

# 3. Select your platform (iOS/Android)
```

### Option 3: Nuclear Option (if error persists)
```bash
cd apps/mobile

# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear

# Then select your platform
```

## What was fixed:
- ✅ Removed all `gap` CSS properties (not supported in React Native)
- ✅ Replaced with `marginLeft` approach
- ✅ Fixed inline styles (moved to StyleSheet)
- ✅ Deleted old home screen file (home-old.tsx)

## After restarting, the error should be gone!

The warning was caused by React Native's StyleSheet not supporting the `gap` property.
We replaced it with margin-based spacing which is fully supported.
