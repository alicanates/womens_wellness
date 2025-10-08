# Home Screen — “Today at a Glance” Expansion (Steps, Meditation, Sleep)
> Purpose: Add **three new wellness tiles** (Steps, Meditation/Breath, Sleep) to the **existing** Home screen’s **“Bugün Bir Bakışta / Today at a Glance”** section in a **2×2 grid** alongside the **current Water tile**.  
> Scope: **Instructions only** (no code). The agent must adapt to the current project’s codebase, design system, database, and APIs—**without breaking** existing features or the visual language.  
> Localization mandate: **All end-user UI and copy MUST be Turkish (tr-TR)**. English appears only in dev logs, comments, analytics event names, or fallback debugging strings.

---

## ⚠️ CRITICAL NOTICE (Must Follow)
For this Home screen expansion and all related features, if any modifications are required in the **existing database**, **API contracts**, **endpoints**, **local storage**, **background jobs**, **permissions**, **other screens**, or **any part of the project**, the agent **must perform** those modifications as well.

You must:
- Prepare and configure all **backend and storage** layers (API, DB, sync, background tasks) so the new tiles work end-to-end.  
- Detect and resolve **version conflicts, data/schema mismatches, merge collisions, and runtime errors** before rollout.  
- Ensure **full compatibility** with current app versions, platform SDK levels, and the rest of the product (Calendar, Reminders, NOVA, Settings).  
- Execute development **step by step** with audits at each phase (design parity → data wiring → offline → permissions → notifications → analytics → QA).  
- Keep changes **safe, reversible, and reliable** with feature flags, migration guards, canary cohorts, and a documented rollback plan.  
- **Do not alter or regress** existing **Water** tracking behavior; the new tiles must integrate alongside it in **“Bugün Bir Bakışta / Today at a Glance.”**  
- Maintain the **Pregnancy toggle (“Hamile Değilim / Hamileyim” + switch)** exactly as it works today on the Calendar page and any Home shortcuts, without regression.

---

## 0) Turkish-First Localization Guardrails

**Default locale:** `tr-TR` for **all** UI strings, notifications, in-app explanations, settings labels, and permission rationales.  
**Fallback:** `en` may exist for developer purposes but must **never** surface to end users unless `tr-TR` resources are missing (treat as a defect).

**Turkish formatting rules to enforce:**
- **Dates:** `d MMMM yyyy` (e.g., `7 Ekim 2025`), weekday names in Turkish; **week starts Monday**.  
- **Numbers:** decimal **comma** (`2,5 L`), thousands **dot** (`7.500 adım`).  
- **Time:** 24-hour clock (`08:30`, `18:45`).  
- **Units:** water `ml/L`, sleep `s` (saat) / `dk` (dakika).  
- **Diacritics:** ensure font & rendering for `İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü`.  
- **Pluralization:** Turkish does not pluralize after numerals (e.g., `2 saat`, not `2 saatler`).  
- **Accessibility labels:** in Turkish (e.g., “Adım: 3.200, hedef 7.000”).  
- **Notifications & permission prompts:** fully Turkish with polite, concise tone.

**QA localization checklist (must pass):**
- [ ] No English or mixed strings visible in UI/notifications.  
- [ ] All date/number formats follow `tr-TR`.  
- [ ] Screen reader reads natural Turkish for tiles/actions.  
- [ ] Large text mode preserves layout without truncation of Turkish diacritics.

---

## 1) Information Architecture (unchanged navigation)
- Bottom tabs remain: **Ana Sayfa, Takvim, Hatırlatıcılar, NOVA**.  
- **Profil avatarı** still opens **Ayarlar**.  
- **“Bugün Bir Bakışta”** becomes a **2×2 grid**:  
  - **Üst sıra:** **Su** (existing) + **Adım** (new)  
  - **Alt sıra:** **Meditasyon/Nefes** (new) + **Uyku** (new)

> Keep the **Water tile as is** (copy, colors, quick add). Only adjust spacing to fit the grid.

---

## 2) Data & Integration Plan (non-breaking)

### 2.1 Capability Discovery
- Inventory current **stores/services/repositories** and existing local DB.  
- Check for existing **Health** connectors (Apple Health / Google Fit) and permission flows.  
- Define feature flags: `home_steps_tile`, `home_meditation_tile`, `home_sleep_tile`.

### 2.2 Schema & Storage (Additive only)
If not present, add optional structures with **forward-only** migrations:
- `daily_steps`: `date`, `count`, `source`, `synced_at`, `is_manual`  
- `meditation_sessions`: `date`, `duration_min`, `source`, `type` (`breath|guided|custom`), `is_manual`  
- `sleep_summary`: `sleep_date`, `duration_min`, `quality_opt`, `source`, `is_manual`

