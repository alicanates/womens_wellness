#!/bin/bash

# Production Environment Validation Script
# Checks if all required environment variables are properly set

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
ERRORS=0
WARNINGS=0
PASSED=0

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Production Environment Validation                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load .env file if exists
if [ -f "apps/api/.env" ]; then
    export $(cat apps/api/.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Loaded apps/api/.env"
else
    echo -e "${RED}✗${NC} apps/api/.env not found!"
    exit 1
fi

echo ""

# Function to check required variable
check_required() {
    local var_name="$1"
    local var_value="${!var_name}"
    local description="$2"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗${NC} $var_name - ${RED}MISSING${NC} ($description)"
        ((ERRORS++))
        return 1
    elif [[ "$var_value" == *"PLACEHOLDER"* ]] || [[ "$var_value" == *"__SET__"* ]] || [[ "$var_value" == *"__GENERATE"* ]]; then
        echo -e "${YELLOW}⚠${NC} $var_name - ${YELLOW}PLACEHOLDER${NC} ($description)"
        ((WARNINGS++))
        return 1
    else
        echo -e "${GREEN}✓${NC} $var_name - ${GREEN}OK${NC}"
        ((PASSED++))
        return 0
    fi
}

# Function to check optional variable
check_optional() {
    local var_name="$1"
    local var_value="${!var_name}"
    local description="$2"
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠${NC} $var_name - ${YELLOW}NOT SET${NC} ($description)"
        ((WARNINGS++))
    elif [[ "$var_value" == *"PLACEHOLDER"* ]] || [[ "$var_value" == *"__OPTIONAL__"* ]]; then
        echo -e "${YELLOW}⚠${NC} $var_name - ${YELLOW}PLACEHOLDER${NC} ($description)"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓${NC} $var_name - ${GREEN}OK${NC}"
        ((PASSED++))
    fi
}

# Function to check security
check_security() {
    local var_name="$1"
    local var_value="${!var_name}"
    local insecure_value="$2"
    local description="$3"
    
    if [ "$var_value" = "$insecure_value" ]; then
        echo -e "${RED}✗${NC} $var_name - ${RED}INSECURE${NC} ($description)"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✓${NC} $var_name - ${GREEN}SECURE${NC}"
        ((PASSED++))
        return 0
    fi
}

# ============================================================================
# CRITICAL CHECKS
# ============================================================================

echo -e "${BLUE}[1] Critical Variables${NC}"
echo ""

check_required "DATABASE_URL" "PostgreSQL connection string"
check_required "REDIS_URL" "Redis connection string"
check_required "JWT_SECRET" "JWT signing secret"
check_required "JWT_REFRESH_SECRET" "JWT refresh token secret"
check_required "GOOGLE_GENERATIVE_AI_API_KEY" "Gemini AI API key"

echo ""

# ============================================================================
# SECURITY CHECKS
# ============================================================================

echo -e "${BLUE}[2] Security Checks${NC}"
echo ""

check_security "JWT_SECRET" "your-super-secret-jwt-key-change-this-in-production" "Must be changed from default"
check_security "JWT_SECRET" "__GENERATE_WITH_OPENSSL__" "Must be generated"

# Check JWT secret length
if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠${NC} JWT_SECRET - ${YELLOW}TOO SHORT${NC} (should be at least 32 characters)"
    ((WARNINGS++))
fi

# Check if DATABASE_URL has SSL
if [[ "$DATABASE_URL" != *"sslmode=require"* ]] && [[ "$DATABASE_URL" != *"ssl=true"* ]]; then
    echo -e "${YELLOW}⚠${NC} DATABASE_URL - ${YELLOW}SSL NOT ENFORCED${NC} (add ?sslmode=require)"
    ((WARNINGS++))
fi

# Check if Redis has password
if [[ "$REDIS_URL" != *"@"* ]] && [[ "$REDIS_URL" != *":"*":"* ]]; then
    echo -e "${YELLOW}⚠${NC} REDIS_URL - ${YELLOW}NO PASSWORD${NC} (recommended for production)"
    ((WARNINGS++))
fi

# Check webhook verification
if [ "$SKIP_WEBHOOK_VERIFICATION" = "true" ]; then
    echo -e "${RED}✗${NC} SKIP_WEBHOOK_VERIFICATION - ${RED}DISABLED${NC} (must be false in production)"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} SKIP_WEBHOOK_VERIFICATION - ${GREEN}ENABLED${NC}"
    ((PASSED++))
fi

# Check cookie security
if [ "$COOKIE_SECURE" != "true" ]; then
    echo -e "${YELLOW}⚠${NC} COOKIE_SECURE - ${YELLOW}NOT SECURE${NC} (should be true in production)"
    ((WARNINGS++))
fi

echo ""

# ============================================================================
# AUTHENTICATION CHECKS
# ============================================================================

echo -e "${BLUE}[3] Authentication${NC}"
echo ""

check_optional "GOOGLE_OAUTH_CLIENT_ID_IOS" "iOS Google OAuth client ID"
check_optional "GOOGLE_OAUTH_CLIENT_ID_ANDROID" "Android Google OAuth client ID"
check_optional "GOOGLE_OAUTH_CLIENT_ID_WEB" "Web Google OAuth client ID"

