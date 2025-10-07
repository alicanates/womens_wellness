# Pregnancy Tracking — Page Content & Activation Plan (Task Instructions for AI Coding Agent)

> Purpose: Define **what each page must contain** and the expected **behaviors, states, and checklists** so the agent can activate and align them with the app’s existing theme and design system.  
> Scope: **Instructions only**. No code samples. The agent must adapt to the current codebase, data model, and APIs.

---

## ⚠️ IMPORTANT NOTICE
For this new **Pregnancy Tracking** set of pages and all related new features, if any modifications are required in the **existing database**, **code structure**, **other screens**, or **any part of the project**, the AI agent must perform those modifications as well.

The AI agent must:
- Prepare and configure the **entire backend infrastructure** to fully support the pregnancy module.  
- Detect and resolve any **version conflicts, data inconsistencies, or code errors** before applying changes.  
- Ensure the integration is **compatible with current app versions**.  
- Execute development **step by step**, verifying each phase carefully for stability and accuracy.  
- Maintain a **safe, reversible, and reliable** development process with complete version control alignment.

---

## 0) Global Requirements (Apply to All Pages)

**Theme & Design**
- Match the app’s existing theme (color palette, typography, spacing scale, icon style, dark/light mode).
- Use the same header pattern, card styles, and action button placements as existing pages.
- Provide consistent empty/loading/error states with the app’s established patterns.

**Localization & Accessibility**
- Localize all strings (TR default, EN fallback).  
- Provide VoiceOver/Screen Reader labels; ensure contrast, font sizes, and tap targets match platform guidance.  
- Provide haptic feedback on primary actions (if supported).

**Privacy & Data**
- Respect Anonymous Mode and KVKK/GDPR: minimize PII in logs; provide clear privacy copy where needed.  
- Ensure data export/delete flows are consistent with the app’s policy.

**Offline & Sync**
- Allow data entry offline; queue for sync; prevent data loss across restarts.  
- Indicate sync status subtly (non-intrusive).

**Notifications (Opt-in)**
- Where relevant (reminders, appointments), allow user-configured notifications.  
- Respect system-level notification preferences; easy opt-out.

**Analytics (Non-PII)**
- Track only high-level usage events (e.g., page_open, item_created).  
- No sensitive payload content in analytics.

**Quality & Reliability**
- Undo/cancel flows for edits and deletes.  
- Confirmation modals for destructive actions.  
- Form validations with clear helper text.

**Deliverables per Page**
- Page content and navigation activation (remove “Coming Soon”).  
- Data wiring to backend or local store as applicable.  
- Localization keys, empty/loading states, a11y labels.  
- Behavior-driven tests and QA scenarios.

---

## 1) Kick Counter (Review & Polish)

> Status: Already present and working. This section defines the expected content polish and acceptance criteria.

**Page Content**
- **Primary action**: Start/Stop session; Kick button with large tap area and haptic feedback.  
- **Session info**: elapsed time, kick count, target (default 10, user-configurable).  
- **History**: list of recent sessions with timestamp, total kicks, total duration.  
- **Trends**: simple sparkline of last ~14 sessions (duration or time-to-10).  
- **Reminder**: daily reminder window (opt-in).

**States**
- Empty (no sessions): educational microcopy + “Start first session.”  
- Ongoing session: persistent mini-control if user navigates away (if app supports).  
- Offline: fully functional; queue save.

**Checklist**
- [ ] Start/Stop/Kick interactions and haptics  
- [ ] History + trend visualization  
- [ ] Reminder configuration  
- [ ] Empty/loading/error states  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 2) Contraction Counter (Activate & Fill)

> Replace “Coming Soon” with full content and interactions.

**Page Content**
- **Recorder**: Start/Stop contraction; auto-capture **duration**, compute **interval** from previous contraction.  
- **Summary** (last 2 hours): frequency, regularity, average interval, average duration (non-medical, informational only).  
- **Log List**: chronological entries with time, duration, optional notes.  
- **Export**: last 2 hours to PDF/CSV for easier triage (share via OS sheet).  
- **Education**: concise, non-diagnostic copy and safety disclaimer.

