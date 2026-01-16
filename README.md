# Women's Wellness Companion 🌸

A modern, privacy-respecting women's wellness tracking app with an empathetic AI companion. Built with React Native (Expo), NestJS, and PostgreSQL.

> **MVP Status**: ~97% Complete | **Language**: Turkish (primary), English (planned)

---

## 🌟 Key Features

### Health & Wellness
- ✅ **BMI & BMR Calculator**: Calculate body metrics with Mifflin-St Jeor formula
- ✅ **Daily Water Tracking**: 30ml/kg baseline with activity/climate modifiers
- ✅ **Period Tracking**: Cycle logging, symptom tracking, prediction algorithm
- ✅ **Pregnancy Timeline**: Due date calculator, week-by-week milestones (40 weeks)
- ✅ **Health Metrics History**: Track and visualize progress over time

### Q&A Community 💬
- ✅ **Question & Answer Platform**: Ask and answer women's health questions
- ✅ **Anonymous Mode**: Ask sensitive questions privately
- ✅ **Voting System**: Upvote/downvote answers for quality content
- ✅ **Best Answer Selection**: Question authors can mark the most helpful answer
- ✅ **Reputation & Badges**: Earn points and badges for helpful contributions
- ✅ **Categories & Tags**: Filter by topics (pregnancy, menstrual health, etc.)
- ✅ **Content Moderation**: Report inappropriate content, spam detection
- ✅ **Favorites & Following**: Save questions and follow users
- ✅ **Notifications**: Get notified of new answers, votes, and comments
- ✅ **Sharing**: Share questions on social media
- ✅ **Premium Features**: Higher question limits for premium users (5 vs 20/month)

### AI Companion (NOVA) 🤖
- ✅ **Empathetic Chat**: Turkish-language AI friend for wellness support
- ✅ **Streaming Responses**: Real-time SSE streaming with typing indicators
- ✅ **Persistent Memory**: Opt-in global + conversation memory
- ✅ **Server Tools**: Access to user metrics, water logging, reminders, predictions
- ✅ **Multi-Model Support**: OpenAI, Anthropic, Google (admin-configurable)
- ✅ **Quota Management**: Free (100 msgs/month), Premium (1000 msgs/month)

### Smart Reminders
- ✅ **Flexible Scheduling**: Daily, Weekly, Monthly, Custom reminders
- ✅ **Push Notifications**: Expo Push with retry logic and receipt tracking
- ✅ **Quiet Hours**: Timezone-aware scheduling, respects user preferences
- ✅ **BullMQ Integration**: Reliable job processing with automatic rescheduling

### Privacy & Security 🔒
- ✅ **KVKK Compliant**: Turkish GDPR alignment, explicit consent flows
- ✅ **Field Encryption**: Sensitive data encrypted with libsodium
- ✅ **Audit Logging**: Immutable trail of all admin actions
- ✅ **Right to be Forgotten**: "Forget everything" purges user data
- ✅ **No PII in Logs**: Zero personal identifiable information in system logs

---

## 🏗️ Architecture

### Monorepo Structure (Turborepo + PNPM)
```
womens_wellness/
├── apps/
│   ├── mobile/           # 📱 Expo React Native app (iOS/Android)
│   ├── api/              # 🔧 NestJS API server (Fastify)
│   └── admin/            # 🛠️ Refine admin panel (Next.js)
├── packages/
│   ├── types/            # TypeScript types & Zod schemas
│   ├── i18n/             # Localization (tr.json)
│   ├── ui/               # Shared UI components
│   └── config/           # ESLint, Prettier, TS configs
├── scripts/
│   ├── dev-setup.sh      # Automated dev environment setup
│   └── validate-env.js   # Pre-flight environment checker
├── docs/
│   ├── google-oauth-flow.md
│   ├── offline-sync-strategy.md
│   └── troubleshooting.md
└── PHASE_*_PROGRESS.md   # Detailed implementation logs
```

### Tech Stack

#### Mobile App (`apps/mobile`)
- **Framework**: Expo SDK (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based)
- **State**: Zustand (UI state) + React Query (server state)
- **Offline**: SQLite (expo-sqlite) for caching
- **Notifications**: expo-notifications
- **Auth**: expo-auth-session (Google OAuth)
- **Storage**: expo-secure-store (tokens)