echo ""

# ============================================================================
# PUSH NOTIFICATIONS
# ============================================================================

echo -e "${BLUE}[4] Push Notifications${NC}"
echo ""

check_optional "EXPO_ACCESS_TOKEN" "Expo push notification token"

echo ""

# ============================================================================
# IN-APP PURCHASE
# ============================================================================

echo -e "${BLUE}[5] In-App Purchase${NC}"
echo ""

check_optional "APPLE_SHARED_SECRET" "Apple App Store shared secret"
check_optional "GOOGLE_SERVICE_ACCOUNT_KEY" "Google Play service account JSON"
check_optional "GOOGLE_PUBSUB_PUSH_TOKEN" "Google Pub/Sub webhook token"

echo ""

# ============================================================================
# EMAIL SERVICE
# ============================================================================

echo -e "${BLUE}[6] Email Service${NC}"
echo ""

check_optional "SMTP_HOST" "SMTP server host"
check_optional "SMTP_PORT" "SMTP server port"
check_optional "SMTP_FROM" "From email address"

echo ""

# ============================================================================
# FILE STORAGE
# ============================================================================

echo -e "${BLUE}[7] File Storage${NC}"
echo ""

if [ "$STORAGE_DRIVER" = "s3" ]; then
    check_required "S3_REGION" "AWS S3 region"
    check_required "S3_BUCKET" "AWS S3 bucket name"
    check_required "S3_ACCESS_KEY_ID" "AWS access key ID"
    check_required "S3_SECRET_ACCESS_KEY" "AWS secret access key"
elif [ "$STORAGE_DRIVER" = "minio" ]; then
    check_required "MINIO_ENDPOINT" "MinIO endpoint"
    check_required "MINIO_ACCESS_KEY" "MinIO access key"
    check_required "MINIO_SECRET_KEY" "MinIO secret key"
    check_required "MINIO_BUCKET" "MinIO bucket name"
else
    echo -e "${GREEN}✓${NC} Using filesystem storage"
    ((PASSED++))
fi

echo ""

# ============================================================================
# MONITORING
# ============================================================================

echo -e "${BLUE}[8] Monitoring & Analytics${NC}"
echo ""

check_optional "SENTRY_DSN" "Sentry error tracking DSN"
check_optional "POSTHOG_API_KEY" "PostHog analytics API key"

echo ""

# ============================================================================
# CORS & DOMAINS
# ============================================================================

echo -e "${BLUE}[9] CORS & Domains${NC}"
echo ""

if [ -n "$CORS_ALLOWED_ORIGINS" ]; then
    if [[ "$CORS_ALLOWED_ORIGINS" == *"localhost"* ]]; then
        echo -e "${YELLOW}⚠${NC} CORS_ALLOWED_ORIGINS - ${YELLOW}CONTAINS LOCALHOST${NC} (remove for production)"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓${NC} CORS_ALLOWED_ORIGINS - ${GREEN}OK${NC}"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} CORS_ALLOWED_ORIGINS - ${YELLOW}NOT SET${NC}"
    ((WARNINGS++))
fi

if [ -n "$API_BASE_URL" ]; then
    if [[ "$API_BASE_URL" == *"localhost"* ]]; then
        echo -e "${YELLOW}⚠${NC} API_BASE_URL - ${YELLOW}LOCALHOST${NC} (should be production domain)"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓${NC} API_BASE_URL - ${GREEN}OK${NC}"
        ((PASSED++))
    fi
fi

echo ""

# ============================================================================
# ADMIN CONFIGURATION
# ============================================================================

echo -e "${BLUE}[10] Admin Configuration${NC}"
echo ""

if [ -n "$ADMIN_EMAILS" ]; then
    if [[ "$ADMIN_EMAILS" == *"test@test.com"* ]] || [[ "$ADMIN_EMAILS" == *"admin@test.com"* ]]; then
        echo -e "${YELLOW}⚠${NC} ADMIN_EMAILS - ${YELLOW}CONTAINS TEST EMAILS${NC} (update for production)"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓${NC} ADMIN_EMAILS - ${GREEN}OK${NC}"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} ADMIN_EMAILS - ${YELLOW}NOT SET${NC}"
    ((WARNINGS++))
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Validation Summary                                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASSED + WARNINGS + ERRORS))

echo -e "  ${GREEN}✓ Passed:${NC}   $PASSED / $TOTAL"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $WARNINGS / $TOTAL"
echo -e "  ${RED}✗ Errors:${NC}   $ERRORS / $TOTAL"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   VALIDATION FAILED                                       ║${NC}"
    echo -e "${RED}║   Fix the errors above before deploying to production    ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║   VALIDATION PASSED WITH WARNINGS                         ║${NC}"
    echo -e "${YELLOW}║   Review warnings above for optimal configuration         ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   VALIDATION PASSED                                       ║${NC}"
    echo -e "${GREEN}║   All checks passed! Ready for production deployment     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
fi
