# New Screens — Steps, Meditation, Sleep (Task Instructions for AI Coding Agent)

> Purpose: Create **three new screens**—**Steps (Adım)**, **Meditation/Breath (Meditasyon/Nefes)**, and **Sleep (Uyku)**—that integrate with the existing Home screen’s “Bugün Bir Bakışta” tiles and match the app’s **current theme, layout, and visual language**.  
> Scope: **Instructions only** (no code). The agent must analyze the **current codebase, data model, APIs, and design system** and implement these screens **without breaking** existing features (notably **Water/Su** which is already live).  
> Localization mandate: **All end-user UI and copy MUST be Turkish (tr-TR)**. English in this document is only for the agent. Any runtime English shown to users is a defect.

---

## ⚠️ CRITICAL NOTICE (Must Follow Exactly)

For these new screens and all related features, if any modifications are required in the **existing database**, **API contracts**, **endpoints**, **local storage**, **background jobs**, **permissions**, **build configs**, **routing**, **telemetry**, **other screens**, or **any part of the project**, the agent **must perform** those modifications as well.

You must:
- Prepare and configure all **backend and storage layers** (API, DB, sync, background tasks) so the new screens work **end-to-end**.  
- Detect and resolve **version conflicts, data/schema mismatches, merge collisions, dependency issues, and runtime errors** before rollout.  
- Ensure **full compatibility** with current app versions, platform SDK levels, feature flags, and modules (Home, Calendar, Reminders, NOVA, Settings).  
- Execute development **step by step**, validating each phase (design parity → data contracts → offline → permissions → notifications → analytics → QA).  
- Keep changes **safe, reversible, and reliable** with feature flags, forward-only migrations, idempotent endpoints, canary cohorts, and a documented rollback plan.  
- Maintain **visual parity** (theme tokens, spacings, radii, shadows, icons) with the existing app; **no new design language**.  
- **Do not alter or regress** the **Water/Su** feature. Keep it as is; integrate the three new screens alongside it.  
- **Turkish-first localization**: tr-TR for all UI, notifications, and accessibility labels (see §0).  
- **Privacy & compliance**: Honor **Anonymous Mode** and **KVKK/GDPR**. No PII or raw health values in analytics.

---

## 0) Turkish-First Localization Guardrails

- **Default locale:** `tr-TR` for UI strings, notifications, permission rationales, and a11y labels.  
- **Formats:**  
  - Dates: `d MMMM yyyy` (e.g., `7 Ekim 2025`), week starts Monday.  
  - Numbers: decimal **comma** (`2,5 L`), thousands **dot** (`7.500 adım`).  
  - Time: 24-hour clock (`08:30`). Units: `s` (saat), `dk` (dakika).  
- **Diacritics:** ensure fonts support `İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü`.  
- **Pluralization:** Turkish style (`2 saat`, not `2 saatler`).  
- **QA:** No English visible to users; VoiceOver reads natural Turkish; large text mode keeps layout intact.

---

## 1) Information Architecture & Navigation

- Bottom tabs remain: **Ana Sayfa**, **Takvim**, **Hatırlatıcılar**, **NOVA**.  
- From Home’s “Bugün Bir Bakışta” tiles, deep-link to the new screens:  
  - **Steps (Adım)** → **Steps Screen**  
  - **Meditation/Breath (Meditasyon/Nefes)** → **Meditation Screen**  
  - **Sleep (Uyku)** → **Sleep Screen**  
- Each screen keeps the app’s standard **Header**, **Back** behavior, and **card layout** patterns.  
- Add **Settings** entries where needed (targets, permissions, notifications).

---

## 2) Data & Integration Plan (Non-Breaking, Additive)

### 2.1 Capability Discovery
- Audit existing **stores/services/repositories**, local DB, and any **Health connectors** (Apple Health / Google Fit).  
- Confirm offline queue/outbox mechanism; define feature flags:  
  - `screen_steps_enabled`, `screen_meditation_enabled`, `screen_sleep_enabled`.