#### Backend API (`apps/api`)
- **Framework**: NestJS 10 + Fastify
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **Cache**: Redis
- **Queue**: BullMQ (reminders, quotas)
- **AI**: Vercel AI SDK (unified interface)
- **Streaming**: Server-Sent Events (SSE)
- **Auth**: Passport JWT + Google OAuth

#### Admin Panel (`apps/admin`)
- **Framework**: Next.js 14 (App Router)
- **Admin**: Refine 4.x
- **UI**: Ant Design 5.x
- **Data**: Custom REST provider (Axios)

---

## 🚀 Quick Start

### Prerequisites (macOS)

```bash
# 1. Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install dependencies
brew install node@20 pnpm git watchman
brew install postgresql@16 redis mailpit

# 3. Optional: For E2E testing
brew tap wix/brew && brew install applesimutils
```

### 1. Setup

```bash
# Clone repository
git clone <repo-url>
cd womens_wellness

# Run automated setup
bash scripts/dev-setup.sh

# Or manual setup:
pnpm install
cp apps/api/.env.example apps/api/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# Generate JWT secrets
openssl rand -hex 32  # Copy to JWT_SECRET in api/.env.local
openssl rand -hex 32  # Copy to JWT_REFRESH_SECRET
```

### 2. Configure Environment

Edit `apps/api/.env.local`:
```ini
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellness

# JWT (replace with generated secrets)
JWT_SECRET=<your-secret-here>
JWT_REFRESH_SECRET=<your-secret-here>

# AI Provider (add at least one)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GOOGLE_GENERATIVE_AI_API_KEY=...

# Google OAuth (optional, for Google Sign-In)
GOOGLE_OAUTH_CLIENT_ID_IOS=...
GOOGLE_OAUTH_CLIENT_ID_ANDROID=...
GOOGLE_OAUTH_CLIENT_ID_WEB=...

# Expo Push (optional, for notifications)
EXPO_ACCESS_TOKEN=...
```

#### 🔑 Gemini API Key Kurulumu (Önerilen)

NOVA AI asistanı şu anda **Google Gemini 1.5 Flash** modelini kullanıyor. API key almak için:

1. **Google AI Studio'ya git**: https://aistudio.google.com/app/apikey
2. **"Create API Key"** butonuna tıkla
3. Bir Google Cloud projesi seç veya yeni oluştur
4. API key'i kopyala (örnek: `AIzaSyC...`)
5. `apps/api/.env.local` dosyasına ekle:
   ```ini
   GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...
   ```

**Önemli Notlar**:
- Gemini API ücretsiz kotası: 15 istek/dakika, 1 milyon token/dakika
- Üretim ortamında API key'i güvenli bir şekilde sakla (secret manager)
- API key'i asla git'e commit etme
- Alternatif olarak OpenAI veya Anthropic kullanabilirsin

**Test etmek için**:
```bash
cd apps/api
pnpm test:gemini  # Gemini API bağlantısını test eder
```

### 3. Start Services

```bash
# Terminal 1: Start databases
brew services start postgresql@16
brew services start redis
brew services start mailpit  # Email catcher (UI at :8025)

# Terminal 2: Validate & prepare database
pnpm validate:env
pnpm db:prep  # Run migrations
pnpm db:seed  # Seed initial data

# Terminal 3: Start API
pnpm dev:api  # http://localhost:4000

# Terminal 4: Start Mobile
pnpm dev:mobile  # Expo Dev Client

# Terminal 5: Start Admin (optional)
pnpm dev:admin  # http://localhost:3001
```

### 4. Access Applications

- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs (Swagger)
- **Admin Panel**: http://localhost:3001
  - Login: `admin@wellness.local` / `admin123`
- **Mailpit** (email catcher): http://localhost:8025

---

## 📱 Mobile App Development

### Development Build (Required for Push & Google Auth)

```bash
# iOS (requires Xcode)
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android

# Or use EAS Build
eas build --profile development --platform ios
```

### Test Users (Seeded)