**States**
- Empty: gentle explainer and CTA “Start timing.”  
- Active timing: prominent stop/resume controls, accidental-tap guard.  
- Offline: logging available; export deferred until data available if needed.

**Checklist**
- [ ] Start/Stop timing; accurate duration/interval calc  
- [ ] Last-2h summary (freq/regularity)  
- [ ] Log list with timestamps & notes  
- [ ] Export PDF/CSV + share flow  
- [ ] Non-medical disclaimer visible  
- [ ] Empty/loading/error states  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 3) Appointments (Activate & Fill)

> Replace “Coming Soon” with visit management and vitals capture.

**Page Content**
- **Upcoming Appointments**: date, time, clinic/location, provider (optional), notes; quick actions (edit, delete).  
- **Past Appointments**: reverse-chronological list with summaries.  
- **Visit Details**: notes, **vitals** (BP, Weight, optional Glucose), attachments (if app supports), follow-ups.  
- **Calendar Integration**: optional add-to-device-calendar and reminders (permission-gated).  
- **Visit Summary PDF**: one-page export (vitals, notes, questions).

**Forms & Validation**
- Required: date/time, title/clinic; optional: provider, notes, vitals.  
- Input masking and unit hints for vitals.

**States**
- Empty: CTA “Add your first appointment.”  
- Offline: create/edit stored locally, sync later.

**Checklist**
- [ ] Create/Read/Update/Delete appointments  
- [ ] Vitals input (BP, Weight, optional Glucose)  
- [ ] Device calendar add & reminders (consent)  
- [ ] Visit Summary PDF export  
- [ ] Empty/loading/error states  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 4) Medications (Activate & Fill)

> Replace “Coming Soon” with medication management and safety lookup.

**Page Content**
- **My Medications**: list with dose, frequency, start/stop dates, indication (optional).  
- **Add/Edit Medication**: name (autocomplete if available), strength, form, dose schedule, notes.  
- **Safety Lookup** (informational): search medication name → **category** (e.g., generally safe/caution/avoid), trimester-specific notes, reputable sources.  
- **Reminders**: optional intake reminders at user-defined times.  
- **Disclaimers**: clear non-medical guidance and urge to consult provider.

**States**
- Empty: prompt to add first medication and/or search safety info.  
- Offline: allow CRUD; cache last safety results locally with staleness note.

**Checklist**
- [ ] Medication CRUD with schedule  
- [ ] Safety lookup results + sources  
- [ ] Intake reminders (opt-in)  
- [ ] Disclaimers visible  
- [ ] Empty/loading/error states  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 5) Birth Plan (Activate & Fill)

> Replace “Coming Soon” with a template-driven plan editor.

**Page Content**
- **Template Sections** (editable):  
  - Preferences & environment (lighting, music, visitors)  
  - Labor & pain management preferences  
  - Interventions (induction, augmentation, monitoring)  
  - Delivery preferences (positions, delayed cord clamping, immediate skin-to-skin)  
  - Postpartum care (lactation support, rooming-in)  
  - Newborn care (vitamin K, eye prophylaxis, vaccinations)  
  - Contacts & preferences (support person, language, cultural needs)
- **Versioning**: last edited timestamp and simple version notes.  
- **Export**: clean PDF; optional secure share link (if supported).

**States**
- Empty: preload template with editable defaults.  
- Offline: fully workable; sync changes later.

**Checklist**
- [ ] Template editor with above sections  
- [ ] Save, duplicate, and revert (basic)  
- [ ] PDF export & optional share link  
- [ ] Last edited timestamp  
- [ ] Empty/loading/error states  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 6) Hospital Bag (Activate & Fill)

> Replace “Coming Soon” with layered checklists.

**Page Content**
- **Grouped Lists**: Parent, Partner, Baby (or custom groups if app supports).  
- **Items**: label, optional quantity, optional notes.  
- **Controls**: check/uncheck, reorder, add custom items/groups.  
- **Presets**: save/load personal presets (optional).  
- **Export/Share**: text or PDF for coordination.

