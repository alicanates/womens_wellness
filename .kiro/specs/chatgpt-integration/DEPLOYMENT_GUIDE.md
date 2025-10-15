# 🚀 Gemini AI Integration - Deployment Guide

Bu rehber, NOVA AI asistanının Gemini entegrasyonunu production ortamına deploy etmek için gereken tüm adımları içerir.

## 📋 Deployment Öncesi Kontrol Listesi

### 1. Environment Variables

#### Backend API

```bash
# REQUIRED
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...  # Production key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<production-secret>
JWT_REFRESH_SECRET=<production-secret>

# OPTIONAL (Backup providers)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**Kontrol**:
- [ ] Gemini API key production ortamında set edildi
- [ ] API key development key'inden farklı
- [ ] Secret manager kullanılıyor (AWS/GCP/Azure/Doppler)
- [ ] Backup provider yapılandırıldı

### 2. Test Sonuçları

Tüm testlerin başarılı olduğundan emin olun:

```bash
# Backend tests
cd apps/api

# 1. Gemini API bağlantı testi
pnpm test:gemini
# ✅ Beklenen: API key geçerli, streaming çalışıyor

# 2. Context builder unit tests
pnpm test context-builder.service.spec.ts --run
# ✅ Beklenen: 4/4 test geçti

# 3. End-to-end chat flow
pnpm test:chat-flow
# ✅ Beklenen: Mesaj gönderme, streaming, kaydetme çalışıyor

# 4. Error scenarios
pnpm test:error-scenarios
# ✅ Beklenen: Timeout, rate limit, network hataları yakalanıyor

# 5. Forget conversation
pnpm test:forget-conversation
# ✅ Beklenen: Conversation silme çalışıyor
```

**Kontrol**:
- [ ] Tüm unit testler geçti
- [ ] Tüm integration testler geçti
- [ ] Tüm E2E testler geçti
- [ ] Error handling testleri geçti

### 3. Mobile App Tests

```bash
cd apps/mobile

# iOS test
# Simulator'da uygulamayı çalıştır ve test et

# Android test
# Emulator'da uygulamayı çalıştır ve test et
```

**Kontrol**:
- [ ] iOS'ta chat akışı çalışıyor
- [ ] Android'de chat akışı çalışıyor
- [ ] Streaming düzgün görünüyor
- [ ] Hata mesajları Türkçe
- [ ] Quota display güncellenıyor
- [ ] "Durdur" butonu çalışıyor
- [ ] "Sil" butonu çalışıyor

### 4. Database

```bash
cd apps/api

# Migration kontrolü
pnpm prisma migrate status

# Gerekirse migration uygula
pnpm prisma migrate deploy
```

**Kontrol**:
- [ ] Tüm migration'lar uygulandı
- [ ] Prisma client güncel
- [ ] Index'ler doğru
- [ ] Backup alındı

### 5. Documentation

**Kontrol**:
- [x] README.md güncellendi
- [x] Gemini API setup guide oluşturuldu
- [x] Environment variables dokümante edildi
- [x] Deployment checklist güncellendi
- [x] Test scriptleri eklendi

---

## 🔧 Deployment Adımları

### Adım 1: Pre-Deployment Validation

```bash
# 1. Environment variables kontrolü
cd apps/api
pnpm validate:env

# 2. TypeScript compilation
pnpm build

# 3. Tüm testleri çalıştır
pnpm test
pnpm test:gemini
pnpm test:chat-flow

# 4. Lint kontrolü
pnpm lint
```

### Adım 2: Database Migration (Production)

```bash
# Production database'e bağlan
export DATABASE_URL="postgresql://user:pass@prod-host:5432/wellness"

# Migration'ları uygula
cd apps/api
pnpm prisma migrate deploy

# Prisma client'ı güncelle
pnpm prisma generate
```

### Adım 3: Backend Deployment

#### Option A: Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 4000

# Start
CMD ["pnpm", "start"]
```

