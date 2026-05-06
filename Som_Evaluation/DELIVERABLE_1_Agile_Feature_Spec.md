# CueGuide — AI-Driven Daily Routine Assistant
## Agile Feature Specification
### Prepared by Dhruv Jain | May 2026

---

## Feature Statement

Enable people with early-stage dementia to complete daily routines independently through AI-generated, personalized step-by-step prompts — reducing caregiver intervention for routine activities while preserving patient autonomy and dignity.

---

## User Stories

### US-1: Routine Creation & Step Decomposition

**As a** caregiver,
**I want to** create daily routines broken into simple, sequential steps with optional media,
**So that** my loved one receives clear guidance tailored to their specific habits and environment.

**Acceptance Criteria:**

- Caregiver creates a routine with: name, category (hygiene, meals, medication, exercise, social), scheduled time, recurrence (daily, specific days, one-time)
- Each routine contains 2–15 ordered steps
- Each step includes: instruction text (≤50 words), optional icon/emoji, optional caregiver voice recording
- System provides pre-built templates for common routines (Morning Hygiene, Medication, Meal Prep, Bedtime)
- Caregiver can reorder, edit, duplicate, or remove steps after creation
- Maximum 12 active routines per day to limit cognitive load

---

### US-2: AI-Powered Step-by-Step Prompting

**As a** person with early dementia,
**I want to** receive clear, calm, one-step-at-a-time prompts when it's time for an activity,
**So that** I can complete daily activities without waiting for someone to remind me.

**Acceptance Criteria:**

- When a routine is due, the app enters full-screen "Focus Mode" showing one step at a time
- Each prompt displays: large text (≥24pt), optional image/icon, and a single "Done" button
- AI personalizes the prompt language using the patient's name, familiar references, and context (time of day, weather, upcoming events)
- If no interaction within a configurable timeout (default 2 min), the prompt replays gently with audio
- After 3 unanswered prompts, the caregiver receives a silent alert (the patient never sees failure messaging — this avoids frustration and confusion)
- Patient can tap "Read Aloud" for text-to-speech playback
- Patient can tap "Help" for an AI-generated expanded explanation
- Patient can tap "Skip" to move to the next step (logged for caregiver review, no judgment displayed)
- Completion time per step is logged for adaptive scheduling

---

### US-3: Caregiver Dashboard & Monitoring

**As a** caregiver,
**I want to** see real-time progress and weekly patterns,
**So that** I can provide support only when truly needed and notice cognitive trends early.

**Acceptance Criteria:**

- Dashboard shows today's routines with status: upcoming, in progress, completed, missed, partially completed
- When the patient is in a routine, the caregiver sees which step they are on and time elapsed
- Push alerts are sent when: a routine is missed (after configurable grace period), the patient is stuck on a step for >5 min, or the patient taps "Help"
- Weekly summary includes: completion rates per routine, average time per routine (trend over weeks), most-skipped steps, best/worst time-of-day patterns
- Caregiver can send an encouragement message that appears on the patient's screen
- Alert fatigue prevention: configurable quiet hours and max alerts per hour

---

### US-4: Contextual AI Cue Generation

**As a** person with early dementia,
**I want** prompts that feel personal and connected to my life,
**So that** I feel oriented and calm rather than confused by generic instructions.

**Acceptance Criteria:**

- Morning greeting includes: day, date, weather, and upcoming events (e.g., "Good morning, Robert. It's Tuesday. Sunny today. Sarah visits at 3 PM.")
- Medication prompts describe the pill visually and explain purpose simply (e.g., "Time for your small blue pill — it helps your heart stay healthy")
- AI varies phrasing over time to avoid habituation (same instruction, different words each day)
- All AI-generated content is reviewable by the caregiver before going live (approval queue)
- Offline fallback: if the AI service is unavailable, static pre-written prompts are used

---

### US-5: Adaptive Scheduling

**As a** caregiver,
**I want** the app to learn when my loved one actually does things and adjust accordingly,
**So that** reminders arrive at the right moment instead of being ignored.

**Acceptance Criteria:**

- System tracks actual completion times vs. scheduled times
- After 5+ data points, suggests an adjusted schedule with a reason (e.g., "Robert usually starts breakfast at 8:15, not 8:00. Adjust?")
- Caregiver approves or rejects each adjustment — no autonomous changes
- Maximum shift: ±15 min per week to prevent schedule drift
- Displays reasoning and confidence level for each suggestion

---

## Dependencies

