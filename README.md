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

- **[CLAUDE.md](./CLAUDE.md)** - Full technical specification (71KB)
- **[PHASE_*_PROGRESS.md](./PHASE_6_PROGRESS.md)** - Implementation logs
- **[docs/troubleshooting.md](./docs/troubleshooting.md)** - Common issues
- **[docs/google-oauth-flow.md](./docs/google-oauth-flow.md)** - OAuth setup
- **[API Docs](http://localhost:4000/api/docs)** - Interactive Swagger

---

## 🔐 Security Notes

### Secrets Management

- **Never commit** `.env.local` files
- Use `.env.example` templates
- Production: Use secret manager (1Password, Doppler, AWS Secrets Manager)
- Rotate keys quarterly

### Environment Variables

```bash
# Required (API)
DATABASE_URL                 # PostgreSQL connection
JWT_SECRET                   # Access token secret
JWT_REFRESH_SECRET           # Refresh token secret
REDIS_URL                    # Redis connection

# Required (At least one AI provider)
OPENAI_API_KEY              # OR
ANTHROPIC_API_KEY           # OR
GOOGLE_GENERATIVE_AI_API_KEY

# Optional (Features)
GOOGLE_OAUTH_CLIENT_ID_*    # Google Sign-In
EXPO_ACCESS_TOKEN           # Push notifications
SENTRY_DSN                  # Error tracking
```

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

### Optional Enhancements 🔮

- [ ] Pregnancy Module (full implementation)
- [ ] English Localization
- [ ] Wearable Integration
- [ ] Community Features
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
