# ⚡ Production Quick Start - 30 Dakikada Deploy

Women's Wellness App'i production'a deploy etmek için hızlı başlangıç rehberi.

## 🎯 Hedef

Bu rehber ile **30 dakikada** minimum viable production ortamını ayağa kaldırabilirsin.

## ✅ Ön Gereksinimler

- [ ] Git repository'si hazır
- [ ] Docker kurulu (opsiyonel)
- [ ] Terminal erişimi
- [ ] Kredi kartı (bazı servisler için)

---

## 🚀 Adım 1: Kritik Servisler (10 dakika)

### 1.1 Database - Supabase (Ücretsiz)

**Neden Supabase?** Ücretsiz tier, otomatik backup, kolay setup.

```bash
# 1. https://supabase.com adresine git
# 2. "Start your project" → Sign up
# 3. "New project" oluştur:
#    - Name: wellness-prod
#    - Database Password: [güçlü şifre]
#    - Region: Frankfurt (Türkiye'ye yakın)
# 4. Project Settings → Database → Connection string → URI
#    Kopyala: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

### 1.2 Redis - Upstash (Ücretsiz)

**Neden Upstash?** Serverless, ücretsiz tier, düşük latency.

```bash
# 1. https://upstash.com adresine git
# 2. Sign up → Create database
#    - Name: wellness-prod
#    - Type: Regional
#    - Region: eu-central-1 (Frankfurt)
#    - TLS: Enabled
# 3. Database → Details → REST API
#    Kopyala: rediss://default:[password]@[host]:6379
```

### 1.3 AI Provider - Google Gemini (Ücretsiz)

**Neden Gemini?** En yüksek ücretsiz kota (15 req/min).

```bash
# 1. https://aistudio.google.com/app/apikey adresine git
# 2. "Create API Key" → Select project
# 3. API key'i kopyala: AIzaSyC...
```

**✅ Checkpoint:** 3 connection string'in hazır olmalı.

---

## 🔐 Adım 2: Environment Setup (5 dakika)

### 2.1 Otomatik Setup (Önerilen)

```bash
# Interactive wizard çalıştır
./scripts/setup-production-env.sh

# Wizard sırasıyla soracak:
# - Database URL (Supabase'den kopyala)
# - Redis URL (Upstash'ten kopyala)
# - Gemini API Key (Google AI Studio'dan kopyala)
# - Diğer opsiyonel servisler (şimdilik skip edebilirsin)
```

### 2.2 Manuel Setup (Alternatif)

```bash
# .env dosyalarını oluştur
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

# JWT secrets oluştur
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# apps/api/.env dosyasını düzenle:
cat > apps/api/.env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require
REDIS_URL=rediss://default:[password]@[host]:6379
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...
SKIP_WEBHOOK_VERIFICATION=false
COOKIE_SECURE=true
EOF
```

### 2.3 Validation

```bash
# Environment'ı validate et
./scripts/validate-production-env.sh

# Tüm kritik değişkenler ✅ olmalı
```

**✅ Checkpoint:** Validation passed.

---

## 🏗️ Adım 3: Database Setup (3 dakika)

```bash
# Migration'ları çalıştır
cd apps/api
npm install
npx prisma migrate deploy

# Seed data (opsiyonel)
npx prisma db seed

# Test connection
npx prisma db pull
```

**✅ Checkpoint:** Migration'lar başarılı.

---

## 🚢 Adım 4: API Deployment (7 dakika)

### Seçenek A: Railway (Önerilen - Kolay)

```bash
# 1. https://railway.app adresine git
# 2. Sign up → New Project → Deploy from GitHub
# 3. Repository'ni seç
# 4. Environment Variables ekle:
#    - DATABASE_URL
#    - REDIS_URL
#    - JWT_SECRET
#    - JWT_REFRESH_SECRET
#    - GOOGLE_GENERATIVE_AI_API_KEY
#    - NODE_ENV=production
# 5. Deploy → Wait for build
# 6. Domain al: Settings → Generate Domain
#    Örnek: wellness-api-production.up.railway.app
```

### Seçenek B: Render

```bash
# 1. https://render.com adresine git
# 2. New → Web Service → Connect GitHub
# 3. Build Command: cd apps/api && npm install && npm run build
# 4. Start Command: cd apps/api && npm run start:prod
# 5. Environment Variables ekle (Railway ile aynı)
# 6. Create Web Service
```

### Seçenek C: Docker (Kendi sunucun)

```bash
# Docker image build et
docker build -t wellness-api -f apps/api/Dockerfile .

# Run
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  -e JWT_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  -e GOOGLE_GENERATIVE_AI_API_KEY="..." \
  wellness-api
```

**✅ Checkpoint:** API health check çalışıyor: `curl https://your-api-url/health`

---

## 📱 Adım 5: Mobile App Build (5 dakika)

### 5.1 Expo Setup

```bash
# EAS CLI kur
npm install -g eas-cli

# Login
eas login

# Project configure
cd apps/mobile
eas build:configure
```

### 5.2 Environment Variables

