#!/usr/bin/env bash

set -euo pipefail

echo "🔧 EAS Build Pre-Install Script"
echo "================================"

# We're in a monorepo but EAS Build doesn't handle it well
# So we'll install only what we need

echo "📦 Installing pnpm..."
npm install -g pnpm@10.14.0

echo "✅ Pre-install complete"
