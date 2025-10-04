#!/usr/bin/env bash
# scripts/start-all.sh
# Start both API and mobile in separate processes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Starting Women's Wellness Development Environment"
echo ""

# Check if API is already running
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  API server is already running on port 4000"
  echo "   Skipping API start..."
else
  echo "🔧 Starting API server in background..."
  cd "$PROJECT_ROOT"
  pnpm --filter @wellness/api dev > /tmp/wellness-api.log 2>&1 &
  API_PID=$!
  echo "   API server started (PID: $API_PID)"
  echo "   Logs: tail -f /tmp/wellness-api.log"

  # Wait for API to be ready
  echo "   Waiting for API to be ready..."
  for i in {1..30}; do
    if curl -s http://localhost:4000/healthz >/dev/null 2>&1; then
      echo "   ✅ API is ready!"
      break
    fi
    sleep 1
  done
fi

echo ""
echo "📱 Starting mobile app..."
cd "$PROJECT_ROOT"
pnpm --filter @wellness/mobile start --ios
