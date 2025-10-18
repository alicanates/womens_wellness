# Q&A Community - Topluluk Soru-Cevap Platformu

## 📋 Genel Bakış

Q&A Community, kadın sağlığı konularında kullanıcıların soru sorabileceği, cevap verebileceği ve bilgi paylaşabileceği topluluk odaklı bir platformdur. Anonim mod, oylama sistemi, itibar puanları ve rozet sistemi ile kullanıcı katılımını teşvik eder.

## ✨ Özellikler

### Temel Özellikler
- ✅ Soru oluşturma ve yönetimi
- ✅ Cevap verme ve en iyi cevap seçimi
- ✅ Oy verme sistemi (upvote/downvote)
- ✅ Yorum yapma (max 300 karakter)
- ✅ Anonim mod desteği
- ✅ Kategori ve tag bazlı filtreleme
- ✅ Arama fonksiyonu

### Sosyal Özellikler
- ✅ Soru favorileme
- ✅ Soru ve kullanıcı takip etme
- ✅ Bildirim sistemi
- ✅ Paylaşım (sosyal medya)
- ✅ İtibar puanı ve rozet sistemi
- ✅ Leaderboard (sıralama)

### Moderasyon
- ✅ İçerik raporlama
- ✅ Otomatik spam algılama
- ✅ Admin moderasyon paneli
- ✅ Çoklu rapor ile otomatik gizleme

### Premium Özellikler
- ✅ Yüksek soru limiti (5 → 20/ay)
- ✅ Premium rozeti
- ✅ Öncelikli görünürlük

## 📊 İstatistikler

### Kullanım Metrikleri
- Toplam soru sayısı
- Toplam cevap sayısı
- Ortalama cevap süresi
- En iyi cevap oranı
- Aktif kullanıcı sayısı
- Kategori dağılımı

### İtibar Sistemi
- Cevap en iyi seçildi: +15 puan
- Cevaba upvote: +5 puan
- Cevaba downvote: -2 puan
- Soru upvote: +3 puan
- Soru downvote: -1 puan

## 🏗️ Mimari

### Backend (NestJS)
```
apps/api/src/qna/
├── qna.module.ts              # Ana modül
├── qna.service.ts             # Soru/cevap servisi
├── vote.service.ts            # Oylama servisi
├── reputation.service.ts      # İtibar servisi
├── moderation.service.ts      # Moderasyon servisi
├── qna-notification.service.ts # Bildirim servisi
├── analytics.service.ts       # Analytics servisi
├── sharing.service.ts         # Paylaşım servisi
├── questions.controller.ts    # Soru endpoint'leri
├── answers.controller.ts      # Cevap endpoint'leri
├── vote.controller.ts         # Oy endpoint'leri
├── comments.controller.ts     # Yorum endpoint'leri
├── interactions.controller.ts # Etkileşim endpoint'leri
├── reputation.controller.ts   # İtibar endpoint'leri
├── moderation.controller.ts   # Moderasyon endpoint'leri
├── notification.controller.ts # Bildirim endpoint'leri
├── analytics.controller.ts    # Analytics endpoint'leri
├── sharing.controller.ts      # Paylaşım endpoint'leri
├── dto/                       # Data Transfer Objects
├── guards/                    # Authorization guards
├── pipes/                     # Validation pipes
└── utils/                     # Utility functions
```

### Mobile (React Native + Expo)
```
apps/mobile/
├── app/(tabs)/community/
│   ├── index.tsx              # Ana liste
│   ├── [id].tsx               # Soru detay
│   ├── ask.tsx                # Soru oluştur
│   ├── my-questions.tsx       # Sorularım
│   ├── my-answers.tsx         # Cevaplarım
│   ├── favorites.tsx          # Favoriler
│   ├── following.tsx          # Takip ettiklerim
│   ├── search.tsx             # Arama
│   └── notification-preferences.tsx
├── src/components/qna/
│   ├── QuestionCard.tsx       # Soru kartı
│   ├── AnswerCard.tsx         # Cevap kartı
│   ├── VoteButton.tsx         # Oy butonu
│   ├── CommentList.tsx        # Yorum listesi
│   ├── CommentInput.tsx       # Yorum input
│   ├── AnswerInput.tsx        # Cevap input
│   ├── CategoryPill.tsx       # Kategori pill
│   ├── TagChip.tsx            # Tag chip
│   ├── BadgeCard.tsx          # Rozet kartı
│   ├── ShareSheet.tsx         # Paylaşım sheet
│   ├── ReportModal.tsx        # Rapor modal
│   ├── LoadingSkeleton.tsx    # Loading skeleton
│   └── OptimizedQuestionList.tsx
├── src/hooks/
│   ├── useQna.ts              # Q&A hooks
│   ├── useQnaInteractions.ts  # Etkileşim hooks
│   └── useQnaNotifications.ts # Bildirim hooks
├── src/store/
│   ├── qnaStore.ts            # Q&A state
│   ├── qnaInteractionsStore.ts
│   └── qnaNotificationStore.ts
├── src/services/
│   └── api.ts                 # API client
└── src/types/
    └── qna.ts                 # TypeScript types
```