> Never drop/rename existing columns. Provide safe rollbacks (no-op or backward compatible).

### 2.3 API & Endpoints (Versioned or Additive)
- `GET /wellness/v1/steps?from&to` — `200` returns daily totals; **Turkish-formatted dates handled on client**.  
- `POST /wellness/v1/steps` — manual entries; idempotency keys for offline retries.  
- `GET/POST /wellness/v1/meditation`  
- `GET/POST /wellness/v1/sleep`

**Privacy:** Honor Anonymous Mode; minimize metadata; redact PII in logs.

### 2.4 Permissions & Connectors
- If using device Health data, present **Turkish** permission rationales and a **Settings** page control to revoke.  
- Graceful fallback to **Manual Entry** when unavailable or denied.  
- Time-zone safe; DST transitions handled.

---

## 3) Tile Specifications (Behavior & Turkish UI Copy)

### 3.1 Water — **Su** (Existing — Do Not Break)
- **Primary copy:** `Su`  
- **Metric line:** `X L / Hedef Y L`  
- **Quick actions:** `+250 ml`, `+500 ml`  
- **Empty state:** `Bugün henüz kayıt yok – +250 ml ile başla`  
- **Notes:** Keep streaks, reminders, and current analytics events unchanged.

### 3.2 Steps — **Adım** (New)
- **Title:** `Adım`  
- **Metric line:** `X adım / Hedef Y` (default target `7.000`)  
- **Quick actions:** `Hedefi Düzenle`, `10 dk yürüyüş hatırlat`  
- **Connected state:** show live count + progress ring/bar.  
- **Permission denied:** `Sağlık verisini bağla` + `Manuel Ekle`  
- **No data today:** `Bugün veri yok – Manuel Ekle`  
- **Goal celebration:** subtle check mark/confetti; Turkish toast: `Hedefe ulaştın!`  

### 3.3 Meditation/Breath — **Meditasyon / Nefes** (New)
- **Title:** `Meditasyon` (subtitle chip `Nefes`)  
- **Metric line:** `Bugün X dk / Hedef 10 dk` (goal editable)  
- **Quick actions:** `1 dk nefes`, `5 dk meditasyon`  
- **Completed:** `Tebrikler, bugün hedefe yaklaştın`  
- **Not started:** `1 dk nefes ile başla`  
- **Privacy:** store only duration + type; no content details.

### 3.4 Sleep — **Uyku** (New)
- **Title:** `Uyku`  
- **Metric line:** `X s / Hedef 7 s` (+optional `Kalite: iyi/orta/zayıf`)  
- **Quick actions:** `Dün geceyi onayla`, `Uyku notu ekle`  
- **Imported pending:** `Yeni uyku verisi – onayla`  
- **Manual state:** preset buttons `5 s`, `6 s`, `7 s`, `8 s`  
- **Edge case copy:** `Parçalı uyku tespit edildi – değerleri gözden geçir`

> All tiles must provide **VoiceOver labels in Turkish** (e.g., “Adım: üç bin iki yüz, hedef yedi bin”).

---

## 4) UX Rules (Grid, Micro-copy, Notifications)

**Grid:** equal tile heights; icons top-left; metric prominent; helper text brief.  
**Micro-copy style:** friendly, concise Turkish; avoid medical claims.  
**Empty/Denied:** each tile offers two paths → **Bağla** (connect) or **Manuel Ekle**.  
**Notifications (opt-in, Turkish):**
- Adım %50/%80: `Hedefe yaklaşıyorsun, kısa bir yürüyüş ister misin?`  
- Meditasyon 18:00 nudge: `Bugün 1 dk nefes molası?`  
- Uyku yatma saati: `Gece rutinine başlama zamanı.`  
Respect **sessiz saatler** and user time zone.

---

## 5) Step-by-Step Integration Plan

1) **Impact Analysis & Flags**  
   - Map Home dependencies/state owners.  
   - Introduce feature flags: `home_steps_tile`, `home_meditation_tile`, `home_sleep_tile`.

2) **Design Parity & Copy**  
   - Align with existing theme tokens.  
   - Register **Turkish** string resources for all tiles, states, notifications, and accessibility labels.

3) **Data Contracts & Migrations**  
   - Add additive DB entities (§2.2).  
   - Validate forward migrations on a copy of production-like data.

4) **Endpoints & Repositories**  
   - Implement versioned or additive endpoints (§2.3).  
   - Ensure idempotent POSTs for offline outbox.

5) **Permissions & Connectors**  
   - Build Turkish permission prompts with clear rationale.  
   - Add Settings controls to revoke/grant; log outcomes (non-PII).

