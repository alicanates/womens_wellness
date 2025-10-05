# CLAUDE.md

# Women's Wellness Companion – Agent Build Spec (v5.2, Concise)

> **Purpose**: Single source of truth for scaffolding & implementing a cross‑platform mobile app (iOS/Android) for women's wellness tracking with an AI companion. Follow this spec exactly. If something is missing, implement a safe modular default and leave `TODO:` markers.

---

## 0) Guiding Principles
- **MVP first**, feature‑flag larger items.
- **Modular, typed, testable** (clean architecture, DI when useful).
- **Offline‑first**; core flows must not block on network.
- **Secrets** never in repo; use env/secret manager.
- **Privacy by design** (explicit consent, easy data export/delete).
- **Observability** (logs/metrics/errors; **no PII in logs**).
- **Kill switches** for AI and push.

---

## 1) Product Summary
- **Core**: BMI/BMR‑TDEE, water target & logs, period calendar & simple prediction, pregnancy due date/week (timeline post‑MVP), reminders.
- **AI Companion (Mascot)**: persistent chat, opt‑in memory (global + conversation), proactive but non‑diagnostic guidance.
- **Membership**: Free vs Premium with message quota & priority. Admin can edit limits.
- **Language**: Turkish at launch; i18n ready for EN.

---

## 2) Architecture (Monorepo / Turborepo)
```
apps/
  mobile/  (Expo React Native, TS)
  api/     (NestJS + Fastify)
  admin/   (Refine + Next.js)
packages/
  ui/ types/ config/ i18n/
```
**Key tech**: Expo RN (TypeScript), React Navigation, React Query, Zustand, expo‑sqlite & notifications; NestJS + Prisma + PostgreSQL; Redis + BullMQ for jobs; SSE streaming; S3/MinIO pluggable storage (filesystem in dev); Vercel AI SDK broker; Sentry + optional PostHog. All local dev on macOS via Homebrew (no Docker).

---

## 3) Environment & Secrets
- `.env.local` per app; **never** commit secrets. Commit `.env.example` only.
- In CI/Prod use a secret manager; inject at runtime.
- API must **validate env** on boot and exit fast on missing/invalid keys.
- Mobile: treat all `EXPO_PUBLIC_` as public.
- Minimum required keys: API base URLs, DB/Redis URLs, JWT secrets, at least one AI provider key, Expo Push token (for pushes).

---

## 4) Data Model (Prisma) – High Level
- **User, Profile, OAuthAccount**
- **HealthMetric**, **WaterLog**
- **PeriodCycle**, **Pregnancy**
- **Reminder**
- **Conversation, Message, Memory**
- **Subscription, UsageQuota, ModelPolicy**
- **AuditLog, FeatureFlag**
> Keep types in `packages/types` and generate zod schemas. Encrypt sensitive JSON fields at rest where indicated. Add indices on user/time columns.

---

## 5) Core Features
- **Calculators**: BMI (persist), BMR/TDEE (Mifflin‑St Jeor), Water target (30 ml/kg baseline).
- **Tracking**: Period calendar with simple moving‑average prediction; water logs & streaks.
- **Reminders**: local schedules for predictable tasks; server‑side push for dynamic AI nudges (quiet hours & timezone aware).
- **AI Chat**: streaming SSE; server‑side tool calls (`get_user_metrics`, `log_water`, `get_next_period_prediction`, `create_reminder`, `get_quota`); opt‑in memory; explicit consent before storing new personal facts; no diagnosis.

---

## 6) Mobile (Expo) – Implementation Outline
- Screens: **Auth** (email/pw + Google), **Home**, **Calendar**, **Metrics**, **Reminders**, **Chat**, **Settings**.
- Reusable: `Card`, `ReminderForm`, `GoogleButton`, `TypingDots`, `UsagePill`, `ErrorBanner`.
- State: React Query (server cache) + Zustand (UI); SQLite for critical offline entities. Background sync to flush outbox when online.
- Notifications: request permission on demand; deep link taps to relevant screens.

---

## 7) API (NestJS) – Implementation Outline
- Modules: Auth, Users, Profiles, Metrics, Cycles, Pregnancy, Water, Reminders (BullMQ), Chat (LLM broker + SSE), Memory, Quota, Admin.
- Routes (REST + SSE): Auth (register/login/refresh/google), CRUD for metrics/cycles/pregnancy/water/reminders, `/quota`, `/chat/:conversationId/message`, `/chat/:conversationId/stream`, memory purge, `/healthz`, `/api/docs`.
- **AI Broker**: Vercel AI SDK; choose provider/model by **ModelPolicy** (plan‑based); enforce temp/maxTokens/tool permissions; stream tokens; cancel on abort.
- **Quotas & Rate Limits**: monthly counters per plan; throttle chat sends; friendly errors on limit.
- **Resilience**: Prisma connection tuning; Redis retry/backoff; structured error payloads; CORS restricted to app/admin origins.

---

