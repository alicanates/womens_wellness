#!/bin/bash

# Monitoring & Observability Paket Kurulum Script'i
# Bu script Sentry ve PostHog paketlerini tüm uygulamalara kurar

set -e

echo "🔍 Monitoring & Observability Paketleri Kuruluyor..."
echo ""

# Mobile App
echo "📱 Mobile App paketleri kuruluyor..."
cd apps/mobile
pnpm add @sentry/react-native posthog-react-native
pnpm add -D @sentry/cli
cd ../..
echo "✅ Mobile paketleri kuruldu"
echo ""

# API
echo "🔧 API paketleri kuruluyor..."
cd apps/api
pnpm add @sentry/node @sentry/profiling-node
cd ../..
echo "✅ API paketleri kuruldu"
echo ""

# Admin Panel
echo "⚙️ Admin Panel paketleri kuruluyor..."
cd apps/admin
pnpm add @sentry/nextjs posthog-js
cd ../..
echo "✅ Admin paketleri kuruldu"
echo ""

echo "✨ Tüm monitoring paketleri başarıyla kuruldu!"
echo ""
echo "📋 Sonraki Adımlar:"
echo "1. Sentry hesabı oluşturun: https://sentry.io"
echo "2. PostHog hesabı oluşturun: https://posthog.com"
echo "3. DSN ve API key'leri .env dosyalarına ekleyin"
echo "4. MONITORING_SETUP_GUIDE.md dosyasını inceleyin"
echo ""
