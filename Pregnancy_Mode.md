# Pregnancy Mode — Feature Definition & Checklists
> Purpose: Introduce a **Pregnancy Mode** that complements the existing period calendar.  
> Scope: Define **features, UX, content, privacy, and QA checklists only**.  
> Rule: Do **not** prescribe specific implementation or schema changes; the AI development agent must adapt to the existing project codebase, database, and APIs without breaking data integrity or version compatibility.

---

## ⚠️ IMPORTANT NOTICE
For this new **Pregnancy Mode** screen and all related new features, if any modifications are required in the **existing database**, **code structure**, **other screens**, or **any part of the project**, the AI agent must perform those modifications as well.  

The AI agent must:
- Prepare and configure the **entire backend infrastructure** to fully support the pregnancy module.  
- Detect and resolve any **version conflicts, data inconsistencies, or code errors** before applying changes.  
- Ensure the integration is **compatible with current app versions**.  
- Execute development **step by step**, verifying each phase carefully for stability and accuracy.  
- Maintain a **safe, reversible, and reliable** development process with complete version control alignment.

---

## 1) Global UX Concept
- **Single-page illusion toggle**: A persistent switch labeled **“I’m Pregnant / Hamileyim”** placed in the calendar header.  
  - When **ON**, display the Pregnancy Mode panel.  
  - When **OFF**, revert to the Period panel.  
  - The switch remains visible in both modes.  
  - Apply smooth transition animation (fade + slide).  
- **State persistence**: The last selected mode persists across app restarts.  
- **No page navigation jumps** — panels swap within the same view context.

### ✅ Checklist — Global UX
- [ ] Toggle visible in the header in both views  
- [ ] Label clearly indicates mode: “I’m Pregnant / Hamileyim”  
- [ ] In-place transition (no route navigation)  
- [ ] Smooth micro-animation (200–300ms)  
- [ ] Last state remembered on relaunch  
- [ ] Compatible with dark/light modes and RTL/LTR layouts  

---

## 2) Pregnancy Summary Card
Displays high-level pregnancy information and daily tips.

**Content:**
- Gestational Age (weeks + days)  
- Estimated Due Date (EDD)  
- Trimester indicator (1, 2, or 3)  
- One or two “Today’s Tips” (localized, medically verified)  
- Badges for **Anonymous Mode** and **Sync Status** (if active)

### ✅ Checklist — Summary Card
- [ ] GA (weeks + days) shown  
- [ ] EDD displayed  
- [ ] Trimester badge visible  
- [ ] Daily tips loaded  
- [ ] Privacy/sync badges present  
- [ ] Accessible font size and color contrast  

---

## 3) Tools Grid (Main Functional Modules)
A responsive grid containing the following feature tiles:

1. Kick Counter  
2. Contraction Timer  
3. Appointments & Measurements  
4. Medication & Food Safety Lookup  
5. Birth Plan  
6. Hospital Bag Checklist  
7. Notes  

### ✅ Checklist — Tools Grid
- [ ] Grid layout responsive (2 columns mobile, 3+ tablet)  
- [ ] Icons + labels consistent with design language  
- [ ] Press/tap feedback with haptic response  
- [ ] Loading skeletons shown during data fetch  
- [ ] Layout consistent across screen sizes  

---

## 4) Tool Behavior Overview

### Kick Counter
- Start timer; user taps **Kick** for each movement.  
- Stop after 10 kicks (or custom goal).  
- Optional daily reminder.  
- Show past session trend as sparkline.

### Contraction Timer
- Logs contraction duration and intervals.  
- Displays frequency and regularity.  
- Export last 2 hours as CSV or PDF.

### Appointments & Measurements
- Stores date, clinic, notes, and vitals (BP, Weight, optional Glucose).  
- Optional system calendar sync.

### Medication & Food Safety Lookup
- Search medications or foods by name.  
- Displays safety category, trimester notes, and reliable sources.  
- Local cache for recent queries.

### Birth Plan
- Template-based customizable plan.  
- Export as PDF and optionally share securely.

### Hospital Bag Checklist
- Predefined grouped checklists (parent, partner, baby).  
- Persistent item states.  
- Optional share/export.

### Notes
- Simple markdown or text note-taking.  
- Fully offline-capable.

### ✅ Checklist — Tool Behavior
- [ ] All seven tools accessible via grid  
- [ ] Data persistence ensured  
- [ ] Offline capability verified  
- [ ] Clear disclaimers (non-medical guidance)  
- [ ] Export/share functions available  

---

## 5) Week-by-Week Content Feed
- Displays content corresponding to the current gestational week.  
- Localized medical summaries and visual assets (if available).  
- Lightweight and scrollable content section.

