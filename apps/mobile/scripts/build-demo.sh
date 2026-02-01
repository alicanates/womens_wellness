#!/bin/bash

# Demo Build Script - iOS & Android
# Kadın Atlası uygulamasını test için build eder

set -e

echo "🚀 Kadın Atlası Demo Build Başlatılıyor..."
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EAS CLI kontrolü
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI bulunamadı!${NC}"
    echo "Kurulum için: npm install -g eas-cli"
    exit 1
fi

echo -e "${GREEN}✅ EAS CLI bulundu${NC}"

# Expo login kontrolü
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Expo hesabına giriş yapmanız gerekiyor${NC}"
    eas login
fi

echo -e "${GREEN}✅ Expo hesabına giriş yapıldı${NC}"
echo ""

# Platform seçimi
echo "Hangi platform için build yapmak istiyorsunuz?"
echo "1) iOS (TestFlight)"
echo "2) Android (APK)"
echo "3) Her ikisi"
echo ""
read -p "Seçiminiz (1-3): " platform_choice

case $platform_choice in
    1)
        PLATFORM="ios"
        echo -e "${BLUE}📱 iOS build başlatılıyor...${NC}"
        ;;
    2)
        PLATFORM="android"
        echo -e "${BLUE}🤖 Android build başlatılıyor...${NC}"
        ;;
    3)
        PLATFORM="all"
        echo -e "${BLUE}📱🤖 iOS ve Android build başlatılıyor...${NC}"
        ;;
    *)
        echo -e "${RED}❌ Geçersiz seçim!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}⏳ Build başlatılıyor... Bu işlem 15-30 dakika sürebilir.${NC}"
echo ""

# Build başlat
cd "$(dirname "$0")/.."
eas build --platform $PLATFORM --profile demo --non-interactive

echo ""
echo -e "${GREEN}✅ Build başarıyla başlatıldı!${NC}"
echo ""
echo "Build durumunu kontrol etmek için:"
echo -e "${BLUE}eas build:list${NC}"
echo ""
echo "Build tamamlandığında:"

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
    echo -e "${BLUE}iOS:${NC} TestFlight'a otomatik yüklenecek"
    echo "  - App Store Connect > TestFlight'tan test kullanıcıları ekleyin"
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
    echo -e "${BLUE}Android:${NC} APK'yı indirmek için:"
    echo "  eas build:download --platform android"
fi

echo ""
echo -e "${GREEN}🎉 Detaylı bilgi için DEMO_BUILD_GUIDE.md dosyasına bakın${NC}"
