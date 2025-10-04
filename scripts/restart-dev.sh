#!/usr/bin/env bash
# scripts/restart-dev.sh
# Safely restart development servers

set -e

echo "🛑 Stopping existing processes..."

# Kill only the specific Metro bundler and Expo processes
pkill -f "expo start" || true
pkill -f "react-native start" || true
pkill -f "metro" || true

# Kill the Simulator if requested
if [[ "$1" == "--kill-simulator" ]]; then
  echo "🛑 Stopping iOS Simulator..."
  killall Simulator 2>/dev/null || true
fi

# Wait a moment for processes to clean up
sleep 2

echo "✅ Cleaned up old processes"
echo ""
echo "🚀 Starting API server..."
echo "   Run in a separate terminal: cd /Users/alican/projects/womens_wellness && pnpm --filter @wellness/api dev"
echo ""
echo "📱 Starting mobile app..."

# Start mobile (API should already be running in another terminal)
cd /Users/alican/projects/womens_wellness
pnpm --filter @wellness/mobile start --ios
