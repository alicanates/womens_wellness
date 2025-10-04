#!/usr/bin/env bash
# scripts/dev-setup.sh
set -euo pipefail

echo "🚀 Setting up Wellness development environment..."

# Install Homebrew dependencies
echo "📦 Installing dependencies via Homebrew..."
brew install node@20 pnpm git watchman postgresql@16 redis mailpit || true

# Optional: Detox testing tools
if [[ "${1:-}" == "--with-detox" ]]; then
  brew tap wix/brew && brew install applesimutils || true
fi

# Start services
echo "🔌 Starting services..."
brew services start postgresql@16 || true
createdb wellness || true
brew services start redis || true
brew services start mailpit || true

# Create env files from examples
echo "📋 Creating environment files..."
for app in api mobile admin; do
  if [[ -f "apps/$app/.env.example" ]] && [[ ! -f "apps/$app/.env.local" ]]; then
    cp "apps/$app/.env.example" "apps/$app/.env.local"
    echo "✅ Created apps/$app/.env.local"
  fi
done

# Generate JWT secrets
echo "🔐 Generating JWT secrets..."
if [[ -f "apps/api/.env.local" ]]; then
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  # macOS requires '' after -i for in-place editing
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/__GENERATE_WITH_OPENSSL__/$JWT_SECRET/" apps/api/.env.local
    # Second replacement for refresh secret
    sed -i '' "s/__GENERATE_WITH_OPENSSL__/$JWT_REFRESH_SECRET/" apps/api/.env.local
  else
    sed -i "s/__GENERATE_WITH_OPENSSL__/$JWT_SECRET/" apps/api/.env.local
    sed -i "s/__GENERATE_WITH_OPENSSL__/$JWT_REFRESH_SECRET/" apps/api/.env.local
  fi
  echo "✅ Generated JWT secrets"
fi

echo "✨ Setup complete! Next steps:"
echo "1. Fill in placeholder values in .env.local files"
echo "2. Run: pnpm i && pnpm db:prep"
echo "3. Start development: pnpm dev"
