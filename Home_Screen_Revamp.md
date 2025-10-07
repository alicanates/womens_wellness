# Home Screen Revamp — Content, Layout & Activation Plan (Task Instructions)

> Purpose: Redesign the **Home** screen to be more engaging, informative, and useful for women’s wellness use-cases while staying aligned with our existing theme and navigation (Home, Calendar, Reminders, NOVA).  
> Scope: **Instructions only** (no code). Adapt everything to the existing codebase, data model, and APIs.  
> Dependency context: Align with the concise product/architecture spec already shared for this project. :contentReference[oaicite:0]{index=0}

---

## ⚠️ CRITICAL NOTICE (Must Follow)
For this **Home** screen revamp and all related new features, if any modifications are required in the **existing database**, **code structure**, **other screens**, or **any part of the project**, you **must perform** those modifications as well.

You must:
- Prepare and configure the **backend** and supporting services so the Home screen widgets fully work end-to-end.  
- Detect and resolve **version conflicts, data inconsistencies, and code errors** before rollout.  
- Ensure **full compatibility** with current app versions and the rest of the product.  
- Execute development **step by step**, verifying each phase carefully (unit/integration/E2E).  
- Keep changes **safe, reversible, and reliable** with proper version control and rollbacks.

---

## 0) Research-Driven Principles (Competitors & Forums → distilled)
Use these principles to guide content and UX (no medical advice):
- **At-a-glance status**: Women expect a quick “today view” (cycle day, predicted next period window, fertile/ovulation status if tracked, today’s reminders).  
- **Actionable micro-tasks**: One-tap logging for water, mood/symptom, period start/end, medication intake.  
- **Gentle personalization**: Greeting + time-of-day tone; surface relevant cards (e.g., “likely PMS window”, “hydration behind target”).  
- **Positive reinforcement**: Streaks, badges, and subtle confetti on goals—without nagging.  
- **Calm visuals**: Soft cards, limited accent colors, clear iconography, dark/light parity.  
- **Privacy first**: Quick controls for notifications & data visibility, no PII in analytics.  
- **Local & offline**: Core logging should work offline, queued for sync later.

---

## 1) Information Architecture (Home)
Structure the Home screen into **Zones** (top → bottom). All zones obey theme, spacing, and card patterns used elsewhere.

### Zone A — Identity & Quick Access
- **Personalized Greeting** (e.g., “Günaydın, Meo!”) + day context (“Bugün nasılsın?”).  
- **Profile avatar** → opens **Settings** (as today).  
- **Daily Streak chip** (tap to see streak rules).  
- **Safety/Privacy chip** (tap to see Anonymous Mode & data controls).

### Zone B — “Today at a Glance” (Status Row)
Compact, tappable **pill cards** (max 4 visible, horizontally scrollable):
- **Cycle Snapshot**: “Gün X / tahmini: 30 Ekim (Güven: Orta)”. Tap → Calendar (month scrolled to today).  
- **Fertile/Ovulation** (if applicable): “Verimlilik penceresi: 12–17” or “Yumurtlama tahmini: Cum”. Tap → Calendar focus day sheet.  
- **Pregnancy Shortcut**: If user set pregnant in Calendar toggle, show “Gebelik: 18w+3d”. Tap → Pregnancy hub.  
- **Reminders Today**: Count + next reminder time. Tap → Reminders.  
- **Hydration**: Today’s progress vs target (e.g., “0.5 L / 2.1 L”). Tap → quick add.  
- **Medication** (if enabled): “1/3 alındı”. Tap → mark intake.

> Personalize which 4 pills are shown by recency and user preferences; overflow in a “Tümü” drawer.

### Zone C — Priority Cards (2–4 cards, vertically)
Large cards with most impact today (use weighted ranking: urgency + user behavior):
1. **Hydration** (if behind target): current total, “Hızlı +250 ml” action.  
2. **Cycle Insight** (if within ±5 days of prediction): confidence + rationale (“son 6 döngüye göre ±2 gün”).  
3. **Symptom/Mood Quick Log**: 4–6 common chips + “Daha Fazla” → full log sheet.  
4. **Medication Intake** (if scheduled within next 3h): one-tap confirm.  
5. **Reminders Due**: next 1–2 reminders with toggles/snooze.  
6. **NOVA Smart Prompt**: one suggestion (e.g., “Bugün nasıl hissediyorsun? Enerji durumunu kaydetmek ister misin?”). Tap → opens NOVA with prefilled prompt.

