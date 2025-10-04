# CLAUDE_NOTES.md

## Bootstrap Status - Phase 1 Complete ✅

**Date**: 2025-10-04
**Specification**: CLAUDE.md v5.2

---

## ✅ Completed Tasks

### 1. Monorepo Infrastructure
- ✅ Turborepo initialized with pnpm workspace
- ✅ Directory structure created (apps/, packages/, scripts/, docs/)
- ✅ Turbo.json configured with build pipeline
- ✅ .gitignore with comprehensive exclusions
- ✅ Root package.json with all development scripts

### 2. Shared Packages
- ✅ `@wellness/types` - TypeScript types, Zod schemas
  - PeriodSymptoms interface
  - StorageDriver interface
  - ErrorCode enum
- ✅ `@wellness/i18n` - Turkish localization (tr.json)
- ✅ `@wellness/config` - ESLint configuration

### 3. NestJS API (apps/api)
- ✅ Package.json with all dependencies
- ✅ Prisma schema with complete data model:
  - User, Profile, OAuthAccount
  - HealthMetric, PeriodCycle, Pregnancy, WaterLog
  - Reminder, Conversation, Message, Memory
  - Subscription, UsageQuota, ModelPolicy
  - AuditLog, FeatureFlag
- ✅ Prisma seed script with test users & model policies
- ✅ NestJS application structure:
  - main.ts with Fastify adapter
  - app.module.ts with ThrottlerModule
  - PrismaModule (global)
  - Health check endpoint
  - Swagger/OpenAPI documentation
- ✅ TypeScript configuration
- ✅ Nest CLI configuration

### 4. Environment Files
- ✅ `.env.example` for all apps (api, mobile, admin)
- ✅ `.env.local` for API with generated JWT secrets
- ✅ All environment variables documented with TODO markers

### 5. Scripts
- ✅ `scripts/dev-setup.sh` - Homebrew setup, service start, env generation
- ✅ `scripts/validate-env.js` - Preflight validation for tools & services

### 6. Documentation
- ✅ `README.md` - Comprehensive setup guide
- ✅ `docs/troubleshooting.md` - Common issues & fixes
- ✅ `docs/google-oauth-flow.md` - OAuth setup guide
- ✅ `docs/offline-sync-strategy.md` - Sync architecture

---

## ⏭️ Next Steps (Phase 2)

### Critical Path to MVP

#### 1. Install Dependencies & Verify Setup
```bash
# Install all packages
pnpm install

# Generate Prisma client
pnpm db:generate

# Verify services are running
pnpm validate:env
```

#### 2. Initialize Mobile App (apps/mobile)
- TODO: Create Expo app structure
- TODO: Add package.json with dependencies
- TODO: Create app.config.ts with bundle IDs
- TODO: Set up navigation (React Navigation)
- TODO: Create auth screens (Sign In, Sign Up)
- TODO: Implement Google Sign-In hook (useGoogleSignIn)
- TODO: Create SQLite offline cache schema
- TODO: Set up React Query & Zustand
- TODO: Copy .env.example to .env.local

#### 3. Initialize Admin Panel (apps/admin)
- TODO: Create Refine Next.js app
- TODO: Add package.json with dependencies
- TODO: Create data provider (connects to API)
- TODO: Set up resources (Users, ModelPolicy, FeatureFlags)
- TODO: Copy .env.example to .env.local

#### 4. API - Auth Module
- TODO: Create AuthModule with:
  - Email/password registration & login
  - Google OAuth endpoint (`POST /auth/google`)
  - JWT service (access + refresh tokens)
  - Guards & decorators
- TODO: Add bcrypt password hashing
- TODO: Implement google-auth-library verification

#### 5. API - Core Modules (MVP Priority)
- TODO: UsersModule (GET /me, profile management)
- TODO: MetricsModule (POST /metrics/bmi, water calculator)
- TODO: WaterModule (GET /water, POST /water)
- TODO: CyclesModule (GET /cycles, POST /cycles, period prediction)
- TODO: RemindersModule (CRUD + BullMQ scheduling)
- TODO: QuotaModule (middleware + monthly reset job)

#### 6. API - AI Chat Module
- TODO: ChatModule with:
  - POST /chat/:conversationId/message
  - GET /chat/:conversationId/stream (SSE)
  - POST /chat/:conversationId/forget
- TODO: ModelSelector service (plan-based routing)
- TODO: Vercel AI SDK integration (OpenAI/Anthropic/Google)
- TODO: Server tools (get_user_metrics, log_water, etc.)
- TODO: Turkish system prompt for NOVA
- TODO: MemoryModule (global + conversation scope)

#### 7. Database Setup
```bash
# Run migrations
pnpm db:prep

# Seed test data
pnpm db:seed

# Verify in Prisma Studio
pnpm db:studio
```

#### 8. Mobile - Core Screens (MVP)
- TODO: Home screen with water/cycle/metrics cards
- TODO: Water logging screen
- TODO: BMI calculator screen
- TODO: Period calendar screen
- TODO: Chat screen with streaming
- TODO: Settings screen with KVKK data rights

#### 9. AI Provider Configuration
- TODO: Obtain API key from at least one provider:
  - OpenAI: https://platform.openai.com/api-keys
  - OR Anthropic: https://console.anthropic.com/
  - OR Google: https://makersuite.google.com/app/apikey
- TODO: Add to apps/api/.env.local
- TODO: Test chat endpoint

#### 10. Google OAuth (Optional but Recommended)
- TODO: Create Google Cloud project
- TODO: Create iOS, Android, Web OAuth clients
- TODO: Get SHA-1 for Android debug keystore
- TODO: Update .env.local files with client IDs
- TODO: Create development build (not Expo Go)

---

## 📋 Assumptions & Decisions Made

