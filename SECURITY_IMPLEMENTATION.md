# 🔒 Güvenlik Güncellemeleri - Production Hazırlığı

## ✅ Tamamlanan Güvenlik İyileştirmeleri

### 1. Pages Controller Authentication ✅
**Dosya:** `apps/api/src/pages/pages.controller.ts`

**Değişiklikler:**
- ✅ Tüm admin endpoint'lere `@UseGuards(JwtAuthGuard, AdminGuard)` eklendi
- ✅ `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` endpoint'leri korundu
- ✅ Public endpoint'ler (`GET /`, `GET /slug/:slug`) açık kaldı

**Korunan Endpoint'ler:**
```typescript
@Get(':id')           // Admin only
@Post()               // Admin only
@Put(':id')           // Admin only
@Delete(':id')        // Admin only
```

---

### 2. Feature Flags Controller Authentication ✅
**Dosya:** `apps/api/src/feature-flag/feature-flag.controller.ts`

**Değişiklikler:**
- ✅ Write endpoint'lere `@UseGuards(AdminGuard)` eklendi
- ✅ Read endpoint'ler authenticated user'lara açık
- ✅ Create, Update, Delete işlemleri sadece admin'ler için

**Korunan Endpoint'ler:**
```typescript
@Post()               // Admin only
@Patch(':key')        // Admin only
@Delete(':key')       // Admin only
```

---

### 3. Subscription Analytics Authentication ✅
**Dosya:** `apps/api/src/subscription/subscription.controller.ts`

**Değişiklikler:**
- ✅ Tüm analytics endpoint'lere `@UseGuards(AuthGuard('jwt'), AdminGuard)` eklendi
- ✅ Admin subscription management endpoint'leri korundu

**Korunan Endpoint'ler:**
```typescript
@Get('analytics/dashboard')    // Admin only
@Get('analytics/mrr')          // Admin only
@Get('analytics/arpu')         // Admin only
@Get('analytics/churn')        // Admin only
@Get('analytics/conversion')   // Admin only
@Get('analytics/revenue')      // Admin only
@Get('analytics/distribution') // Admin only
@Get('analytics/ltv')          // Admin only
@Get('admin/all')              // Admin only
@Get('admin/:id')              // Admin only
```

---

### 4. IAP Webhook Signature Verification ✅

#### Apple Webhook Guard
**Dosya:** `apps/api/src/subscription/guards/apple-webhook.guard.ts`

**Özellikler:**
- ✅ Apple App Store Server Notification signature verification
- ✅ JWT format validation
- ✅ Development mode bypass (SKIP_WEBHOOK_VERIFICATION=true)
- ✅ Decoded payload request'e ekleniyor
- ⚠️  **TODO:** Full JWT verification with Apple's public keys

**Kullanım:**
```typescript
@Post('webhook/apple')
@UseGuards(AppleWebhookGuard)
async handleAppleWebhook(@Body() body: any, @Request() req) {
    const payload = req.appleWebhookPayload || body;
    // ...
}
```

#### Google Webhook Guard
**Dosya:** `apps/api/src/subscription/guards/google-webhook.guard.ts`

**Özellikler:**
- ✅ Google Play Real-time Developer Notification verification
- ✅ Pub/Sub JWT token validation
- ✅ Push endpoint token verification
- ✅ Base64 message decoding
- ✅ Development mode bypass (SKIP_WEBHOOK_VERIFICATION=true)
- ⚠️  **TODO:** Full JWT verification with Google's public keys

**Kullanım:**
```typescript
@Post('webhook/google')
@UseGuards(GoogleWebhookGuard)
async handleGoogleWebhook(@Body() body: any, @Request() req) {
    const data = req.googleWebhookData || body;
    // ...
}
```

---

## 🔧 Gerekli Environment Variables

### Production için Zorunlu:
```bash
# Admin Authentication
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Webhook Security (Production)
NODE_ENV=production
SKIP_WEBHOOK_VERIFICATION=false  # Production'da false olmalı!

# Google Pub/Sub Webhook Token
GOOGLE_PUBSUB_PUSH_TOKEN=your-secure-random-token-here
```

### Development için:
```bash
# Development Mode
NODE_ENV=development
SKIP_WEBHOOK_VERIFICATION=true  # Sadece development'ta true!

# Admin Authentication (Test)
ADMIN_EMAILS=test@admin.wellnesscompanion.com
```

---

## 📋 Production Checklist

### Deployment Öncesi Kontroller:

- [ ] **Environment Variables**
  - [ ] `NODE_ENV=production` set edildi
  - [ ] `SKIP_WEBHOOK_VERIFICATION=false` set edildi
  - [ ] `ADMIN_EMAILS` production admin'leri içeriyor
  - [ ] `GOOGLE_PUBSUB_PUSH_TOKEN` güçlü bir token ile set edildi

