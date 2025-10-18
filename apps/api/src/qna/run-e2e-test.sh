#!/bin/bash

# QnA E2E Integration Test Runner
# This script runs comprehensive end-to-end tests for the QnA module

echo "🚀 Starting QnA E2E Integration Tests..."
echo "=========================================="
echo ""

# Check if API is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Warning: API server doesn't seem to be running on port 3000"
    echo "   Please start the API server first: cd apps/api && pnpm dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Set test environment
export NODE_ENV=test

# Run the e2e tests
echo "📝 Running E2E tests..."
echo ""

cd "$(dirname "$0")/../../.."
npx jest --config apps/api/jest.config.js apps/api/src/qna/qna.e2e.spec.ts --runInBand --verbose

TEST_EXIT_CODE=$?

echo ""
echo "=========================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All E2E tests passed!"
else
    echo "❌ Some E2E tests failed"
fi
echo "=========================================="

exit $TEST_EXIT_CODE
