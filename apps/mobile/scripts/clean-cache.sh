#!/bin/bash

# React Native & Expo Cache Temizleme Scripti
# Bu script tüm cache'leri temizler ve fresh start sağlar

echo "🧹 Cache temizleme başlıyor..."

# 1. Node modules
echo "📦 Node modules siliniyor..."
rm -rf node_modules

# 2. Expo cache
echo "🎯 Expo cache siliniyor..."
rm -rf .expo
rm -rf .expo-shared

# 3. Metro bundler cache
echo "🚇 Metro cache siliniyor..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true

# 4. Android build cache
echo "🤖 Android cache siliniyor..."
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/build

# 5. iOS build cache
echo "🍎 iOS cache siliniyor..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

# 6. Watchman cache
echo "👀 Watchman cache siliniyor..."
watchman watch-del-all 2>/dev/null || true

# 7. Log dosyaları
echo "📝 Log dosyaları siliniyor..."
find . -name "*.log" -type f -delete

# 8. Dependencies yeniden yükleme
echo "📥 Dependencies yeniden yükleniyor..."
pnpm install

echo ""
echo "✅ Cache temizleme tamamlandı!"
echo ""
echo "🚀 Uygulamayı başlatmak için:"
echo "   pnpm start"
echo ""
echo "veya cache ile başlatmak için:"
echo "   npx expo start -c"