## 8) Admin Panel (Refine)
- Manage Users, Profiles, Conversations, Reminders, FeatureFlags, **ModelPolicy**, quotas/plans, AuditLogs (read‑only, CSV export). Impersonation off by default.

---

## 9) Security & Privacy (KVKK‑aware)
- Explicit consent, privacy notice, in‑app Article 11 request channel.
- TR‑hosted storage preferred; cross‑border transfer requires proper safeguards/consent.
- Retention/destruction policy; automated cleanup; audit logs.
- On‑device: encrypt caches; “Forget everything” purges memory and messages.
- Zero‑PII logging; TLS; secret rotation; MFA recommended.

---

## 10) Setup (macOS, Homebrew) – Minimal
1) Install: Node 20, pnpm, git, watchman, **PostgreSQL 16**, **Redis**, **Mailpit** (SMTP test).  
2) Start services and create `wellness` DB.  
3) Fill `.env.local` files from examples.  
4) `pnpm i && pnpm db:prep && pnpm dev` (api, mobile, admin in separate terminals).  
> Google OAuth requires dev build (EAS); add scheme/redirects and client IDs.

---

## 11) MVP Scope (Must Ship)
- Auth + Profile
- BMI & Water target + persistence
- Period calendar (manual logs + simple prediction)
- Reminders (local + server push)
- AI chat (streaming, quotas, opt‑in memory, server‑side provider selection)
- Rive mascot splash (short and skippable)

**Post‑MVP**: pregnancy week‑by‑week timeline, TDEE UI, symptom analytics, EN localization, wearables, richer insights.

---

## 12) Acceptance Criteria (Samples)
- Reminders trigger at correct local time (±2 min); delivery receipts tracked.
- Chat streams token‑by‑token; **Stop** cancels immediately; resume after relaunch.
- “Forget everything” wipes messages + memory for the user.
- Free plan blocks at quota limit with clear UI & upsell.

---

## 13) API Contracts (Examples)
- `POST /metrics/bmi` → `{ bmi, category, metricId }`
- `POST /chat/:conversationId/message` → `{ messageId }`
- `GET /chat/:conversationId/stream` → SSE events: `token`, `done`, `error`
- `POST /memory/forget_all` → `{ status: "ok" }`

---

## 14) System Prompt (Server)
- Assistant name: **NOVA**. Empathetic, supportive, Turkish by default. Uses tools; never diagnoses; requests consent before storing personal facts; personalizes with cycle/pregnancy/water/reminders when permitted.

---

## 15) Pricing & Plans (Editable in Admin)
| Plan | Monthly AI Messages | Priority | Reminders | Storage | Default Policy |
|------|---------------------|----------|-----------|---------|----------------|
| Free | 100                 | Standard | Unlimited local + limited server push | 1 GB | `openai:gpt-4o-mini` (or equivalent) |
| Premium | 1000             | High     | Unlimited + priority push | 10 GB | `anthropic:claude-3.5-sonnet` or `openai:gpt-4.1` |

---

## 16) Auth Flows
- **Google**: Expo AuthSession gets **ID token** → `POST /auth/google` → server verifies, links/creates user, issues app JWTs. Requires dev build, scheme/redirects, iOS reversed client ID, Android SHA‑1.
- **Email/Password**: register/login/refresh; dev email via Mailpit.

---

## 17) Offline & Streaming (Essentials)
- **Outbox** for offline mutations; last‑write‑wins for simple logs; server‑authoritative for chat/memory.
- Background sync when online.
- SSE client reads tokens; exponential backoff reconnect; AbortController on cancel.

---

## 18) Model Policy & Quotas
- **ModelSelector** reads plan → returns provider/model/temperature/maxTokens/tools; log policy version in AuditLog.
- **Quota**: Redis counters + `UsageQuota` table; monthly reset job; friendly over‑limit handling.

---

## 19) Localization (TR baseline)
- `packages/i18n/tr.json` with auth/home/chat/calculators/errors keys. Day/time formatting via `dayjs` `tr` locale.

---

## 20) Deliverables Checklist
- Monorepo initialized; env templates; scripts for setup/validation.
- Prisma schema + migrations + seed (admin, plans, ModelPolicy).
- NestJS modules/routes + SSE + AI broker with ModelSelector.
- StorageDriver abstraction (filesystem dev; S3/MinIO prod‑ready).
- Expo app with navigation, screens, chat streaming, notifications.
- Google Sign‑In wired (mobile + `/auth/google`).
- Quota enforcement + monthly reset job.
- Rive splash integrated (skippable).
- Tests (unit + e2e) + CI workflow.

---

## Omitted in This Concise Version (refer to full spec if needed)
- Long code samples & skeletons (controllers, services, hooks).
- Detailed Homebrew/EAS/push step‑by‑step scripts.
- Extensive algorithm listings (e.g., pregnancy milestones, quiet‑hours helpers).
- Full error‑code enums & DevOps runbooks.
- Troubleshooting appendices.

> **Rule**: If an omitted detail becomes necessary, implement the safest default and add a `TODO:` with a link to the corresponding module or create a short doc under `docs/`.
