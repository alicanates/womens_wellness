# Google OAuth Flow

## Overview
This document describes the Google Sign-In flow for the Wellness app.

## Architecture
```
Mobile (Expo) → Google OAuth → ID Token → API Server → App JWT
```

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API (or Google Identity)

### 2. Create OAuth 2.0 Credentials

#### For iOS
1. Create an **iOS client ID**
2. Note the **Client ID** (e.g., `123456-abc.apps.googleusercontent.com`)
3. Note the **reversed client ID** (e.g., `com.googleusercontent.apps.123456-abc`)
4. Add the reversed client ID to your `app.config.ts`:
```ts
ios: {
  bundleIdentifier: 'com.wellness.companion',
  config: {
    googleSignIn: {
      reservedClientId: 'com.googleusercontent.apps.YOUR-CLIENT-ID',
    },
  },
}
```

#### For Android
1. Create an **Android client ID**
2. Get your app's **SHA-1** fingerprint:
```bash
# Debug keystore (development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore (production)
keytool -list -v -keystore /path/to/release.keystore -alias your-alias
```
3. Add SHA-1 to Google Console
4. Note the **Client ID**

#### For Web (Optional - Admin panel)
1. Create a **Web client ID**
2. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - Your production domain
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`

### 3. Configure Environment Variables

#### Mobile (`apps/mobile/.env.local`)
```ini
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=YOUR_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=YOUR_ANDROID_CLIENT_ID
```

#### API (`apps/api/.env.local`)
```ini
GOOGLE_OAUTH_CLIENT_ID_IOS=YOUR_IOS_CLIENT_ID
GOOGLE_OAUTH_CLIENT_ID_ANDROID=YOUR_ANDROID_CLIENT_ID
GOOGLE_OAUTH_CLIENT_ID_WEB=YOUR_WEB_CLIENT_ID
GOOGLE_OAUTH_AUDIENCES=YOUR_IOS_CLIENT_ID,YOUR_ANDROID_CLIENT_ID,YOUR_WEB_CLIENT_ID
```

## Flow Details

### Mobile Side (Expo)
1. User taps "Continue with Google"
2. App uses `expo-auth-session` to initiate OAuth flow
3. User authenticates with Google
4. App receives **ID token**
5. App sends ID token to API: `POST /auth/google { idToken }`

### API Side (NestJS)
1. Receive ID token from mobile
2. Verify token using `google-auth-library`:
   - Check signature
   - Verify audience matches configured client IDs
   - Verify email is verified
3. Extract user info (sub, email, name)
4. Find or create user in database
5. Create/update OAuthAccount record
6. Generate app JWT (access + refresh tokens)
7. Return tokens to mobile

## Code Example

### Mobile Hook
```ts
import * as Google from 'expo-auth-session/providers/google';

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    responseType: 'id_token',
  });

  async function signIn() {
    const result = await promptAsync();
    const idToken = result.params.id_token;

    // Send to API
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    return response.json();
  }

  return { signIn };
}
```

### API Verification
```ts
import { OAuth2Client } from 'google-auth-library';

async function verifyIdToken(idToken: string) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: ALLOWED_CLIENT_IDS,
  });

  const payload = ticket.getPayload();
  return payload; // { sub, email, email_verified, name, ... }
}
```

## Security Notes
- Always verify `email_verified` is `true`
- Always verify `audience` matches your client IDs
- Never trust client-sent user info without verification
- ID tokens are short-lived (typically 1 hour)
- Store only app JWTs on the client, never Google tokens

## Testing
1. Use development build (not Expo Go)
2. Test on real device or simulator with Google account signed in
3. Check network logs for token exchange
4. Verify database OAuthAccount records are created

## Common Issues
- **"Invalid audience"**: Client ID mismatch between mobile and API
- **"Email not verified"**: User's Google email not verified
- **"Development build required"**: Expo Go doesn't support native Google Sign-In
- **Reversed client ID missing**: Check `app.config.ts` iOS configuration
