# CLAUDE.md

# Women's Wellness Companion – Agent Build Spec (v5.2) – **No Docker (macOS Local Dev)** – English

> **Purpose**: This Markdown is the single source of truth for an AI coding agent to scaffold and implement a cross‑platform mobile app (iOS/Android) for women's wellness tracking with an AI mascot/companion. **Follow this spec exactly.** If something is missing or ambiguous, implement the safest modular default and leave `TODO:` markers.

---

## 0) Guiding Principles

- **MVP first**, iterative delivery, work behind feature flags.
- **Modular & testable**: clean architecture, typed contracts, DI where useful.
- **Offline‑first** with graceful network degradation; never block core flows on network.
- **Secrets**: never in repo; load from environment everywhere.
- **Privacy by design**: explicit consent, transparent data use, easy "Forget me".
- **Observability**: logs/metrics/error tracking; **no PII in logs**.
- **Kill switches** for AI features and push notifications.

---

## 1) Product Summary

A modern, privacy‑respecting **women's wellness companion**. Users can track:

- **Measurements & Calculators**: BMI, BMR/TDEE, daily water need, pregnancy due date/week, period prediction & symptoms.
- **Calendars & Schedules**: period calendar, pregnancy timeline, reminder schedules (daily/weekly/monthly).
- **AI Companion (Mascot)**: persistent chat that (opt‑in) remembers app data to personalize guidance, proactive reminders, and empathetic support.
- **Membership**: free vs premium (e.g., **100 AI messages/month** for free; configurable in Admin).

**Distinctive UX**: a bottom‑center **mascot button** opens chat. On cold start, show a short **3D/Rive animation** of the mascot before the home screen.

**Language**: **Turkish UI and Turkish AI responses** at launch. English will be added next (i18n scaffolding ready).

---

## 2) High‑Level Architecture

**Monorepo (Turborepo)** with typed packages:

```
apps/
  mobile/            # Expo React Native app (TypeScript)
  api/               # NestJS (Fastify) API server
  admin/             # Admin panel (Refine + Next.js)
packages/
  ui/                # Shared RN/React UI primitives
  types/             # Zod/TypeScript types, API contracts, DTOs
  config/            # ESLint, Prettier, TS config, jest configs
  i18n/              # Localization resources
```

### 2.1 Tech Choices (latest stable)

- **Mobile**: React Native via **Expo** SDK, TypeScript, React Navigation, React Query, Zustand (lightweight store), `expo-sqlite` (offline cache), `expo-notifications`. Locale formatting with `dayjs` + `dayjs/locale/tr`.
- **Backend API**: **NestJS** (TypeScript) + Fastify; **Prisma** ORM; **PostgreSQL**; **Redis** for queues/rate limits; **BullMQ** for jobs (reminders, quota resets, push). Streaming via **SSE**.
- **Database**: **PostgreSQL installed locally via Homebrew** (no Docker). Prisma manages schema/migrations. **Connection pooling**: for production, set `connection_limit` (e.g., 10) and `connect_timeout` (e.g., 10s) in `schema.prisma` datasource (see §7.6).
- **Auth**: First‑party **email/password** (argon2/bcrypt) **+ Google Sign‑In** (OAuth 2.0 / OpenID Connect). Mobile obtains a **Google ID token** via **Expo AuthSession Google provider** and exchanges it at our API for app JWT (access/refresh). Optional email verification via local SMTP catcher for email/password flows.
- **File/Object Storage**: **Filesystem driver** in development (default), switchable to **MinIO** (Homebrew) or S3 in prod via a pluggable `StorageDriver`.
- **AI Layer**: Server‑side broker using **Vercel AI SDK** as a unified interface to **OpenAI**, **Anthropic**, and **Google** models. **Users never pick a model**; **Admin** selects provider/model by membership plan via **ModelPolicy**. Mobile talks **only** to our API.
- **Push**: **Expo Push** (FCM/APNs) with receipts & retries via BullMQ.
- **Admin Panel**: **Refine** (Next.js + Ant Design) bound to our API for users, quotas, **ModelPolicy**, feature flags.
- **Analytics/Crash**: Sentry (errors), PostHog (optional) for product metrics. Disabled in dev.
- **Testing**: Jest + React Testing Library (mobile), **Detox** (E2E mobile), Vitest + Supertest (API). Husky + lint‑staged.

**Rationale**: Expo accelerates mobile delivery; NestJS/Prisma/Postgres are mature OSS; Vercel AI SDK abstracts multiple LLMs; Refine is a flexible OSS admin. **All local development runs on macOS via Homebrew** (no Docker).

---

## 3) Environment & Secrets

Create **`.env.local`** files per app (API, Mobile, Admin). **Never hardcode secrets**.  
For production and CI, use a secret manager (e.g., 1Password, Doppler, AWS/GCP Secret Manager, HashiCorp Vault) and inject env vars at runtime.  
**Rule of thumb:**  
- Server-only secrets live in server env (not exposed to clients).  
- In Expo/Next.js, any variable prefixed with `EXPO_PUBLIC_` / `NEXT_PUBLIC_` is **public** at build time—**never** put secrets there.

> Recommended files in repo:  
> - commit: `.env.example` (safe placeholders)  
> - local only: `.env.local` (ignored), `.env.development.local`, `.env.test.local`  
> - CI/prod: managed by the secret store (no commits)

---

### 3.1 `apps/api/.env.local`

```ini
# ───────────── App & Network ─────────────
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000

# Allowed origins for CORS (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# Log level: debug | info | warn | error
LOG_LEVEL=debug

# HTTP timeouts / payload limits
HTTP_REQUEST_TIMEOUT_MS=15000
MAX_UPLOAD_MB=25

# ───────────── Database & Cache ─────────────
# PostgreSQL (dev example; adjust user/pass for your machine)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellness

# Redis (Queues / Rate limiting)
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=wellness
QUEUE_PREFIX=wellness

# ───────────── Auth / Security ─────────────
# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=__GENERATE_WITH_OPENSSL__
JWT_REFRESH_SECRET=__GENERATE_WITH_OPENSSL__
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=30

# Password hashing
BCRYPT_SALT_ROUNDS=10

# Cookies / sessions (if used)
COOKIE_SECURE=false
COOKIE_DOMAIN=localhost

# ───────────── Google OAuth (OIDC) ─────────────
# TODO: Replace with actual client IDs from Google Cloud Console
GOOGLE_OAUTH_CLIENT_ID_IOS=PLACEHOLDER_GOOGLE_CLIENT_IOS
GOOGLE_OAUTH_CLIENT_ID_ANDROID=PLACEHOLDER_GOOGLE_CLIENT_ANDROID
GOOGLE_OAUTH_CLIENT_ID_WEB=PLACEHOLDER_GOOGLE_CLIENT_WEB
GOOGLE_OAUTH_ALLOWED_HD=                     # optional domain restriction
GOOGLE_OAUTH_AUDIENCES=PLACEHOLDER_GOOGLE_CLIENT_IOS,PLACEHOLDER_GOOGLE_CLIENT_ANDROID,PLACEHOLDER_GOOGLE_CLIENT_WEB

# Redirect URI examples (register in GCP OAuth):
#  - Mobile (Expo AuthSession): <scheme>:/oauthredirect
#  - Web (Admin): http://localhost:3000/auth/callback
PUBLIC_MOBILE_SCHEME=wellness
PUBLIC_MOBILE_REDIRECT_URL=wellness:/oauthredirect
PUBLIC_WEB_ORIGIN=http://localhost:3000

# ───────────── Email (verification / reset) ─────────────
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=__OPTIONAL__
SMTP_PASS=__OPTIONAL__
SMTP_FROM="Wellness App <no-reply@local.test>"
SMTP_TLS=false

# ───────────── File Storage ─────────────
# Driver: filesystem | s3 | minio
STORAGE_DRIVER=filesystem
FILES_BASE_PATH=./var/files   # used if STORAGE_DRIVER=filesystem

# MinIO (if STORAGE_DRIVER=minio)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=__SET__
MINIO_SECRET_KEY=__SET__
MINIO_BUCKET=wellness
MINIO_USE_SSL=false

# AWS S3 (if STORAGE_DRIVER=s3)
S3_REGION=__SET__
S3_ENDPOINT=                      # optional for S3-compatible providers
S3_BUCKET=__SET__
S3_ACCESS_KEY_ID=__SET__
S3_SECRET_ACCESS_KEY=__SET__
S3_FORCE_PATH_STYLE=true
S3_SSE=                           # e.g., AES256 (optional)

# ───────────── AI Providers (use at least one) ─────────────
# TODO: Replace with actual API keys
OPENAI_API_KEY=sk-PLACEHOLDER_OPENAI_KEY
ANTHROPIC_API_KEY=sk-PLACEHOLDER_ANTHROPIC_KEY
GOOGLE_GENERATIVE_AI_API_KEY=PLACEHOLDER_GOOGLE_AI_KEY

# ───────────── Push (server-to-Expo) ─────────────
# TODO: Get from Expo dashboard
EXPO_ACCESS_TOKEN=PLACEHOLDER_EXPO_ACCESS_TOKEN

# ───────────── Observability ─────────────
SENTRY_DSN=__OPTIONAL__
POSTHOG_API_KEY=__OPTIONAL__
POSTHOG_HOST=__OPTIONAL__

# ───────────── Feature Flags (examples) ─────────────
FEATURE_GOOGLE_AUTH=true
FEATURE_OFFLINE_FIRST=true

# ───────────── Defaults (examples) ─────────────
PAGINATION_DEFAULT_LIMIT=20
```

