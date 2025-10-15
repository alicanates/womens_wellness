#!/bin/bash

# Forget Conversation Test Runner
# Bu script forget conversation testini çalıştırır

echo "🧪 Running Forget Conversation Test..."
echo ""

# API dizinine git
cd "$(dirname "$0")/../.."

# .env.local dosyasını yükle
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Test scriptini çalıştır
npx tsx src/chat/test-forget-conversation.ts

# Exit code'u koru
exit $?