### 2.2 Storage & Migrations (Additive Only)
If not present, add optional structures with **forward-only** migrations (no destructive changes):
- **`daily_steps`**: `date`, `count`, `source (device/manual)`, `synced_at`, `is_manual`  
- **`meditation_sessions`**: `date`, `duration_min`, `type (breath|guided|custom)`, `source`, `is_manual`, `note_opt`  
- **`sleep_summary`**: `sleep_date`, `duration_min`, `quality_opt (iyi|orta|zayıf)`, `source`, `is_manual`, `note_opt`
> Provide **idempotent** keys for offline retries; maintain UTC storage, render in local TZ.

### 2.3 Endpoints (Versioned or Additive)
- `GET /wellness/v1/steps?from&to` · `POST /wellness/v1/steps`  
- `GET /wellness/v1/meditation?from&to` · `POST /wellness/v1/meditation`  
- `GET /wellness/v1/sleep?from&to` · `POST /wellness/v1/sleep`  
- Respect **Anonymous Mode**; redact PII; enforce minimal payloads.

### 2.4 Permissions & Connectors
- If Health data is used: Turkish **permission prompt** with rationale; Setting to **revoke** permissions.  
- Fall back gracefully to **Manual Entry** when unavailable/denied.  
- Handle DST and TZ shifts; deduplicate multi-device imports.

### 2.5 Notifications (Opt-in)
- Per-screen toggles: `Adım hedefi`, `Meditasyon hatırlatması`, `Yatma zamanı`.  
- Respect **sessiz saatler**; deep-link to the relevant screen/section.

### 2.6 Analytics (Non-PII)
- Event names may be English (e.g., `screen_open`, `manual_entry_saved`, `permission_granted`, `goal_reached`).  
- **Never** send raw numeric values; use ranges/buckets if analytics require magnitude.

---

## 3) STEPS Screen — **Adım**

### 3.1 Purpose & Value
A clear daily view of steps, progress toward target, weekly/monthly trends, and simple controls for permissions, manual entry, and reminders.

### 3.2 Page Structure (match existing card design)
1. **Header**: “Adım” + today’s date.  
2. **Today Card**  
   - Metric: `X adım / Hedef Y` (progress ring/bar).  
   - Actions: `Hedefi Düzenle`, `Manuel Ekle`, `Sağlık Verisini Bağla` (if needed).  
   - Status chips: `İzin kapalı`, `Senkron bekliyor`, `Çevrimdışı`.  
3. **History & Trends**  
   - **Last 7 days** mini bar/sparkline (calm colors).  
   - “Haftalık ortalama”, “En iyi gün”, “Seri (gün)”.  
   - Filter: `Hafta`, `Ay`.  
4. **Reminders**  
   - Quick: `10 dk yürüyüş hatırlat`.  
   - Schedule with quiet hours.  
5. **Tips (optional, info only)**: Short Turkish microcopy (non-medical).

### 3.3 Interactions
- **Manual Entry:** date + steps input with safeguards (upper bound sanity check).  
- **Goal Edit:** predefined presets (5k/7k/10k) + custom; store per user.  
- **Permissions:** request/revoke; show last sync time; retry button.  
- **Empty/Denied States:** clear explanation + “Bağla” and “Manuel Ekle”.

### 3.4 Data to Store
- Daily total, data source, is_manual, last_import_ts, device_id_hash (if needed), notes_opt.

### 3.5 Edge Cases
- Duplicate imports across devices → dedupe by `(user_id, date, source, hash)`.  
- Time-zone change midday → recompute daily bucket at local midnight.  
- Background restrictions → show “Senkron duraklatıldı” banner.

### 3.6 Acceptance (Steps)
- Accurate daily/weekly values; edits recalc immediately.  
- Offline manual entries survive app restarts and sync correctly.  
- Turkish UI copy everywhere; no English leakage.  
- Performance: above-the-fold renders within Home budget when deep-linked.

---

## 4) MEDITATION Screen — **Meditasyon / Nefes**