### Database (PostgreSQL + Prisma)
```
Question
├── id, userId, title, content
├── category, tags, isAnonymous
├── status, viewCount, isPremium
└── Relations: answers, comments, favorites, followers

Answer
├── id, questionId, userId, content
├── isBestAnswer, voteCount
└── Relations: votes, comments

AnswerVote
├── id, answerId, userId, voteType
└── Unique: (answerId, userId)

QuestionComment / AnswerComment
├── id, targetId, userId, content
└── Max length: 300 characters

QuestionFavorite / QuestionFollower
├── id, questionId, userId
└── Unique: (questionId, userId)

UserFollower
├── id, followerId, followingId
└── Unique: (followerId, followingId)

UserReputation
├── id, userId, totalPoints
├── questionsAsked, answersGiven
├── bestAnswers, upvotesReceived
└── Relations: history, badges

Badge
├── id, key, nameTr, nameEn
├── description, iconUrl
└── requirement (JSON)

ContentReport
├── id, contentId, contentType
├── reporterId, reason, status
└── reviewedBy, reviewedAt

QnaQuota
├── id, userId, monthKey
├── questionsAsked, limit
└── resetsAt
```

## 🚀 Kurulum

### 1. Database Migration

```bash
cd apps/api

# Migration'ı çalıştır
pnpm prisma migrate deploy

# Seed data ekle (rozetler)
pnpm prisma db seed
```

### 2. Backend Başlatma

```bash
cd apps/api

# Dependencies
pnpm install

# Development
pnpm dev

# Production
pnpm build
pnpm start:prod
```

### 3. Mobile App Başlatma

```bash
cd apps/mobile

# Dependencies
pnpm install

# Development
pnpm dev

# iOS
pnpm ios

# Android
pnpm android
```

## 📖 Dokümantasyon

### API Dokümantasyonu
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Tüm endpoint'ler ve kullanım örnekleri
- Swagger UI: http://localhost:4000/api/docs

### Component Dokümantasyonu
- [COMPONENT_DOCUMENTATION.md](../../mobile/src/components/qna/COMPONENT_DOCUMENTATION.md) - React Native component'leri

### Deployment
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment rehberi

### Tasarım ve Gereksinimler
- [design.md](./design.md) - Teknik tasarım dokümanı
- [requirements.md](./requirements.md) - Gereksinim spesifikasyonları
- [tasks.md](./tasks.md) - Implementation task listesi

## 🧪 Test

### Backend Tests

```bash
cd apps/api

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Specific test
pnpm test qna.service.spec.ts

# Coverage
pnpm test:cov
```

### Mobile Tests

```bash
cd apps/mobile

# Unit tests
pnpm test

# E2E tests (Detox)
pnpm test:e2e

# Component tests
pnpm test:components
```

### Manual Testing

```bash
# Test scripts
cd apps/api/src/qna

# Test filtering
node test-filtering.ts

# Test interactions
node test-interactions.ts

# Test reputation
node test-reputation.ts

# Test moderation
node test-moderation.ts

# Test notifications
node test-notifications.ts

# Test analytics
node test-analytics-sharing.ts

# E2E test
node qna.e2e.spec.ts
```

## 📊 Monitoring

### Key Metrics

```typescript
// Application metrics
- Request rate (req/min)
- Response time (p50, p95, p99)
- Error rate (%)
- Active users

// Business metrics
- Questions created/day
- Answers created/day
- Votes cast/day
- Best answer rate (%)
- Average time to first answer
- User retention

// Database metrics
- Query execution time
- Connection pool usage
- Table sizes
- Index usage
```

### Alerts

```yaml
# High error rate
- Error rate > 1% for 5 minutes

# Slow queries
- 95th percentile > 2s for 5 minutes

# High moderation queue
- Pending reports > 100 for 10 minutes

# Quota exceeded spike
- Quota exceeded errors > 10/min
```

