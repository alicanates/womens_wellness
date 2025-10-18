#!/bin/bash

# Q&A Filtering and Search Test Runner
# This script tests category filtering, tag filtering, search, and sorting features

echo "🧪 Q&A Filtering and Search Test"
echo "================================"
echo ""

# Check if API is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ API is not running on http://localhost:3000"
    echo "Please start the API server first: cd apps/api && pnpm dev"
    exit 1
fi

echo "✅ API is running"
echo ""

# Run the test
cd "$(dirname "$0")"
npx tsx test-filtering.ts

exit $?