**Notes (API):**  
- **Fail fast on boot:** validate env with a schema (e.g., Zod/envalid) and exit if required keys are missing/invalid.  
- Put any **third-party credentials** (SMTP, OAuth client secrets, S3 keys) only on the server side.  
- Keep **redirect URIs** consistent between the app scheme and the GCP OAuth configuration.
- Generate JWT secrets with: `openssl rand -hex 32`

---

### 3.2 `apps/mobile/.env.local`

```ini
# API
API_BASE_URL=http://localhost:4000

# Expo AuthSession (public by design; never put secrets here)
EXPO_PUBLIC_SCHEME=wellness
EXPO_PUBLIC_REDIRECT_URL=wellness:/oauthredirect

# Google OAuth client IDs (public – used by AuthSession)
# TODO: Replace with actual client IDs
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=PLACEHOLDER_GOOGLE_CLIENT_IOS
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=PLACEHOLDER_GOOGLE_CLIENT_ANDROID
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=PLACEHOLDER_GOOGLE_CLIENT_WEB

# EAS / project metadata (optional)
EXPO_PUBLIC_EAS_PROJECT_ID=__OPTIONAL__

# Observability (public)
SENTRY_DSN=__OPTIONAL__
POSTHOG_API_KEY=__OPTIONAL__
POSTHOG_HOST=__OPTIONAL__

# UX defaults (examples)
EXPO_PUBLIC_DEFAULT_LOCALE=tr
EXPO_PUBLIC_DATE_FORMAT=iso
```

**Notes (Mobile):**  
- Only variables prefixed with `EXPO_PUBLIC_` are available at runtime. Treat them as **public**.  
- Google Sign-In in Expo **requires a development build** (not Expo Go). Ensure the **scheme** matches the redirect you register in GCP.

---

### 3.3 `apps/admin/.env.local`

```ini
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Optional: Web OAuth (if Admin uses Google login)
# TODO: Replace if implementing admin Google auth
NEXT_PUBLIC_GOOGLE_CLIENT_ID_WEB=PLACEHOLDER_GOOGLE_CLIENT_WEB

# Observability (public)
NEXT_PUBLIC_SENTRY_DSN=__OPTIONAL__
NEXT_PUBLIC_POSTHOG_API_KEY=__OPTIONAL__
NEXT_PUBLIC_POSTHOG_HOST=__OPTIONAL__

# UI/timeout defaults (examples)
NEXT_PUBLIC_APP_NAME=Wellness Admin
NEXT_PUBLIC_API_TIMEOUT_MS=15000
```

---

### 3.4 Secret management & profiles

- **Do not commit** `.env.local`. Commit a safe **`.env.example`** with placeholders.  
- In **CI/prod**, inject secrets from your manager into the process environment.  
- Suggested layering:
  - local dev: `.env.local`  
  - test: `.env.test.local` (or a separate test docker/CI database)  
  - production: no files committed – use secret manager or platform env.

---

### 3.5 Validation & boot checks

- On API start, validate env (types, presence, formats like URLs/emails/ints/booleans).  
- Normalize booleans (`true|false`) and lists (comma-separated).  
- Log a **redacted** config summary (no secrets) showing effective origins, base URLs, and enabled features.  
- Refuse to start if essential vars (DB/Redis/JWT/SMTP/AI provider when required) are missing.
- Include a validation script (see §46) to check environment readiness.

---

### 3.6 Rotation & audit

- Rotate JWT/SMTP/S3/OAuth credentials periodically; keep **key IDs** and **created-at** metadata in your secret manager.  
- Version your `.env.example` and maintain a brief **CHANGELOG** for env changes so contributors know what to add.

---

## 4) Data Model (Prisma)

> Keep types in `packages/types` and generate zod schemas. Apply RLS on sensitive tables.

**User** `(id, email, createdAt, status)`

**Profile** `(userId FK, displayName, birthYear, heightCm, weightKg, country, timezone, preferencesJson)`

**OAuthAccount** `(id, userId FK, provider ENUM["google"], providerUserId, email, createdAt, updatedAt, rawJson)`

**HealthMetric** `(id, userId, kind ENUM["BMI","BMR","WATER","CUSTOM"], valueJson, measuredAt)`

**PeriodCycle** `(id, userId, startDate, endDate?, symptomsJson, notes)`

**Pregnancy** `(id, userId, lmpDate?, dueDate?, doctorNotes, weekCache)`

**WaterLog** `(id, userId, amountMl, loggedAt)`

**Reminder** `(id, userId, type ENUM["DAILY","WEEKLY","MONTHLY","CUSTOM"], payloadJson, nextRunAt, active)`

**Conversation** `(id, userId, title, createdAt, archivedAt?)`

**Message** `(id, conversationId, role ENUM["user","assistant","tool"], content, tokens, createdAt)`

**Memory** `(id, userId, scope ENUM["global","conversation"], key, valueJson, updatedAt)`

**Subscription** `(userId, plan ENUM["free","premium"], renewsAt, status)`

**UsageQuota** `(userId, monthKey, aiRequests, limit, resetsAt)`

**ModelPolicy** `(id, plan ENUM["free","premium"], provider ENUM["openai","anthropic","google"], modelName, temperature, maxTokens, toolsEnabledJson, updatedAt)`

**AuditLog** `(id, userId?, action, entity, entityId, metadataJson, createdAt)`

**FeatureFlag** `(key, valueJson)`

### 4.1 Period Symptoms JSON Schema (used in `PeriodCycle.symptomsJson`)

```ts
// packages/types/period.ts
export interface PeriodSymptoms {
  flow: 'light' | 'moderate' | 'heavy';
  cramps: 0 | 1 | 2 | 3 | 4 | 5; // severity scale
  mood: string[];                // e.g. ['irritable','sad','anxious','happy']
  physical: string[];            // e.g. ['headache','backache','bloating','fatigue']
  notes?: string;
}
```

### 4.2 Complete Prisma Schema

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String?
  status    UserStatus @default(ACTIVE)
  createdAt DateTime   @default(now())
  
  profile       Profile?
  oauthAccounts OAuthAccount[]
  // ... other relations
  
  @@index([email])
}

