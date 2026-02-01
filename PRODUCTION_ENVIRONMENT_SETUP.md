# Production Environment Setup Guide

Bu rehber, Women's Wellness uygulamasını production ortamına deploy etmek için gereken tüm environment variables ve servislerin kurulumunu adım adım açıklar.

## 📋 İçindekiler

1. [Gerekli Servisler](#gerekli-servisler)
2. [Environment Variables](#environment-variables)
3. [API Setup](#api-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Admin Panel Setup](#admin-panel-setup)
6. [Deployment Checklist](#deployment-checklist)

---

## 🔧 Gerekli Servisler

### 1. Database (PostgreSQL)

**Seçenekler:**
- **Supabase** (Önerilen - Kolay, ücretsiz tier)
  - https://supabase.com
  - Ücretsiz: 500MB database, 2GB bandwidth
  - Otomatik backup, connection pooling
  
- **Railway**
  - https://railway.app
  - $5/ay başlangıç
  - Kolay deployment
  
- **DigitalOcean Managed Database**
  - https://www.digitalocean.com/products/managed-databases
  - $15/ay başlangıç
  - Güvenilir, scalable

**Kurulum (Supabase):**
```bash
1. Supabase.com'a git
2. "New Project" oluştur
3. Database password belirle
4. Project Settings → Database → Connection String'i kopyala
5. DATABASE_URL olarak kullan
```

### 2. Redis (Cache & Queue)

**Seçenekler:**
- **Upstash** (Önerilen - Serverless, ücretsiz tier)
  - https://upstash.com
  - Ücretsiz: 10,000 commands/day
  - Global replication
  
- **Railway**
  - Redis container
  - $5/ay
  
- **AWS ElastiCache**
  - Production-grade
  - $15+/ay

**Kurulum (Upstash):**
```bash
1. Upstash.com'a git
2. "Create Database" → Redis
3. Region seç (en yakın)
4. Connection string'i kopyala
5. REDIS_URL olarak kullan
```

### 3. AI Provider (En az biri gerekli)

**Google Gemini (Önerilen - Ücretsiz kota yüksek):**
```bash
1. https://aistudio.google.com/app/apikey
2. "Create API Key" tıkla
3. Google Cloud projesi seç/oluştur
4. API key'i kopyala
5. GOOGLE_GENERATIVE_AI_API_KEY olarak kullan

Ücretsiz Kota:
- 15 request/minute
- 1 million tokens/minute
- 1500 requests/day
```

**OpenAI (Alternatif):**
```bash
1. https://platform.openai.com/api-keys
2. "Create new secret key"
3. OPENAI_API_KEY olarak kullan

Fiyatlandırma:
- gpt-4o-mini: $0.15/1M input tokens
- gpt-4o: $2.50/1M input tokens
```

**Anthropic Claude (Alternatif):**
```bash
1. https://console.anthropic.com/
2. "Create API Key"
3. ANTHROPIC_API_KEY olarak kullan

Fiyatlandırma:
- claude-3.5-haiku: $0.80/1M input tokens
- claude-3.5-sonnet: $3/1M input tokens
```

### 4. Google OAuth (Opsiyonel - Google ile giriş için)

**Kurulum:**
```bash
1. https://console.cloud.google.com
2. "APIs & Services" → "Credentials"
3. "Create Credentials" → "OAuth 2.0 Client ID"

iOS Client ID:
- Application type: iOS
- Bundle ID: com.wellness.companion (veya senin bundle ID'n)
- GOOGLE_OAUTH_CLIENT_ID_IOS olarak kullan

Android Client ID:
- Application type: Android
- Package name: com.wellness.companion
- SHA-1 certificate fingerprint ekle
- GOOGLE_OAUTH_CLIENT_ID_ANDROID olarak kullan

Web Client ID:
- Application type: Web application
- Authorized redirect URIs ekle
- GOOGLE_OAUTH_CLIENT_ID_WEB olarak kullan
```

### 5. Expo Push Notifications

**Kurulum:**
```bash
1. https://expo.dev
2. Hesap oluştur/giriş yap
3. Project oluştur
4. Settings → Access Tokens
5. "Create Token"
6. EXPO_ACCESS_TOKEN olarak kullan
```

### 6. Email Service (Şifre sıfırlama için)

**SendGrid (Önerilen - Ücretsiz tier):**
```bash
1. https://sendgrid.com
2. Hesap oluştur
3. Settings → API Keys → Create API Key
4. SMTP_HOST=smtp.sendgrid.net
5. SMTP_PORT=587
6. SMTP_USER=apikey
7. SMTP_PASS=<your-api-key>

Ücretsiz: 100 emails/day
```

**AWS SES (Alternatif):**
```bash
1. AWS Console → SES
2. Verify domain/email
3. Create SMTP credentials
4. SMTP bilgilerini kullan

Fiyat: $0.10/1000 emails
```

### 7. File Storage (Profil fotoğrafları için)

**AWS S3 (Önerilen):**
```bash
1. AWS Console → S3
2. Create bucket
3. IAM user oluştur (S3 access)
4. Access key/secret key al
5. Environment variables:
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
```

**Cloudflare R2 (Alternatif - Daha ucuz):**
```bash
1. Cloudflare Dashboard → R2
2. Create bucket
3. API tokens oluştur
4. S3-compatible endpoint kullan
```

### 8. Monitoring (Önerilen)

**Sentry (Error tracking):**
```bash
1. https://sentry.io
2. Create project (Node.js + React Native)
3. DSN'leri kopyala
4. SENTRY_DSN olarak kullan

Ücretsiz: 5,000 errors/month
```

**PostHog (Analytics):**
```bash
1. https://posthog.com
2. Create project
3. API key al
4. POSTHOG_API_KEY olarak kullan

Ücretsiz: 1M events/month
```

---

## 🔐 Environment Variables

### API (.env.production)

```bash
# ===== REQUIRED =====

# Node Environment
NODE_ENV=production
PORT=4000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Redis
REDIS_URL=redis://default:password@host:6379

# JWT Secrets (Generate with: openssl rand -hex 32)
JWT_SECRET=your-super-secret-jwt-key-here-64-chars-minimum
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-64-chars-minimum
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Provider (EN AZ BİRİ GEREKLİ)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...
# VEYA
OPENAI_API_KEY=sk-...
# VEYA
ANTHROPIC_API_KEY=sk-ant-...

# ===== OPTIONAL =====

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID_IOS=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_ANDROID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_WEB=xxx.apps.googleusercontent.com

# Expo Push
EXPO_ACCESS_TOKEN=your-expo-access-token

# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx
SMTP_FROM=noreply@yourapp.com

# File Storage (AWS S3)
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com

# CORS (Frontend domains)
CORS_ORIGINS=https://yourapp.com,https://admin.yourapp.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Mobile (.env.production)

```bash
# API Base URL
EXPO_PUBLIC_API_URL=https://api.yourapp.com

# Google OAuth
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# PostHog
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxx
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App Info
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENV=production
```

### Admin (.env.production)

```bash
# API Base URL
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com

# App Info
NEXT_PUBLIC_APP_NAME=Wellness Admin
NEXT_PUBLIC_APP_ENV=production

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Tüm environment variables ayarlandı
- [ ] Database migrations çalıştırıldı
- [ ] Database seed data eklendi
- [ ] JWT secrets generate edildi (production için farklı)
- [ ] CORS origins production domain'leri içeriyor
- [ ] Rate limiting production için ayarlandı
- [ ] SSL/TLS sertifikaları hazır
- [ ] Domain DNS ayarları yapıldı

### API Deployment

- [ ] Production database bağlantısı test edildi
- [ ] Redis bağlantısı test edildi
- [ ] AI provider API key'leri test edildi
- [ ] Email servisi test edildi
- [ ] File upload test edildi
- [ ] Health check endpoint çalışıyor (/healthz)
- [ ] Swagger docs kapatıldı veya korundu
- [ ] Error tracking (Sentry) aktif

### Mobile Deployment

- [ ] Production API URL ayarlandı
- [ ] Google OAuth client ID'leri production için
- [ ] App Store Connect hesabı hazır ($99/yıl)
- [ ] Google Play Console hesabı hazır ($25 one-time)
- [ ] App icons ve splash screens hazır
- [ ] Privacy Policy URL eklendi
- [ ] Terms of Service URL eklendi
- [ ] App Store screenshots hazır
- [ ] EAS Build profilleri yapılandırıldı
- [ ] TestFlight/Internal testing tamamlandı

### Admin Panel Deployment

- [ ] Production API URL ayarlandı
- [ ] Vercel/Netlify deployment yapılandırıldı
- [ ] Admin credentials güvenli
- [ ] HTTPS aktif
- [ ] Analytics aktif

### Post-Deployment

- [ ] Smoke tests çalıştırıldı
- [ ] Monitoring dashboards kontrol edildi
- [ ] Error rates normal
- [ ] Performance metrics kabul edilebilir
- [ ] Backup stratejisi aktif
- [ ] Incident response planı hazır

---

## 🔒 Security Checklist

- [ ] Tüm secrets environment variables'da (kod içinde yok)
- [ ] Production database SSL ile bağlanıyor
- [ ] JWT secrets güçlü ve unique
- [ ] Rate limiting aktif
- [ ] CORS doğru yapılandırılmış
- [ ] Input validation aktif
- [ ] SQL injection koruması var
- [ ] XSS koruması var
- [ ] HTTPS zorunlu
- [ ] Security headers ayarlandı (Helmet.js)
- [ ] Dependency vulnerabilities tarandı (npm audit)
- [ ] Secrets rotation planı var

---

## 📊 Tahmini Maliyetler

### Minimum (Ücretsiz Tier'lar)
- Database: Supabase Free ($0)
- Redis: Upstash Free ($0)
- AI: Gemini Free ($0)
- Email: SendGrid Free ($0)
- Monitoring: Sentry + PostHog Free ($0)
- **Total: $0/ay** (Sınırlı kullanım)

### Starter (Küçük ölçek)
- Database: Supabase Pro ($25)
- Redis: Upstash Pay-as-you-go ($5)
- AI: Gemini + OpenAI ($20)
- Email: SendGrid Essentials ($15)
- Hosting: Railway ($10)
- Monitoring: Sentry Team ($26)
- **Total: ~$100/ay**

### Production (Orta ölçek)
- Database: DigitalOcean ($50)
- Redis: AWS ElastiCache ($30)
- AI: OpenAI + Claude ($100)
- Email: SendGrid Pro ($90)
- Hosting: AWS ECS ($50)
- Monitoring: Sentry Business ($80)
- CDN: Cloudflare ($20)
- **Total: ~$420/ay**

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check SSL requirement
# Supabase requires ?sslmode=require
```

### Redis Connection Issues
```bash
# Test connection
redis-cli -u $REDIS_URL ping

# Should return: PONG
```

### AI API Issues
```bash
# Test Gemini
curl https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: $GOOGLE_GENERATIVE_AI_API_KEY"

# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Email Issues
```bash
# Test SMTP
telnet smtp.sendgrid.net 587

# Check SendGrid dashboard for errors
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Upstash Docs**: https://docs.upstash.com
- **Gemini API**: https://ai.google.dev/docs
- **Expo Docs**: https://docs.expo.dev
- **SendGrid Docs**: https://docs.sendgrid.com
- **Sentry Docs**: https://docs.sentry.io

---

**Son Güncelleme**: 2025-02-01
**Versiyon**: 1.0.0

Production'a geçmeden önce tüm checklist itemlerini kontrol edin! 🚀