**States**
- Empty: prefill with recommended items (editable).  
- Offline: available; changes sync later.

**Checklist**
- [ ] Grouped, editable checklists  
- [ ] Persistent checked state  
- [ ] Reorder and custom items  
- [ ] Optional presets; export/share  
- [ ] Empty/loading/error states  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 7) Notes (Review & Polish)

> Status: Already present and working. Define content polish and acceptance criteria.

**Page Content**
- **Notes List**: reverse-chronological with timestamps, search/filter.  
- **Editor**: simple markdown/plain text, basic formatting (bold, list) if supported.  
- **Attachments**: if app supports, allow adding small images or files.  
- **Organization**: optional tags or pinning.

**States**
- Empty: “Create your first note.”  
- Offline: fully usable; sync later.

**Checklist**
- [ ] Create/Edit/Delete notes  
- [ ] Search/filter; optional tags/pins  
- [ ] Optional attachments (if supported)  
- [ ] Offline + sync reliability  
- [ ] Localization + a11y

---

## 8) Navigation & Activation Tasks

**Tasks**
- Replace “Coming Soon” states on **Contraction Counter, Appointments, Medications, Birth Plan, Hospital Bag** with the specified content and interactions.  
- Ensure **consistent navigation** from the main Pregnancy Tracking hub to each page and back.  
- Implement **deep links** (if app supports) for quick access from notifications.  
- Confirm **state preservation** when switching between pages or backgrounding the app.

**Activation Checklist**
- [ ] All 5 pages activated and accessible  
- [ ] Back navigation consistent with platform norms  
- [ ] Deep links (optional) verified  
- [ ] State preserved across navigations  
- [ ] No regressions in Kick Counter / Notes

---

## 9) Notifications (Per-Feature Configuration)

**Kick Counter**: daily reminder (time window).  
**Contraction Counter**: educational nudge disabled by default; no medical alerts.  
**Appointments**: reminder X hours/days before; snooze/disable.  
**Medications**: intake reminders at schedule; respect quiet hours.  
**Birth Plan**: optional milestone reminder ~34–36 weeks to review.  
**Hospital Bag**: optional milestone reminder ~36–38 weeks to finalize.

**Checklist**
- [ ] Opt-in per feature  
- [ ] Local/push compatibility  
- [ ] Snooze/disable accessible  
- [ ] Quiet hours respected

---

## 10) QA Scenarios (Behavior-Driven)

- **Navigation**: Open each page from hub; back navigation works; deep links open correct screen.  
- **Contraction Counter**: log 6–10 entries; verify intervals, summary, export PDF/CSV.  
- **Appointments**: create/edit/delete; add vitals; add to device calendar; generate Visit Summary PDF.  
- **Medications**: add multiple meds with schedules; run safety lookup; set reminders; verify disclaimers.  
- **Birth Plan**: edit default template; export; share link (if supported).  
- **Hospital Bag**: check/uncheck; add custom items; export.  
- **Kick Counter/Notes**: regression pass on core behaviors.  
- **Offline**: create entries across pages; relaunch app; reconnect; verify sync & no data loss.  
- **Localization & Accessibility**: switch language; run screen reader; verify labels and focus order.  
- **Privacy**: enable Anonymous Mode; inspect analytics and logs for non-PII.  
- **Dark/Light Mode**: visual regression checks.

---

## 11) Success Criteria

- **Completeness**: All pages activated with specified content and interactions.  
- **Consistency**: Visual and interaction parity with existing app pages.  
- **Reliability**: Offline-first entries persist; sync resolves without conflicts.  
- **Trust**: Privacy copy clear; no sensitive data in analytics; disclaimers present.  
- **Engagement**: Measurable use of appointments, medications, and checklists; kick/contraction tools used appropriately.

---

## 12) Out of Scope

- Clinical diagnostics or triage logic.  
- Introducing brand-new design language deviating from existing app.  
- Hardcoded implementation specifics; agent must adapt to current architecture.

---