### Zone D — Discovery & Education (Optional Feed)
- **Short, vetted micro-articles** (TR + EN sources summarized in-app).  
- Topics: menstrual health basics, hydration, sleep hygiene, exercise ideas, mindfulness.  
- Clearly tagged as **information only, not medical advice**.

### Zone E — Footer Quick Actions
- **+ Log** (sheet): water, symptom/mood, medication intake, weight/BMI, period start/end.  
- **See All Metrics** → Metrics/Health screen (BMI, water history, etc.).

---

## 2) Widget/Module Specifications (Behavior, No Code)

### 2.1 Cycle Snapshot Pill
- Shows **Cycle Day**, **Next Period Estimate**, **Confidence** (“Düşük/Orta/Yüksek”).  
- If irregular flag set, widen uncertainty and show “daha fazla veri ile iyileşir” tip.  
- Tap → Calendar with focus day details.

**Checklist**
- [ ] Day & estimate accurate after edits  
- [ ] Confidence derived from variance rules  
- [ ] Tap deep link correct  
- [ ] Offline safe, updates on sync

---

### 2.2 Fertile/Ovulation Pill (Conditional)
- If user tracks fertility signals, show **window** and **ovulation estimate day**.  
- Include short tooltip: estimations are not guarantees.

**Checklist**
- [ ] Show only when model has enough data  
- [ ] Explanatory tooltip  
- [ ] Tap deep link to Calendar focus

---

### 2.3 Pregnancy Shortcut Pill (Conditional)
- Visible if Calendar switch = **Hamileyim**.  
- Shows **GA (weeks+days)** and **EDD**.  
- Tap → Pregnancy hub.

**Checklist**
- [ ] Visibility tied to pregnancy state  
- [ ] GA/EDD in user locale  
- [ ] Tap deep link accurate

---

### 2.4 Hydration Card
- Shows **today’s total** vs **target**; **Quick Add** buttons (customizable volumes).  
- Gentle nudges when behind target; quiet hours respected.

**Checklist**
- [ ] Quick add increments locally & syncs  
- [ ] Target logic from profile (kg-based or manual)  
- [ ] Streak updates correctly

---

### 2.5 Symptom/Mood Quick Log Card
- 4–6 frequently used chips (auto-learned); “Daha Fazla” opens full sheet.  
- “Bugün nasıl?” single-tap mood scale (🙂 😐 🙁).

**Checklist**
- [ ] Chip set adapts to usage  
- [ ] Offline queue + sync  
- [ ] Undo within 5s

---

### 2.6 Medication Card (If medication module active)
- Shows today’s planned intakes; one-tap “Aldım”.  
- Snooze 15/30/60m.

**Checklist**
- [ ] Intake state & reminders consistent  
- [ ] Quiet hours respected  
- [ ] Deep links to Meds page

---

### 2.7 Reminders Card
- Next reminder preview, toggle on/off, quick snooze.  
- “Tümü” → Reminders screen.

**Checklist**
- [ ] Local/push interplay correct  
- [ ] Timezone aware  
- [ ] Snooze UI non-intrusive

---

### 2.8 NOVA Smart Prompt
- One contextual suggestion/day (limit to avoid fatigue).  
- Examples: hydration nudge, symptom log check-in, cycle education tidbit.  
- Tap opens NOVA with a safe, prefilled prompt; user can edit before sending.

**Checklist**
- [ ] Opt-in for proactive nudges  
- [ ] Rate limited; quiet hours  
- [ ] No health diagnosis language

---

## 3) Navigation & Entry Points
- Bottom tabs stay: **Ana Sayfa, Takvim, Hatırlatıcılar, NOVA**.  
- **Avatar** → **Ayarlar** (unchanged).  
- Deep links from notifications open relevant card/sheet.  
- If an action is ongoing (e.g., unsaved quick log), warn before leaving.

**Checklist**
- [ ] All deep links verified  
- [ ] Back navigation predictable  
- [ ] Unsaved changes guard

---