```javascript
// Free plan user
email: 'free@wellness.local'
password: 'free123'

// Premium plan user
email: 'premium@wellness.local'
password: 'premium123'

// Admin user
email: 'admin@wellness.local'
password: 'admin123'
```

---

## 🛠️ Admin Panel Features

### Resources

1. **Users** - View profiles, subscriptions, edit status
2. **Model Policies** - Configure AI models per plan
   - Free → `gpt-4o-mini` (100 msgs/month)
   - Premium → `claude-3.5-sonnet` (1000 msgs/month)
3. **Feature Flags** - Live toggles for kill switches
4. **Usage Quotas** - Monitor AI consumption with progress bars
5. **Reminders** - View all scheduled reminders
6. **Audit Logs** - Security trail with CSV export

### Key Admin Actions

```bash
# Toggle feature flag
Admin Panel → Feature Flags → Toggle switch

# Change AI model for free plan
Admin Panel → Model Policies → Edit Free Policy
  Provider: anthropic
  Model: claude-3.5-haiku
  Temperature: 0.7
  Max Tokens: 2048
  Save

# View quota usage
Admin Panel → Usage Quotas → See progress bars
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# E2E tests (requires Detox setup)
pnpm test:e2e

# Specific app
cd apps/api && pnpm test
cd apps/mobile && pnpm test
```

### Manual Testing Scenarios

1. **Period Tracking**
   - Add cycle → See prediction
   - Cross month boundary → Verify calendar

2. **AI Chat**
   - Send message → Streaming response
   - Hit quota limit → See friendly error
   - "Forget everything" → Memory cleared

3. **Push Notifications**
   - Create reminder → Wait for delivery
   - Test quiet hours → No push during configured hours
   - Tap notification → Deep link works

4. **Offline Mode**
   - Log water offline → Syncs on reconnect
   - Create reminder offline → Queued for sync

---

## 📊 API Endpoints

### Complete Endpoint List

```
# Authentication
POST   /auth/register, /auth/login, /auth/refresh
POST   /auth/google                    # Google OAuth exchange

# User
GET    /me, PATCH /me

# Metrics
GET    /metrics
POST   /metrics/bmi, /metrics/bmr, /metrics/water/calculate

# Water
GET    /water, /water/today, /water/stats
POST   /water

# Cycles
GET    /cycles, /cycles/:id, /cycles/prediction, /cycles/calendar, /cycles/stats
POST   /cycles
PATCH  /cycles/:id
DELETE /cycles/:id

# AI Chat
POST   /chat/:conversationId/message
GET    /chat/:conversationId/stream      # SSE streaming
POST   /chat/:conversationId/forget
GET    /chat/conversations
GET    /chat/:conversationId/history

# Reminders
GET    /reminders, /reminders/:id
POST   /reminders
PATCH  /reminders/:id, /reminders/:id/toggle
DELETE /reminders/:id
POST   /reminders/push/register, /reminders/push/test

# Q&A Community
GET    /qna/questions                    # List questions
POST   /qna/questions                    # Create question
GET    /qna/questions/:id                # Question detail
PATCH  /qna/questions/:id                # Update question
DELETE /qna/questions/:id                # Delete question
GET    /qna/questions/my                 # My questions
GET    /qna/questions/favorites          # Favorite questions
GET    /qna/questions/following          # Following questions
GET    /qna/questions/quota/status       # Quota status
POST   /qna/questions/:id/favorite       # Favorite question
DELETE /qna/questions/:id/favorite       # Unfavorite question
POST   /qna/questions/:id/follow         # Follow question
DELETE /qna/questions/:id/follow         # Unfollow question

POST   /qna/questions/:id/answers        # Create answer
GET    /qna/questions/:id/answers        # List answers
PATCH  /qna/answers/:id                  # Update answer
DELETE /qna/answers/:id                  # Delete answer
POST   /qna/questions/:qid/answers/:aid/mark-best  # Mark best answer

POST   /qna/answers/:id/vote             # Vote on answer
DELETE /qna/answers/:id/vote             # Remove vote
GET    /qna/answers/:id/vote             # Get user vote
GET    /qna/answers/:id/vote-count       # Get vote count

POST   /qna/questions/:id/comments       # Comment on question
GET    /qna/questions/:id/comments       # Get question comments
POST   /qna/answers/:id/comments         # Comment on answer
GET    /qna/answers/:id/comments         # Get answer comments
DELETE /qna/comments/question/:id        # Delete question comment
DELETE /qna/comments/answer/:id          # Delete answer comment

POST   /qna/users/:id/follow             # Follow user
DELETE /qna/users/:id/follow             # Unfollow user
GET    /qna/users/:id/followers          # Get followers
GET    /qna/users/:id/following          # Get following

GET    /qna/reputation/me                # My reputation
GET    /qna/reputation/:userId           # User reputation
GET    /qna/reputation/leaderboard       # Leaderboard
GET    /qna/reputation/badges            # All badges
GET    /qna/reputation/my-badges         # My badges

POST   /qna/moderation/report            # Report content
GET    /qna/moderation/reports           # List reports (admin)
PATCH  /qna/moderation/reports/:id       # Review report (admin)
POST   /qna/moderation/hide/:id          # Hide content (admin)
DELETE /qna/moderation/content/:id       # Delete content (admin)

GET    /qna/notifications/preferences    # Get notification preferences
PATCH  /qna/notifications/preferences    # Update preferences

GET    /qna/analytics/overview           # Analytics overview
GET    /qna/analytics/categories         # Category distribution
GET    /qna/analytics/top-users          # Top contributors

GET    /qna/questions/:id/share-link     # Get share link
GET    /qna/questions/:id/share-metadata # Get share metadata

# Quotas
GET    /quota                            # Current user
GET    /quotas                           # Admin: all quotas

# Admin Resources
GET    /model-policies, /model-policies/:id
POST   /model-policies
PATCH  /model-policies/:id
DELETE /model-policies/:id

GET    /feature-flags, /feature-flags/:key
POST   /feature-flags
PATCH  /feature-flags/:key
DELETE /feature-flags/:key

GET    /audit-logs, /audit-logs/:id

# System
GET    /, /healthz
GET    /api/docs                         # Swagger UI
```