// ... rest of models with relations
```

---

## 5) Core Features & Requirements

### 5.1 Calculators (local, offline‑capable)

- **BMI**: `kg / (m^2)`; persist to `HealthMetric`.
- **BMR/TDEE**: **Mifflin‑St Jeor** implemented; TDEE via activity multiplier; store inputs/outputs (see §40.6).
- **Water Need**: **30 ml/kg baseline** with activity/climate modifiers; daily target; logs via `WaterLog` (see §40.5).
- **Pregnancy**: due date (Naegele's rule; LMP + 280 days), week counter; **complete week‑by‑week milestones** (see §40.4).
- **Period Prediction**: moving average/simple cycle model initially (MVP); store cycles; calendar heatmap.

### 5.2 Calendars & Tracking

- **Period Calendar**: month view with predicted fertile/menstruation windows; editable; symptom notes.
- **Pregnancy Timeline**: week‑by‑week milestones; reminder hooks.
- **Water & Metrics**: daily logging UX; streaks & gentle nudges.

### 5.3 Reminders & Notifications

- **Local schedules** via `expo-notifications` for predictable reminders (water, logs).
- **Server‑scheduled** pushes for dynamic or AI‑based nudges (BullMQ). Respect quiet hours & timezone.
- User‑configurable **daily/weekly/monthly** cadence. Toggle per reminder. Snooze & dismiss.

### 5.4 AI Companion (Mascot)

- **Mascot Button**: centered in bottom tab; opens full‑screen chat.
- **Persistent Conversations**: resume where user left off; user can delete chats or **"Forget everything"** (wipe `Memory` and messages).
- **Model Selection**: **Not visible to users.** Server chooses provider/model by membership plan via **ModelPolicy**.
- **Memory Strategy**: opt‑in **global profile memory** + **conversation memory**. Summarize long threads. Store key facts (hydration goal, cycle length, preferences). Always request consent before storing new personal facts.
- **Server Tools**: `get_user_metrics`, `log_water(amount)`, `get_next_period_prediction`, `create_reminder(payload)`, `get_quota()`
- **Streaming**: mobile renders SSE token‑by‑token with typing indicator; **Stop** cancels response.
- **Safety & Tone**: empathetic, non‑judgmental. No medical diagnosis. Provide disclaimers and encourage professional care when needed.

### 5.5 3D/Rive Splash

- On cold app launch show a **Rive** animation (≤2–3s) of the mascot; skip on warm resumes.
- File stored in storage and bundled fallback.

### 5.6 Membership & Quotas

- **Free**: configurable (default: 100 AI messages/month). Friendly upsell when limit hit.
- **Premium**: higher limits + priority queueing.
- **Server enforcement** via `UsageQuota` and Redis counters. Monthly reset job.

---

## 6) Mobile App (Expo) – Implementation Plan

### 6.1 Libraries

`expo`, `react-native`, `react-navigation`, `@tanstack/react-query`, `zustand`, `expo-notifications`, `expo-secure-store`, `expo-sqlite`, `zod`, `@shopify/flash-list`, `@gorhom/bottom-sheet`, `react-native-markdown-display`.

### 6.2 Screens & Components

- **Auth**: Sign In, Sign Up, Forgot Password. **Add "Continue with Google"** button on Sign In and Sign Up. On tap, use Expo AuthSession Google provider → get `id_token` → `POST /auth/google` to exchange for app JWT.
- **Home**: cards for Water, Cycle, Pregnancy, Metrics; quick‑add buttons.
- **Calendar**: period/pregnancy views, edit entries.
- **Metrics**: BMI/BMR/TDEE calculators with history.
- **Reminders**: list, create/edit schedules.
- **Chat**: clean chat page – mascot, message list (stream), input field, **Stop**, copy, markdown rendering, clear/forget controls. **No model selector.**
- **Settings**: profile, privacy, notifications, export/delete data, theme.

**Reusable**: `Card`, `StatRow`, `ReminderForm`, `UsagePill`, `TypingDots`, `EmptyState`, `ErrorBanner`, **`GoogleButton`**.

### 6.3 State & Offline

- React Query for server cache; invalidate on writes.
- Zustand for UI/app state. SQLite for critical offline entities (recent messages, queued logs).
- Background sync task to flush local writes when online.

### 6.4 Notifications

- Request permissions on first need; store preferences.
- Local schedules for water; server pushes for AI nudges.
- Handle taps (deep‑link to relevant screen).

---

## 7) API Server (NestJS) – Implementation Plan

### 7.1 Modules

`AuthModule`, `UsersModule`, `ProfilesModule`, `MetricsModule`, `CyclesModule`, `PregnancyModule`, `WaterModule`, `RemindersModule` (BullMQ), `ChatModule` (LLM broker, SSE streaming), `MemoryModule` (global & conversation scope), `QuotaModule` (limits, resets), `AdminModule` (Refine bindings).

### 7.2 Routes (REST + SSE)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/google                      # exchange Google ID token for app JWT
GET    /me
GET    /metrics
POST   /metrics/bmi
POST   /metrics/bmr
GET    /cycles
POST   /cycles
GET    /pregnancy
POST   /pregnancy
GET    /water
POST   /water
GET    /reminders
POST   /reminders
PATCH  /reminders/:id
DELETE /reminders/:id
GET    /quota
POST   /chat/:conversationId/message           # { content }
GET    /chat/:conversationId/stream            # SSE stream of assistant reply
POST   /chat/:conversationId/forget            # wipe conversation + memory
POST   /memory/forget_all                      # GDPR/KVKK full purge
GET    /healthz                                # See §13 for structure
GET    /api/docs                               # Swagger UI (see §7.5)
```

### 7.3 AI Broker (Vercel AI SDK)
- Providers: OpenAI, Anthropic, Google. **Routing by plan** using `ModelPolicy` (e.g., free → gpt‑4o‑mini or equivalent; premium → gpt‑4.1 / claude‑3.5‑sonnet). Temperature, maxTokens, and tool permissions are also policy‑driven.
- System prompt (empathetic wellness companion), tool/function calls to access server tools.
- Streaming via `StreamingTextResponse` → SSE.
- Safety: no diagnosis; provide resources; respect user limits.

### 7.4 Reminders Engine

- Jobs in BullMQ; compute next run; enqueue Expo push.
- Persist push receipts; retry with backoff.

### 7.5 Quotas & Rate Limiting

- **Quota**: Middleware checks `UsageQuota`; increment on assistant replies; block over limit.
- **Monthly reset job** clears counters.
- **Rate limiting (NestJS Throttler)**:
  - Public routes: **60 rpm**/IP
  - Auth routes: **30 rpm**/IP (ignore known bots)
  - Chat send: **6 rpm**/user
  
  ```ts
  // apps/api/src/app.module.ts
  import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
  @Module({
    imports: [
      ThrottlerModule.forRoot([
        { ttl: 60_000, limit: 60 },                         // public
        { ttl: 60_000, limit: 30, ignoreUserAgents: [/googlebot/i] }, // auth
      ]),
    ],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
  })
  export class AppModule {}
  ```

  ```ts
  // apps/api/src/chat/chat.controller.ts
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 6 } })
  async sendMessage() { /* ... */ }
  ```

### 7.6 Database & Redis Resilience

- **Prisma datasource** (production hardening):
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    // Production tuning:
    // connection_limit = 10
    // connect_timeout = 10
  }
  ```
- **Redis client options** (retry/backoff, partial tolerance):
  ```ts
  // apps/api/src/redis.ts
  export const redisOptions = {
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    reconnectOnError: (err: Error) => err.message.includes('READONLY'),
    maxRetriesPerRequest: 3,
  };
  ```

### 7.5 (bis) API Documentation (Swagger/OpenAPI)

```ts
// apps/api/src/main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const config = new DocumentBuilder()
  .setTitle('Wellness API')
  .setDescription("Women's Wellness Companion API")
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

---

## 8) Admin Panel (Refine)

- CRUD: Users, Profiles, Conversations, Reminders, FeatureFlags, Quotas.
- **ModelPolicy management**: plan → provider/model/temperature/maxTokens/tools; live changes apply to new responses.
- Plan/quota settings (free/premium limits).
- AuditLogs read‑only; CSV export.
- Impersonation disabled by default; feature flag gated.

---

## 9) Security & Privacy (Türkiye compliance reflected)

- **KVKK (Law No. 6698) alignment**: privacy notice, explicit consent flows where required, in‑app channel for data subject requests (Article 11 rights).
- **Cross‑border transfer (Art. 9)**: if needed—adequacy decision / appropriate safeguards or explicit consent; logged and auditable. Default: TR‑hosted storage where feasible.
- **Retention & Destruction**: publish a **Personal Data Retention & Destruction Policy**; store only as long as necessary; upon expiry, securely delete, destroy, or anonymize (per the 2017 Regulation). Automated cleanup jobs and audit logs.
- **Security**: TLS; rotating secrets; zero‑PII logging; at‑rest encryption (libsodium) for selected fields; MFA recommended; regular patching and vulnerability scans; defined breach notification procedures.
- **RLS & Authorization**: multi‑tenant isolation; least privilege; access controls; audit logs.
- **On‑device privacy**: store only permitted data; encrypt local caches (SecureStore/Keychain). Clearable message cache and memory.
- **Right to be forgotten**: "Forget everything" fully purges memory and messages; export (JSON) available.

---

## 10) UX & Content

- **Language**: Turkish UI and Turkish AI by default; English coming next (i18n keys ready).
- **Personal Space & Emotional Support**: the app provides a safe, private space for women to share personal topics (health, emotions, sexuality). The AI friend checks in gently (e.g., "How was your day?"), listens without judgment, and supports well‑being.
- **Personalization**: contextual prompts based on cycle, pregnancy week, hydration target, etc. Reminders respect timezone and quiet hours.
- **Tone**: supportive, friendly, inclusive. No clinical diagnoses; encourage professional care when appropriate.
- **Accessibility**: dynamic type, VoiceOver/TalkBack, high contrast, large touch targets.

---

## 11) Project Setup & Scripts (macOS, no Docker)

- **IDE**: Visual Studio Code. Recommended extensions: ESLint, Prettier, Prisma, Jest, REST Client/Thunder Client, React Native Tools.
- **Workspace**: Turborepo with PNPM.
- **Local services via Homebrew**.

### 11.1 macOS Prerequisites (Homebrew)

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Toolchain
brew install node@20 pnpm git watchman

# Datastores & queue
brew install postgresql@16 redis

# SMTP catcher (choose one)
brew install mailpit   # UI :8025, SMTP :1025
# OR: brew install mailhog

# Optional S3-compatible storage
brew install minio/stable/minio minio/stable/mc

# Optional Detox testing (can be added later)
brew tap wix/brew && brew install applesimutils
```

### 11.2 Start Services

```bash
# Postgres
brew services start postgresql@16
createdb wellness || true