### ✅ Checklist — Weekly Content
- [ ] Current week displayed accurately  
- [ ] Localization verified (default: Turkish)  
- [ ] Caching enabled for faster access  
- [ ] Source references visible  

---

## 6) Doctor Visit Summary (PDF)
- Generates a one-page summary including:
  - Recent vitals  
  - Notes and symptoms  
  - Medication/supplement list  
  - Prepared questions for provider  
- Exportable and shareable securely.

### ✅ Checklist — Visit Summary
- [ ] One-page layout verified  
- [ ] Data fields localized and consistent  
- [ ] PDF export functional  
- [ ] Share/save flow stable  

---

## 7) Notifications & Reminders
- Daily kick counter reminders  
- Appointment alerts  
- Weekly content updates  

### ✅ Checklist — Notifications
- [ ] User consent required  
- [ ] Adjustable time preferences  
- [ ] Local & push notification compatibility  
- [ ] Snooze/disable options  

---

## 8) Privacy & Anonymous Mode
- Optional **Anonymous Mode** hides personal identifiers.  
- In-app privacy policy and export/delete controls.  
- KVKK/GDPR compliance enforced.

### ✅ Checklist — Privacy
- [ ] Anonymous Mode toggle accessible  
- [ ] Privacy copy clear and localized  
- [ ] Data export and delete endpoints visible  
- [ ] PII excluded from logs/analytics  

---

## 9) Wearable Integrations (Optional)
- Displays optional trends from connected health devices:  
  - Resting HR, HRV, Respiratory Rate, Sleep Duration.  
- User consent mandatory.

### ✅ Checklist — Integrations
- [ ] Controlled by feature flags  
- [ ] Proper “no data” empty states  
- [ ] Consent prompts visible  
- [ ] Trend rendering verified  

---

## 10) Offline Mode & Data Sync
- Core tools (Kick Counter, Notes, Appointments, etc.) function offline.  
- Sync automatically resumes on connection restore.  
- Avoids duplicate or lost entries.

### ✅ Checklist — Offline & Sync
- [ ] Local cache/queue active  
- [ ] Automatic sync upon reconnect  
- [ ] No data loss  
- [ ] Conflict resolution policy confirmed  

---

## 11) Localization & Accessibility
- Turkish as default language; English fallback.  
- Accessible font sizes, color contrast, and voice-over labels.  
- Haptic feedback for key interactions.

### ✅ Checklist — Localization & Accessibility
- [ ] All new strings localized  
- [ ] Accessibility attributes tested  
- [ ] Haptics functioning on supported devices  
- [ ] VoiceOver/ScreenReader labels verified  

---

## 12) Visual Design Guidelines
- Use modern card-based layout with rounded corners.  
- Unified spacing and typography.  
- Consistent iconography and brand color palette.  

### ✅ Checklist — Visual Design
- [ ] Unified layout hierarchy  
- [ ] Proper spacing rhythm  
- [ ] Consistent icons and colors  
- [ ] Verified dark/light mode rendering  

---

## 13) Rollout Plan (Feature-Flagged)
**Phase 1:** Toggle + Summary Card + Kick Counter + Notes  
**Phase 2:** Contraction Timer + Appointments + Visit Summary PDF  
**Phase 3:** Safety Lookup + Birth Plan + Hospital Bag Checklist  
**Phase 4:** Integrations + Notifications + UI refinements  

### ✅ Checklist — Rollout
- [ ] Feature flags per phase  
- [ ] Staged rollout verified  
- [ ] Error monitoring active  
- [ ] Rollback plan available  

---

## 14) Success Criteria
- Seamless switching between modes  
- Reliable offline operation  
- Full privacy compliance  
- Increased engagement and retention among pregnant users  

### ✅ Checklist — Acceptance
- [ ] Usability tests passed  
- [ ] Offline sync validated  
- [ ] Privacy/legal compliance approved  
- [ ] Feature adoption metrics tracked  

---

## 15) QA Scenarios
- [ ] Toggle mode persistence test  
- [ ] Kick Counter session save & reminder  
- [ ] Contraction Timer logging/export  
- [ ] Appointment CRUD flow  
- [ ] Safety Lookup results & cache  
- [ ] Birth Plan edit/export  
- [ ] Hospital Bag checklist persistence  
- [ ] Notes offline/online sync  
- [ ] Weekly content correctness  
- [ ] Notification scheduling and opt-out  
- [ ] Privacy toggle & Anonymous Mode behavior  
- [ ] Wearable data rendering (if active)  
- [ ] Accessibility compliance  

---

## 16) Out of Scope
- Medical diagnostics or clinical decision-making  
- Deep backend restructuring (unless required by integration)  
- Hard-coded API definitions — the agent should align with existing architecture  

---