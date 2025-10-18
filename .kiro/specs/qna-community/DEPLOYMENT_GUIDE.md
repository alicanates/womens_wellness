# Q&A Community Deployment Guide

## Genel Bakış

Bu doküman, Q&A Community özelliğinin production ortamına deploy edilmesi için gereken adımları detaylı olarak açıklar.

## İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Database Migration](#database-migration)
3. [Backend Deployment](#backend-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Rollback Procedure](#rollback-procedure)
9. [Troubleshooting](#troubleshooting)

---

## Ön Gereksinimler

### 1. Database Backup

Production database'ini deploy öncesi mutlaka yedekleyin:

```bash
# PostgreSQL backup
pg_dump -h <host> -U <user> -d wellness_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Veya managed service kullanıyorsanız
# AWS RDS: Automated snapshot oluşturun
# Heroku: heroku pg:backups:capture
```

### 2. Gerekli Araçlar

```bash
# Node.js 20+
node --version

# PNPM
pnpm --version

# Prisma CLI
pnpm add -g prisma

# EAS CLI (mobile deployment için)
npm install -g eas-cli
```

### 3. Access & Credentials

- [ ] Production database access
- [ ] Redis instance access
- [ ] API server SSH/deployment access
- [ ] EAS account ve project setup
- [ ] App Store Connect / Google Play Console access
- [ ] Environment variables hazır

---

## Database Migration

### 1. Migration Dosyalarını İncele

```bash
cd apps/api

# Migration dosyalarını listele
ls -la prisma/migrations/

# Q&A Community migration'ı kontrol et
cat prisma/migrations/20251016221244_add_qna_community/migration.sql
```

### 2. Staging'de Test Et

```bash
# Staging database'e bağlan
export DATABASE_URL="postgresql://user:pass@staging-db:5432/wellness_staging"

# Migration'ı çalıştır
pnpm prisma migrate deploy

# Seed data ekle
pnpm prisma db seed
```

### 3. Production Migration

**⚠️ DİKKAT: Bu işlem geri alınamaz!**

```bash
# Production database'e bağlan
export DATABASE_URL="postgresql://user:pass@prod-db:5432/wellness_prod"

# Dry-run (sadece göster, çalıştırma)
pnpm prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource $DATABASE_URL \
  --script

# Migration'ı çalıştır
pnpm prisma migrate deploy

# Verify
pnpm prisma db pull
```

### 4. Seed Initial Data

```bash
# Badge'leri seed et
pnpm prisma db seed

# Veya manuel olarak
node prisma/seed-qna-badges.ts
```

**Seed edilen data:**
- 10 adet rozet (first_question, first_answer, first_best_answer, vb.)
- Kategori tanımları
- Varsayılan moderation keyword'leri

---

## Backend Deployment

### 1. Build & Test

```bash
cd apps/api

# Dependencies yükle
pnpm install --frozen-lockfile

# Build
pnpm build

# Test
pnpm test

# Linting
pnpm lint
```

### 2. Environment Variables

Production `.env` dosyasını hazırlayın:

```bash
# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/wellness_prod

# Redis
REDIS_URL=redis://prod-redis:6379

# JWT
JWT_SECRET=<production-secret>
JWT_REFRESH_SECRET=<production-refresh-secret>

# AI Provider
GOOGLE_GENERATIVE_AI_API_KEY=<prod-key>

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info

# Q&A Specific
QNA_FREE_QUESTION_LIMIT=5
QNA_PREMIUM_QUESTION_LIMIT=20
QNA_SPAM_THRESHOLD=3
QNA_AUTO_HIDE_REPORT_COUNT=5
```

### 3. Deploy Options

#### Option A: Docker

```bash
# Build image
docker build -t wellness-api:qna-v1 -f apps/api/Dockerfile .

# Run migration
docker run --rm \
  -e DATABASE_URL=$DATABASE_URL \
  wellness-api:qna-v1 \
  pnpm prisma migrate deploy

# Start container
docker run -d \
  --name wellness-api \
  -p 4000:4000 \
  --env-file .env.production \
  wellness-api:qna-v1
```

#### Option B: PM2

```bash
# Install PM2
npm install -g pm2

# Start with ecosystem file
pm2 start ecosystem.config.js --env production

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'wellness-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```

#### Option C: Heroku

```bash
# Login
heroku login

# Create app (if not exists)
heroku create wellness-api-prod

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set JWT_SECRET=<secret>
heroku config:set GOOGLE_GENERATIVE_AI_API_KEY=<key>

# Deploy
git push heroku main

# Run migration
heroku run pnpm prisma migrate deploy

# Scale
heroku ps:scale web=2
```

### 4. Verify Deployment

```bash
# Health check
curl https://api.wellness.app/healthz

# Test Q&A endpoint
curl -H "Authorization: Bearer <token>" \
  https://api.wellness.app/api/qna/questions

# Check logs
# Docker: docker logs wellness-api
# PM2: pm2 logs wellness-api
# Heroku: heroku logs --tail
```

---

## Mobile App Deployment

### 1. Update Version

```json
// apps/mobile/app.json
{
  "expo": {
    "version": "1.5.0",
    "ios": {
      "buildNumber": "15"
    },
    "android": {
      "versionCode": 15
    }
  }
}
```

### 2. Build with EAS

```bash
cd apps/mobile

# Login to EAS
eas login

# Configure project (first time)
eas build:configure

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Or both
eas build --platform all --profile production
```

**eas.json:**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.wellness.app"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 3. Submit to Stores

```bash
# iOS App Store
eas submit --platform ios --profile production

# Google Play Store
eas submit --platform android --profile production
```

### 4. Phased Rollout (Önerilen)

**iOS:**
- App Store Connect → My Apps → Version → Phased Release
- 7 gün boyunca kademeli olarak %100'e ulaşır

**Android:**
- Google Play Console → Release → Production → Create Release
- Staged rollout: %10 → %25 → %50 → %100

---

## Environment Variables

### Backend (apps/api)

```bash
# Required
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Optional but recommended
SENTRY_DSN=...
LOG_LEVEL=info
NODE_ENV=production

# Q&A Specific
QNA_FREE_QUESTION_LIMIT=5
QNA_PREMIUM_QUESTION_LIMIT=20
QNA_SPAM_THRESHOLD=3
QNA_AUTO_HIDE_REPORT_COUNT=5
QNA_COMMENT_MAX_LENGTH=300
QNA_QUESTION_TITLE_MAX_LENGTH=200
QNA_QUESTION_CONTENT_MAX_LENGTH=5000
```

### Mobile (apps/mobile)

```bash
# Required
EXPO_PUBLIC_API_URL=https://api.wellness.app

# Optional
EXPO_PUBLIC_SENTRY_DSN=...
EXPO_PUBLIC_ANALYTICS_ID=...
```

---

## Post-Deployment Checklist

### 1. Functional Testing

- [ ] Soru oluşturma çalışıyor
- [ ] Cevap verme çalışıyor
- [ ] Oy verme çalışıyor
- [ ] Yorum yapma çalışıyor
- [ ] Favorileme çalışıyor
- [ ] Takip etme çalışıyor
- [ ] Bildirimler gidiyor
- [ ] Quota kontrolü çalışıyor
- [ ] Moderation çalışıyor
- [ ] Paylaşım çalışıyor

### 2. Performance Testing

```bash
# Load test with k6
k6 run load-tests/qna-endpoints.js

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.wellness.app/api/qna/questions
```

### 3. Database Indexes

```sql
-- Verify indexes exist
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename LIKE 'Question%' OR tablename LIKE 'Answer%';

-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM "Question" 
WHERE category = 'PREGNANCY' 
ORDER BY "createdAt" DESC 
LIMIT 20;
```

### 4. Monitoring Setup

```bash
# Setup alerts
# - API response time > 2s
# - Error rate > 1%
# - Database connection pool > 80%
# - Redis memory > 80%
# - Question creation rate spike
# - Moderation queue > 100 items
```

### 5. Documentation Update

- [ ] API docs güncellendi
- [ ] README güncellendi
- [ ] Changelog oluşturuldu
- [ ] Release notes yazıldı
- [ ] Team bilgilendirildi

---

## Monitoring & Alerts

### 1. Key Metrics

**Application Metrics:**
- Request rate (req/min)
- Response time (p50, p95, p99)
- Error rate (%)
- Active users
- Questions created/day
- Answers created/day
- Votes cast/day

**Database Metrics:**
- Connection pool usage
- Query execution time
- Slow queries (>1s)
- Table sizes
- Index usage

**Business Metrics:**
- Daily active users (DAU)
- Questions per user
- Answer rate (answers/question)
- Best answer rate (%)
- Average time to first answer
- User retention

### 2. Alerting Rules

```yaml
# Prometheus alert rules
groups:
  - name: qna_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: SlowQueries
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        annotations:
          summary: "95th percentile response time > 2s"
          
      - alert: ModerationQueueHigh
        expr: qna_moderation_queue_size > 100
        for: 10m
        annotations:
          summary: "Moderation queue has >100 pending reports"
```

### 3. Logging

```typescript
// Structured logging
logger.info('Question created', {
  questionId: question.id,
  userId: user.id,
  category: question.category,
  isAnonymous: question.isAnonymous,
  isPremium: user.isPremium,
});

logger.warn('Quota exceeded', {
  userId: user.id,
  limit: quota.limit,
  used: quota.questionsAsked,
});

logger.error('Vote failed', {
  answerId: answer.id,
  userId: user.id,
  error: error.message,
});
```

### 4. Dashboard

**Grafana Dashboard Panels:**
1. Request rate (line chart)
2. Response time (heatmap)
3. Error rate (gauge)
4. Active users (stat)
5. Questions created (bar chart)
6. Top categories (pie chart)
7. Database connections (gauge)
8. Redis memory (gauge)

---

## Rollback Procedure

### 1. Immediate Rollback (API)

```bash
# Docker
docker stop wellness-api
docker start wellness-api-previous

# PM2
pm2 stop wellness-api
pm2 start wellness-api-previous

# Heroku
heroku releases:rollback
```

### 2. Database Rollback

**⚠️ DİKKAT: Veri kaybı olabilir!**

```bash
# Restore from backup
psql -h <host> -U <user> -d wellness_prod < backup_20251017_100000.sql

# Or use managed service restore
# AWS RDS: Restore from snapshot
# Heroku: heroku pg:backups:restore
```

### 3. Mobile App Rollback

**iOS:**
- App Store Connect → My Apps → Version → Remove from Sale
- Önceki versiyonu yeniden submit et

**Android:**
- Google Play Console → Release → Production → Halt rollout
- Önceki versiyonu yeniden yayınla

### 4. Feature Flag Rollback

```bash
# Disable Q&A feature via admin panel
curl -X PATCH https://api.wellness.app/api/feature-flags/qna_enabled \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"enabled": false}'
```

---

## Troubleshooting

### Problem: Migration başarısız

**Çözüm:**
```bash
# Migration durumunu kontrol et
pnpm prisma migrate status

# Başarısız migration'ı resolve et
pnpm prisma migrate resolve --applied <migration-name>

# Veya rollback
pnpm prisma migrate resolve --rolled-back <migration-name>
```

### Problem: Yüksek response time

**Çözüm:**
```bash
# Slow query'leri bul
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Index ekle
CREATE INDEX idx_question_category_created 
ON "Question" (category, "createdAt" DESC);

# Redis cache'i kontrol et
redis-cli INFO memory
redis-cli KEYS "qna:*"
```

### Problem: Quota çalışmıyor

**Çözüm:**
```bash
# Quota kayıtlarını kontrol et
SELECT * FROM "QnaQuota" WHERE "userId" = '<user-id>';

# Manuel reset
UPDATE "QnaQuota" 
SET "questionsAsked" = 0, "resetsAt" = NOW() + INTERVAL '1 month'
WHERE "userId" = '<user-id>';
```

### Problem: Bildirimler gitmiyor

**Çözüm:**
```bash
# Notification preferences kontrol et
SELECT * FROM "QnaNotificationPreference" WHERE "userId" = '<user-id>';

# Push token kontrol et
SELECT "pushToken" FROM "User" WHERE id = '<user-id>';

# Test notification gönder
curl -X POST https://api.wellness.app/api/reminders/push/test \
  -H "Authorization: Bearer <token>"
```

### Problem: Spam detection çok agresif

**Çözüm:**
```typescript
// apps/api/src/qna/moderation.service.ts
// Spam threshold'u artır
const SPAM_THRESHOLD = 5; // 3'ten 5'e çıkar

// Veya keyword listesini güncelle
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'lottery'
  // Daha az keyword
];
```

---

## Performance Optimization

### 1. Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT q.*, u.username, COUNT(a.id) as answer_count
FROM "Question" q
LEFT JOIN "User" u ON q."userId" = u.id
LEFT JOIN "Answer" a ON a."questionId" = q.id
WHERE q.category = 'PREGNANCY'
GROUP BY q.id, u.username
ORDER BY q."createdAt" DESC
LIMIT 20;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_answer_question_id 
ON "Answer" ("questionId");

CREATE INDEX CONCURRENTLY idx_vote_answer_user 
ON "AnswerVote" ("answerId", "userId");

-- Vacuum and analyze
VACUUM ANALYZE "Question";
VACUUM ANALYZE "Answer";
VACUUM ANALYZE "AnswerVote";
```

### 2. Redis Caching

```typescript
// Cache question list
const cacheKey = `qna:questions:${category}:${page}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const questions = await this.prisma.question.findMany({...});
await redis.setex(cacheKey, 300, JSON.stringify(questions)); // 5 min TTL
```

### 3. API Rate Limiting

```typescript
// Adjust rate limits based on load
@Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10/hour
async createQuestion() { ... }

@Throttle({ default: { limit: 100, ttl: 3600000 } }) // 100/hour
async voteAnswer() { ... }
```

### 4. Mobile App Optimization

```typescript
// Use FlashList for better performance
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={questions}
  renderItem={({ item }) => <QuestionCard question={item} />}
  estimatedItemSize={200}
/>

// Implement pagination
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['questions'],
  queryFn: ({ pageParam = 1 }) => fetchQuestions(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

---

## Security Checklist

- [ ] SQL injection koruması (Prisma ORM kullanımı)
- [ ] XSS koruması (input sanitization)
- [ ] CSRF koruması (token validation)
- [ ] Rate limiting aktif
- [ ] JWT token expiry ayarlandı
- [ ] HTTPS zorunlu
- [ ] Sensitive data encryption
- [ ] Audit logging aktif
- [ ] Error messages sanitized (no stack traces)
- [ ] CORS properly configured
- [ ] Input validation (DTO'lar)
- [ ] File upload restrictions (if any)
- [ ] API key rotation policy
- [ ] Database backup strategy
- [ ] Disaster recovery plan

---

## Support & Escalation

### Level 1: User Support
- Email: support@wellness.app
- Response time: 24 hours
- Issues: Login, basic features

### Level 2: Technical Support
- Email: tech@wellness.app
- Response time: 4 hours
- Issues: Bugs, performance

### Level 3: Engineering
- Slack: #wellness-engineering
- Response time: 1 hour
- Issues: Critical bugs, outages

### On-Call Rotation
- PagerDuty integration
- 24/7 coverage
- Escalation after 15 minutes

---

## Changelog

### v1.5.0 (2025-10-17)
- ✨ Q&A Community platform eklendi
- ✨ Reputation ve badge sistemi
- ✨ Content moderation
- ✨ Analytics ve sharing
- 🐛 Bug fixes ve performance iyileştirmeleri

---

## Kaynaklar

- [API Documentation](./API_DOCUMENTATION.md)
- [Component Documentation](../../mobile/src/components/qna/COMPONENT_DOCUMENTATION.md)
- [Design Document](./design.md)
- [Requirements Document](./requirements.md)
- [Main README](../../../README.md)

---

**Deployment tamamlandıktan sonra bu checklist'i doldurun ve team'e bildirin!**
