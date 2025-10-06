# Multi‑Step Sign‑Up Flow — Task List (Claude Code Agent)

> **Context**: The current app has a single‑page "Create Account" screen. We will migrate to a **multi‑step (wizard)** onboarding flow while **preserving the existing theme/colors/typography**.
>
> **Out of scope**: Any **birth** or **pregnancy** features.
>
> **Default notification intensity**: **Light**.
>
> **Premium value**: **Stronger AI** — improved memory (with explicit consent), faster responses, higher message capacity, and exclusive capabilities.

---

## Agent Autonomy & Integration Rules
- You are **not required to follow this document verbatim**. Treat it as the target spec.
- **Respect the existing project structure, tech stack, and library versions**. Integrate changes in a way that avoids conflicts, runtime errors, or version mismatches. If a suggested library clashes with current versions, **propose an equivalent** that fits.
- If required infrastructure is missing (navigation, tokens, authentication, notifications, feature flags, form validation), **create it first**, but do so in the least disruptive way. Prefer additive changes that are easy to review and revert.
- When making trade‑offs, **prioritize reliability and compatibility** over novelty. Document deviations in the PR description.

---

## 0) Preflight & Setup Validation
- [ ] **Theme fidelity**: Locate existing theme tokens (colors/spacing/typography) and reuse them for new screens. Avoid custom hard‑coded styles.
- [ ] **Navigation**: Ensure routing can support a wizard. If needed, add an `OnboardingStack` (or equivalent) without breaking current routes.
- [ ] **State management**: Add a light store for wizard state (Context/Zustand/etc.) only if none exists.
- [ ] **Validation**: If no schema validation is present, introduce `zod` (or compatible validator) and wire up with `react-hook-form` (or the app’s current form lib).
- [ ] **Secure storage**: Provide a minimal layer to store signup drafts/tokens securely (SecureStore/Keychain/Keystore) if missing.
- [ ] **Auth & tokens**: Ensure `register/login/refresh/logout` endpoints and refresh flow exist. If missing, scaffold client code and tests.
- [ ] **HTTP client**: Verify interceptors (401/403 handling, refresh, timeouts). Add if absent.
- [ ] **i18n & a11y**: Confirm i18n setup and accessibility helpers. Add where missing.
- [ ] **Notifications**: Add a wrapper that supports local/push, quiet hours, and the **light** intensity profile.
- [ ] **Analytics/Telemetry**: Define screen/step events. Add `analytics.ts` (or plug into existing analytics).
- [ ] **Feature flags**: Introduce a simple flag surface for premium AI if not present.

> If any prerequisite is missing, open a separate **infrastructure PR** before implementing wizard screens.

---

## 1) Information Architecture & Flow
**Steps**
1. **Identity & Access** *(required)*  
   Fields: Full Name, Username, Email, Birth Date (date picker), Password.  
   Instant validation (username availability, email format, password strength).
2. **Period Info (Optional)**  
   "Last period date" with calendar picker + **Skip**. If provided, save to Cycle storage and sync with the in‑app calendar.
3. **Privacy & Consents**  
   KVKK/Privacy link + granular toggles.  
   **AI memory opt‑in** (optional) with explicit consent for storing personal info.
4. **Notification Preferences**  
   Default **Light** profile. Optional quiet hours. Request OS permission **after** value proposition.
5. **Premium Plan Intro**  
   Free vs **Stronger AI**: better memory, faster responses, higher message capacity, exclusive features. Keep purchase flow on a separate route.
6. **Quick Tour (Optional)**  
   3 short cards (Calendar, Reminders, Chat), each with **Skip**.

**Example routes** (adjust to your router):
- `/onboarding/identity`
- `/onboarding/period`
- `/onboarding/privacy`
- `/onboarding/notifications`
- `/onboarding/premium`
- `/onboarding/intro`

---

## 2) UI/UX Requirements (Theme Fidelity)
- Use existing design system components (Button, Input, DatePicker, Checkbox, Switch, ProgressBar, Banner).
- **Progress**: “Step X/6” + progress bar.
- **Errors**: Short, friendly, inline messages that follow theme colors and typography.
- **Accessibility**: Keyboard‑navigable date picker, proper labels, contrast ≥ 4.5:1.
- **Save & resume**: Auto‑save drafts; resume if the app is closed.

---

## 3) Data Models & Validation
```ts
// zod examples — adapt to current validation tooling if different
const Username = z
  .string()
  .min(3)
  .max(24)
  .regex(/^[a-z0-9._]+$/i, "Only letters, numbers, '.' and '_' allowed");

const IdentitySchema = z.object({
  fullName: z.string().min(2),
  username: Username,
  email: z.string().email(),
  birthDate: z.date(),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, "At least 1 uppercase, 1 lowercase and 1 digit"),
});

type IdentityInput = z.infer<typeof IdentitySchema>;

const PeriodSchema = z.object({
  lastPeriodDate: z.date().optional(), // optional
});

const ConsentSchema = z.object({
  acceptPrivacy: z.literal(true),
  aiMemoryOptIn: z.boolean().optional(),
});

const NotificationSchema = z.object({
  intensity: z.enum(["light", "medium", "high"]).default("light"),
  quietHours: z.object({ start: z.string(), end: z.string() }).optional(),
});
```

