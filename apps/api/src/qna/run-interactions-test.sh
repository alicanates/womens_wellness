#!/bin/bash

echo "🧪 Favorileme ve Takip Sistemi Test Script"
echo "=========================================="
echo ""

# Check if API is running
if ! curl -s http://localhost:3000/api > /dev/null; then
    echo "❌ API sunucusu çalışmıyor. Lütfen önce 'pnpm dev' ile başlatın."
    exit 1
fi

echo "✅ API sunucusu çalışıyor"
echo ""

# Run the test
cd "$(dirname "$0")"
npx ts-node test-interactions.ts
