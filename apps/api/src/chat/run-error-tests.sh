#!/bin/bash

# Error Scenarios Test Runner
# This script runs the error scenario tests for the chat system

echo "🔴 Starting Error Scenarios Test Suite"
echo "========================================"
echo ""

# Check if API is running
API_URL="${API_URL:-http://localhost:3001}"
echo "Checking if API is running at $API_URL..."

if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ API is running"
else
    echo "⚠️  Warning: API may not be running at $API_URL"
    echo "   Some tests may fail. Start the API with: pnpm dev"
    echo ""
fi

# Load environment variables
if [ -f "apps/api/.env.local" ]; then
    export $(cat apps/api/.env.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  Warning: .env.local not found"
fi

echo ""
echo "Running error scenario tests..."
echo ""

# Run the test script
cd apps/api
npx ts-node src/chat/test-error-scenarios.ts

# Capture exit code
EXIT_CODE=$?

echo ""
echo "========================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Error scenario tests completed successfully"
else
    echo "❌ Error scenario tests failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