```bash
# Build image
docker build -t wellness-api:latest .

# Run container
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyC..." \
  -e JWT_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  wellness-api:latest
```

#### Option B: PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start API
cd apps/api
pm2 start dist/main.js --name wellness-api

# Save PM2 config
pm2 save

# Setup auto-restart
pm2 startup
```

#### Option C: Cloud Platform (AWS/GCP/Azure)

**AWS Elastic Beanstalk**:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Deploy
eb deploy
```

**Google Cloud Run**:
```bash
# Build and deploy
gcloud run deploy wellness-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...
```

### Adım 4: Mobile App Deployment

```bash
cd apps/mobile

# Update API URL
# Edit .env.local
EXPO_PUBLIC_API_URL=https://api.yourapp.com

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Adım 5: Smoke Tests (Production)

```bash
# Health check
curl https://api.yourapp.com/healthz

# Test chat endpoint (with valid token)
curl -X POST \
  -H "Authorization: Bearer YOUR_PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Merhaba NOVA"}' \
  https://api.yourapp.com/chat/CONVERSATION_ID/message

# Test streaming
curl -N -H "Authorization: Bearer YOUR_PROD_TOKEN" \
  https://api.yourapp.com/chat/CONVERSATION_ID/stream
```

**Kontrol**:
- [ ] Health check 200 OK
- [ ] Chat endpoint çalışıyor
- [ ] Streaming çalışıyor
- [ ] Hata mesajları Türkçe
- [ ] Quota sistemi çalışıyor

---

## 📊 Monitoring & Alerting

### 1. Metrics to Monitor

```typescript
// Örnek Prometheus metrics
import { Counter, Histogram, Gauge } from 'prom-client';

// Request metrics
const geminiRequestsTotal = new Counter({
  name: 'gemini_requests_total',
  help: 'Total Gemini API requests',
  labelNames: ['status', 'error_type'],
});

// Response time
const geminiResponseTime = new Histogram({
  name: 'gemini_response_time_seconds',
  help: 'Gemini API response time',
  buckets: [0.5, 1, 2, 5, 10, 30],
});

// Token usage
const geminiTokensUsed = new Counter({
  name: 'gemini_tokens_used_total',
  help: 'Total tokens used',
});

// Active conversations
const activeConversations = new Gauge({
  name: 'active_conversations',
  help: 'Number of active conversations',
});
```

### 2. Alerts to Setup

**Critical Alerts** (PagerDuty/Slack):
- API error rate > 5%
- Response time > 10s (p95)
- Gemini API quota exceeded
- Database connection lost
- Redis connection lost

**Warning Alerts** (Email):
- API error rate > 2%
- Response time > 5s (p95)
- Gemini API quota > 80%
- Disk space > 80%
- Memory usage > 80%

### 3. Logging

```typescript
// Structured logging örneği
import { Logger } from '@nestjs/common';

const logger = new Logger('ChatService');

// Success log
logger.log({
  event: 'chat_response_success',
  userId: user.id,
  conversationId,
  tokens: tokenCount,
  responseTime: duration,
});

// Error log
logger.error({
  event: 'chat_response_error',
  userId: user.id,
  conversationId,
  error: error.message,
  errorType: 'timeout',
});
```

### 4. Dashboard (Grafana)

Önerilen dashboard panelleri:

1. **API Health**
   - Request rate (req/min)
   - Error rate (%)
   - Response time (p50, p95, p99)

2. **Gemini API**
   - Requests per minute
   - Token usage per day
   - Error breakdown (timeout, rate limit, etc.)
   - Cost per day

3. **User Engagement**
   - Active conversations
   - Messages per day
   - Average conversation length
   - Quota usage per plan

4. **System Resources**
   - CPU usage
   - Memory usage
   - Database connections
   - Redis connections

---

## 🔄 Rollback Plan

### Scenario 1: Gemini API Issues

**Problem**: Gemini API down veya rate limit

**Solution**:
```bash
# Admin panel'den backup provider'a geç
# Model Policies → Edit Free Policy
Provider: openai
Model: gpt-4o-mini

