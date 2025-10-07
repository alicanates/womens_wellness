# Period Tracking — Calendar Revamp & Content Expansion (Task Instructions for AI Coding Agent)

> Purpose: Revise the **Period Tracking** page to be more informative, explainable, and visually calm while keeping the existing calendar layout.  
> Scope: **Instructions only** (no code). You must adapt to the existing codebase, database, and APIs without breaking data integrity or app versions.  
> Note: The **pregnancy toggle** (“Hamile Değilim” + switch) **must remain** and keep working exactly as before for seamless navigation to the Pregnancy page.

---

## ⚠️ CRITICAL NOTICE (Must Follow)
For this **Period Tracking** revamp and all related new features, if any modifications are required in the **existing database**, **code structure**, **other screens**, or **any part of the project**, you **must perform** those modifications as well.

You must:
- Prepare and configure the **backend** and supporting services so this page is fully functional.  
- Detect and resolve **version conflicts, data inconsistencies, and code errors** before rollout.  
- Ensure **full compatibility** with current app versions and the rest of the product.  
- Execute development **step by step**, verifying each phase carefully (unit/integration/E2E).  
- Keep changes **safe, reversible, and reliable** with proper version control and rollbacks.  
- **Do not remove or alter** the pregnancy toggle (“Hamile Değilim” + switch); preserve its behavior and UX.

---

## 0) Global Requirements (Apply to this page)

**Theme & Design**
- Keep the same theme as existing pages (palette, typography, elevation, spacing, icon set, dark/light).  
- Reduce visual noise: prefer **icon/dot markers** over large color blocks; use **soft, low-saturation** accents.  
- Provide **legend** and **tap-to-explain** interactions so users understand each marker instantly.

**Localization & Accessibility**
- TR default, EN fallback.  
- Screen reader labels for every marker and state; high-contrast mode supported.  
- Tap targets ≥ platform guidelines; haptic feedback on key actions.

**Privacy & Data**
- Respect Anonymous Mode and KVKK/GDPR: no PII in logs, clear privacy copy.  
- Allow data export/delete consistent with app policies.

**Offline & Sync**
- All logging (period, symptoms, etc.) available offline; queue + sync on reconnect.

**Notifications (Opt-in)**
- Reminders for period prediction, fertile window, ovulation estimate, medication, and symptom logging (user-configurable).

**Analytics (Non-PII)**
- Track page_open, add/edit/delete_period, add_symptom, toggle_view, etc. No sensitive payload values.

---

## 1) Calendar Marking System (Replace Color Blocks)

**Goals**
- Reduce eye strain, increase clarity, and make meanings obvious.  
- Keep calendar grid but change **marking** logic and visuals.

**Day Cell Marker System (icon/dot layering; avoid heavy fills)**
- **Period**: small dot at bottom of the cell. Intensity can encode flow if supported (e.g., 1–3 tiny stacked dots).  
- **Fertile Window**: subtle **ring** outline around the date (thin stroke). Confidence shown via ring opacity.  
- **Ovulation (estimated)**: a **star** icon in the upper-right corner (or single dot with star glyph).  
- **Logged Sex**: tiny **heart** dot in lower-right.  
- **Symptoms/Mood**: a small **emoji** or **face icon** in upper-left when at least one key symptom logged that day.  
- **Medication/Health Note**: mini **pill** or **flag** dot in lower-left.  
- **Appointment**: tiny **calendar** or **bell** dot center-left/right (avoid clutter; cap max markers per cell; overflow with a “+n” badge).

**Legend & Explainability**
- A **legend strip** above the calendar (or collapsible chip row) showing: Period • Fertile • Ovulation • Sex • Symptom • Meds • Appt.  
- **Tap on a legend item** → brief explanation sheet (e.g., “Fertile Window is an estimate based on your past cycles; not a guarantee.”).  
- **Tap a day** → bottom sheet with that day’s details (see Section 2).

**Colors (calm, accessible)**
- Use subtle accent hues; avoid full-cell fills.  
- Provide **high-contrast mode** and colorblind-safe variants (no meaning conveyed by color alone—icons/dots support).

