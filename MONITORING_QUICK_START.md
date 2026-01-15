# 🚀 Monitoring Hızlı Başlangıç

## ⚡ 5 Dakikada Kurulum

### 1️⃣ Paketleri Kur (2 dakika)

```bash
bash scripts/install-monitoring.sh
```

### 2️⃣ Sentry Kurulumu (2 dakika)

1. [sentry.io](https://sentry.io) → Sign Up
2. Create Organization: "Wellness App"
3. Create 3 Projects:
   - `wellness-mobile` (React Native)
   - `wellness-api` (Node.js)
   - `wellness-admin` (Next.js)
4. Her projeden DSN'i kopyala

### 3️⃣ PostHog Kurulumu (1 dakika)

1. [posthog.com](https://posthog.com) → Sign Up
2. Create Project: "Wellness App"
3. Copy API Key

### 4️⃣ Environment Variables Ayarla

**apps/mobile/.env.local:**
```env
SENTRY_DSN=https://xxx@sentry.io/mobile-project-id
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com
```

**apps/api/.env:**
```env
SENTRY_DSN=https://xxx@sentry.io/api-project-id
```

**apps/admin/.env.local:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/admin-project-id
NEXT_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 5️⃣ Test Et

```bash
# Uygulamayı başlat
pnpm dev

# Mobile'da bir hata oluştur (test için)
# Sentry dashboard'unda görünmeli
```

---

## ✅ Kurulum Tamamlandı!

### 📊 Sentry'de Görebilecekleriniz:
- Uygulama hataları
- Performance metrikleri
- User context
- Breadcrumbs (kullanıcı aksiyonları)

### 📈 PostHog'da Görebilecekleriniz:
- User analytics
- Feature usage
- Conversion funnels
- Session recordings (opsiyonel)

---

## 🔧 Gelişmiş Yapılandırma

Detaylı yapılandırma için: [MONITORING_SETUP_GUIDE.md](./MONITORING_SETUP_GUIDE.md)

---

## 🆘 Sorun Giderme

### Sentry çalışmıyor
- DSN doğru mu kontrol edin
- Console'da "Sentry initialized" mesajını arayın
- Network tab'da sentry.io'ya istek gidiyor mu kontrol edin

### PostHog çalışmıyor
- API Key doğru mu kontrol edin
- Console'da PostHog hatalarını kontrol edin
- Browser'da posthog.com'a istek gidiyor mu kontrol edin

---

## 📚 Kullanım Örnekleri

### Mobile'da Event Tracking
```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/posthog';

trackEvent(AnalyticsEvents.CHAT_MESSAGE_SENT, {
  messageLength: message.length,
  hasAttachment: false,
});
```

### API'de Error Tracking
```typescript
import { SentryService } from './common/sentry.service';

this.sentryService.captureException(error, {
  userId: user.id,
  endpoint: '/api/chat',
});
```

### Admin'de User Tracking
```typescript
import { identifyUser } from '@/lib/posthog';

identifyUser(user.id, {
  role: 'admin',
  email: user.email,
});
```
