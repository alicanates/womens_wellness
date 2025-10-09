#!/bin/bash

# Script to clean up and recreate users for the wellness app
# This will delete all users except admin and recreate test users

set -e

echo "🧹 Resetting users in wellness database..."
echo ""

# Database connection string
DB_URL="postgresql://alican@localhost:5432/wellness"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  WARNING: This will delete ALL users except admin!${NC}"
echo -e "${YELLOW}⚠️  All wellness data, conversations, and preferences will be deleted!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Step 1: Deleting all non-admin users..."

psql $DB_URL <<SQL
-- Delete all users except admin
DELETE FROM "User" WHERE email != 'admin@wellness.local';
SQL

echo -e "${GREEN}✓ Non-admin users deleted${NC}"
echo ""

echo "Step 2: Recreating test user..."

# Get the hashed password for "test123"
# bcrypt hash of "test123" with salt rounds 10
# You'll need to generate this properly in your app
TEST_PASSWORD="\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu"

psql $DB_URL <<SQL
-- Create test user
INSERT INTO "User" (id, email, password, status, "createdAt", "updatedAt")
VALUES (
  'user_' || encode(gen_random_bytes(12), 'hex'),
  'test@test.com',
  '$TEST_PASSWORD',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email;

-- Create profile for test user
INSERT INTO "Profile" (id, "userId", "displayName", timezone, "createdAt", "updatedAt")
SELECT
  'profile_' || encode(gen_random_bytes(12), 'hex'),
  id,
  'Test User',
  'Europe/Istanbul',
  NOW(),
  NOW()
FROM "User"
WHERE email = 'test@test.com'
ON CONFLICT ("userId") DO NOTHING;

-- Create subscription for test user
INSERT INTO "Subscription" (id, "userId", plan, status, "createdAt", "updatedAt")
SELECT
  'sub_' || encode(gen_random_bytes(12), 'hex'),
  id,
  'free',
  'active',
  NOW(),
  NOW()
FROM "User"
WHERE email = 'test@test.com'
ON CONFLICT ("userId") DO NOTHING;

-- Create wellness preferences for test user
INSERT INTO "WellnessPreferences" (id, "userId", "stepsGoal", "meditationGoalMin", "sleepGoalHours", "tilesEnabled", "notificationsJson", "createdAt", "updatedAt")
SELECT
  'wp_' || encode(gen_random_bytes(12), 'hex'),
  id,
  7000,
  10,
  7.0,
  '{"steps": true, "meditation": true, "sleep": true, "water": true}'::json,
  '{}'::json,
  NOW(),
  NOW()
FROM "User"
WHERE email = 'test@test.com'
ON CONFLICT ("userId") DO NOTHING;
SQL

echo -e "${GREEN}✓ Test user created (email: test@test.com, password: test123)${NC}"
echo ""

echo "Step 3: Verifying users..."

psql $DB_URL -c "SELECT email, status FROM \"User\";"

echo ""
echo -e "${GREEN}✅ User reset complete!${NC}"
echo ""
echo "Available users:"
echo "  - admin@wellness.local (password: admin123)"
echo "  - test@test.com (password: test123)"
echo ""