**Checklist — Calendar Marking**
- [ ] Replace heavy color blocks with dots/icons/rings  
- [ ] Add legend with tap-to-explain sheets  
- [ ] Day tap opens details bottom sheet  
- [ ] Colorblind-safe + high-contrast options  
- [ ] Cap markers per cell; show “+n” overflow  
- [ ] Dark/Light parity verified

---

## 2) Day Details Bottom Sheet (On tap)

**Content**
- **Header**: Date + quick status chips (e.g., “Predicted Period”, “Fertile”, “Ovulation Est.”).  
- **Period Controls**: Log Start/End, edit flow level, add notes; show previous/next period boundaries if known.  
- **Symptoms/Mood**: quick multi-select (common symptoms, mood, energy, cramps, discharge).  
- **Sex & Protection**: logged sex; prompt contraception used; mark plan B notes if needed (no medical advice).  
- **Meds/Health**: meds taken, painkillers, vitamins; custom health notes.  
- **Attachments** (if supported): small images/files (e.g., lab results).  
- **Save/Undo** actions, delete entry.

**Explainers**
- Short tooltips explaining **why** a day is predicted fertile/ovulatory.  
- Clear disclaimers: estimations, not diagnostics.

**Checklist — Day Sheet**
- [ ] Period log controls (start/end/edit/delete)  
- [ ] Symptoms, sex/protection, meds inputs  
- [ ] Explanatory chips for predictions  
- [ ] Offline save + sync later  
- [ ] Undo/cancel flows and delete confirmation

---

## 3) Above-Calendar Insight Cards (Explain the “Why”)

Place lightweight cards above/below the calendar to make the page **more informative** and **less mysterious**:

1) **Next Period Prediction**  
   - Date estimate, **confidence level** (Low/Med/High) + short rationale (“Based on last 6 cycles; cycle variance: ±X days”).  
   - CTA to adjust if user has irregular cycles.

2) **Fertile Window & Ovulation Estimate**  
   - Window summary (e.g., Day 12–17) + “ovulation around Day 14 (±1–2)”.  
   - Plain-language note on **uncertainty** and factors affecting accuracy.  
   - Link to daily explainer.

3) **Cycle Health Snapshot**  
   - Avg cycle length, length variability (std dev), avg period length, last 3 cycle comparison.  
   - Simple chart icon or tiny sparkline (non-dense visuals).

4) **Recommendations / Nudges (Optional)**  
   - “Consider logging cervical mucus for better predictions.”  
   - “Set reminders for your expected start date.”

**Checklist — Insight Cards**
- [ ] Prediction with confidence + rationale  
- [ ] Fertile/ovulation summary + uncertainty note  
- [ ] Cycle health snapshot (safe summaries only)  
- [ ] Nudges toggled by user preference  
- [ ] Localized, concise language

---

## 4) Cycle Management (Create / Edit / Delete)

**User Stories**
- **Log Period Start**: from today or past date; optionally auto-suggest end based on usual length.  
- **Log Period End**: close the current period; adjust if wrongly set.  
- **Edit Period**: change start/end dates, flow levels (light/med/heavy), notes.  
- **Delete Period**: remove accidental logs (with confirmation).  
- **Backfill**: enter historical periods to improve predictions.  
- **Irregular Cycles**: mark as irregular; the system lowers confidence and widens prediction bands.

**Validation Rules (non-prescriptive, agent adapts)**
- Prevent overlapping periods by default (allow with explicit confirm if needed).  
- If start > end, prompt correction.  
- Recalc predictions after edits/deletes.

**Checklist — Cycle CRUD**
- [ ] Add/End/Edit/Delete flows complete  
- [ ] Backfill supported  
- [ ] Overlap and date validations  
- [ ] Recalculation triggers  
- [ ] Offline safe + conflict handling

---

## 5) Filtering & View Options

**View Modes**
- **All markers** (default).  
- **Focus on Period** (only period/fertility marks).  
- **Focus on Symptoms** (symptom icons only).  
- **Minimal** (only period dots + ovulation star).