**Backend DTOs**  
- `POST /auth/register` → body: `IdentityInput` + optional `lastPeriodDate` + consents.  
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.  
- `POST /cycles` → `{ lastPeriodDate }` (during onboarding or later).  
- `GET /me` → profile & plan info.

---

## 4) End‑to‑End Flow (Technical Steps)

### A. Infrastructure & Skeleton
- [ ] Create/extend `OnboardingStack` and routes.
- [ ] Add `onboardingStore` (Context/Zustand) to share wizard state.
- [ ] Use `FormProvider` + `react-hook-form` (or project’s chosen form lib). Each step reads via `useFormContext`.
- [ ] Implement an accessible `DatePicker` styled by theme tokens.
- [ ] Ensure `apiClient` interceptors (Auth header, refresh, error mapping) are in place.

### B. Identity & Access (Step 1)
- [ ] Implement fields; enable **Next** only when schema is valid.
- [ ] Username availability: `GET /users/availability?username=...` (debounced).
- [ ] Password strength meter + show/hide control.
- [ ] On submit, persist a `registerDraft` in the store.

### C. Period Info (Step 2 — optional)
- [ ] Calendar picker + **Skip** path.
- [ ] If provided, store locally; defer `POST /cycles` until after registration succeeds.

### D. Privacy & Consents (Step 3)
- [ ] KVKK/Privacy short text + link to full policy.
- [ ] `acceptPrivacy` required; `aiMemoryOptIn` optional.

### E. Notification Preferences (Step 4)
- [ ] Default `intensity = light`.
- [ ] Optional quiet hours. Show OS permission prompt **after** explaining the benefit.

### F. Premium Intro (Step 5)
- [ ] Comparison card: Free vs **Stronger AI**.
- [ ] Allow choosing a plan now or later. Keep purchase flow on a separate route.

### G. Quick Tour (Step 6)
- [ ] 3 informative cards (Calendar, Reminders, Chat) — each with **Skip**.
- [ ] On finish → redirect to Home/Dashboard.

### H. Registration Completion
- [ ] `POST /auth/register` (Identity + Consents). On success, securely store tokens.
- [ ] If `lastPeriodDate` present → `POST /cycles`.
- [ ] `GET /me` and navigate to the main app.

---

## 5) Notification Profiles
- **light** (default):
  - Minimal, critical upcoming‑period alerts only.
  - Weekly tip summary.
  - Respect quiet hours.

Display a short description of the selected profile in UI.

---

## 6) Premium — “Stronger AI” Requirements
- [ ] **Memory**: Long‑term recall of user‑approved facts (with a visible "Forget everything" control).
- [ ] **Faster responses**: Prioritized request queue.
- [ ] **Higher message capacity**: Increased daily/monthly quota.
- [ ] **Exclusive features**: Advanced suggestions, larger context window, richer responses.
- [ ] **UI**: Plan badges, quota meter, upgrade affordances.
- [ ] **Flags**: Gate via `featureFlags.premiumAI`.

---

## 7) Error Handling & Edge Cases
- [ ] Future birth date ⇒ validation error.
- [ ] Offline submit ⇒ store draft; retry when online.
- [ ] Notification permission denied ⇒ passive card with “enable later” path.
- [ ] `POST /auth/register` 4xx/5xx ⇒ friendly error + retry.

---

## 8) Analytics Events (Examples)
- `onboarding_step_view` { step }
- `onboarding_next_click` { step }
- `onboarding_validation_error` { step, field }
- `register_success` { plan }
- `period_saved` { hasDate: boolean }
- `notifications_opt_in` { intensity }

---

## 9) Testing & Acceptance Criteria
**Tests**
- **Unit**: Schemas, helpers, store.
- **Integration**: Form → store → API chain per step.
- **E2E**: Step 1→6 flow (including Skip variants) and offline scenarios.

**Acceptance**
- Cannot proceed past Step 1 without all required fields.
- Period step is skippable; if skipped, show a gentle reminder card later in Home.
- Default notification intensity is **light**.
- Premium screen clearly communicates Stronger AI benefits; purchase flow is on a separate route.
- New screens adhere to the existing theme/colors/typography.

---

## 10) PR & Release Plan
- **PR #1 (Infrastructure)**: navigation/store/validation/client + screen skeletons.
- **PR #2 (Steps 1–2)**: Identity + Period + API contracts.
- **PR #3 (Steps 3–4)**: Privacy + Notifications (light default) + permission flow.
- **PR #4 (Steps 5–6)**: Premium intro + Quick tour.
- **PR #5 (Tests & Telemetry)**: E2E and analytics.

**Rollout**: Stage with a feature flag; if issues are detected, disable the flag to fall back gracefully.

