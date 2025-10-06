# Password Reset Testing Guide

## Overview

The password reset feature has been implemented with the following approach:

- **Method**: Time-limited reset link (more secure than emailing passwords)
- **Token Lifetime**: 1 hour
- **Email Provider**: Mailpit (for development/testing)
- **Security**: Prevents email enumeration, one-time use tokens

## What Was Implemented

### Backend (API)

1. **Database Model** (`PasswordResetToken`)
   - Token storage with expiration
   - Email tracking
   - Usage tracking (one-time use)

2. **Mail Service** (`src/mail/mail.service.ts`)
   - Beautiful HTML email template with Turkish content
   - Theme-consistent styling (hot pink colors)
   - Plain text fallback
   - Nodemailer integration with SMTP

3. **Auth Endpoints**
   - `POST /auth/forgot-password` - Request reset link
   - `POST /auth/reset-password` - Reset with token
   - `GET /auth/verify-reset-token` - Check token validity

4. **Security Features**
   - Email enumeration prevention
   - Token expiration (1 hour)
   - One-time use tokens
   - Secure random token generation
   - Transaction-based password updates

### Frontend (Mobile App)

1. **Updated Auth Screens**
   - Sign In screen with theme colors and "Forgot Password?" link
   - Sign Up screen with welcoming message and theme colors
   - Both screens now have:
     - Better UX with emoji headers
     - Consistent pink theme (#FF69B4)
     - Keyboard-aware scrolling
     - Improved typography and spacing

2. **New Forgot Password Screen**
   - Email input with validation
   - Success state showing confirmation message
   - Option to resend email
   - Theme-consistent design
   - Clear user guidance

3. **API Integration**
   - `authService.forgotPassword()`
   - `authService.resetPassword()`
   - `authService.verifyResetToken()`

## Testing with Mailpit

### Setup Mailpit (Already configured in your project)

Mailpit is configured in `.env.local`:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM="Wellness App <no-reply@local.test>"
SMTP_TLS=false
```

### Starting Mailpit

1. If not already running, start Mailpit:
   ```bash
   mailpit
   ```

2. Mailpit will start on:
   - **SMTP Server**: `localhost:1025` (for sending emails)
   - **Web UI**: `http://localhost:8025` (for viewing emails)

### Testing the Password Reset Flow

#### Step 1: Start the Services

1. **Start the API server:**
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Start Mailpit** (in another terminal):
   ```bash
   mailpit
   ```

3. **Start the mobile app** (in another terminal):
   ```bash
   cd apps/mobile
   pnpm start
   ```

#### Step 2: Test with Your Test User

1. **Open the mobile app** on iOS simulator
2. **Navigate to Sign In screen**
3. **Tap "Şifremi Unuttum" (Forgot Password)**
4. **Enter your test email**: `meo@test.com`
5. **Tap "Sıfırlama Bağlantısı Gönder"**
6. **Check Mailpit**: Open `http://localhost:8025` in your browser

#### Step 3: View the Email in Mailpit

1. Open Mailpit web interface: `http://localhost:8025`
2. You should see an email with subject: **"Şifre Sıfırlama Talebi"**
3. Click on the email to view it
4. The email will show:
   - A beautiful hot pink design matching your app theme
   - A "Şifremi Sıfırla" button
   - The reset link (valid for 1 hour)
   - Clear instructions in Turkish

#### Step 4: Testing the Reset Link

**Option A: Test via API directly (Recommended for now)**

1. Copy the token from the reset URL in the email
   - URL format: `http://localhost:4000/auth/reset-password?token=<TOKEN>`
2. Use Postman, curl, or similar to test:
   ```bash
   curl -X POST http://localhost:4000/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token": "YOUR_TOKEN_HERE",
       "newPassword": "newpassword123"
     }'
   ```
3. You should get a success response:
   ```json
   {
     "message": "Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz."
   }
   ```

**Option B: Test via Mobile App (Requires deep linking setup)**

For a full end-to-end test in the mobile app, you would need to:
1. Set up deep linking in the mobile app to handle `wellness://reset-password?token=...`
2. Configure the reset email to use the mobile app deep link instead of API URL
3. This is a future enhancement - for now, use Option A

#### Step 5: Verify the Password Was Changed

1. Go back to the Sign In screen in the mobile app
2. Try logging in with the OLD password - should fail
3. Try logging in with the NEW password - should succeed!

## Real Email Testing (Production)

For production or testing with real email addresses:

### 1. Configure SMTP Settings

Update `.env.local` with real SMTP credentials:

```env
# Example with Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Women's Wellness <no-reply@yourapp.com>"
SMTP_TLS=true
```

### 2. For Gmail:
- Enable 2FA on your Google account
- Generate an "App Password" at https://myaccount.google.com/apppasswords
- Use the app password in `SMTP_PASS`

### 3. For Production SMTP Services:
Consider using:
- **SendGrid** - Reliable and popular
- **AWS SES** - Cost-effective
- **Mailgun** - Good deliverability
- **Postmark** - Transaction email focused

## Security Notes

1. **Email Enumeration Prevention**: The API always returns success, even if the email doesn't exist. This prevents attackers from discovering valid email addresses.

2. **Token Expiration**: Tokens expire after 1 hour for security.

3. **One-Time Use**: Tokens can only be used once. After use, they're marked as `used`.

4. **Secure Token Generation**: Uses `crypto.randomBytes(32)` for secure random tokens.

5. **No Passwords in Emails**: Never sends actual passwords via email, only reset links.

## Troubleshooting

### Email Not Appearing in Mailpit
- Ensure Mailpit is running on port 1025
- Check API logs for email sending errors
- Verify SMTP settings in `.env.local`

### Token Invalid or Expired
- Tokens expire after 1 hour
- Request a new reset link
- Check that the token hasn't been used already

### API Errors
- Ensure PostgreSQL is running
- Run migrations: `cd apps/api && npx prisma generate`
- Check API logs for detailed error messages

## Migration Note

The `PasswordResetToken` model was added to the Prisma schema. To apply the migration:

```bash
cd apps/api
DATABASE_URL="postgresql://alican@localhost:5432/wellness" npx prisma migrate dev --name add_password_reset_token
```

Or manually apply the SQL:

```sql
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
```

## Summary

✅ **Completed**:
- Backend password reset API endpoints
- Email service with beautiful Turkish email templates
- Frontend forgot password screen with theme colors
- Updated sign in/sign up screens with improved UX
- Security features (token expiration, one-time use, enumeration prevention)
- Mailpit integration for development testing

🚀 **Next Steps** (Optional enhancements):
- Deep linking for mobile app to handle reset links directly
- Email template customization for different providers
- Rate limiting on password reset requests
- Admin panel to view/manage reset tokens