## 4) Visual Design Rules (System-agnostic)
- **Calm cards**: 12–16pt padding, soft corners, minimal shadows.  
- **Iconography**: consistent set; avoid heavy color fills.  
- **Typography**: clear hierarchy (title > metric > helper).  
- **Dark/Light parity**: test at 100%, 75%, 50% brightness.  
- **Micro-animations**: subtle on quick-add, streak unlocks (≤250ms).

**Checklist**
- [ ] Color contrast AA+  
- [ ] Icon & text legibility on all backgrounds  
- [ ] Reduced motion option honored

---

## 5) Personalization & Ranking
- Rank Zone C cards by **utility** (due reminders > behind target > new streak > education).  
- Remember user **dismissals** (hide for 7 days) and **pin** preferences.  
- Respect **Anonymous Mode**: suppress personalization from sensitive inputs.

**Checklist**
- [ ] Ranking deterministic but user-tunable  
- [ ] Dismiss/pin persisted  
- [ ] Anon Mode filtering applied

---

## 6) Privacy, Security, Observability
- Privacy copy accessible from Home (top chip).  
- **No PII in logs**; structured, minimal analytics (screen_open, tap events).  
- **Export/Delete** entry points discoverable.  
- Errors shown with user-friendly banners; Sentry/monitoring integrated per project standards. :contentReference[oaicite:1]{index=1}

**Checklist**
- [ ] Anon Mode honored end-to-end  
- [ ] Observability without sensitive payloads  
- [ ] Export/Delete reachable within 3 taps

---

## 7) Offline & Performance
- Core actions (quick log, hydration add, intake confirm) work **offline**; queued sync with conflict policy.  
- Home loads **<1.5s** on median device; above-the-fold ready within first frame budget.  
- Cache small micro-article cards; stale-while-revalidate.

**Checklist**
- [ ] Outbox queue tested (airplane mode)  
- [ ] Cold start and resume timings logged  
- [ ] Jank-free scroll & interactions

---

## 8) Notifications (Opt-in, Respect Quiet Hours)
- Hydration nudges (max 3/day), period window reminders, medication times, “review your reminders” weekly digest.  
- All open the relevant card/sheet via deep link.

**Checklist**
- [ ] Consent first run; granular toggles  
- [ ] Quiet hours & timezone aware  
- [ ] Tap-through opens correct surface

---

## 9) QA Scenarios (Behavior-Driven)
- **Personalization**: pill/card ranking changes after user interactions.  
- **Deep Links**: notifications open exact card/sheet.  
- **Offline**: add hydration/symptom, kill app, reopen online → data syncs once.  
- **Calendar Integration**: Home cycle pill reflects edits made in Calendar.  
- **Reminders**: schedule → deliver → snooze → deliver again.  
- **A11y**: screen reader labels, focus order, large text mode.  
- **Dark Mode**: legibility & icon contrast verified.  
- **Error States**: simulated API failures show helpful banners; retry works.  
- **Anon Mode**: analytics show screen/tap events with no PII payloads.  
- **Regression**: BMI, water logs, reminders unaffected by Home revamp.

---

## 10) Rollout & Success Criteria
**Rollout**
- Phase 1: Zone A/B + Hydration + Cycle Snapshot + Reminders.  
- Phase 2: Symptom Quick Log + Medication Card + NOVA Prompt.  
- Phase 3: Discovery/Education feed + personalization tuning.

**Success**
- **Engagement**: +X% increase in daily active logging (water/symptom/meds).  
- **Time-to-action**: median taps to log ≤2 from Home.  
- **Reliability**: 0 data-loss bugs in offline tests; crash-free sessions ≥ 99.8%.  
- **Satisfaction**: thumbs-up rate on Home ≥ baseline +15%.

---

## Deliverables
1) New **Home** layout with Zones A–E, respecting theme and spacing.  
2) Pills (Cycle, Fertile/Ovulation, Pregnancy, Reminders, Hydration, Meds) with deep links.  
3) Priority Cards (Hydration, Cycle Insight, Symptom Quick Log, Reminders, Meds, NOVA Prompt).  
4) Optional micro-article feed with safe summaries.  
5) Personalization, ranking & dismiss/pin logic.  
6) Offline queue + sync for quick logs.  
7) A11y & localization updates (TR default, EN fallback).  
8) QA scenarios & staged rollout plan.

---

## Out of Scope
- Clinical decision support or diagnosis.  
- New global design token changes (stick to existing theme).  
- Any code examples in this instruction file.

---