6) **Domain Logic**  
   - Targets (steps/day, meditation minutes, sleep hours) editable; default Turkish labels.  
   - Time-zone aware daily rollups; dedupe by `(user_id, date, source, hash)`.

7) **UI Composition**  
   - Convert “Bugün Bir Bakışta” to **2×2** grid; **Su** tile intact.  
   - Add three new tiles with full Turkish copy, empty/denied states, and quick actions.

8) **Offline Queue & Sync**  
   - Manual entries enqueue offline; reconcile deterministically on reconnect.

9) **Notifications**  
   - Per-tile toggles in Settings (`Bildirimler`) with **quiet hours**.  
   - Deep link opens the relevant tile/detail sheet.

10) **Analytics (Non-PII)**  
   - Event names may be English (e.g., `tile_viewed`, `quick_action_used`), but **no raw values**—use ranges/buckets if needed.  
   - Verify Anonymous Mode strips user identifiers.

11) **QA & Hardening**  
   - Unit → Integration → E2E scenarios (§8).  
   - Soak tests: airplane mode, permission flips, DST change, battery saver.

12) **Staged Rollout**  
   - Internal → Beta cohort (feature flags) → phased 10/50/100%.  
   - Monitor crashes, frame times, opt-in rates; maintain a **rollback** switch.

---

## 6) Settings & Turkish Controls

Create/extend **Ayarlar → İyilik Hali Kartları** section:
- **Kartları Göster/Gizle:** Adım, Meditasyon, Uyku.  
- **Hedefler:** `Adım Hedefi`, `Meditasyon Hedefi`, `Uyku Hedefi`.  
- **Sağlık İzinleri:** bağla/kaldır; durum göstergesi.  
- **Bildirimler:** per-tile schedule + `Sessiz saatler`.

---

## 7) Error Handling & Edge Cases (Turkish UX)

- Health data stale/partial → `Son senkron: hh:mm` + `Manuel düzenle`.  
- DST/time-zone shifts → store UTC, render local.  
- Multi-device duplicates → dedupe policy; Turkish info banner on merge.  
- Background restricted/battery saver → `Senkronizasyon duraklatıldı` chip with learn-more.

---

## 8) QA Scenario Suite (Behavior-Only, Turkish)

- **Permissions:** grant/deny/revoke; tiles degrade to **Manuel Ekle** with Turkish copy.  
- **Offline:** create manual entries; kill app; reconnect; verify reconciliation.  
- **Targets:** edit targets; verify persistence and progress recalculation (Turkish units).  
- **Notifications:** schedule → receive (Turkish) → deep link → snooze → quiet hours respected.  
- **Sleep:** confirm imported night; edit duration; handle midnight crossings.  
- **Steps:** low/high counts; goal celebration message `Hedefe ulaştın!`.  
- **Meditation:** 1-dk and 5-dk timers; handle interruptions/cancel.  
- **A11y:** screen reader in Turkish; focus order logical; diacritics rendered.  
- **Dark/Light:** parity; icons legible on both.  
- **Regression:** Water tile totals & streaks unchanged; Home load time budget not exceeded.  
- **Localization:** no English leak; dates/numbers in `tr-TR`.

---

## 9) Acceptance Criteria

- **Completeness:** Home shows a stable **2×2 grid** with **Su + Adım + Meditasyon + Uyku** in **“Bugün Bir Bakışta.”**  
- **Turkish compliance:** All UI/notifications/labels in Turkish; correct `tr-TR` formats.  
- **Compatibility:** No regressions to Home/Calendar/Reminders/NOVA or the Pregnancy toggle.  
- **Reliability:** Offline entries never lost; deterministic sync/merge.  
- **Performance:** Cold start budget maintained; above-the-fold ready on time.  
- **Privacy:** Anonymous Mode respected; analytics contain no raw health values.  
- **Satisfaction:** Dogfood thumbs-up ≥ 85%; opt-in to at least one new tile ≥ 60%.

---

## Deliverables

1) Updated Home layout with **2×2 grid** in **“Bugün Bir Bakışta”** (Su + Adım + Meditasyon + Uyku).  
2) Additive **DB migrations**, **API endpoints**, and **repositories** for new tiles.  
3) Turkish **permission flows** with **manual entry** fallbacks.  
4) Per-tile **notifications**, **targets**, and **Ayarlar** controls (all Turkish).  
5) Offline outbox + conflict policy + background sync.  
6) Localization/A11y assets (Turkish-first) and non-PII analytics events.  
7) QA checklist and **staged rollout** plan with flags and rollback steps.

---

## Out of Scope
- New global branding or design token changes.  
- Clinical advice or diagnostic claims.  
- Any code examples in this instruction file.

---