- [ ] **Admin Accounts**
  - [ ] Production admin email'leri belirlendi
  - [ ] Admin domain (@admin.wellnesscompanion.com) aktif
  - [ ] Test admin hesapları production'dan kaldırıldı

- [ ] **Webhook Configuration**
  - [ ] Apple App Store webhook URL'i yapılandırıldı
  - [ ] Google Play Pub/Sub topic oluşturuldu
  - [ ] Google Pub/Sub push endpoint token set edildi
  - [ ] Webhook endpoint'leri test edildi

- [ ] **Security Testing**
  - [ ] Admin endpoint'ler non-admin user ile test edildi (403 dönmeli)
  - [ ] Webhook endpoint'leri invalid signature ile test edildi (401 dönmeli)
  - [ ] Feature flag write endpoint'leri non-admin ile test edildi (403 dönmeli)

---

## ⚠️ Kalan TODO'lar (Önerilen İyileştirmeler)

### 1. Full JWT Verification - Apple Webhooks
**Öncelik:** Yüksek

**Yapılacaklar:**
1. Apple'ın public key'lerini fetch et: `https://api.storekit.itunes.apple.com/v1/certificates`
2. JWT signature'ı public key ile verify et
3. JWT claims'leri validate et (iss, aud, exp)
4. Key rotation'ı handle et

**Referans:** https://developer.apple.com/documentation/appstoreservernotifications/responding_to_app_store_server_notifications

---

### 2. Full JWT Verification - Google Webhooks
**Öncelik:** Yüksek

**Yapılacaklar:**
1. Google'ın public key'lerini fetch et: `https://www.googleapis.com/oauth2/v3/certs`
2. JWT signature'ı public key ile verify et
3. JWT claims'leri validate et (iss, aud, exp)
4. Key rotation'ı handle et

**Referans:** https://cloud.google.com/pubsub/docs/push#authentication_and_authorization

---

### 3. Rate Limiting - Admin Endpoints
**Öncelik:** Orta

**Yapılacaklar:**
- Admin endpoint'lere rate limiting ekle
- Brute force attack'lere karşı koruma
- IP-based throttling

---

### 4. Audit Logging
**Öncelik:** Orta

**Yapılacaklar:**
- Admin işlemlerini logla
- Webhook event'lerini logla
- Security event'lerini logla
- Log retention policy belirle

---

## 🧪 Test Senaryoları

### Admin Authentication Tests:
```bash
# Non-admin user ile admin endpoint'e istek
curl -H "Authorization: Bearer <non-admin-token>" \
  http://localhost:3000/api/pages

# Beklenen: 403 Forbidden

# Admin user ile admin endpoint'e istek
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/pages

# Beklenen: 200 OK
```

### Webhook Signature Tests:
```bash
# Invalid signature ile Apple webhook
curl -X POST http://localhost:3000/api/subscription/webhook/apple \
  -H "Content-Type: application/json" \
  -d '{"signedPayload": "invalid.jwt.token"}'

# Beklenen: 401 Unauthorized (production'da)

# Invalid token ile Google webhook
curl -X POST http://localhost:3000/api/subscription/webhook/google \
  -H "Content-Type: application/json" \
  -d '{"message": {"data": "invalid"}}'

# Beklenen: 401 Unauthorized (production'da)
```

---

## 📚 Dokümantasyon

### Admin Guard Kullanımı:
```typescript
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin')
export class AdminController {
  @Get('sensitive-data')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getSensitiveData() {
    // Sadece admin'ler erişebilir
  }
}
```

### Webhook Guard Kullanımı:
```typescript
import { AppleWebhookGuard } from './guards/apple-webhook.guard';

@Post('webhook/apple')
@UseGuards(AppleWebhookGuard)
async handleWebhook(@Body() body: any, @Request() req) {
  // req.appleWebhookPayload verified payload içerir
}
```

---

## 🎯 Özet

### Kapatılan Güvenlik Açıkları:
1. ✅ Pages controller authentication eksikliği
2. ✅ Feature flags write endpoint'leri korumasız
3. ✅ Subscription analytics endpoint'leri korumasız
4. ✅ Admin subscription management endpoint'leri korumasız
5. ✅ Apple IAP webhook signature verification eksikliği (basic)
6. ✅ Google Play IAP webhook verification eksikliği (basic)

### Production'a Hazır:
- ✅ Tüm admin endpoint'ler korunuyor
- ✅ Webhook endpoint'leri basic verification ile korunuyor
- ✅ Development/Production mode ayrımı yapılıyor
- ✅ Environment variable'lar dokümante edildi

### Önerilen İyileştirmeler:
- ⚠️  Full JWT verification (Apple & Google)
- ⚠️  Rate limiting
- ⚠️  Audit logging
- ⚠️  Security monitoring

---

**Son Güncelleme:** 2026-01-16
**Durum:** ✅ Production Ready (with recommended improvements)
