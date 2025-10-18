#!/bin/bash

echo "🧪 Reputation System Test Script"
echo "================================"
echo ""
echo "Bu script reputation sistemini test eder."
echo ""

# API'nin çalıştığından emin ol
echo "📡 API bağlantısı kontrol ediliyor..."
if ! curl -s http://localhost:3000/api > /dev/null; then
    echo "❌ API çalışmıyor! Lütfen önce 'pnpm dev' ile API'yi başlatın."
    exit 1
fi

echo "✅ API çalışıyor"
echo ""

# Test kullanıcılarının var olduğundan emin ol
echo "👤 Test kullanıcıları kontrol ediliyor..."
echo "Not: test@example.com ve test2@example.com kullanıcılarının var olması gerekiyor"
echo ""

# Test'i çalıştır
echo "🚀 Test başlatılıyor..."
echo ""

cd "$(dirname "$0")"
npx tsx test-reputation.ts

echo ""
echo "✅ Test tamamlandı!"