# Redis
brew services start redis

# SMTP
brew services start mailpit   # http://localhost:8025

# (Optional) MinIO
# export MINIO_ROOT_USER=__SET__; export MINIO_ROOT_PASSWORD=__SET__
# minio server ~/minio-data --console-address :9001 &

# Google OAuth Setup (manual steps required)
# 1) Create OAuth 2.0 Client IDs in Google Cloud Console for iOS, Android, and (optional) Web.
# 2) Add iOS reversed client id to Info.plist via Expo config; add Android SHA-1 to credentials.
# 3) Put the client IDs into apps/mobile/.env.local and API .env.local as shown above.
# 4) On mobile: use Expo AuthSession Google provider to get id_token.
# 5) On server: verify id_token (audience ∈ GOOGLE_OAUTH_AUDIENCES) and either link to existing User or create a new one + OAuthAccount row, then issue app JWTs.
```

### 11.3 Initial Project Setup Commands

```bash
# Create project structure
mkdir -p wellness && cd wellness
pnpm init
pnpm add -D turbo

# Initialize monorepo
pnpm dlx create-turbo@latest . --example basic

# Create app directories
mkdir -p apps/{mobile,api,admin}
mkdir -p packages/{types,ui,config,i18n}

# Initialize Expo app
cd apps/mobile && pnpm dlx create-expo-app . --template blank-typescript
cd ../..

# Initialize NestJS API
cd apps/api && pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git
cd ../..

# Initialize Admin (Refine)
cd apps/admin && pnpm dlx create-refine-app . --template nextjs
cd ../..

# Copy environment templates
cp apps/api/.env.example apps/api/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# Install dependencies
pnpm i

# Run validation
pnpm validate:env
```

### 11.4 Development Workflow

```bash
# 1. Start services
brew services start postgresql@16 redis mailpit

# 2. Validate environment
pnpm validate:env

# 3. Run migrations
pnpm db:prep

# 4. Seed database
pnpm db:seed

# 5. Start development servers (in separate terminals)
pnpm dev:api     # Terminal 1: API on :4000
pnpm dev:mobile  # Terminal 2: Expo
pnpm dev:admin   # Terminal 3: Admin on :3000

# 6. Run tests
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests (requires applesimutils)
```

### 11.5 Repo Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:api": "turbo run dev --filter=api",
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev:admin": "turbo run dev --filter=admin",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "lint": "turbo run lint",
    "db:prep": "cd apps/api && pnpm prisma migrate dev",
    "db:seed": "cd apps/api && pnpm prisma db seed",
    "db:studio": "cd apps/api && pnpm prisma studio",
    "validate:env": "node scripts/validate-env.js",
    "setup:dev": "bash scripts/dev-setup.sh"
  }
}
```

**Notes**

- Fill `.env.local` files before starting services.
- With `STORAGE_DRIVER=filesystem` you do **not** need MinIO in development. Assets are stored under `apps/api/var/files` (gitignored).
- Xcode required for iOS; Android Studio + SDK for Android.


// turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

---

## 12) Testing Strategy

- Unit tests for calculators and reducers.
- API integration tests (Vitest + Supertest).
- Detox E2E: auth, logging water, creating reminder, AI chat happy path, quota edge cases, **period tracking across month boundary**, **offline water logging with sync**, **push delivery respects quiet hours/timezone**, **data export KVKK compliance**, **AI chat with quota exhaustion**.
- Load test `/chat/*` with streaming and backpressure.

---

## 13) Observability & Health

- Structured logs (pino) without PII.
- Health checks `/healthz` with enriched payload:
  ```ts
  interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      database: { connected: boolean; latency: number };
      redis: { connected: boolean; memory: number };
      storage: { accessible: boolean; space: number };
      ai: { provider: string; available: boolean };
    };
    version: string;
    uptime: number;
  }
  ```
- SLOs: chat latency p95 < 2.5s to first token; push success > 98%.

---

## 14) MVP Scope (must ship)

- Auth, Profile
- BMI & Water need calculators + persistence
- Period calendar (manual logs + simple prediction)
- Reminders (local + server push)
- AI chat with memory (global + conversation), server‑side provider selection, streaming, quotas
- Rive mascot splash

**Post‑MVP**: **complete pregnancy timeline** (now specified in §40.4), **TDEE**, symptom analytics, multilingual (EN), wearables, richer insights, community features.

---

## 15) Acceptance Criteria (sample)

- Creating a reminder schedules a local or server push at the correct local time and is delivered within ±2 minutes.
- AI chat streams tokens and stops immediately on user cancel; conversation resumes after app relaunch.
- "Forget everything" removes memory rows and messages within the user's scope.
- Free plan is blocked exactly at quota limit with clear UI.

---

## 16) API Contracts (DTOs – examples)

```ts
// POST /metrics/bmi
{ heightCm: number; weightKg: number; measuredAt?: string }
→ { bmi: number; category: "underweight"|"normal"|"overweight"|"obese"; metricId: string }

// POST /chat/:conversationId/message
{ content: string }
→ { messageId: string }

// GET /chat/:conversationId/stream (SSE)
// events: token, done, error

// POST /memory/forget_all
{} → { status: "ok" }
```

---

## 17) AI System Prompt (server)

> Sen "NOVA"sın, bu uygulamanın maskotu ve güvenilir bir arkadaş ve asistansın. Empatik, yargılamayan ve kapsayıcısın. Kullanıcının izin verdiği verilere (regl döngüsü, su tüketimi, hatırlatıcılar, hamilelik haftası) araçlar aracılığıyla erişebilirsin. Tıp uzmanı değilsin; asla teşhis koyma; tıbbi endişeler için profesyonel yardım almayı teşvik et. Hafızaya dayalı önerileri kişiselleştir (yaklaşan regl, hamilelik haftası, hidrasyon hedefi gibi). Hafızaya yeni kişisel bilgiler kaydetmeden önce her zaman izin iste. Türkçe konuş. Kullanıcı rahatlamak isterse, "Günün nasıl geçti?" gibi nazik sorularla aktif dinleme yap.

---

## 18) Feature Flags (examples)

- `ai.google.enabled` (default false)
- `reminders.server_push` (default true)
- `admin.impersonation` (default false)

---

## 19) Open Questions (filled before coding)

1. **Localization**: Launch in **Turkish**. **English** will be added next. i18n scaffolding ready; all copy uses keys.
2. **Pricing & Plans**: Implement the plan table in **§21 Pricing & Plans** (free/premium, quotas, AI prioritization).
3. **Mascot**: Visual identity and Rive animation will be provided as a **separate file**.
4. **Backups & Reliability (best‑practice)**: Postgres **WAL‑based backups** + hourly snapshots; Redis AOF + cold‑start tolerance; encrypted S3/MinIO snapshots; for local dev, daily `pg_dump` and restore drills (quarterly).
5. **OS Support**: Do **not** enforce minimum OS versions; optimize for the latest iOS/Android; apply graceful degradation on older versions.
6. **Legal (Türkiye)**: KVKK 6698 compliance; in‑app Article 11 rights handling; cross‑border transfer mechanisms (Art. 9) if needed; publish a Retention & Destruction Policy; follow 2023 mobile app privacy recommendations (MFA, encryption, regular updates).

---

## 20) Deliverables Checklist for the Agent
- [ ] Monorepo (Turborepo) initialized with apps and packages.
- [ ] macOS (no Docker) setup docs + `scripts/dev-setup.sh` and `scripts/validate-env.js`.
- [ ] Prisma schema + migrations + seed (admin user, plans, ModelPolicy rows).
- [ ] NestJS modules/routes, SSE streaming endpoint, AI broker with `ModelSelector`.
- [ ] StorageDriver abstraction with **filesystem** default; MinIO/S3 pluggable.
- [ ] Expo app with navigation, screens, chat UI (streaming), notifications wired.
- [ ] Google Sign‑In implemented (mobile hook + `/auth/google`).
- [ ] Quota enforcement + monthly reset job.
- [ ] Rive splash wired with placeholder and skip on warm start.
- [ ] Tests (unit + e2e) and CI workflow.
- [ ] `.env.example` templates with all required variables documented.

---

## 21) Pricing & Plans

> **Goal**: Simple, scalable tiers; AI prioritization and quota differences.

| Plan        | Monthly AI Message Quota | Priority | Reminders                             | Storage | Default ModelPolicy                                                                |
| ----------- | ------------------------ | -------- | ------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| **Free**    | 100                      | Standard | Unlimited local + limited server push | 1 GB    | `openai:gpt-4o-mini` (or equivalent), `maxTokens:1024`, limited tools              |
| **Premium** | 1000                     | High     | Unlimited + priority push             | 10 GB   | `anthropic:claude-3.5-sonnet` **or** `openai:gpt-4.1`, `maxTokens:4096`, all tools |

**Notes**