### 1. Placeholder Values
- All API keys use `PLACEHOLDER_*` or `sk-PLACEHOLDER_*` format
- JWT secrets **have been generated** using `openssl rand -hex 32`
- Google OAuth client IDs use `PLACEHOLDER_GOOGLE_CLIENT_*`
- Database URL assumes `postgres:postgres` local credentials

### 2. Bundle IDs
- iOS: `com.wellness.companion`
- Android: `com.wellness.companion`
- These are temporary and should be changed before production

### 3. Defaults Applied
- Default locale: **Turkish (tr)**
- Timezone: `Europe/Istanbul`
- Free plan quota: 100 AI messages/month
- Premium plan quota: 1000 AI messages/month
- Rate limits: 60 rpm public, 30 rpm auth, 6 rpm chat

### 4. Service Ports
- API: 4000
- Admin: 3000
- Expo Metro: 8081
- PostgreSQL: 5432
- Redis: 6379
- Mailpit SMTP: 1025
- Mailpit UI: 8025

### 5. Storage
- Development uses **filesystem driver** (no MinIO needed)
- Files stored at `apps/api/var/files` (gitignored)

---

## ⚠️ Known Limitations

1. **Mobile & Admin apps not yet initialized** - Only basic structure created
2. **No AI provider configured** - User must add at least one API key
3. **Google OAuth not configured** - Requires manual Google Cloud setup
4. **No development build** - Expo Go won't support Google Sign-In
5. **Services must be started manually** - PostgreSQL, Redis, Mailpit
6. **No tests written yet** - Unit and E2E tests pending
7. **No MinIO/S3 setup** - Filesystem storage only
8. **No Detox installed** - E2E testing framework pending
9. **Rive animation placeholder** - Real mascot animation file needed

---

## 🔧 Manual Setup Required

### Before First Run

1. **Start Services**:
   ```bash
   brew services start postgresql@16 redis mailpit
   createdb wellness
   ```

2. **Add AI Provider API Key** (choose one):
   - Edit `apps/api/.env.local`
   - Replace `sk-PLACEHOLDER_OPENAI_KEY` with real key
   - OR replace `sk-PLACEHOLDER_ANTHROPIC_KEY`
   - OR replace `PLACEHOLDER_GOOGLE_AI_KEY`

3. **Install Dependencies**:
   ```bash
   pnpm install
   pnpm db:generate
   ```

4. **Run Migrations**:
   ```bash
   pnpm db:prep
   pnpm db:seed
   ```

5. **Validate**:
   ```bash
   pnpm validate:env
   ```

### Optional (for Google Sign-In)

1. Create Google Cloud project
2. Create OAuth client IDs (iOS, Android)
3. Update `.env.local` files
4. Create Expo development build

---

## 📂 Repository Tree (Current State)

```
womens_wellness/
├── CLAUDE.md                      # Full specification (v5.2)
├── CLAUDE_NOTES.md               # This file
├── README.md                     # Setup guide
├── package.json                  # Root monorepo config
├── pnpm-workspace.yaml          # PNPM workspace
├── turbo.json                   # Turbo pipeline
├── .gitignore                   # Comprehensive exclusions
│
├── apps/
│   ├── api/                     # NestJS API ✅
│   │   ├── package.json         # All dependencies
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── .env.example         # Template
│   │   ├── .env.local           # Generated with JWT secrets
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Complete data model
│   │   │   └── seed.ts          # Test users + policies
│   │   └── src/
│   │       ├── main.ts          # Fastify + Swagger
│   │       ├── app.module.ts    # ThrottlerModule
│   │       ├── app.controller.ts
│   │       ├── app.service.ts   # Health check
│   │       └── prisma/          # PrismaModule
│   │
│   ├── mobile/                  # Expo app (TODO)
│   │   └── .env.example
│   │
│   └── admin/                   # Refine panel (TODO)
│       └── .env.example
│
├── packages/
│   ├── types/                   # Shared types ✅
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── period.ts        # PeriodSymptoms
│   │       ├── storage.ts       # StorageDriver
│   │       └── errors.ts        # ErrorCode enum
│   │
│   ├── i18n/                    # Localization ✅
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── locales/
│   │           └── tr.json      # Turkish translations
│   │
│   ├── config/                  # ESLint config ✅
│   │   ├── package.json
│   │   └── eslint.js
│   │
│   └── ui/                      # Shared UI (TODO)
│
├── scripts/
│   ├── dev-setup.sh             # Homebrew bootstrap ✅
│   └── validate-env.js          # Preflight checks ✅
│
└── docs/
    ├── troubleshooting.md       # Common issues ✅
    ├── google-oauth-flow.md     # OAuth guide ✅
    └── offline-sync-strategy.md # Sync architecture ✅
```

---

## 🎯 Success Criteria for Phase 2

- [ ] All dependencies installed without errors
- [ ] Database migrations run successfully
- [ ] API server starts on port 4000
- [ ] Health check returns 200 OK
- [ ] Swagger docs accessible at /api/docs
- [ ] At least one AI provider configured
- [ ] Prisma Studio shows seeded test users
- [ ] Mobile app initialized (even if minimal)
- [ ] Admin panel initialized (even if minimal)
- [ ] All validation checks pass

---

## 📞 Getting Help

1. **Validation Failures**: Run `pnpm validate:env` for specific issues
2. **Service Issues**: Check `docs/troubleshooting.md`
3. **OAuth Setup**: Follow `docs/google-oauth-flow.md`
4. **Offline Sync**: Reference `docs/offline-sync-strategy.md`
5. **Full Spec**: See `CLAUDE.md` for authoritative details

---

**Status**: ✅ Phase 1 (Bootstrap) Complete
**Next**: Phase 2 (Core Implementation) Ready to Begin
