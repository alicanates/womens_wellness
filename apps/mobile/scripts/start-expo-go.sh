#!/bin/bash

# Expo Go ile Hızlı Test
# QR kod ile anında paylaşım

set -e

echo "🚀 Expo Go ile Test Başlatılıyor..."
echo ""
echo "📱 Test kullanıcıları için:"
echo "1. App Store/Play Store'dan 'Expo Go' indirin"
echo "2. Aşağıdaki QR kodu tarayın"
echo ""
echo "💡 Aynı WiFi ağında olmanız gerekiyor"
echo "   (Farklı ağdaysanız: npm run test:tunnel kullanın)"
echo ""

cd "$(dirname "$0")/.."

# Normal mod (aynı WiFi)
npx expo start

echo ""
echo "✅ QR kodu yukarıda görünüyor"
echo "📸 Screenshot alıp arkadaşlarınızla paylaşın!"
