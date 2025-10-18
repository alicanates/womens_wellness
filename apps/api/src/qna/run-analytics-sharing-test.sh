#!/bin/bash

echo "🚀 Running Analytics and Sharing Tests..."
echo ""

cd "$(dirname "$0")/../../.."

npx ts-node apps/api/src/qna/test-analytics-sharing.ts