- All numbers are editable in Admin. On overage, display a gentle warning and offer upgrade.
- ModelPolicy is centrally managed; never shown in the client.

---

## 22) Detailed Authentication Flows (Google & Email)

### 22.1 Google Sign‑In (Mobile → Server → JWT)

1. **Mobile** (Expo AuthSession Google): obtain **ID token**.
2. **POST** `/auth/google` with `{ idToken }`.
3. **Server** verifies token audience (`GOOGLE_OAUTH_AUDIENCES`) using `google-auth-library` and fetches profile (sub, email, email\_verified).
4. **Linking logic**:
   - If `email_verified` and a **User** exists with same email → attach/update **OAuthAccount**.
   - Else create new **User** (+ **OAuthAccount**), generate **Profile** skeleton.
5. Issue app **JWT access/refresh**; set http‑only refresh cookie (mobile uses secure storage for access token).
6. Return `{ accessToken, refreshToken, user }`.

**Redirect URIs**: use Expo AuthSession scheme. Configure **reversed client ID** for iOS, **SHA‑1** for Android; add to Google Cloud Console.

**Expo Go Limitation**: Google Sign‑In requires a **development build** (see §26) – not supported in Expo Go.

### 22.2 Email/Password Flow

- `POST /auth/register` → create user (email verification optional in dev via Mailpit).
- `POST /auth/login` → issue JWTs.
- `POST /auth/refresh` → rotate tokens; revoke on logout.

---

## 23) Offline Sync Strategy

- **Queueing**: a local **outbox** table in SQLite (e.g., `pending_ops(id, type, payloadJson, createdAt, conflict_resolution)`) collects mutations when offline.
- **Conflict Resolution**: **last‑write‑wins** for simple metrics/logs; **server authoritative** for conversations/memory. Include `updatedAt` versioning; reject with `409` and return canonical record.
- **Background Sync**: periodic task (AppState + `setInterval`) flushes outbox when `online && authenticated`.
- **Network Awareness**: listen to NetInfo; disable network‑only actions when offline and surface non‑blocking banners.
- **SQLite Cache**: cache **recent messages**, **water logs**, **reminders**; invalidate via version stamps from ETags.

---

## 24) SSE Streaming Implementation

### 24.1 Server (NestJS)
- SSE endpoint `/chat/:conversationId/stream` returns **text/event-stream**.
- Use Vercel AI SDK `StreamingTextResponse` and emit chunks as:
  ```text
  event: token
  data: <chunk>

  event: done
  data: {}

  ```
- Support **server‑side abort** via `AbortController` (cancel on client **Stop**).

### 24.2 Mobile Client
- Use `EventSource` polyfill (or fetch loop) to read tokens.
- **Buffering & Flush** (explicit constants):
  ```ts
  export const STREAM_BUFFER_SIZE = 512;       // characters
  export const STREAM_FLUSH_INTERVAL = 50;     // ms
  export const MAX_BUFFER_WAIT = 200;          // ms before forced flush
  ```
- **Reconnection**: exponential backoff (max 15s) on network error; resume by replaying last N tokens from buffer.
- **Cancellation**: pressing **Stop** calls `AbortController` on the in‑flight fetch.

---

## 25) StorageDriver Interface

Create `packages/types/storage.ts`:

```ts
export interface StorageDriver {
  upload(file: Buffer, key: string, contentType?: string): Promise<string>; // returns canonical key
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string, opts?: { public?: boolean; expiresInSeconds?: number }): string;
}
```

Provide implementations: `FilesystemStorageDriver` (dev default), `MinioStorageDriver`, `S3StorageDriver`.

---

## 26) Expo Development Build Setup (EAS)

- **Bundle IDs**: set iOS `bundleIdentifier`, Android `applicationId` in `app.config.ts`.
- **Credentials**: use EAS CLI to configure (dev profiles). For Google Sign‑In, register **iOS reversed client ID** and Android **SHA‑1**.
- **Build**: `eas build --profile development --platform ios|android`.
- **Install**: use QR or `eas build:install` on device/simulator.
- **Run**: `expo start --dev-client` to launch the dev client with AuthSession working.

---

## 27) Push Notification Setup

- **Apple**: Apple Developer account; enable Push, create keys/certs; connect via EAS credentials.
- **Android (FCM)**: create Firebase project; add Android app; download `google-services.json`; connect to EAS/Expo.
- **Expo Push Flow**: register for permissions → obtain Expo push token → send to API → server enqueues pushes via BullMQ and tracks receipts.

---

## 28) AI Memory Management

- **Summarization Triggers**: on conversation token count > N or message count > M, summarize last K messages into a concise memory note.
- **Pruning**: cap **conversation memory** to X entries, prune by **age** and **relevance score**.
- **Retrieval**: select memory items by tags (hydration, cycle, pregnancy) and recency; include in system context.
- **Privacy Filter**: never persist sensitive facts without explicit user consent; allow **Forget everything** to purge.

---

## 29) Model Policy Enforcement

Provide a selector class:

```ts
export class ModelSelector {
  async selectModel(userPlan: 'free'|'premium'): Promise<ModelConfig> { /* read ModelPolicy by plan */ }
  async applyPolicy(policy: ModelPolicy, req: ChatRequest): Promise<ProcessedRequest> {
    // enforce temperature, maxTokens, tools; strip disallowed tools
    return { ...req, model: policy.modelName, temperature: policy.temperature, maxTokens: policy.maxTokens };
  }
}
```

Apply before each chat completion; log policy version in **AuditLog**.

---

## 30) Quota Management

- **Counters**: Redis key `quota:{userId}:{month}` increments on **assistant message sent**.
- **Middleware**: block when `usage >= limit` with a friendly error; include remaining quota in headers.
- **Reset Job**: monthly BullMQ job resets rows in `UsageQuota` and clears Redis counters.
- **Grace**: optional 5% grace; configurable via FeatureFlag.

---

## 31) Error Handling Patterns

- **Mobile**: global error boundary; toasts/banners; retry with backoff for network; offline fallbacks; empty‑state components.
- **Server**: NestJS exception filters; structured error payload `{ code, message, details }` (localized on client).
- **i18n Errors**: add Turkish keys now; English later (placeholders allowed).

---


## 31.1) Standardized Error Codes

```ts
export enum ErrorCode {
  // Auth errors (1xxx)
  AUTH_INVALID_CREDENTIALS = 1001,
  AUTH_TOKEN_EXPIRED = 1002,
  AUTH_UNAUTHORIZED = 1003,
  
  // Validation errors (2xxx)
  VALIDATION_FAILED = 2001,
  INVALID_INPUT = 2002,
  
  // Business logic errors (3xxx)
  QUOTA_EXCEEDED = 3001,
  SUBSCRIPTION_EXPIRED = 3002,
  
  // System errors (5xxx)
  INTERNAL_ERROR = 5000,
  DATABASE_ERROR = 5001,
  AI_PROVIDER_ERROR = 5002,
}
```


## 32) Testing Data & Fixtures

- **Seed**: admin user, one free + one premium user; sample cycles, water logs; default ModelPolicy rows.
- **Mocks**: mock AI responses for deterministic tests; push receipts; Google token verification.
- **E2E**: Detox flows for auth (email + Google), water log, reminder, chat stream, quota limit.

---


```ts
// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@wellness.local',
      password: await hash('admin123', 10),
      profile: {
        create: {
          displayName: 'Admin User',
          timezone: 'Europe/Istanbul'
        }
      }
    }
  });

  // Create model policies
  await prisma.modelPolicy.createMany({
    data: [
      {
        plan: 'free',
        provider: 'openai',
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1024
      },
      {
        plan: 'premium',
        provider: 'anthropic',
        modelName: 'claude-3.5-sonnet',
        temperature: 0.8,
        maxTokens: 4096
      }
    ]
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```


## 33) Security Details

- **Field Encryption** (libsodium): `Profile.preferencesJson`, `Pregnancy.doctorNotes`, `PeriodCycle.symptomsJson`, sensitive `Memory.valueJson`.
- **Rate Limiting**: public routes 60 rpm/IP; auth routes 30 rpm/IP; chat send 6 rpm/user with burst. (**Implemented via NestJS Throttler**, see §7.5)
- **CORS**: restrict to mobile schemes and admin origin; preflight cached.
- **API Key Rotation**: store provider keys as env; support hot reload; rotate quarterly or on incident.

---

## 34) Database Indexing

Add Prisma indexes:

```prisma
@@index([userId, createdAt], map: "idx_user_createdAt") // on tables: HealthMetric, Reminder, Conversation
@@index([userId, monthKey], map: "idx_quota_user_month") // on UsageQuota
@@index([conversationId, createdAt], map: "idx_msg_conv_createdAt") // on Message
```

---

## 35) Monitoring & Observability

