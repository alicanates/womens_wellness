#!/bin/bash

# Development Build APK Oluştur
# Tüm özellikler çalışır + QR kod güncellemeleri

set -e

echo "🔨 Development Build APK Oluşturuluyor..."
echo ""
echo "Bu build ile:"
echo "✅ Tüm native özellikler çalışır (IAP, bildirimler, vb.)"
echo "✅ QR kod ile güncelleme yapabilirsiniz"
echo "✅ Production benzeri test"
echo ""
echo "⏱️  Build süresi: 15-20 dakika"
echo ""

# EAS CLI kontrolü
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI bulunamadı!"
    echo "Kurulum için: npm install -g eas-cli"
    exit 1
fi

# Expo login kontrolü
if ! eas whoami &> /dev/null; then
    echo "⚠️  Expo hesabına giriş yapmanız gerekiyor"
    eas login
fi

cd "$(dirname "$0")/.."

echo "🚀 Android Development Build başlatılıyor..."
echo ""

eas build --profile development --platform android

echo ""
echo "✅ Build başlatıldı!"
echo ""
echo "Build tamamlandığında:"
echo "1. APK'yı indirin: eas build:download"
echo "2. Google Drive'a yükleyin"
echo "3. Linki arkadaşlarınızla paylaşın"
echo ""
echo "Sonra güncellemeler için:"
echo "  npm run dev"
echo "  QR kodu paylaşın"
