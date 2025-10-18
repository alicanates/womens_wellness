#!/bin/bash

echo "🧪 QnA Notification System Test"
echo "================================"
echo ""
echo "Prerequisites:"
echo "1. API server must be running (npm run dev)"
echo "2. Test users must exist (test1@example.com, test2@example.com, test3@example.com)"
echo "3. Users should have push tokens registered for actual push delivery"
echo ""
echo "Starting test in 3 seconds..."
sleep 3

cd "$(dirname "$0")/../../.."
npx tsx apps/api/src/qna/test-notifications.ts