---

## 🔧 Scripts Reference

```bash
# Development
pnpm dev                 # All apps in parallel
pnpm dev:api             # API only (:4000)
pnpm dev:mobile          # Mobile only
pnpm dev:admin           # Admin only (:3001)

# Database
pnpm db:prep             # Run migrations
pnpm db:seed             # Seed data
pnpm db:studio           # Prisma Studio

# Testing
pnpm test                # All tests
pnpm test:e2e            # E2E tests
pnpm lint                # Lint all

# Build
pnpm build               # Build all apps

# Environment
pnpm validate:env        # Check prerequisites
bash scripts/dev-setup.sh # Automated setup
```

---

## 📚 Documentation

### General
- **[CLAUDE.md](./CLAUDE.md)** - Full technical specification (71KB)
- **[PHASE_*_PROGRESS.md](./PHASE_6_PROGRESS.md)** - Implementation logs
- **[docs/gemini-api-setup.md](./docs/gemini-api-setup.md)** - Gemini API kurulum rehberi (Türkçe)
- **[docs/troubleshooting.md](./docs/troubleshooting.md)** - Common issues
- **[docs/google-oauth-flow.md](./docs/google-oauth-flow.md)** - OAuth setup
- **[API Docs](http://localhost:4000/api/docs)** - Interactive Swagger

### 🚀 Production Deployment
- **[PRODUCTION_QUICK_START.md](./PRODUCTION_QUICK_START.md)** - ⚡ 30 dakikada production'a geç (Cloud)
- **[SELF_HOSTED_SETUP.md](./SELF_HOSTED_SETUP.md)** - 🏠 Kendi sunucunda çalıştır (Self-hosted)
- **[PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md)** - 📖 Detaylı environment variables rehberi
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - ✅ Kapsamlı deployment checklist
- **[PRODUCTION_SECURITY_CHECKLIST.md](./PRODUCTION_SECURITY_CHECKLIST.md)** - 🔐 Güvenlik kontrolleri

---

## 🔐 Security Notes

### Secrets Management

- **Never commit** `.env.local` files
- Use `.env.example` templates
- Production: Use secret manager (1Password, Doppler, AWS Secrets Manager)
- Rotate keys quarterly

### Environment Variables

#### Backend API (`apps/api/.env.local`)

```bash
# ===== REQUIRED =====

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellness

# JWT Authentication
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-hex-32>

# Redis (for caching & queues)
REDIS_URL=redis://localhost:6379

# AI Provider (EN AZ BİRİ GEREKLİ)
# Gemini (Önerilen - ücretsiz kota yüksek)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...
# VEYA OpenAI
OPENAI_API_KEY=sk-...
# VEYA Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# ===== OPTIONAL =====

# Google OAuth (Google ile giriş için)
GOOGLE_OAUTH_CLIENT_ID_IOS=<ios-client-id>.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_ANDROID=<android-client-id>.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_ID_WEB=<web-client-id>.apps.googleusercontent.com

# Push Notifications (Expo Push için)
EXPO_ACCESS_TOKEN=<expo-access-token>

# Email (Development - Mailpit otomatik kullanılır)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@wellness.local

# Error Tracking (Production)
SENTRY_DSN=https://...@sentry.io/...

# Environment
NODE_ENV=development
PORT=4000
```

#### Mobile App (`apps/mobile/.env.local`)

```bash
# API Base URL
EXPO_PUBLIC_API_URL=http://localhost:4000

# Google OAuth (Google ile giriş için)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios-client-id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android-client-id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web-client-id>.apps.googleusercontent.com
```

#### Admin Panel (`apps/admin/.env.local`)

```bash
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Güvenlik Uyarıları**:
- ⚠️ `.env.local` dosyalarını asla git'e commit etme
- ⚠️ Production'da secret manager kullan (AWS Secrets Manager, Doppler, 1Password)
- ⚠️ API key'leri düzenli olarak rotate et (3-6 ayda bir)
- ⚠️ Development ve production için farklı key'ler kullan

---

## 🗂️ Project Status

### Completed Features ✅

| Feature | Status | Phase |
|---------|--------|-------|
| Authentication (Email + Google OAuth) | ✅ Complete | 2 |
| User Profiles | ✅ Complete | 2 |
| Health Metrics (BMI, BMR, Water) | ✅ Complete | 3 |
| Water Logging & Tracking | ✅ Complete | 3 |
| AI Chat with Streaming | ✅ Complete | 4 |
| Memory Management | ✅ Complete | 4 |
| Quota System | ✅ Complete | 4 |
| Period Tracking & Prediction | ✅ Complete | 5 |
| Calendar Views | ✅ Complete | 5 |
| Reminders (Backend) | ✅ Complete | 6 |
| Reminders (Mobile UI) | ✅ Complete | 6 |
| Push Notifications | ✅ Complete | 7 |
| Admin Panel (Refine) | ✅ Complete | 8 |
| Model Policy Management | ✅ Complete | 8 |
| Feature Flags | ✅ Complete | 8 |
| Audit Logging | ✅ Complete | 8 |

### Recently Added Features ✨

| Feature | Status | Date |
|---------|--------|------|
| Q&A Community Platform | ✅ Complete | Oct 2025 |
| Reputation & Badge System | ✅ Complete | Oct 2025 |
| Content Moderation | ✅ Complete | Oct 2025 |
| Analytics & Sharing | ✅ Complete | Oct 2025 |

### Optional Enhancements 🔮

- [ ] Pregnancy Module (full implementation)
- [ ] English Localization
- [ ] Wearable Integration
- [ ] Advanced Analytics Dashboard
- [ ] Export to PDF/CSV

---

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use conventional commits
3. Add tests for new features
4. Run `pnpm lint` before committing
5. Update documentation

---

## 📄 License

[License details here]

---

## 🙏 Acknowledgments

Built with:
- [Expo](https://expo.dev)
- [NestJS](https://nestjs.com)
- [Prisma](https://prisma.io)
- [Refine](https://refine.dev)
- [Vercel AI SDK](https://sdk.vercel.ai)

Designed for women's health and wellness with privacy and empathy at the core. 💜

---

**Questions?** Check [docs/troubleshooting.md](./docs/troubleshooting.md) or open an issue.