- **Sentry**: init in mobile and API; tag user plan; scrub PII.
- **Metrics**: counters for messages sent, reminders delivered; histograms for TTFB (SSE), queue latency.
- **Alerts**: push failure rate > 5% (5m), chat TTFB p95 > 3s (15m), API 5xx > 1% (5m).

---

## 36) Turkish Localization Resources
- Create `packages/i18n/tr.json` with the following starter content (extend as you build features):
```json
{
  "auth": {
    "signIn": "Giriş Yap",
    "signUp": "Kayıt Ol",
    "email": "E-posta",
    "password": "Şifre",
    "forgotPassword": "Şifremi Unuttum",
    "continueWithGoogle": "Google ile Devam Et",
    "emailRequired": "E-posta adresi gerekli",
    "passwordMinLength": "Şifre en az 8 karakter olmalı"
  },
  "home": {
    "welcome": "Hoş Geldiniz",
    "todayWater": "Bugünkü Su Tüketimi",
    "nextPeriod": "Sonraki Regl",
    "pregnancyWeek": "Hamilelik Haftası"
  },
  "chat": {
    "typeMessage": "Mesajınızı yazın...",
    "stop": "Durdur",
    "clearChat": "Sohbeti Temizle",
    "forgetEverything": "Her Şeyi Unut",
    "quotaExceeded": "Aylık mesaj limitinize ulaştınız"
  },
  "calculators": {
    "bmi": {
      "title": "Vücut Kitle İndeksi",
      "underweight": "Zayıf",
      "normal": "Normal",
      "overweight": "Fazla Kilolu",
      "obese": "Obez"
    }
  },
  "errors": {
    "networkError": "Bağlantı hatası",
    "serverError": "Sunucu hatası",
    "unauthorized": "Yetkisiz erişim"
  }
}
```
- Date/time formatting via `dayjs` locale `tr`; relative time plugin for "x dakika önce".
- Medical terminology vetted for menstrual/pregnancy contexts; avoid diagnostic language.

---

## 37) Rive Animation Asset

- Placeholder asset `assets/rive/mascot_placeholder.riv` used in dev if real file missing.
- Splash duration ≤ 3s; skippable on warm start; feature‑flag to disable for tests.

---

## 38) Recommended Files & Scripts
- `docs/google-oauth-flow.md`
- `docs/offline-sync-strategy.md`
- `docs/troubleshooting.md` (see §44 for starter content)
- `packages/types/storage.ts`
- `packages/i18n/tr.json`
- `scripts/dev-setup.sh` (Homebrew install + services + env templates)
- `scripts/validate-env.js` (preflight checks for tools/services/env files)
- *(Optional)* `docker-compose.yml` as an alternative to Homebrew for contributors who prefer containers (not required for you).

---

## 39) Appendices – Minimal Code Skeletons (Copy‑paste starters)
> These are intentionally thin; fill TODOs and adapt naming. All TypeScript.

### 39.1 NestJS – Google OAuth Controller & Service
```ts
// apps/api/src/auth/google.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthService } from './google.service';

export class GoogleAuthDto { idToken!: string }

@Controller('auth')
export class GoogleAuthController {
  constructor(private readonly google: GoogleAuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: GoogleAuthDto) {
    const { accessToken, refreshToken, user } = await this.google.exchangeIdToken(dto.idToken);
    return { accessToken, refreshToken, user };
  }
}
```
```ts
// apps/api/src/auth/google.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './jwt.service';

@Injectable()
export class GoogleAuthService {
  private client = new OAuth2Client();
  private audiences = (process.env.GOOGLE_OAUTH_AUDIENCES ?? '').split(',').map(s => s.trim()).filter(Boolean);

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async verify(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({ idToken, audience: this.audiences });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) throw new UnauthorizedException('Invalid Google token');
    if (payload.email_verified === false) throw new UnauthorizedException('Email not verified');
    return payload;
  }

  async exchangeIdToken(idToken: string) {
    const p = await this.verify(idToken);
    // Link or create user
    let user = await this.prisma.user.findUnique({ where: { email: p.email! } });
    if (!user) {
      user = await this.prisma.user.create({ data: { email: p.email! } });
      await this.prisma.profile.create({ data: { userId: user.id, displayName: p.name ?? '' } });
    }
    await this.prisma.oAuthAccount.upsert({
      where: { provider_providerUserId: { provider: 'google', providerUserId: p.sub! } },
      update: { email: p.email!, rawJson: p as any },
      create: { userId: user.id, provider: 'google', providerUserId: p.sub!, email: p.email!, rawJson: p as any },
    });

    const accessToken = await this.jwt.issueAccess(user);
    const refreshToken = await this.jwt.issueRefresh(user);
    return { accessToken, refreshToken, user };
  }
}
```

### 39.2 NestJS – SSE Chat Controller
```ts
// apps/api/src/chat/chat.controller.ts
import { Controller, Get, Param, Sse, Req, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Sse(':conversationId/stream')
  stream(@Param('conversationId') id: string, @Req() req): Observable<MessageEvent> {
    const abort = new AbortController();
    req.on('close', () => abort.abort());
    return this.chat.stream(id, { signal: abort.signal }).pipe(
      map(token => ({ data: token } as MessageEvent))
    );
  }
}
```
```ts
// apps/api/src/chat/chat.service.ts (sketch using Vercel AI SDK)
import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { streamText } from 'ai';

@Injectable()
export class ChatService {
  stream(conversationId: string, opts: { signal: AbortSignal }): Observable<string> {
    const iterator = (async function* () {
      // TODO: Use ModelSelector to get appropriate model based on user plan
      const result = await streamText({ model: 'gpt-4o-mini', prompt: '...', signal: opts.signal });
      for await (const part of result.stream) {
        if (typeof part === 'string') yield part;
      }
    })();
    return from(iterator);
  }
}
```

### 39.3 StorageDriver – Filesystem Implementation (dev default)
```ts
// packages/types/storage.ts
export interface StorageDriver {
  upload(file: Buffer, key: string, contentType?: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string, opts?: { public?: boolean; expiresInSeconds?: number }): string;
}
```
```ts
// apps/api/src/storage/filesystem.driver.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import type { StorageDriver } from '@pkg/types/storage';

export class FilesystemStorageDriver implements StorageDriver {
  root = process.env.FILES_BASE_PATH ?? path.resolve(process.cwd(), 'var/files');

  private full(key: string) { return path.join(this.root, key); }

  async upload(file: Buffer, key: string): Promise<string> {
    const fp = this.full(key);
    await fs.mkdir(path.dirname(fp), { recursive: true });
    await fs.writeFile(fp, file);
    return key;
  }
  async download(key: string): Promise<Buffer> { return fs.readFile(this.full(key)); }
  async delete(key: string): Promise<void> { await fs.rm(this.full(key), { force: true }); }
  getUrl(key: string): string { return `/files/${encodeURIComponent(key)}`; } // mount static in NestJS
}
```

### 39.4 Expo – Google Sign‑In Hook (AuthSession)
```ts
// apps/mobile/src/hooks/useGoogleSignIn.ts
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const redirectUri = makeRedirectUri({ useProxy: false });
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID!,
    redirectUri,
    responseType: 'id_token',
    scopes: ['openid', 'email', 'profile'],
  });

  async function signIn() {
    if (!request) return;
    setLoading(true);
    try {
      const res = await promptAsync();
      const idToken = (res as any)?.params?.id_token;
      if (idToken) {
        const r = await fetch(`${process.env.API_BASE_URL}/auth/google`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken })
        });
        const json = await r.json();
        // TODO: persist json.accessToken securely, update auth state
        return json;
      }
    } finally { setLoading(false); }
  }

  return { signIn, loading };
}
```

### 39.5 Expo – SSE Client Utility
```ts
// apps/mobile/src/lib/sse.ts
export function streamSSE(url: string, onToken: (t: string) => void, signal?: AbortSignal) {
  const controller = new AbortController();
  const s = signal ?? controller.signal;
  (async () => {
    const res = await fetch(url, { headers: { Accept: 'text/event-stream' }, signal: s });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = chunk.split('\n').find(l => l.startsWith('data: '));
        if (line) onToken(line.slice(6));
      }
    }
  })();
  return () => controller.abort();
}
```