**Month/Year Navigation**
- Smooth month paging; year jump if supported.

**Checklist — Views**
- [ ] Toggle view modes (persist user preference)  
- [ ] Fast month navigation  
- [ ] Performance OK on low-end devices

---

## 6) Explanatory Content Section (Static, Collapsible)

Add a collapsible **“How this works”** section (or info icon near the legend) that covers:
- How predictions are made (cycle averages, recency weighting, user logs).  
- Why confidence changes (missing data, variability, postpartum, stopping birth control, PCOS, perimenopause).  
- What the fertile window and ovulation **mean** and **don’t mean** (no guarantee of conception/contraception).  
- Links to trusted resources (non-clickbait; within app policy).

**Checklist — Explanations**
- [ ] Plain-language explanations  
- [ ] Sensitive-topic tone; no medical claims  
- [ ] Localized; short and scannable

---

## 7) Reminders & Notifications (Opt-in)

- **Period Start Reminder**: X days before expected start.  
- **Fertile Window Reminder**: day 1 of estimated window.  
- **Ovulation Estimate Reminder**: morning of estimated day (optional).  
- **Medication Reminder**: for tracked meds (if enabled).  
- **Symptom Logging Nudge**: optional, frequency-limited.

**Checklist — Reminders**
- [ ] Per-reminder opt-in and time selection  
- [ ] Respect system settings and quiet hours  
- [ ] Snooze/disable controls  
- [ ] Deep links to relevant day sheet

---

## 8) Performance & Reliability

- Calendar virtualization for smooth scrolling.  
- Local caching for month data and insight cards.  
- Robust error/empty states; silent retries on network issues.

**Checklist — Perf/Reliability**
- [ ] Scrolling and transitions stay fluid  
- [ ] No UI freezes on month change  
- [ ] Safe fallback when predictions unavailable

---

## 9) QA Scenarios (Behavior-Driven)

- **Calendar Markers**: verify dots/icons/rings appear correctly for period/fertile/ovulation/sex/symptom/meds/appt; test overflow “+n”.  
- **Day Details**: add/edit/delete period; add symptoms, sex, meds; verify recalculation and markers update.  
- **Insights**: confirm next period/fertile/ovulation cards show correct dates and confidence; test irregular cycle impact.  
- **Reminders**: opt-in/out; receive notifications; deep-link opens correct day.  
- **Offline**: log actions offline; close app; reopen; reconnect; ensure data syncs without loss.  
- **A11y/Localization**: screen reader labels, focus order, TR/EN copy, high-contrast mode.  
- **Pregnancy Toggle**: ensure it remains visible/functional; seamless switch to Pregnancy page and back; state preserved.  
- **Regression**: prior period data and reminders remain intact after update.

---

## 10) Success Criteria

- **Clarity**: Users can interpret the calendar at a glance; legend + tap-to-explain reduce confusion.  
- **Trust**: Confidence labels and reasons are visible; disclaimers are clear.  
- **Usability**: CRUD flows are fast and forgiving; undo/cancel available.  
- **Calm Visuals**: Reduced color load; icon/dot system validated in dark/light modes.  
- **Reliability**: Offline-first entries persist; predictions recalc promptly.

---

## Deliverables (for this page)

1) New **icon/dot/ring** marking system + legend & explanations.  
2) **Day details bottom sheet** with full logging (period/symptom/sex/meds/notes).  
3) **Insight cards** (next period with confidence; fertile window & ovulation; cycle health snapshot; optional nudges).  
4) Full **Cycle CRUD** (add/edit/delete/backfill) with validations.  
5) **Reminders** (opt-in) and deep links.  
6) **Accessibility/localization** updates and tests.  
7) **Performance** improvements and robust states.  
8) **QA suite** and rollout plan (staged if needed).

---

## Out of Scope (for clarity)
- Medical diagnosis or clinical decision support.  
- Changing app-wide design tokens or brand identity (only calm refinements on this page).  
- Hard-coded implementation details; adapt to existing stack.

---