### 4.1 Purpose & Value
Promote low-friction mindfulness with quick timers, daily goal, session history, and gentle reminders—aligned with women’s wellness expectations.

### 4.2 Page Structure
1. **Header**: “Meditasyon”  
2. **Today Card**  
   - Metric: `Bugün X dk / Hedef Y dk`.  
   - Quick Actions: `1 dk nefes`, `5 dk meditasyon`.  
   - Toggle: `Seans türü` (nefes/guided/custom).  
3. **Session Controls**  
   - Start/Pause/Complete; haptics; background-safe countdown.  
   - On complete → success toast `Harika! X dk tamamlandı`.  
4. **History & Insights**  
   - List of sessions (date, duration, type, optional note).  
   - Weekly goal streak; calm sparkline.  
5. **Reminders**  
   - Daily or weekday schedule; snooze 15/30/60 dk.  
6. **Notes (optional)**  
   - Short text per session; stored locally and synced.

### 4.3 Interactions
- **Timer reliability:** survives app background/lock; resumes correctly.  
- **Edit Session:** adjust duration if timer was interrupted.  
- **Manual Add:** enter duration+type for past days.

### 4.4 Data to Store
- Session: `date`, `duration_min`, `type (breath|guided|custom)`, `is_manual`, `note_opt`, `completed_at`.

### 4.5 Edge Cases
- Multiple short sessions → aggregate correctly in “Today X dk”.  
- Quiet hours → mute notifications and suggestion nudges.  
- Anonymous Mode → suppress detailed content labels (store durations only).

### 4.6 Acceptance (Meditation)
- Timer accuracy; no drift across background/foreground.  
- Daily total equals sum of sessions; weekly streak logic stable.  
- Turkish copy and a11y labels present; large text mode OK.

---

## 5) SLEEP Screen — **Uyku**

### 5.1 Purpose & Value
A practical daily “last night” view with confirm/edit flow, optional quality rating, notes, and weekly patterns—sensitive to real-world fragmentation across midnight.

### 5.2 Page Structure
1. **Header**: “Uyku”  
2. **Last Night Card**  
   - Metric: `X s (Kalite: iyi/orta/zayıf)` when available.  
   - Actions: `Dün geceyi onayla`, `Düzenle`, `Uyku notu ekle`.  
   - If no import: quick presets `5 s`, `6 s`, `7 s`, `8 s`.  
3. **Week at a Glance**  
   - Bars for last 7 nights (hours) + average; target line (7 s).  
4. **Bedtime Routine (optional)**  
   - Toggle reminder near preferred bedtime.  
5. **Education (info only)**  
   - Short Turkish microcopy about sleep hygiene (non-medical).

### 5.3 Interactions
- **Confirm Import:** when Health source provides data → accept/adjust.  
- **Manual Entry:** set duration; optional quality and note.  
- **Edit Past Night:** correction flows with validation.  
- **Notes:** cramps/restlessness/awakening times (free text or quick chips).

### 5.4 Data to Store
- Per night: `sleep_date`, `duration_min`, `quality_opt (iyi|orta|zayıf)`, `source (device/manual)`, `is_manual`, `note_opt`, `import_batch_id`.

### 5.5 Edge Cases
- Fragmented sleep (before/after midnight) → combine to the **sleep_date** the user expects; document the rule in code comments.  
- Naps ignored unless explicitly supported; do not inflate nightly totals.  
- DST transitions; TZ shifts; multi-device duplicates (dedupe policy).

### 5.6 Acceptance (Sleep)
- Import/confirm/edit flows robust; no duplicate nights.  
- Weekly view accurate; target line and averages correct.  
- Turkish copy and a11y labels present; no English leakage.

---

## 6) UX & Visual Rules (All Three Screens)

- **Design parity:** reuse existing card components, paddings (12–16), radii, shadows, and icon set; calm colors; dark/light parity.  
- **Micro-copy:** short, friendly Turkish; avoid medical claims.  
- **Accessibility:** large numbers, AA+ contrast; VoiceOver labels like “Adım: üç bin iki yüz, hedef yedi bin”.  
- **Empty/Permission-Denied:** dual path → **Bağla** (connect Health) or **Manuel Ekle**.  
- **Haptics:** subtle on completes and quick actions.  
- **Loading skeletons:** consistent with existing screens.

