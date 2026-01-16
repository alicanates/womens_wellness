#!/bin/bash

# Production Environment Setup Script
# Interactive wizard for setting up all required environment variables

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
WARN="⚠️"
INFO="ℹ️"
ROCKET="🚀"

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Women's Wellness App - Production Environment Setup    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running in production mode
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${WARN} ${YELLOW}Warning: NODE_ENV is not set to 'production'${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to generate random secret
generate_secret() {
    openssl rand -hex 32
}

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        value=${value:-$default}
    else
        read -p "$prompt: " value
    fi
    
    eval "$var_name='$value'"
}

# Function to prompt for secret input (hidden)
prompt_secret() {
    local prompt="$1"
    local var_name="$2"
    
    read -s -p "$prompt: " value
    echo
    eval "$var_name='$value'"
}

# Function to validate URL
validate_url() {
    local url="$1"
    if [[ $url =~ ^https?:// ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate email
validate_email() {
    local email="$1"
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

echo -e "${INFO} ${BLUE}This wizard will help you set up all required environment variables.${NC}"
echo -e "${INFO} ${BLUE}Press Ctrl+C at any time to cancel.${NC}"
echo ""

# ============================================================================
# 1. CRITICAL VARIABLES
# ============================================================================

echo -e "${ROCKET} ${GREEN}Step 1: Critical Variables${NC}"
echo -e "${INFO} These are REQUIRED for the app to work."
echo ""

# JWT Secrets
echo -e "${BLUE}[1/8] JWT Secrets${NC}"
echo "Generate secure random strings for JWT tokens."
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
echo -e "${CHECK} Generated JWT_SECRET: ${JWT_SECRET:0:16}..."
echo -e "${CHECK} Generated JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:0:16}..."
echo ""

# Database
echo -e "${BLUE}[2/8] PostgreSQL Database${NC}"
echo "Example: postgresql://user:password@host:5432/dbname?sslmode=require"
prompt_with_default "Database URL" "" DATABASE_URL
while [ -z "$DATABASE_URL" ]; do
    echo -e "${CROSS} ${RED}Database URL is required!${NC}"
    prompt_with_default "Database URL" "" DATABASE_URL
done
echo -e "${CHECK} Database URL set"
echo ""

# Redis
echo -e "${BLUE}[3/8] Redis${NC}"
echo "Example: redis://:password@host:6379 or rediss://... for TLS"
prompt_with_default "Redis URL" "" REDIS_URL
while [ -z "$REDIS_URL" ]; do
    echo -e "${CROSS} ${RED}Redis URL is required!${NC}"
    prompt_with_default "Redis URL" "" REDIS_URL
done
echo -e "${CHECK} Redis URL set"
echo ""

# Google AI
echo -e "${BLUE}[4/8] Google Gemini AI${NC}"
echo "Get your API key from: https://aistudio.google.com/app/apikey"
prompt_secret "Gemini API Key" GOOGLE_GENERATIVE_AI_API_KEY
while [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
    echo -e "${CROSS} ${RED}Gemini API Key is required for AI chat!${NC}"
    prompt_secret "Gemini API Key" GOOGLE_GENERATIVE_AI_API_KEY
done
echo -e "${CHECK} Gemini API Key set"
echo ""

# Google OAuth
echo -e "${BLUE}[5/8] Google OAuth${NC}"
echo "Get client IDs from: https://console.cloud.google.com"
prompt_with_default "iOS Client ID" "" GOOGLE_OAUTH_CLIENT_ID_IOS
prompt_with_default "Android Client ID" "" GOOGLE_OAUTH_CLIENT_ID_ANDROID
prompt_with_default "Web Client ID" "" GOOGLE_OAUTH_CLIENT_ID_WEB

if [ -z "$GOOGLE_OAUTH_CLIENT_ID_IOS" ] || [ -z "$GOOGLE_OAUTH_CLIENT_ID_ANDROID" ]; then
    echo -e "${WARN} ${YELLOW}Warning: Google OAuth not fully configured. Google login won't work!${NC}"
else
    echo -e "${CHECK} Google OAuth configured"
fi
echo ""

# Expo
echo -e "${BLUE}[6/8] Expo Push Notifications${NC}"
echo "Get access token from: https://expo.dev (Account Settings → Access Tokens)"
prompt_secret "Expo Access Token" EXPO_ACCESS_TOKEN
if [ -z "$EXPO_ACCESS_TOKEN" ]; then
    echo -e "${WARN} ${YELLOW}Warning: Push notifications won't work without Expo token!${NC}"
else
    echo -e "${CHECK} Expo token set"
fi
echo ""

# IAP - Apple
echo -e "${BLUE}[7/8] In-App Purchase - Apple${NC}"
echo "Get shared secret from: App Store Connect → App → Subscriptions"
prompt_secret "Apple Shared Secret" APPLE_SHARED_SECRET
if [ -z "$APPLE_SHARED_SECRET" ]; then
    echo -e "${WARN} ${YELLOW}Warning: iOS IAP won't work!${NC}"
else
    echo -e "${CHECK} Apple IAP configured"
fi
echo ""

# IAP - Google
echo -e "${BLUE}[8/8] In-App Purchase - Google${NC}"
echo "Service account JSON from: Google Play Console → API Access"
echo "Paste the entire JSON as a single line:"
read -r GOOGLE_SERVICE_ACCOUNT_KEY
if [ -z "$GOOGLE_SERVICE_ACCOUNT_KEY" ]; then
    echo -e "${WARN} ${YELLOW}Warning: Android IAP won't work!${NC}"
else
    echo -e "${CHECK} Google IAP configured"
fi

# Generate Google Pub/Sub token
GOOGLE_PUBSUB_PUSH_TOKEN=$(generate_secret)
echo -e "${CHECK} Generated Pub/Sub push token"
echo ""

# ============================================================================
# 2. OPTIONAL BUT RECOMMENDED
# ============================================================================

echo -e "${ROCKET} ${GREEN}Step 2: Optional Services (Recommended)${NC}"
echo ""

# Email
echo -e "${BLUE}Email Service (for password reset)${NC}"
read -p "Configure email service? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    prompt_with_default "SMTP Host" "smtp.sendgrid.net" SMTP_HOST
    prompt_with_default "SMTP Port" "587" SMTP_PORT
    prompt_with_default "SMTP User" "apikey" SMTP_USER
    prompt_secret "SMTP Password" SMTP_PASS
    prompt_with_default "From Email" "noreply@yourdomain.com" SMTP_FROM
    SMTP_TLS="true"
    echo -e "${CHECK} Email service configured"
else
    SMTP_HOST="localhost"
    SMTP_PORT="1025"
    SMTP_USER=""
    SMTP_PASS=""
    SMTP_FROM="noreply@local.test"
    SMTP_TLS="false"
    echo -e "${WARN} ${YELLOW}Email service skipped${NC}"
fi
echo ""

# File Storage
echo -e "${BLUE}File Storage (for profile pictures)${NC}"
read -p "Configure S3/MinIO? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "1) AWS S3"
    echo "2) MinIO"
    echo "3) Filesystem (local)"
    read -p "Choose storage driver (1-3): " storage_choice
    
    case $storage_choice in
        1)
            STORAGE_DRIVER="s3"
            prompt_with_default "S3 Region" "eu-central-1" S3_REGION
            prompt_with_default "S3 Bucket" "" S3_BUCKET
            prompt_with_default "S3 Access Key ID" "" S3_ACCESS_KEY_ID
            prompt_secret "S3 Secret Access Key" S3_SECRET_ACCESS_KEY
            S3_FORCE_PATH_STYLE="false"
            echo -e "${CHECK} AWS S3 configured"
            ;;
        2)
            STORAGE_DRIVER="minio"
            prompt_with_default "MinIO Endpoint" "localhost" MINIO_ENDPOINT
            prompt_with_default "MinIO Port" "9000" MINIO_PORT
            prompt_with_default "MinIO Access Key" "" MINIO_ACCESS_KEY
            prompt_secret "MinIO Secret Key" MINIO_SECRET_KEY
            prompt_with_default "MinIO Bucket" "wellness" MINIO_BUCKET
            MINIO_USE_SSL="false"
            echo -e "${CHECK} MinIO configured"
            ;;
        *)
            STORAGE_DRIVER="filesystem"
            FILES_BASE_PATH="./var/files"
            echo -e "${CHECK} Filesystem storage configured"
            ;;
    esac
else
    STORAGE_DRIVER="filesystem"
    FILES_BASE_PATH="./var/files"
    echo -e "${WARN} ${YELLOW}Using local filesystem storage${NC}"
fi
echo ""

# Monitoring - Sentry
echo -e "${BLUE}Error Tracking (Sentry)${NC}"
read -p "Configure Sentry? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get DSN from: https://sentry.io → Project Settings → Client Keys"
    prompt_with_default "Sentry DSN" "" SENTRY_DSN
    if [ -n "$SENTRY_DSN" ]; then
        echo -e "${CHECK} Sentry configured"
    fi
else
    SENTRY_DSN=""
    echo -e "${WARN} ${YELLOW}Sentry skipped${NC}"
fi
echo ""

# Monitoring - PostHog
echo -e "${BLUE}Analytics (PostHog)${NC}"
read -p "Configure PostHog? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Get API key from: https://posthog.com → Project Settings"
    prompt_with_default "PostHog API Key" "" POSTHOG_API_KEY
    prompt_with_default "PostHog Host" "https://app.posthog.com" POSTHOG_HOST
    if [ -n "$POSTHOG_API_KEY" ]; then
        echo -e "${CHECK} PostHog configured"
    fi
else
    POSTHOG_API_KEY=""
    POSTHOG_HOST="https://app.posthog.com"
    echo -e "${WARN} ${YELLOW}PostHog skipped${NC}"
fi
echo ""

# ============================================================================
# 3. ADDITIONAL SETTINGS
# ============================================================================

echo -e "${ROCKET} ${GREEN}Step 3: Additional Settings${NC}"
echo ""

# API URL
prompt_with_default "API Base URL" "https://api.yourdomain.com" API_BASE_URL

# CORS Origins
prompt_with_default "CORS Allowed Origins (comma-separated)" "https://yourdomain.com,https://admin.yourdomain.com" CORS_ALLOWED_ORIGINS

# Admin Emails
prompt_with_default "Admin Emails (comma-separated)" "admin@yourdomain.com" ADMIN_EMAILS

# Mobile Scheme
prompt_with_default "Mobile App Scheme" "wellness" PUBLIC_MOBILE_SCHEME
PUBLIC_MOBILE_REDIRECT_URL="${PUBLIC_MOBILE_SCHEME}:/oauthredirect"

# Web Origin
prompt_with_default "Web Admin Origin" "https://admin.yourdomain.com" PUBLIC_WEB_ORIGIN

echo ""

# ============================================================================
# 4. WRITE .ENV FILES
# ============================================================================

echo -e "${ROCKET} ${GREEN}Step 4: Writing .env files${NC}"
echo ""

# API .env
API_ENV_FILE="apps/api/.env"
echo "Writing $API_ENV_FILE..."

cat > "$API_ENV_FILE" << EOF
# ═══════════════════════════════════════════════════════════
# Production Environment Variables
# Generated: $(date)
# ═══════════════════════════════════════════════════════════

# ───────────── App & Network ─────────────
NODE_ENV=production
PORT=4000
API_BASE_URL=$API_BASE_URL
CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS
LOG_LEVEL=info
HTTP_REQUEST_TIMEOUT_MS=15000
MAX_UPLOAD_MB=25

# ───────────── Database & Cache ─────────────
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
REDIS_PREFIX=wellness
QUEUE_PREFIX=wellness

# ───────────── Auth / Security ─────────────
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=30
ADMIN_EMAILS=$ADMIN_EMAILS
SKIP_WEBHOOK_VERIFICATION=false
GOOGLE_PUBSUB_PUSH_TOKEN=$GOOGLE_PUBSUB_PUSH_TOKEN
BCRYPT_SALT_ROUNDS=10
COOKIE_SECURE=true
COOKIE_DOMAIN=yourdomain.com

# ───────────── Google OAuth ─────────────
GOOGLE_OAUTH_CLIENT_ID_IOS=$GOOGLE_OAUTH_CLIENT_ID_IOS
GOOGLE_OAUTH_CLIENT_ID_ANDROID=$GOOGLE_OAUTH_CLIENT_ID_ANDROID
GOOGLE_OAUTH_CLIENT_ID_WEB=$GOOGLE_OAUTH_CLIENT_ID_WEB
GOOGLE_OAUTH_AUDIENCES=$GOOGLE_OAUTH_CLIENT_ID_IOS,$GOOGLE_OAUTH_CLIENT_ID_ANDROID,$GOOGLE_OAUTH_CLIENT_ID_WEB
PUBLIC_MOBILE_SCHEME=$PUBLIC_MOBILE_SCHEME
PUBLIC_MOBILE_REDIRECT_URL=$PUBLIC_MOBILE_REDIRECT_URL
PUBLIC_WEB_ORIGIN=$PUBLIC_WEB_ORIGIN

# ───────────── Email ─────────────
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM
SMTP_TLS=$SMTP_TLS

# ───────────── File Storage ─────────────
STORAGE_DRIVER=$STORAGE_DRIVER
EOF

# Add storage-specific config
if [ "$STORAGE_DRIVER" = "s3" ]; then
    cat >> "$API_ENV_FILE" << EOF
S3_REGION=$S3_REGION
S3_BUCKET=$S3_BUCKET
S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
S3_FORCE_PATH_STYLE=$S3_FORCE_PATH_STYLE
EOF
elif [ "$STORAGE_DRIVER" = "minio" ]; then
    cat >> "$API_ENV_FILE" << EOF
MINIO_ENDPOINT=$MINIO_ENDPOINT
MINIO_PORT=$MINIO_PORT
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
MINIO_BUCKET=$MINIO_BUCKET
MINIO_USE_SSL=$MINIO_USE_SSL
EOF
else
    cat >> "$API_ENV_FILE" << EOF
FILES_BASE_PATH=$FILES_BASE_PATH
EOF
fi

# Continue API .env
cat >> "$API_ENV_FILE" << EOF

# ───────────── AI Providers ─────────────
GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_GENERATIVE_AI_API_KEY

# ───────────── Push Notifications ─────────────
EXPO_ACCESS_TOKEN=$EXPO_ACCESS_TOKEN

# ───────────── Monitoring ─────────────
SENTRY_DSN=$SENTRY_DSN
POSTHOG_API_KEY=$POSTHOG_API_KEY
POSTHOG_HOST=$POSTHOG_HOST

# ───────────── In-App Purchase ─────────────
APPLE_SHARED_SECRET=$APPLE_SHARED_SECRET
GOOGLE_SERVICE_ACCOUNT_KEY=$GOOGLE_SERVICE_ACCOUNT_KEY

# ───────────── Feature Flags ─────────────
FEATURE_GOOGLE_AUTH=true
FEATURE_OFFLINE_FIRST=true

# ───────────── Defaults ─────────────
PAGINATION_DEFAULT_LIMIT=20
EOF

echo -e "${CHECK} Created $API_ENV_FILE"

# Mobile .env
MOBILE_ENV_FILE="apps/mobile/.env"
echo "Writing $MOBILE_ENV_FILE..."

cat > "$MOBILE_ENV_FILE" << EOF
# ═══════════════════════════════════════════════════════════
# Mobile Production Environment Variables
# Generated: $(date)
# ═══════════════════════════════════════════════════════════

# API
EXPO_PUBLIC_API_BASE_URL=$API_BASE_URL

# Expo
EXPO_PUBLIC_SCHEME=$PUBLIC_MOBILE_SCHEME
EXPO_PUBLIC_REDIRECT_URL=$PUBLIC_MOBILE_REDIRECT_URL

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=$GOOGLE_OAUTH_CLIENT_ID_IOS
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=$GOOGLE_OAUTH_CLIENT_ID_ANDROID
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=$GOOGLE_OAUTH_CLIENT_ID_WEB

# Monitoring
SENTRY_DSN=$SENTRY_DSN
POSTHOG_API_KEY=$POSTHOG_API_KEY
POSTHOG_HOST=$POSTHOG_HOST

# Defaults
EXPO_PUBLIC_DEFAULT_LOCALE=tr
EXPO_PUBLIC_DATE_FORMAT=iso
EOF

echo -e "${CHECK} Created $MOBILE_ENV_FILE"

# Admin .env
ADMIN_ENV_FILE="apps/admin/.env"
if [ -f "apps/admin/.env.example" ]; then
    echo "Writing $ADMIN_ENV_FILE..."
    
    cat > "$ADMIN_ENV_FILE" << EOF
# ═══════════════════════════════════════════════════════════
# Admin Production Environment Variables
# Generated: $(date)
# ═══════════════════════════════════════════════════════════

NEXT_PUBLIC_API_URL=$API_BASE_URL
EOF
    
    echo -e "${CHECK} Created $ADMIN_ENV_FILE"
fi

echo ""

# ============================================================================
# 5. VALIDATION
# ============================================================================

echo -e "${ROCKET} ${GREEN}Step 5: Validation${NC}"
echo ""

# Check if validation script exists
if [ -f "apps/api/scripts/validate-env.ts" ]; then
    echo "Running environment validation..."
    cd apps/api
    if npm run validate:env 2>/dev/null; then
        echo -e "${CHECK} ${GREEN}Environment validation passed!${NC}"
    else
        echo -e "${WARN} ${YELLOW}Some validations failed. Check the output above.${NC}"
    fi
    cd ../..
else
    echo -e "${INFO} Validation script not found, skipping..."
fi

echo ""

# ============================================================================
# 6. SUMMARY
# ============================================================================

echo -e "${ROCKET} ${GREEN}Setup Complete!${NC}"
echo ""
echo -e "${INFO} ${BLUE}Summary:${NC}"
echo -e "  ${CHECK} JWT secrets generated"
echo -e "  ${CHECK} Database configured"
echo -e "  ${CHECK} Redis configured"
echo -e "  ${CHECK} AI provider configured"

if [ -n "$GOOGLE_OAUTH_CLIENT_ID_IOS" ]; then
    echo -e "  ${CHECK} Google OAuth configured"
else
    echo -e "  ${WARN} Google OAuth NOT configured"
fi

if [ -n "$EXPO_ACCESS_TOKEN" ]; then
    echo -e "  ${CHECK} Push notifications configured"
else
    echo -e "  ${WARN} Push notifications NOT configured"
fi

if [ -n "$APPLE_SHARED_SECRET" ]; then
    echo -e "  ${CHECK} Apple IAP configured"
else
    echo -e "  ${WARN} Apple IAP NOT configured"
fi

if [ -n "$GOOGLE_SERVICE_ACCOUNT_KEY" ]; then
    echo -e "  ${CHECK} Google IAP configured"
else
    echo -e "  ${WARN} Google IAP NOT configured"
fi

if [ -n "$SENTRY_DSN" ]; then
    echo -e "  ${CHECK} Error tracking configured"
else
    echo -e "  ${WARN} Error tracking NOT configured"
fi

if [ -n "$POSTHOG_API_KEY" ]; then
    echo -e "  ${CHECK} Analytics configured"
else
    echo -e "  ${WARN} Analytics NOT configured"
fi

echo ""
echo -e "${INFO} ${BLUE}Next Steps:${NC}"
echo "  1. Review the generated .env files"
echo "  2. Run database migrations: cd apps/api && npm run migration:run"
echo "  3. Test the setup: make dev"
echo "  4. Deploy to production"
echo ""
echo -e "${INFO} ${BLUE}Documentation:${NC}"
echo "  - PRODUCTION_ENV_GUIDE.md - Detailed setup guide"
echo "  - DEPLOYMENT_CHECKLIST.md - Pre-deployment checklist"
echo ""
echo -e "${ROCKET} ${GREEN}Happy deploying!${NC}"
