# Android APK Build Guide

## Overview
The Android APK is built automatically using GitHub Actions whenever changes are pushed to the `chatbot` or `main` branches that affect the mobile app.

## Build Process

### Automatic Build (GitHub Actions)
1. Push changes to `chatbot` or `main` branch
2. GitHub Actions workflow automatically triggers
3. Workflow builds the APK using Expo prebuild + Gradle
4. APK is available as a downloadable artifact

### Workflow Location
`.github/workflows/build-android.yml`

### Build Steps
1. Checkout repository
2. Setup Node.js 20.x
3. Setup pnpm 10.14.0
4. Setup Java 17 (Temurin)
5. Setup Android SDK
6. Setup Expo
7. Install dependencies (no frozen lockfile)
8. Generate Android native code with `expo prebuild`
9. Build APK with Gradle
10. Upload APK as artifact

### Download APK
1. Go to GitHub repository: https://github.com/alicanates/womens_wellness
2. Click on "Actions" tab
3. Select the latest "Build Android APK" workflow run
4. Scroll down to "Artifacts" section
5. Download "app-release" artifact
6. Extract the ZIP file to get `app-release.apk`

## Configuration

### GitHub Secrets (Optional)
If you want to use EAS Build features, add `EXPO_TOKEN` to GitHub repository secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: Your Expo access token (get from https://expo.dev/accounts/[username]/settings/access-tokens)

### App Configuration
- **Package Name**: `com.kadinatlasi.wellness`
- **App Name**: Kadın Atlası
- **Version**: 1.0.0
- **Version Code**: 1
- **API URL**: https://api.kadinatlasi.com

## Manual Build (Local)

If you need to build locally:

```bash
cd apps/mobile

# Install dependencies
pnpm install

# Generate Android native code
npx expo prebuild --platform android --clean

# Build APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Build Fails with "Plugin not found"
- This is usually due to monorepo structure
- GitHub Actions workflow handles this by using `--no-frozen-lockfile`
- Ensure `expo prebuild` runs before Gradle build

### Missing Dependencies
- Check that all required packages are in `apps/mobile/package.json`
- Verify no workspace dependencies remain (should be copied to local)

### Gradle Errors
- Ensure Java 17 is used
- Check Android SDK is properly installed
- Verify `expo prebuild` completed successfully

## Next Steps

After downloading the APK:
1. Transfer to Android device
2. Enable "Install from Unknown Sources" in device settings
3. Install the APK
4. Test the app thoroughly

## Production Release

For Google Play Store release:
1. Change `buildType` from `apk` to `aab` in `eas.json`
2. Configure signing keys
3. Build with production profile: `eas build --platform android --profile production`
4. Upload AAB to Google Play Console