---

## 7) Step-by-Step Integration Plan

1) **Impact Analysis & Flags**  
   - Map dependencies; add `screen_steps_enabled`, `screen_meditation_enabled`, `screen_sleep_enabled`.

2) **Design Parity & Turkish Copy**  
   - Register all Turkish strings, notifications, a11y labels.  
   - Verify numbers/dates/time in `tr-TR`.

3) **Data Contracts & Migrations**  
   - Add additive tables/fields (§2.2).  
   - Dry-run on production-like data; ensure rollback safety.

4) **Endpoints & Repositories**  
   - Implement/extend versioned endpoints (§2.3) with **idempotency** for offline outbox.

5) **Permissions & Connectors**  
   - Turkish permission rationales; Settings controls to revoke/grant; handle permission flips at runtime.

6) **Domain Logic**  
   - Targets: steps/day, meditation minutes, sleep hours—editable with Turkish labels.  
   - Time-zone safe daily rollups; duplicate import dedupe; data aging policy.

7) **UI Composition**  
   - Build three screens using existing card components; deep-links from Home tiles.  
   - Ensure back navigation and state restoration match app norms.

8) **Offline Queue & Sync**  
   - Manual entries enqueue offline; reconcile deterministically on reconnect (last-writer-wins or server timestamp policy).

9) **Notifications**  
   - Add per-screen toggles in **Ayarlar → Bildirimler**; respect **sessiz saatler**; deep-link targets.

10) **Analytics (Non-PII)**  
   - Instrument `screen_open`, `manual_entry_saved`, `goal_reached`, `permission_granted/denied`.  
   - Validate no raw numeric payloads.

11) **QA & Hardening**  
   - Unit → Integration → E2E scenarios (see §8).  
   - Soak tests: airplane mode, DST change, permission flips, battery saver.

12) **Staged Rollout**  
   - Internal → Beta (flags) → 10/50/100%. Monitor crashes, frame time, opt-in and retention; **rollback** ready.

---

## 8) QA Scenario Suite (Behavior-Only, Turkish)

- **Permissions:** grant/deny/revoke; screens degrade to **Manuel Ekle** gracefully with Turkish copy.  
- **Offline:** create manual entries; kill app; reconnect; verify reconciliation and no data loss.  
- **Targets:** edit steps/meditation/sleep targets; progress recalculates; values persist.  
- **Notifications:** schedule → receive (Turkish) → deep link → snooze → quiet hours.  
- **Steps:** import + manual override; goal celebration message `Hedefe ulaştın!`; dedupe duplicates.  
- **Meditation:** 1-dk & 5-dk timers handle interruptions/cancel; daily total equals sum of sessions.  
- **Sleep:** confirm imported night; edit fragmented nights; handle midnight crossing and DST.  
- **A11y:** screen reader order; large text mode; diacritics render.  
- **Dark/Light:** parity; icons/text legible.  
- **Localization:** no English leakage; `tr-TR` formats for dates/numbers/times.  
- **Regression:** Water/Su page and Home tiles unaffected; app launch time budget intact.

---

## 9) Deliverables

1) Three production-ready screens: **Adım**, **Meditasyon**, **Uyku**, visually consistent with existing pages.  
2) Additive **DB migrations**, **API endpoints**, **repositories/services** supporting create/read and offline sync.  
3) Turkish **permission flows** with Settings revocation; manual entry fallbacks.  
4) Per-screen **notifications**, **targets**, and **Ayarlar** controls.  
5) Offline outbox + conflict policy; background sync reliability.  
6) Full localization/a11y assets and non-PII analytics events.  
7) QA checklist results and **staged rollout** plan with flags and rollback.

---

## 10) Out of Scope

- Changing global design tokens or brand identity.  
- Clinical or diagnostic claims.  
- Any code examples within this document.

---