```bash
# apps/mobile/.env dosyasını düzenle
cat > .env << EOF
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.railway.app
EXPO_PUBLIC_SCHEME=wellness
EXPO_PUBLIC_REDIRECT_URL=wellness:/oauthredirect
EOF
```

### 5.3 Build (Opsiyonel - Şimdilik Skip)

```bash
# iOS build (Apple Developer hesabı gerekli)
eas build --platform ios --profile production

# Android build (Google Play hesabı gerekli)
eas build --platform android --profile production

# Not: İlk build 15-20 dakika sürer, şimdilik skip edebilirsin
```

**✅ Checkpoint:** EAS configured, build'i sonra yapabilirsin.

---

## ✅ Adım 6: Smoke Test (2 dakika)

### 6.1 API Test

```bash
# Health check
curl https://your-api-url/health

# Beklenen response:
# {"status":"ok","timestamp":"..."}

# Register test user
curl -X POST https://your-api-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST https://your-api-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Beklenen: access_token ve refresh_token
```

### 6.2 AI Chat Test

```bash
# Chat test (access_token'ı yukarıdan al)
curl -X POST https://your-api-url/chat/test-conv/message \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Merhaba NOVA!"
  }'

# Beklenen: AI response
```

**✅ Checkpoint:** Tüm testler başarılı!

---

## 🎉 Tebrikler! Production'dasın!

### Şu anda çalışan:
- ✅ API (Railway/Render)
- ✅ Database (Supabase)
- ✅ Redis (Upstash)
- ✅ AI Chat (Gemini)
- ✅ Authentication
- ✅ Health Metrics
- ✅ Period Tracking

### Henüz eksik (opsiyonel):
- ⏳ Google OAuth (Google login için)
- ⏳ Push Notifications (bildirimler için)
- ⏳ In-App Purchase (premium için)
- ⏳ Email Service (şifre sıfırlama için)
- ⏳ Monitoring (Sentry/PostHog)
- ⏳ Mobile app build (App Store/Play Store)

---

## 📊 Maliyet Özeti

**Şu anki setup (ücretsiz):**
- Supabase: $0 (500MB DB)
- Upstash: $0 (10K commands/day)
- Gemini API: $0 (15 req/min)
- Railway: $5/ay (ilk $5 ücretsiz)
- **Total: $0-5/ay**

**Scaling için (1K+ users):**
- Railway: $20/ay
- Supabase: $25/ay (Pro plan)
- Upstash: $10/ay
- **Total: $55/ay**

---

## 🔜 Sonraki Adımlar

### Hemen yapılabilir:
1. **Monitoring ekle** (5 dk)
   ```bash
   # Sentry kurulumu
   # 1. https://sentry.io → Create project
   # 2. DSN'i .env'e ekle
   # 3. Redeploy
   ```

2. **Domain bağla** (10 dk)
   ```bash
   # Railway'de: Settings → Custom Domain
   # DNS'e CNAME ekle: api.yourdomain.com → railway-url
   ```

3. **SSL certificate** (otomatik)
   ```bash
   # Railway/Render otomatik Let's Encrypt sağlar
   ```

### Sonra yapılacak (1-2 hafta):
1. **Google OAuth** - [PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md#google-oauth-setup)
2. **Push Notifications** - [PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md#expo-push-notifications)
3. **Mobile App Build** - [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md#mobile-app)
4. **Legal Docs** - Privacy Policy & Terms
5. **App Store Submit** - iOS & Android

---

## 🆘 Sorun mu var?

### API çalışmıyor
```bash
# Logs kontrol et
# Railway: Dashboard → Logs
# Render: Dashboard → Logs

# Database bağlantısı test et
npx prisma db pull

# Redis bağlantısı test et
redis-cli -u $REDIS_URL ping
```

### AI chat çalışmıyor
```bash
# Gemini API test et
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GOOGLE_GENERATIVE_AI_API_KEY"
```

### Migration hatası
```bash
# Database'i sıfırla (DİKKAT: tüm data silinir)
npx prisma migrate reset --force

# Migration'ları tekrar çalıştır
npx prisma migrate deploy
```

---

## 📚 Detaylı Dokümantasyon

- **[PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md)** - Tüm servisler için detaylı setup
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Kapsamlı checklist
- **[KALAN_ISLER.md](./KALAN_ISLER.md)** - Eksik özellikler listesi

---

## 💡 Pro Tips

1. **Backup al**: Supabase otomatik backup yapar, ama manuel backup da al
   ```bash
   make backup-db
   ```

2. **Monitoring ekle**: Production'da mutlaka Sentry kur
   ```bash
   SENTRY_DSN=https://...@sentry.io/...
   ```

3. **Rate limiting**: API'de zaten aktif, ama tune et
   ```bash
   # apps/api/src/main.ts
   throttle: { ttl: 60, limit: 100 }
   ```

4. **Health check**: Uptime monitoring ekle (UptimeRobot ücretsiz)
   ```bash
   # https://uptimerobot.com
   # Monitor: https://your-api-url/health
   ```

---

**Hazırsın! 🚀**

Sorular için: [PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md) veya [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
