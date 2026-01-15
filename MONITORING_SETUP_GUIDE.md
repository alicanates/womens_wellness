# 🔍 Monitoring & Observability Kurulum Rehberi

## 📋 Genel Bakış

Bu rehber, Sentry (error tracking) ve PostHog (analytics) entegrasyonunu tamamlamak için adım adım talimatlar içerir.

## 🎯 Kapsam

- ✅ Sentry error tracking (Mobile, API, Admin)
- ✅ PostHog analytics (Mobile, Admin)
- ✅ Environment configuration
- ✅ Production-ready setup

---

## 📦 1. Paket Kurulumu

### Mobile App
```bash
cd apps/mobile
pnpm add @sentry/react-native posthog-react-native
pnpm add -D @sentry/cli
```

### API
```bash
cd apps/api
pnpm add @sentry/node @sentry/profiling-node
```

### Admin Panel
```bash
cd apps/admin
pnpm add @sentry/nextjs posthog-js
```

---

## 🔧 2. Sentry Yapılandırması

### 2.1 Sentry Projesi Oluşturma

1. [sentry.io](https://sentry.io) hesabı oluşturun
2. Yeni organizasyon oluşturun: "Wellness App"
3. Üç proje oluşturun:
   - `wellness-mobile` (React Native)
   - `wellness-api` (Node.js)
   - `wellness-admin` (Next.js)
4. Her proje için DSN'i kopyalayın

### 2.2 Environment Variables

**apps/mobile/.env.local:**
```env
SENTRY_DSN=https://your-mobile-dsn@sentry.io/project-id
```

**apps/api/.env:**
```env
SENTRY_DSN=https://your-api-dsn@sentry.io/project-id
```

**apps/admin/.env.local:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-admin-dsn@sentry.io/project-id
```

---

## 📊 3. PostHog Yapılandırması

### 3.1 PostHog Projesi Oluşturma

1. [posthog.com](https://posthog.com) hesabı oluşturun (veya self-hosted)
2. Yeni proje oluşturun: "Wellness App"
3. API Key'i kopyalayın

### 3.2 Environment Variables

**apps/mobile/.env.local:**
```env
POSTHOG_API_KEY=phc_your_api_key_here
POSTHOG_HOST=https://app.posthog.com
```

**apps/admin/.env.local:**
```env
NEXT_PUBLIC_POSTHOG_API_KEY=phc_your_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 🚀 4. Implementasyon Detayları

### Mobile App Features
- ✅ Automatic error capture
- ✅ Performance monitoring
- ✅ User context tracking
- ✅ Breadcrumbs
- ✅ Release tracking
- ✅ Screen tracking
- ✅ User analytics events

### API Features
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Request context
- ✅ User tracking
- ✅ Custom error handling

### Admin Panel Features
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ User analytics
- ✅ Page view tracking

---

## 🧪 5. Test Etme

### Sentry Test
```typescript
// Mobile veya Admin'de
throw new Error('Test error for Sentry');

// API'de
this.logger.error('Test error for Sentry', { context: 'TestController' });
```

### PostHog Test
```typescript
// Mobile'da
posthog.capture('test_event', { property: 'value' });

// Admin'de
posthog.capture('test_event', { property: 'value' });
```

---

## 📈 6. Production Checklist

- [ ] Sentry DSN'leri production environment'a eklendi
- [ ] PostHog API key production environment'a eklendi
- [ ] Source maps yükleme yapılandırıldı
- [ ] Release tracking aktif
- [ ] User context tracking çalışıyor
- [ ] Performance monitoring aktif
- [ ] Alert kuralları oluşturuldu
- [ ] Team üyeleri Sentry'ye eklendi
- [ ] Dashboard'lar oluşturuldu

---

## 🔐 7. Güvenlik Notları

- ⚠️ DSN'ler public olabilir (client-side)
- ⚠️ Hassas bilgileri beforeSend ile filtreleyin
- ⚠️ PII (Personally Identifiable Information) scrubbing aktif
- ⚠️ API keys'i asla commit etmeyin

---

## 📚 8. Kaynaklar

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [PostHog React Native Docs](https://posthog.com/docs/libraries/react-native)
- [PostHog Next.js Docs](https://posthog.com/docs/libraries/next-js)

---

## ✅ Durum

- ✅ Yapılandırma dosyaları oluşturuldu
- ✅ Utility fonksiyonlar hazır
- ⏳ Paket kurulumu bekleniyor
- ⏳ Environment variables ayarlanması bekleniyor