### 39.6 Dev Script – Homebrew Bootstrap
```bash
#!/usr/bin/env bash
# scripts/dev-setup.sh
set -euo pipefail

echo "🚀 Setting up Wellness development environment..."

# Install Homebrew dependencies
echo "📦 Installing dependencies via Homebrew..."
brew install node@20 pnpm git watchman postgresql@16 redis mailpit || true

# Optional: Detox testing tools
if [[ "$1" == "--with-detox" ]]; then
  brew tap wix/brew && brew install applesimutils || true
endif

# Start services
echo "🔌 Starting services..."
brew services start postgresql@16 || true
createdb wellness || true
brew services start redis || true
brew services start mailpit || true

# Create env files from examples
echo "📋 Creating environment files..."
for app in api mobile admin; do
  if [[ -f "apps/$app/.env.example" ]] && [[ ! -f "apps/$app/.env.local" ]]; then
    cp "apps/$app/.env.example" "apps/$app/.env.local"
    echo "✅ Created apps/$app/.env.local"
  fi
done

# Generate JWT secrets
echo "🔐 Generating JWT secrets..."
if [[ -f "apps/api/.env.local" ]]; then
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  sed -i '' "s/__GENERATE_WITH_OPENSSL__/$JWT_SECRET/g" apps/api/.env.local
  sed -i '' "s/__GENERATE_WITH_OPENSSL__/$JWT_REFRESH_SECRET/g" apps/api/.env.local
fi

echo "✨ Setup complete! Next steps:"
echo "1. Fill in placeholder values in .env.local files"
echo "2. Run: pnpm i && pnpm db:prep"
echo "3. Start development: pnpm dev"
```

### 39.7 Dev Script – Environment Preflight Validation
```js
#!/usr/bin/env node
// scripts/validate-env.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

let failures = 0;

function check(name, fn, fix) {
  try {
    fn();
    console.log(`${GREEN}✔${NC} ${name}`);
  } catch (e) {
    console.log(`${RED}✘${NC} ${name}`);
    if (fix) console.log(`  ${YELLOW}→ ${fix}${NC}`);
    failures++;
  }
}

function command(cmd) {
  execSync(cmd, { stdio: 'ignore' });
}

console.log('🔍 Validating development environment...\n');

console.log('== Core Tools ==');
check('Node.js v20.x', () => {
  const version = execSync('node -v').toString().trim();
  if (!version.startsWith('v20.')) throw new Error();
});

check('PNPM installed', () => command('which pnpm'));
check('Git installed', () => command('which git'));
check('Watchman installed', () => command('which watchman'));

console.log('\n== Services ==');
check('PostgreSQL running', () => command('pg_isready -q'));
check('Redis running', () => {
  const result = execSync('redis-cli ping').toString().trim();
  if (result !== 'PONG') throw new Error();
});
check('Mailpit SMTP (1025)', () => command('nc -z 127.0.0.1 1025'));
check('wellness DB exists', () => {
  execSync("psql -lqt | awk '{print $1}' | grep -qw wellness");
});

console.log('\n== Environment Files ==');
const envFiles = [
  'apps/api/.env.local',
  'apps/mobile/.env.local',
  'apps/admin/.env.local'
];

envFiles.forEach(file => {
  check(`${file} exists`, () => {
    if (!fs.existsSync(file)) throw new Error();
  }, `Copy from ${file.replace('.local', '.example')}`);
});

// Check for placeholder values
if (fs.existsSync('apps/api/.env.local')) {
  const apiEnv = fs.readFileSync('apps/api/.env.local', 'utf8');
  
  check('JWT secrets configured', () => {
    if (apiEnv.includes('__GENERATE_WITH_OPENSSL__')) throw new Error();
  }, 'Run: openssl rand -hex 32 (for each secret)');
  
  check('At least one AI provider configured', () => {
    const hasProvider = 
      !apiEnv.includes('sk-PLACEHOLDER_OPENAI_KEY') ||
      !apiEnv.includes('sk-PLACEHOLDER_ANTHROPIC_KEY') ||
      !apiEnv.includes('PLACEHOLDER_GOOGLE_AI_KEY');
    if (!hasProvider) throw new Error();
  }, 'Add at least one AI provider API key');
}

console.log('\n== Optional Tools ==');
check('applesimutils (Detox)', 
  () => command('which applesimutils'),
  'brew tap wix/brew && brew install applesimutils'
);

// Summary
console.log('\n' + '='.repeat(40));
if (failures === 0) {
  console.log(`${GREEN}✅ All checks passed! Ready for development.${NC}`);
  process.exit(0);
} else {
  console.log(`${RED}❌ ${failures} check(s) failed. Review the fixes above.${NC}`);
  process.exit(1);
}
```

---

## 40) Algorithms & Content Specs

### 40.1 Period Prediction (MVP)
```ts
class PeriodPredictor {
  predict(cycles: { startDate: string }[]): { nextStart: Date; fertile: { start: Date; end: Date } } {
    const recent = cycles.slice(-6);
    const lengths = recent.map((c, i) => (i === 0 ? null : (new Date(recent[i].startDate).getTime() - new Date(recent[i-1].startDate).getTime()) / 86400000)).filter(Boolean) as number[];
    const avg = lengths.length ? Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length) : 28;
    const last = new Date(cycles[cycles.length-1].startDate);
    const nextStart = new Date(last.getTime() + avg*86400000);
    const fertileStart = new Date(nextStart.getTime() - 18*86400000);
    const fertileEnd = new Date(nextStart.getTime() - 11*86400000);
    return { nextStart, fertile: { start: fertileStart, end: fertileEnd } };
  }
}
```

### 40.2 Quiet Hours for Push
```ts
interface QuietHours { enabled: boolean; startHour: number; endHour: number; timezone: string }
function shouldSendPush(now: Date, q?: QuietHours): boolean {
  if (!q?.enabled) return true;
  const hour = Number(new Intl.DateTimeFormat('tr-TR', { hour: 'numeric', hour12: false, timeZone: q.timezone }).format(now));
  if (q.startHour > q.endHour) return !(hour >= q.startHour || hour < q.endHour); // overnight window
  return !(hour >= q.startHour && hour < q.endHour);
}
```

### 40.3 Memory Relevance Scoring
```ts
interface MemoryItem { key: string; value: any; createdAt: Date; accessCount: number; lastAccessed: Date; tags: string[] }
function relevance(item: MemoryItem, ctxTags: string[]): number {
  const ageDays = Math.max(1, (Date.now() - new Date(item.lastAccessed).getTime())/86400000);
  const ageScore = 1/ageDays; // newer is better
  const freqScore = Math.log(1 + item.accessCount)/10;
  const ctxScore = item.tags.filter(t => ctxTags.includes(t)).length / Math.max(1,item.tags.length);
  return 0.3*ageScore + 0.3*freqScore + 0.4*ctxScore;
}
```

### 40.4 Pregnancy Milestones (weeks 4–40)

> Turkish and English strings. Keep neutral, non‑diagnostic language.

```ts
export const pregnancyMilestones: Record<number, { tr: string; en: string }> = {
  4:  { tr: "Embriyo oluşmaya başladı.", en: "Embryo begins forming." },
  5:  { tr: "Kalp atmaya başlıyor.", en: "Heart begins beating." },
  6:  { tr: "Yüz özellikleri gelişiyor.", en: "Facial features developing." },
  7:  { tr: "El ve ayak tomurcukları belirginleşiyor.", en: "Limb buds become visible." },
  8:  { tr: "Bebeğiniz üzüm büyüklüğünde; kalp atışı ultrasonda duyulabilir.", en: "Baby is grape-sized; heartbeat detectable on ultrasound." },
  9:  { tr: "Temel organlar oluşumunu sürdürüyor.", en: "Major organs continue forming." },
  10: { tr: "Organlar büyük ölçüde tamamlandı.", en: "Organs are largely formed." },
  11: { tr: "Parmaklar ayrışıyor, küçük hareketler artıyor.", en: "Fingers separate; small movements increase." },
  12: { tr: "İlk trimester bitiyor; düşük riski azalıyor.", en: "First trimester ending; miscarriage risk decreasing." },
  13: { tr: "İkinci trimestere giriş.", en: "Entering second trimester." },
  14: { tr: "Cinsiyet belirlenebilir.", en: "Sex may be detectable." },
  15: { tr: "Cilt ve saç yapısı gelişmeye devam ediyor.", en: "Skin and hair structures develop." },
  16: { tr: "Bebek hareketleri başlayabilir.", en: "Baby movements may begin." },
  17: { tr: "İskelet daha sert hâle geliyor.", en: "Skeleton hardening." },
  18: { tr: "Detaylı ultrason zamanı.", en: "Time for detailed ultrasound." },
  19: { tr: "Duyusal gelişim hızlanıyor.", en: "Sensory development accelerates." },
  20: { tr: "Yarı yola geldiniz! Bebek hareketlerini hissedebilirsiniz.", en: "Halfway there! You may feel movements." },
  21: { tr: "Uyku‑uyanıklık döngüleri oluşuyor.", en: "Sleep‑wake cycles emerging." },
  22: { tr: "Kas gelişimi artıyor.", en: "Muscle development increases." },
  23: { tr: "Akciğerler olgunlaşmaya devam ediyor.", en: "Lungs continue maturing." },
  24: { tr: "Canlı doğum eşiğine yaklaşılıyor.", en: "Approaching viability threshold." },
  25: { tr: "Kilo alımı hızlanıyor.", en: "Weight gain accelerates." },
  26: { tr: "Görme ve işitme duyuları güçleniyor.", en: "Sight and hearing strengthen." },
  27: { tr: "Üçüncü trimestere giriş.", en: "Entering third trimester." },
  28: { tr: "Hareket paternleri daha belirgin.", en: "Movement patterns more distinct." },
  29: { tr: "Beyin gelişimi hızlanıyor.", en: "Rapid brain development." },
  30: { tr: "Yağ dokusu artıyor.", en: "Fat layers increasing." },
  31: { tr: "Solunum pratikleri (nefes alıp verme) artıyor.", en: "Breathing practice increases." },
  32: { tr: "Vücut ısı kontrolü gelişiyor.", en: "Improved temperature regulation." },
  33: { tr: "Bağışıklık sistemi olgunlaşıyor.", en: "Immune system maturing." },
  34: { tr: "Bebek baş aşağı pozisyona dönebilir.", en: "Baby may turn head‑down." },
  35: { tr: "Cilt daha pürüzsüz hale geliyor.", en: "Skin becoming smoother." },
  36: { tr: "Doğuma hazırlık belirtileri görülebilir.", en: "Signs of birth preparation may appear." },
  37: { tr: "Tam süreye yaklaşım.", en: "Approaching full term." },
  38: { tr: "Son kontroller ve hazırlıklar.", en: "Final checks and preparations." },
  39: { tr: "Bebek doğum için hazır.", en: "Baby is ready for birth." },
  40: { tr: "Vade tamamlandı. Doğum her an gerçekleşebilir.", en: "Term reached; birth may occur any time." }
};
```