| Dependency | Type | Priority | Notes |
|---|---|---|---|
| LLM API (Claude / Anthropic) | External service | P0 | Core AI for prompt personalization and cue generation |
| Cloud database (Supabase) | Infrastructure | P0 | Patient data, routines, completion logs. HIPAA BAA required. |
| Push notification service | External service | P1 | Firebase Cloud Messaging for caregiver alerts |
| HIPAA-compliant hosting | Infrastructure | P0 | Required for any Protected Health Information storage |
| Text-to-speech | On-device or API | P1 | Accessibility for read-aloud functionality |
| Weather API | External service | P2 | Contextual information for morning greetings |

---

## Business Value

**Market context:** 6.9 million Americans are living with Alzheimer's disease. Early-stage dementia represents the largest addressable segment where technology intervention can meaningfully extend independence.

**Caregiver burden reduction:** Informal caregivers spend an average of 5+ hours per day on supervision and task reminding. Automating routine prompting can return 1–2 hours per day — equivalent to $50–75/day at home care aide rates.

**Delayed institutional care:** Maintaining daily routine independence is one of the strongest predictors of home care viability. Extending home care by 6–18 months represents $60K–$180K in avoided nursing home costs per family.

**Competitive gap:** Existing apps (CareZone, Remindee, MemoryMinder) provide basic calendar reminders. None use AI for adaptive, personalized, step-by-step prompting with contextual awareness. CueGuide would be first-to-market with this approach.

**Revenue model alignment:**
- B2C: $14.99/month family plan (1 patient + up to 3 caregivers)
- B2B: $99/month per 10 patients (care facility license)
- B2B2C: Per-patient-per-month via insurance or health system partnerships

---

## Proposed Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React Native (Expo) | Cross-platform iOS/Android from a single codebase. Supports offline-first via AsyncStorage. |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + Edge Functions) | HIPAA-eligible with BAA. Row-Level Security for patient data isolation. Real-time sync for caregiver dashboard. |
| **AI** | Claude API (Anthropic) | Strongest safety and alignment profile for healthcare applications. Structured output for consistent prompt formatting. |
| **Text-to-Speech** | ElevenLabs API with device-native fallback | Natural-sounding voice for read-aloud. Falls back to on-device TTS when offline. |
| **Notifications** | Firebase Cloud Messaging | Reliable cross-platform push notifications. |
| **Analytics** | PostHog (self-hosted) | HIPAA-compliant usage analytics without third-party data exposure. |

**Key architectural decisions:**

1. **Offline-first:** All routines and AI-generated prompts are cached locally. The app works without internet, syncing when connectivity returns. This matters because elderly users often have unreliable connectivity.

2. **PHI anonymization for AI calls:** Patient context is de-identified before being sent to any LLM API. The API receives "a 68-year-old male who takes a blue heart pill" — never names, DOBs, or medical record numbers. Re-personalization happens client-side.

3. **Adaptive, not autonomous:** The scheduling algorithm suggests changes based on behavioral data but always requires caregiver approval. No part of the system makes autonomous decisions about a patient's routine.

---

## 30-Day MVP Roadmap

| Week | Deliverable |
|---|---|
| **Week 1** | Data model, authentication, routine CRUD. Caregiver can create and edit routines with ordered steps. |
| **Week 2** | Prompting engine: scheduled notifications trigger full-screen step-by-step Focus Mode. On-device text-to-speech. |
| **Week 3** | AI integration: Claude API generates personalized prompt language and contextual cues. Caregiver dashboard v1 with real-time status. |
| **Week 4** | Adaptive scheduling (heuristic engine). Caregiver alert system. Weekly summary report. Usability testing with 2–3 caregiver-patient pairs. |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Patient ignores or fears the device | High | High | Gradual onboarding with caregiver present. Familiar voice recordings. Gentle chimes only — no alarms. |
| Cognitive decline outpaces app utility | Medium | High | Graceful degradation: transitions to caregiver-only mode. Simplified interface per stage. |
| AI generates confusing prompts | Low | Critical | Safety filter on all AI output. Caregiver approval queue. Static prompt fallback. |
| HIPAA compliance gaps | Low | Critical | Supabase BAA. Encryption at rest + in transit. No PHI in logs. PHI anonymized before AI API calls. |
| Caregiver setup burden | High | Medium | Pre-built routine templates. 5-minute onboarding wizard. AI suggests routines from initial questionnaire. |
| Internet connectivity issues | Medium | Medium | Offline-first: all routines + prompts cached locally. Syncs when reconnected. |
