# 🔐 Production Environment Setup Guide

Bu rehber, Women's Wellness App'i production'a deploy etmek için gerekli tüm environment variable'ları adım adım açıklar.

## 📋 İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Kritik Değişkenler](#kritik-değişkenler)
3. [Servis Bazlı Kurulum](#servis-bazlı-kurulum)
4. [Güvenlik Kontrolleri](#güvenlik-kontrolleri)
5. [Deployment Checklist](#deployment-checklist)

---

## 🚀 Hızlı Başlangıç

### 1. Environment Dosyalarını Oluştur

```bash
# API için
cp apps/api/.env.example apps/api/.env

# Mobile için
cp apps/mobile/.env.example apps/mobile/.env

# Admin için
cp apps/admin/.env.example apps/admin/.env
```

### 2. Otomatik Setup Script'i Çalıştır

```bash
# Interactive setup (önerilen)
./scripts/setup-production-env.sh

# Veya manuel olarak devam et
```

---

## ⚠️ Kritik Değişkenler

Bu değişkenler **MUTLAKA** ayarlanmalı, yoksa uygulama çalışmaz:

### 1. AI Provider (ZORUNLU)

```bash
# Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

**Nasıl alınır:**
1. https://aistudio.google.com/app/apikey adresine git
2. Google hesabınla giriş yap
3. "Create API Key" butonuna tıkla
4. API key'i kopyala

**Maliyet:** İlk 50 request/gün ücretsiz, sonrası $0.001/request

### 2. JWT Secrets (ZORUNLU)

```bash
# Güvenli random string'ler oluştur
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

**Önemli:** Production'da bu değerleri **ASLA** değiştirme, tüm kullanıcılar logout olur!

### 3. Database (ZORUNLU)

```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

**Önerilen servisler:**
- **Supabase** (ücretsiz tier, kolay): https://supabase.com
- **Railway** ($5/ay): https://railway.app
- **DigitalOcean** ($15/ay): https://digitalocean.com/products/managed-databases

### 4. Redis (ZORUNLU)

```bash
# Redis connection string
REDIS_URL=redis://:password@host:6379
```

**Önerilen servisler:**
- **Upstash** (ücretsiz tier): https://upstash.com
- **Railway** ($5/ay): https://railway.app

### 5. Google OAuth (ZORUNLU - Google login için)

```bash
GOOGLE_OAUTH_CLIENT_ID_IOS=123456789-xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_ANDROID=123456789-yyy.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_WEB=123456789-zzz.apps.googleusercontent.com
```

**Nasıl alınır:** Aşağıda detaylı anlatım var.

### 6. Push Notifications (ZORUNLU - bildirimler için)

```bash
# Expo Dashboard: https://expo.dev
EXPO_ACCESS_TOKEN=your-expo-access-token
```

---

## 🔧 Servis Bazlı Kurulum

### Google OAuth Setup

**1. Google Cloud Console'a git:**
https://console.cloud.google.com

**2. Yeni proje oluştur:**
- "Select a project" → "New Project"
- Proje adı: "Women's Wellness"
- Create

**3. OAuth Consent Screen:**
- APIs & Services → OAuth consent screen
- User Type: External
- App name: Women's Wellness
- User support email: [email]
- Developer contact: [email]
- Save

**4. Credentials oluştur:**

**iOS Client ID:**
```
APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
Application type: iOS
Bundle ID: com.yourcompany.wellness (app.json'dan al)
```

**Android Client ID:**
```
Application type: Android
Package name: com.yourcompany.wellness
SHA-1: (EAS Build'den alınacak)
```

**Web Client ID:**
```
Application type: Web application
Authorized redirect URIs:
  - https://yourdomain.com/auth/callback
  - http://localhost:3000/auth/callback (dev için)
```

**5. .env dosyalarına ekle:**
```bash
# apps/api/.env
GOOGLE_OAUTH_CLIENT_ID_IOS=xxx-ios.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_ANDROID=xxx-android.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_WEB=xxx-web.apps.googleusercontent.com

# apps/mobile/.env
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxx-ios.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxx-android.apps.googleusercontent.com
```

---

### Expo Push Notifications

**1. Expo hesabı oluştur:**
https://expo.dev

**2. Access token al:**
```
Dashboard → Account Settings → Access Tokens → Create Token
Name: Production API
Scope: Read & Write
```

**3. .env'e ekle:**
```bash
# apps/api/.env
EXPO_ACCESS_TOKEN=your-token-here
```

---

### Database Setup (Supabase Örneği)

**1. Supabase'e git:**
https://supabase.com

**2. Yeni proje oluştur:**
- Organization: Yeni oluştur
- Project name: wellness-prod
- Database password: Güçlü bir şifre
- Region: Frankfurt (Türkiye'ye yakın)

**3. Connection string al:**
```
Project Settings → Database → Connection string → URI
```

**4. .env'e ekle:**
```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require
```

**5. Migration'ları çalıştır:**
```bash
cd apps/api
npm run migration:run
```

---

### Redis Setup (Upstash Örneği)

**1. Upstash'e git:**
https://upstash.com

**2. Yeni database oluştur:**
- Name: wellness-prod
- Type: Regional
- Region: eu-central-1 (Frankfurt)
- TLS: Enabled

**3. Connection string al:**
```
Database → Details → REST API → UPSTASH_REDIS_REST_URL
```

**4. .env'e ekle:**
```bash
REDIS_URL=rediss://default:[password]@[host]:6379
```

---

### In-App Purchase Setup

#### Apple App Store

**1. App Store Connect'e git:**
https://appstoreconnect.apple.com

**2. Shared Secret al:**
```
My Apps → [Your App] → App Information → App-Specific Shared Secret → Generate
```

**3. .env'e ekle:**
```bash
APPLE_SHARED_SECRET=abc123def456...
```

#### Google Play Store

**1. Google Play Console'a git:**
https://play.google.com/console

**2. Service Account oluştur:**
```
Setup → API access → Create new service account
Google Cloud Console'da:
  - Service account name: wellness-iap
  - Role: Service Account User
  - Create key → JSON
```

**3. JSON key'i tek satıra çevir:**
```bash
cat service-account.json | jq -c . | pbcopy
```

**4. .env'e ekle:**
```bash
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'
```

**5. Pub/Sub webhook token oluştur:**
```bash
GOOGLE_PUBSUB_PUSH_TOKEN=$(openssl rand -hex 32)
```

---

### Email Service (SendGrid Örneği)

**1. SendGrid'e git:**
https://sendgrid.com

**2. API Key oluştur:**
```
Settings → API Keys → Create API Key
Name: Wellness Production
Permissions: Full Access
```

**3. .env'e ekle:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx...
SMTP_FROM="Women's Wellness <noreply@yourdomain.com>"
SMTP_TLS=true
```

**4. Domain verification:**
```
Settings → Sender Authentication → Authenticate Your Domain
```

---

### File Storage (AWS S3 Örneği)

**1. AWS Console'a git:**
https://console.aws.amazon.com/s3

**2. Bucket oluştur:**
```
Create bucket
Name: wellness-prod-files
Region: eu-central-1
Block all public access: OFF (CORS ile kontrol edeceğiz)
```

**3. CORS yapılandır:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com", "https://yourapp.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

**4. IAM User oluştur:**
```
IAM → Users → Add user
Name: wellness-s3-user
Access type: Programmatic access
Permissions: AmazonS3FullAccess (veya custom policy)
```

**5. .env'e ekle:**
```bash
STORAGE_DRIVER=s3
S3_REGION=eu-central-1
S3_BUCKET=wellness-prod-files
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=xxx...
```

---

### Monitoring Setup

#### Sentry (Error Tracking)

**1. Sentry'e git:**
https://sentry.io

**2. Proje oluştur:**
```
Create Project
Platform: Node.js (API için)
Platform: React Native (Mobile için)
```

**3. DSN al:**
```
Project Settings → Client Keys (DSN)
```

**4. .env'e ekle:**
```bash
# apps/api/.env
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz

# apps/mobile/.env
SENTRY_DSN=https://aaa@bbb.ingest.sentry.io/ccc
```

#### PostHog (Analytics)

**1. PostHog'a git:**
https://posthog.com

**2. Project key al:**
```
Project Settings → Project API Key
```

**3. .env'e ekle:**
```bash
POSTHOG_API_KEY=phc_xxx...
POSTHOG_HOST=https://app.posthog.com
```

---

## 🔒 Güvenlik Kontrolleri

### 1. Secrets Validation

```bash
# API secrets kontrolü
cd apps/api
npm run validate:env
```

### 2. Production Checklist

```bash
# ✅ JWT secrets değiştirildi mi?
[ ] JWT_SECRET != "your-super-secret-jwt-key-change-this-in-production"
[ ] JWT_REFRESH_SECRET != "__GENERATE_WITH_OPENSSL__"

# ✅ Database SSL aktif mi?
[ ] DATABASE_URL contains "sslmode=require"

# ✅ Redis password var mı?
[ ] REDIS_URL contains password

# ✅ Webhook verification aktif mi?
[ ] SKIP_WEBHOOK_VERIFICATION=false

# ✅ Cookie secure aktif mi?
[ ] COOKIE_SECURE=true

# ✅ CORS origins doğru mu?
[ ] CORS_ALLOWED_ORIGINS contains production domains

# ✅ Admin emails ayarlı mı?
[ ] ADMIN_EMAILS contains real emails

# ✅ Monitoring aktif mi?
[ ] SENTRY_DSN is set
[ ] POSTHOG_API_KEY is set
```

### 3. Environment Variables Test

```bash
# Tüm gerekli değişkenleri kontrol et
./scripts/validate-production-env.sh
```

---

## 📦 Deployment Checklist

### Pre-Deployment

- [ ] Tüm environment variables ayarlandı
- [ ] Database migration'ları çalıştırıldı
- [ ] Redis bağlantısı test edildi
- [ ] S3 bucket CORS yapılandırıldı
- [ ] Email service test edildi
- [ ] Push notifications test edildi
- [ ] Monitoring kuruldu
- [ ] Backup stratejisi belirlendi

### Deployment

- [ ] Docker image build edildi
- [ ] Health check endpoint çalışıyor
- [ ] SSL certificate kuruldu
- [ ] Domain DNS ayarlandı
- [ ] Rate limiting aktif
- [ ] CORS origins güncellendi

### Post-Deployment

- [ ] Smoke tests çalıştırıldı
- [ ] Error tracking çalışıyor
- [ ] Analytics events geliyor
- [ ] Push notifications gönderiliyor
- [ ] IAP webhook çalışıyor
- [ ] Database backup alındı

---

## 🆘 Troubleshooting

### "AI chat çalışmıyor"
```bash
# Gemini API key kontrolü
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GOOGLE_GENERATIVE_AI_API_KEY"
```

### "Google login çalışmıyor"
```bash
# OAuth client ID kontrolü
# iOS: Bundle ID eşleşmeli
# Android: SHA-1 fingerprint doğru olmalı
# Web: Redirect URI kayıtlı olmalı
```

### "Push notifications gitmiyor"
```bash
# Expo token kontrolü
curl -H "Authorization: Bearer $EXPO_ACCESS_TOKEN" \
  https://exp.host/--/api/v2/push/send \
  -d '{"to":"ExponentPushToken[xxx]","title":"Test","body":"Test"}'
```

### "Database bağlantı hatası"
```bash
# SSL mode kontrolü
# Production'da mutlaka sslmode=require olmalı
DATABASE_URL=postgresql://...?sslmode=require
```

---

## 💰 Maliyet Özeti

### Ücretsiz Tier (0-1K users)
- Supabase: Free (500MB DB, 2GB bandwidth)
- Upstash: Free (10K commands/day)
- SendGrid: Free (100 emails/day)
- Sentry: Free (5K errors/month)
- PostHog: Free (1M events/month)
- **Total: $0/ay**

### Startup Tier (1K-10K users)
- Railway: $20/ay (API + DB + Redis)
- AWS S3: $5/ay
- SendGrid: $15/ay (40K emails)
- Gemini API: $20/ay
- **Total: $60/ay**

### Growth Tier (10K+ users)
- Railway: $50/ay
- AWS S3: $20/ay
- SendGrid: $50/ay
- Gemini API: $100/ay
- Sentry: $26/ay
- **Total: $246/ay**

---

## 📚 Kaynaklar

- [Google AI Studio](https://aistudio.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Expo Dashboard](https://expo.dev)
- [Supabase](https://supabase.com)
- [Upstash](https://upstash.com)
- [SendGrid](https://sendgrid.com)
- [Sentry](https://sentry.io)
- [PostHog](https://posthog.com)

---

## ✅ Sonraki Adımlar

1. **Environment Setup:** Bu rehberi takip et
2. **Legal Docs:** Privacy Policy & Terms hazırla
3. **App Store Setup:** iOS & Android hesapları aç
4. **Testing:** Critical path test et
5. **Launch:** Soft launch yap

**Tahmini süre:** 1-2 hafta

**Yardım gerekirse:** Bu rehberdeki her adım test edilmiştir. Sorun yaşarsan troubleshooting bölümüne bak.