# VEYA environment variable ile
export FALLBACK_AI_PROVIDER=openai
```

### Scenario 2: Performance Issues

**Problem**: Yavaş yanıt süreleri

**Solution**:
```typescript
// Conversation history limitini düşür
const history = await this.getConversationHistory(conversationId, 5); // 10 → 5

// Max tokens limitini düşür
maxTokens: 1024, // 2048 → 1024

// Context building'i basitleştir
// Wellness data'yı geçici olarak devre dışı bırak
```

### Scenario 3: Critical Bug

**Problem**: Uygulama çöküyor

**Solution**:
```bash
# 1. Önceki versiyona dön
git revert HEAD
git push

# 2. Redeploy
eb deploy  # veya cloud platform komutunuz

# 3. Feature flag ile chat'i kapat
# Admin Panel → Feature Flags → chat_enabled = false
```

### Scenario 4: Database Issues

**Problem**: Migration hatası

**Solution**:
```bash
# Migration'ı geri al
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Önceki migration'a dön
npx prisma migrate deploy
```

---

## 💰 Cost Estimation

### Gemini API Costs (Ücretsiz Tier)

| Metrik | Limit | Aşım Durumu |
|--------|-------|-------------|
| İstek/Dakika | 15 | Rate limit error |
| İstek/Gün | 1,500 | Quota exceeded |
| Token/Dakika | 1M | Rate limit error |
| Token/Gün | 1.5M | Quota exceeded |

### Paid Tier (Gerekirse)

Gemini 1.5 Flash fiyatlandırması:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

**Örnek hesaplama**:
- 10,000 mesaj/gün
- Ortalama 500 token/mesaj (input + output)
- Aylık maliyet: ~$112.50

### Optimization Tips

1. **Conversation history limitini optimize et**:
   - 10 mesaj → 5 mesaj = %50 maliyet düşüşü

2. **Max tokens limitini ayarla**:
   - 2048 → 1024 = %50 maliyet düşüşü

3. **Caching kullan**:
   - User context cache (5 dakika)
   - System prompt cache

4. **Batch processing**:
   - Birden fazla kullanıcı için context'i toplu oluştur

---

## ✅ Post-Deployment Checklist

### İlk 24 Saat

- [ ] API health check her 5 dakikada bir
- [ ] Error logs monitör et
- [ ] Response time'ları kontrol et
- [ ] Gemini API quota kullanımını izle
- [ ] User feedback topla
- [ ] Crash reports kontrol et

### İlk Hafta

- [ ] Günlük error rate raporu
- [ ] Günlük cost raporu
- [ ] User engagement metrikleri
- [ ] Performance optimization fırsatları
- [ ] A/B test sonuçları (varsa)

### İlk Ay

- [ ] Aylık cost analizi
- [ ] User retention analizi
- [ ] Feature usage analizi
- [ ] Optimization planı
- [ ] Roadmap güncelleme

---

## 📞 Support & Escalation

### Tier 1: Self-Service
- Documentation: [docs/gemini-api-setup.md](../../../docs/gemini-api-setup.md)
- Troubleshooting: [docs/troubleshooting.md](../../../docs/troubleshooting.md)
- Logs: Check application logs

### Tier 2: Team Support
- Slack: #wellness-support
- Email: support@yourapp.com
- Response time: 4 hours

### Tier 3: Critical Issues
- PagerDuty: On-call engineer
- Phone: +1-XXX-XXX-XXXX
- Response time: 15 minutes

---

## 🎉 Success Criteria

Deployment başarılı sayılır eğer:

- ✅ API uptime > 99.9%
- ✅ Error rate < 1%
- ✅ Response time < 5s (p95)
- ✅ User satisfaction > 4.5/5
- ✅ Zero critical bugs
- ✅ Cost within budget

---

**Deployment'ınız başarılı olsun! 🚀**

Son güncelleme: 2025-10-15