## 🔒 Güvenlik

### Input Validation
- XSS koruması (HTML sanitization)
- SQL injection koruması (Prisma ORM)
- Max length kontrolü
- Content type validation

### Rate Limiting
- Soru oluşturma: 5/saat
- Cevap verme: 10/saat
- Oy verme: 50/saat
- Yorum yapma: 20/saat
- Favorileme/Takip: 30/saat

### Authorization
- JWT token validation
- Owner-only actions (edit, delete)
- Question author-only (mark best answer)
- Admin-only (moderation)

### Privacy
- Anonim mod (gerçek user ID gizli)
- GDPR compliance
- Right to be forgotten
- Data export

## 🎨 UI/UX

### Design System
- Material Design 3 principles
- Consistent spacing (4px grid)
- Color palette (category-based)
- Typography scale
- Dark mode support

### Accessibility
- Screen reader support
- Semantic HTML/Native elements
- ARIA labels
- Keyboard navigation
- Focus management
- High contrast mode

### Animations
- Haptic feedback
- Press animations
- Transition animations
- Loading animations
- Skeleton shimmer

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Landscape support
- Different screen sizes

## 🌍 Internationalization

### Supported Languages
- 🇹🇷 Türkçe (primary)
- 🇬🇧 English (planned)

### Translation Files
```
packages/i18n/src/locales/
├── tr.json
└── en.json
```

### Usage
```typescript
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();
t('qna.askQuestion'); // "Soru Sor"
```

## 📈 Performance

### Optimizations
- FlashList for virtualization
- React Query caching
- Optimistic updates
- Image lazy loading
- Debounced search
- Memoization (React.memo, useMemo)

### Caching Strategy
- Question list: 5 min TTL
- User reputation: 10 min TTL
- Leaderboard: 1 hour TTL
- Vote counts: 2 min TTL

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Pagination (cursor-based)

## 🐛 Troubleshooting

### Yaygın Sorunlar

**Problem: Soru oluşturulamıyor**
```bash
# Quota kontrolü
GET /api/qna/questions/quota/status

# Çözüm: Quota reset veya premium upgrade
```

**Problem: Bildirimler gitmiyor**
```bash
# Preferences kontrolü
GET /api/qna/notifications/preferences

# Push token kontrolü
SELECT "pushToken" FROM "User" WHERE id = '<user-id>';
```

**Problem: Yavaş response time**
```bash
# Slow query analizi
EXPLAIN ANALYZE SELECT * FROM "Question" ...

# Index ekleme
CREATE INDEX idx_question_category ON "Question" (category);
```

**Problem: Spam detection çok agresif**
```typescript
// Threshold'u artır
const SPAM_THRESHOLD = 5; // 3'ten 5'e
```

## 🤝 Katkıda Bulunma

### Development Workflow

1. Feature branch oluştur
```bash
git checkout -b feature/qna-improvement
```

2. Değişiklikleri yap
```bash
# Code changes
# Add tests
# Update docs
```

3. Test et
```bash
pnpm test
pnpm lint
```

4. Commit et
```bash
git commit -m "feat(qna): add new feature"
```

5. Pull request aç
```bash
git push origin feature/qna-improvement
# Open PR on GitHub
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Meaningful variable names
- Comments for complex logic
- JSDoc for public APIs

### Testing Requirements

- Unit tests for services
- Integration tests for API
- Component tests for UI
- E2E tests for critical flows
- Minimum 80% coverage

## 📝 Changelog

### v1.0.0 (2025-10-17)
- ✨ İlk release
- ✨ Soru-cevap platformu
- ✨ Oy verme sistemi
- ✨ İtibar ve rozet sistemi
- ✨ Moderasyon sistemi
- ✨ Bildirim entegrasyonu
- ✨ Analytics ve paylaşım
- ✨ Mobile UI components
- ✨ Dark mode desteği
- ✨ i18n desteği

## 📞 Destek

### İletişim
- Email: support@wellness.app
- GitHub Issues: https://github.com/wellness/app/issues
- Slack: #qna-community

### Dokümantasyon
- API Docs: http://localhost:4000/api/docs
- Component Docs: [COMPONENT_DOCUMENTATION.md](../../mobile/src/components/qna/COMPONENT_DOCUMENTATION.md)
- Deployment: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Kaynaklar
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)

## 📜 Lisans

[License details here]

---

**Built with ❤️ for women's health and wellness community**