### 40.5 Daily Water Need Calculation

```ts
type Activity = 'sedentary'|'moderate'|'active';
type Climate = 'cool'|'temperate'|'hot';

export function calculateDailyWaterNeed(weightKg: number, activity: Activity, climate: Climate): number {
  const base = weightKg * 30; // 30 ml per kg baseline
  const activityMultiplier = { sedentary: 1.0, moderate: 1.2, active: 1.4 }[activity];
  const climateBonus = { cool: 0, temperate: 200, hot: 500 }[climate];
  return Math.round(base * activityMultiplier + climateBonus); // ml/day
}
```

### 40.6 BMR & TDEE (Mifflin‑St Jeor)

```ts
type Sex = 'male'|'female';

export function calculateBMR(weightKg: number, heightCm: number, ageYears: number, sex: Sex): number {
  if (sex === 'female') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
  }
  return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
}

export function calculateTDEE(bmr: number, activityLevel: 'sedentary'|'light'|'moderate'|'active'|'very_active'): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  } as const;
  return Math.round(bmr * multipliers[activityLevel]);
}
```

---

## 41) KVKK Rights UI (Settings)
```tsx
const DataRightsSection = () => (
  <Card>
    <Title>Kişisel Veri Haklarınız (KVKK)</Title>
    <Button onPress={exportData}>Verilerimi İndir (JSON)</Button>
    <Button onPress={requestCorrection}>Düzeltme Talep Et</Button>
    <Button onPress={requestDeletion}>Hesabımı Sil</Button>
    <Button onPress={viewProcessingPurposes}>İşleme Amaçlarını Gör</Button>
    <Button onPress={viewDataRecipients}>Veri Paylaşımlarını Gör</Button>
    <Text>Talepleriniz 30 gün içinde yanıtlanacaktır.</Text>
  </Card>
);
```

---

## 42) SQLite Offline Cache Schema (mobile)
```sql
CREATE TABLE IF NOT EXISTS offline_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  retry_count INTEGER DEFAULT 0,
  conflict_resolution TEXT DEFAULT 'last_write_wins'
);
CREATE INDEX IF NOT EXISTS idx_queue_created ON offline_queue(created_at);

CREATE TABLE IF NOT EXISTS cached_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0,
  sync_version INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON cached_messages(conversation_id, created_at);
```

---

## 43) Expo Auth Redirect Configuration (example)
```ts
// app.config.ts
export default {
  expo: {
    scheme: 'wellness',
    ios: {
      bundleIdentifier: 'com.wellness.companion',
      infoPlist: {
        CFBundleURLSchemes: ['wellness'] // add reversed client id in native credentials
      }
    },
    android: {
      package: 'com.wellness.companion',
      intentFilters: [{ action: 'VIEW', category: ['DEFAULT','BROWSABLE'], data: { scheme: 'wellness' } }]
    }
  }
};
```

---

## 44) Troubleshooting Guide (starter)

Create `docs/troubleshooting.md` and include:

```md
# Troubleshooting

## Google Sign‑In not working
- Verify iOS bundle ID / Android applicationId match Google Console.
- Check reversed client ID (iOS) and SHA‑1 (Android) are registered.
- Ensure you use a **development build** (not Expo Go).
- Placeholder values (`PLACEHOLDER_GOOGLE_CLIENT_*`) must be replaced with actual IDs.

## Push notifications not received
- Check quiet hours settings and local timezone.
- Verify FCM/APNs credentials are configured via EAS.
- Inspect BullMQ job status and Expo receipts.
- Ensure `EXPO_ACCESS_TOKEN` is set correctly.

## AI responses slow or failing
- Check ModelPolicy (temperature/maxTokens) and provider status.
- Verify at least one AI provider key is configured (not placeholder).
- Inspect quotas; ensure not rate‑limited.
- Review server logs for SSE backpressure.

## Database connection errors
```bash
# Check PostgreSQL is running
pg_isready -q

# Verify database exists
psql -lqt | awk '{print $1}' | grep -qw wellness

# If missing, create it
createdb wellness
```

## Redis connection errors
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"

# If not running
brew services start redis
```

## Environment validation failures
```bash
# Run validation script
pnpm validate:env

# Or manually check
node scripts/validate-env.js
```

## Mailpit not receiving emails
```bash
# Check if running
nc -z 127.0.0.1 1025

# Restart service
brew services restart mailpit

# Access UI at http://localhost:8025
```
```

---

## 45) Placeholder Values for Development

Use these placeholders until real values are obtained:
- Google Client IDs: `PLACEHOLDER_GOOGLE_CLIENT_[PLATFORM]`
- API Keys: `sk-PLACEHOLDER_[PROVIDER]_KEY`
- JWT Secrets: Generate with: `openssl rand -hex 32`
- Expo Access Token: `PLACEHOLDER_EXPO_ACCESS_TOKEN`
- Bundle ID: `com.wellness.companion` (change 'wellness' to your organization)

**Note**: The app will run with placeholders but certain features (Google auth, AI chat, push) won't work until real values are configured.

---

## 46) AI Agent Instructions

**IMPORTANT INSTRUCTIONS FOR THE CODING AGENT:**

1. **Project Structure**: Create the project in folder: `wellness`
2. **Placeholder Strategy**: 
   - Use placeholder values for all API keys and secrets
   - Generate strong random values for JWT secrets using `openssl rand -hex 32`
   - Comment with `TODO: Replace with actual [service] credentials` where manual configuration is needed
3. **Environment Files**:
   - Create `.env.example` files with all variables documented
   - Create `.env.local` files with placeholders
   - Never commit `.env.local` files (add to .gitignore)
4. **Bundle IDs**: Use these temporarily:
   - iOS: `com.wellness.companion`
   - Android: `com.wellness.companion`
5. **Validation**: Implement the validation script (`scripts/validate-env.js`) that checks for:
   - Missing environment variables
   - Services running (PostgreSQL, Redis, Mailpit)
   - Placeholder values that need replacement
6. **Documentation**: Create README.md with:
   - Clear setup instructions
   - List of manual steps required (Google OAuth setup, API keys)
   - Link to troubleshooting guide
7. **Turkish First**: All UI text and AI responses default to Turkish
8. **Offline First**: Implement SQLite caching with the enhanced schema (includes sync_version and conflict_resolution)
9. **Testing**: 
   - Skip Detox E2E tests initially if applesimutils is not installed
   - Focus on unit tests and API integration tests first
10. **Incremental Development**:
    - Start with core auth and profile
    - Then add calculators and water logging
    - Then implement AI chat with streaming
    - Finally add reminders and push notifications

**Bootstrap Commands to Run First:**
```bash
# Create project
mkdir wellness && cd wellness

# Initialize monorepo
pnpm init
pnpm add -D turbo
pnpm dlx create-turbo@latest . --example basic

# Run setup script after creating it
bash scripts/dev-setup.sh

# Validate environment
node scripts/validate-env.js
```

---

## 47) Final Notes

This specification is comprehensive and ready for implementation. The AI coding agent should follow it exactly, using placeholders where external services are required. All manual setup steps (Google OAuth, API keys) are clearly marked with TODO comments.

The project prioritizes:
- Privacy and KVKK compliance
- Offline-first architecture
- Turkish language support
- Empathetic AI companion
- Clean, modular code structure

Remember to replace all placeholder values before deploying to production.
