# CueGuide — Full Build Spec & PRD
## AI-Driven Daily Routine Assistant for Early Dementia
### For: Som Gollakota, CTO, AdaptAILabs

---

## PART 1: AGILE FEATURE DEFINITION

### Feature Statement

Enable people with early-stage dementia to complete daily routines independently through AI-generated, personalized step-by-step prompts — reducing caregiver intervention for routine activities while preserving patient autonomy and dignity.

### User Stories

#### US-1: Routine Creation (Caregiver)
**As a** caregiver, **I want to** create daily routines broken into simple sequential steps with optional media, **so that** my loved one receives clear guidance tailored to their specific habits.

**Acceptance Criteria:**
- Caregiver can create a routine with: name, category (hygiene, meals, medication, exercise, social), scheduled time, recurrence (daily, specific days, one-time)
- Each routine contains 2-15 ordered steps
- Each step has: instruction text (max 50 words), optional icon/emoji, optional audio note
- System provides pre-built templates for common routines (Morning Hygiene, Medication, Meal Prep, Bedtime) as starting points
- Caregiver can reorder, edit, duplicate, or remove steps
- Maximum 12 active routines per day (cognitive load limit)

#### US-2: AI-Powered Step-by-Step Prompting (Patient)
**As a** person with early dementia, **I want to** receive clear, calm, one-step-at-a-time prompts when it's time for an activity, **so that** I can do things on my own without waiting for someone to tell me.

**Acceptance Criteria:**
- When a routine is due, app enters full-screen "Focus Mode" — one step at a time, no distractions
- Each prompt shows: large text (min 24pt), icon/image, and a single "Done ✓" button
- AI personalizes the prompt language using the patient's name, familiar references, and context (time of day, weather, upcoming events)
- If no interaction within 2 minutes, prompt gently replays with audio
- After 3 unanswered prompts, caregiver receives a silent alert (patient never sees failure messaging)
- Patient can tap "Read Aloud" for text-to-speech
- Patient can tap "Help" to see an AI-generated expanded explanation
- Patient can tap "Skip" (logged for caregiver review, no judgment shown)
- Completion time per step is logged for adaptive scheduling

#### US-3: Caregiver Dashboard & Monitoring
**As a** caregiver, **I want to** see real-time progress and weekly patterns, **so that** I support only when truly needed and notice cognitive trends early.

**Acceptance Criteria:**
- Dashboard shows today's routines: upcoming / in progress / completed / missed / partial
- When patient is in a routine, caregiver sees which step they're on
- Push alert when: routine missed (after grace period), patient stuck on a step > 5 min, patient taps "Help"
- Weekly summary: completion rates, average time per routine (trend), most-skipped steps, best/worst time of day
- Caregiver can send encouragement message to patient's screen

#### US-4: Contextual AI Cue Generation
**As a** person with early dementia, **I want** prompts that feel personal and connected to my life, **so that** I feel oriented, not confused.

**Acceptance Criteria:**
- Morning greeting includes: day, date, weather, upcoming events ("Good morning, Robert. It's Tuesday. Sunny today. Sarah visits at 3 PM.")
- Medication prompts describe the pill visually and explain purpose simply ("Time for your small blue pill — it helps your heart stay healthy")
- AI varies phrasing over time to avoid habituation (same instruction, different words)
- All AI-generated content can be reviewed by caregiver before going live
- Offline fallback: if AI unavailable, static pre-written prompts are used

#### US-5: Adaptive Scheduling
**As a** caregiver, **I want** the app to learn when my loved one actually does things and adjust accordingly, **so that** reminders arrive at the right moment.

**Acceptance Criteria:**
- System tracks actual completion times vs. scheduled times
- After 5+ data points, suggests adjusted schedule (e.g., "Robert usually starts breakfast at 8:15, not 8:00. Adjust?")
- Caregiver approves or rejects adjustments
- Maximum shift: ±15 minutes per week (prevents drift)
- Displays reason for suggestion ("Based on Robert's pattern this week")

### Dependencies

| Dependency | Type | Priority |
|---|---|---|
| LLM API (Claude preferred) | External service | P0 — core AI |
| Database (Supabase/Firebase) | Infrastructure | P0 — data persistence |
| Push notifications | External service | P1 — caregiver alerts |
| HIPAA-compliant hosting | Infrastructure | P0 — required for PHI |
| Text-to-speech | On-device or API | P1 — accessibility |
| Weather API | External | P2 — contextual prompts |

### Business Value

- **6.9M Americans** living with Alzheimer's. Early-stage = largest addressable segment.
- Caregivers spend **5+ hours/day** on supervision. Automating routine prompting saves 1-2 hrs/day.
- **Delays institutional care** by 6-18 months (estimated $60K-180K savings per family).
- No competitor does AI-personalized step-by-step prompting. Existing apps (CareZone, Remindee, MemoryMinder) are basic reminders with no AI adaptation.
- Revenue model: $14.99/mo family plan, $99/mo per 10 patients (care facility), or per-patient-per-month via insurance partners.

---

## PART 2: TECHNOLOGY STACK & ARCHITECTURE

### Recommended Stack (Production)

| Layer | Technology | Why |
|---|---|---|
| Frontend | React Native (Expo) | Cross-platform iOS/Android. Large-print design system. Offline-first. |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Edge Functions) | HIPAA-eligible with BAA. RLS for data isolation. Real-time sync for caregiver dashboard. |
| AI | Claude API (Anthropic) | Best safety/alignment for healthcare. Structured output for prompts. |
| TTS | ElevenLabs API or device-native | Natural voice for read-aloud. Fallback to on-device TTS. |
| Notifications | Firebase Cloud Messaging | Cross-platform push notifications. |
| Analytics | PostHog (self-hosted) | HIPAA-compliant usage analytics. |
| Monitoring | Sentry | Error tracking + performance. |

### System Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React Native (Expo) — Offline-First            │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Patient   │  │ Caregiver│  │ Onboarding   │  │
│  │ Focus     │  │ Dashboard│  │ & Setup      │  │
│  │ Mode      │  │          │  │              │  │
│  └─────┬────┘  └────┬─────┘  └──────────────┘  │
│        │             │                           │
└────────┼─────────────┼──────────────────────────┘
         │             │
    ┌────▼─────────────▼────┐
    │    SUPABASE BACKEND    │
    │                        │
    │  ┌──────────────────┐  │
    │  │  PostgreSQL       │  │
    │  │  - patients       │  │
    │  │  - routines       │  │
    │  │  - steps          │  │
    │  │  - completions    │  │
    │  │  - profiles       │  │
    │  └──────────────────┘  │
    │                        │
    │  ┌──────────────────┐  │
    │  │  Edge Functions   │  │
    │  │  - /generate-cue  │  │
    │  │  - /adapt-schedule│  │
    │  │  - /weekly-report │  │
    │  └────────┬─────────┘  │
    └───────────┼────────────┘
                │
         ┌──────▼──────┐
         │  Claude API  │
         │  (Anthropic) │
         └─────────────┘
```

### Data Model

```sql
-- Patient profile (the person with dementia)
patients (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  preferred_name text,           -- "Dad", "Robert", "Grandpa"
  date_of_birth date,
  stage text DEFAULT 'early',    -- early, moderate
  preferences jsonb,             -- {voice: "female", fontSize: 28, theme: "warm"}
  context_notes text,            -- "Lives alone. Cat named Whiskers. Daughter Sarah visits Tuesdays."
  created_by uuid REFERENCES caregivers(id),
  created_at timestamptz DEFAULT now()
)

-- Caregiver account
caregivers (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  relationship text,             -- "daughter", "spouse", "aide"
  phone text,
  notification_prefs jsonb,
  created_at timestamptz DEFAULT now()
)

-- Routine definition
routines (
  id uuid PRIMARY KEY,
  patient_id uuid REFERENCES patients(id),
  name text NOT NULL,            -- "Morning Hygiene"
  category text NOT NULL,        -- hygiene, meals, medication, exercise, social
  scheduled_time time NOT NULL,
  recurrence text[] DEFAULT '{daily}', -- ['monday','wednesday','friday'] or ['daily']
  is_active boolean DEFAULT true,
  template_source text,          -- null or 'morning_hygiene_template'
  created_by uuid REFERENCES caregivers(id),
  created_at timestamptz DEFAULT now()
)

-- Individual steps within a routine
steps (
  id uuid PRIMARY KEY,
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE,
  position integer NOT NULL,     -- ordering
  instruction text NOT NULL,     -- "Brush your teeth for 2 minutes"
  help_text text,                -- expanded explanation
  icon text,                     -- emoji or icon name: "🪥"
  image_url text,                -- optional photo
  audio_url text,                -- optional caregiver voice recording
  estimated_seconds integer DEFAULT 120,
  created_at timestamptz DEFAULT now()
)

-- Completion logs (the gold mine for adaptive scheduling)
completions (
  id uuid PRIMARY KEY,
  routine_id uuid REFERENCES routines(id),
  patient_id uuid REFERENCES patients(id),
  date date NOT NULL,
  status text NOT NULL,          -- 'completed', 'partial', 'missed', 'in_progress'
  started_at timestamptz,
  completed_at timestamptz,
  steps_completed integer,
  steps_total integer,
  step_times jsonb,              -- [{step_id, started_at, completed_at, skipped, help_requested}]
  ai_prompts_used jsonb,         -- log of AI-generated text for audit
  created_at timestamptz DEFAULT now()
)

-- Adaptive schedule suggestions
schedule_adjustments (
  id uuid PRIMARY KEY,
  routine_id uuid REFERENCES routines(id),
  suggested_time time NOT NULL,
  reason text,                   -- "Robert starts 15 min later on average"
  confidence float,              -- 0-1
  status text DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamptz DEFAULT now()
)
```

### AI Prompt Engineering (Claude Integration)

**System prompt for cue generation:**

```
You are CueGuide, a compassionate AI assistant helping people with early-stage
dementia complete daily routines. You generate step-by-step prompts that are:

- Warm and encouraging, never clinical or condescending
- Short (1-2 sentences max per step)
- Concrete and specific (name objects by color/shape, name rooms)
- Personalized using the patient's preferred name and context
- Oriented in time (include day, date, weather when relevant)
- Varied in phrasing (don't repeat the exact same words each day)

You never use:
- Complex sentences or jargon
- Negative framing ("Don't forget" → "Time to...")
- Urgent or alarming language
- References to their condition

Output format: JSON with fields {greeting, steps: [{text, audio_text}], encouragement}
```

**Example API call:**

```json
{
  "patient_name": "Robert",
  "preferred_name": "Dad",
  "routine_name": "Morning Medication",
  "steps": [
    {"instruction": "Take heart medication", "icon": "💊"},
    {"instruction": "Take vitamin D", "icon": "☀️"},
    {"instruction": "Drink full glass of water", "icon": "🥤"}
  ],
  "context": {
    "day": "Tuesday",
    "date": "May 6, 2026",
    "weather": "Sunny, 72°F",
    "upcoming": "Sarah visits at 3 PM",
    "notes": "Blue pill = lisinopril. Takes meds with breakfast."
  },
  "previous_prompts": ["last 3 days of prompts for variation"]
}
```

**Expected AI output:**

```json
{
  "greeting": "Good morning, Dad. It's Tuesday, May 6th — sunny and warm today. Sarah is coming to visit this afternoon!",
  "steps": [
    {
      "text": "Time for your small blue heart pill. It's in the yellow pill box on the kitchen counter.",
      "audio_text": "Time for your small blue heart pill, Dad. Look for the yellow pill box on the kitchen counter."
    },
    {
      "text": "Now your vitamin D — the white round one. It helps keep your bones strong.",
      "audio_text": "Now take your vitamin D. It's the white round pill. It helps keep your bones strong."
    },
    {
      "text": "Have a nice full glass of water with breakfast. Your blue cup is by the sink.",
      "audio_text": "Finish up with a full glass of water. Your blue cup is right by the sink."
    }
  ],
  "encouragement": "All done with your morning meds. You're taking great care of yourself, Dad."
}
```

---

## PART 3: DEMO APP BUILD SPEC

### What to Build (for Som's evaluation)

A **single-page web application** (React or plain HTML/JS) that demonstrates the core loop. This is NOT the production app — it's a working proof-of-concept that shows:

1. **The caregiver creates a routine** (or selects a template)
2. **AI generates personalized prompts** for each step
3. **Patient walks through the routine** in Focus Mode (step by step)
4. **Caregiver sees the dashboard** with completion status
5. **Adaptive scheduling** shows a suggestion based on logged data

### Demo Architecture

```
Single HTML file or React app (Vite)
├── Caregiver View
│   ├── Patient Profile Setup (name, context, preferences)
│   ├── Routine Creator (templates + custom)
│   ├── Dashboard (today's routines, status, completion %)
│   └── Schedule Adjustment Review
├── Patient View (Focus Mode)
│   ├── Greeting Screen (day, date, weather, context)
│   ├── Step-by-Step Prompts (one at a time, large text)
│   ├── Done / Help / Skip buttons
│   └── Completion Celebration
├── AI Integration
│   ├── Claude API call for personalized prompt generation
│   ├── Prompt caching (don't re-call for demo replays)
│   └── Fallback static prompts if no API key
└── Data
    ├── In-memory state (no database for demo)
    ├── Sample patient profile pre-loaded
    └── Sample completion history for dashboard charts
```

### UI/UX Requirements

#### Patient View (Focus Mode)
- **Background:** Soft warm color (cream/light blue). No harsh whites.
- **Font:** Sans-serif, minimum 28px body, 40px headings
- **Layout:** Single centered card. One step visible at a time. No scrolling.
- **Buttons:** Large (minimum 60px height), high contrast, rounded corners
  - "Done ✓" = primary green, full width
  - "Help 💡" = secondary, smaller, bottom-left
  - "Skip →" = ghost/text button, bottom-right
  - "Read Aloud 🔊" = icon button, top-right
- **Progress:** Gentle progress bar or dots at top ("Step 2 of 5")
- **Transitions:** Smooth fade between steps. No sudden changes.
- **No clutter:** No navigation bars, no settings icons, no back buttons in Focus Mode
- **Celebration:** On completion, show warm message + gentle animation (confetti is too much — use a soft glow or checkmark)

#### Caregiver View
- **Clean dashboard layout** — cards for each routine showing status
- **Color coding:** Green = completed, Blue = in progress, Yellow = upcoming, Red = missed
- **Charts:** Simple bar or line chart showing completion rates over past 7 days (use Chart.js or Recharts)
- **Routine creator:** Simple form with drag-to-reorder steps
- **Patient profile editor:** Name, preferred name, context notes, preferences

#### Navigation
- Toggle between "Patient View" and "Caregiver View" via tab/button at top
- In production this would be separate apps/logins; for demo, a simple toggle is fine

### Sample Data (Pre-loaded)

**Patient Profile:**
```json
{
  "name": "Robert Chen",
  "preferredName": "Dad",
  "dateOfBirth": "1958-03-15",
  "stage": "early",
  "context": "Lives with wife Margaret in San Jose. Orange tabby cat named Ginger. Daughter Sarah visits Tuesdays and Thursdays. Takes lisinopril (small blue pill) and vitamin D (white round). Keeps meds in yellow pill box on kitchen counter. Blue cup by the sink is his favorite. Loves morning walks in the neighborhood. Retired engineer — likes when things are organized.",
  "preferences": {
    "fontSize": 28,
    "theme": "warm",
    "voice": "female"
  }
}
```

**Sample Routines:**

1. **Morning Hygiene** (8:00 AM, Daily)
   - Step 1: "Wash your face with warm water" 🚿
   - Step 2: "Brush your teeth for 2 minutes" 🪥
   - Step 3: "Comb your hair" 💇
   - Step 4: "Put on your clothes for the day — Margaret laid them out on the bed" 👔
   - Step 5: "Put on your watch and glasses" 👓

2. **Morning Medication** (8:30 AM, Daily)
   - Step 1: "Take your small blue heart pill from the yellow box" 💊
   - Step 2: "Take your vitamin D — the white round one" ☀️
   - Step 3: "Drink a full glass of water" 🥤

3. **Afternoon Walk** (2:00 PM, Mon/Wed/Fri)
   - Step 1: "Put on your walking shoes — they're by the front door" 👟
   - Step 2: "Grab your hat and sunglasses" 🧢
   - Step 3: "Take your phone and house key" 🔑
   - Step 4: "Walk around the block — about 15 minutes" 🚶
   - Step 5: "When you get home, have a glass of water" 💧

4. **Bedtime Routine** (9:00 PM, Daily)
   - Step 1: "Brush your teeth" 🪥
   - Step 2: "Change into your pajamas" 🛏️
   - Step 3: "Make sure the front door is locked" 🔒
   - Step 4: "Set your phone on the nightstand to charge" 🔌
   - Step 5: "Turn off the lights — goodnight, Dad" 🌙

**Sample Completion History (for dashboard charts):**
```json
[
  {"date": "2026-04-28", "routine": "Morning Hygiene", "status": "completed", "minutes": 22, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-28", "routine": "Morning Medication", "status": "completed", "minutes": 5, "stepsCompleted": 3, "stepsTotal": 3},
  {"date": "2026-04-28", "routine": "Afternoon Walk", "status": "partial", "minutes": 8, "stepsCompleted": 3, "stepsTotal": 5},
  {"date": "2026-04-28", "routine": "Bedtime Routine", "status": "completed", "minutes": 15, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-27", "routine": "Morning Hygiene", "status": "completed", "minutes": 25, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-27", "routine": "Morning Medication", "status": "completed", "minutes": 4, "stepsCompleted": 3, "stepsTotal": 3},
  {"date": "2026-04-27", "routine": "Afternoon Walk", "status": "missed", "minutes": 0, "stepsCompleted": 0, "stepsTotal": 5},
  {"date": "2026-04-27", "routine": "Bedtime Routine", "status": "completed", "minutes": 18, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-26", "routine": "Morning Hygiene", "status": "completed", "minutes": 20, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-26", "routine": "Morning Medication", "status": "completed", "minutes": 6, "stepsCompleted": 3, "stepsTotal": 3},
  {"date": "2026-04-26", "routine": "Afternoon Walk", "status": "completed", "minutes": 22, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-26", "routine": "Bedtime Routine", "status": "partial", "minutes": 10, "stepsCompleted": 3, "stepsTotal": 5},
  {"date": "2026-04-25", "routine": "Morning Hygiene", "status": "completed", "minutes": 23, "stepsCompleted": 5, "stepsTotal": 5},
  {"date": "2026-04-25", "routine": "Morning Medication", "status": "missed", "minutes": 0, "stepsCompleted": 0, "stepsTotal": 3},
  {"date": "2026-04-25", "routine": "Afternoon Walk", "status": "completed", "minutes": 20, "stepsCompleted": 5, "stepsTotal": 5}
]
```

**Sample Schedule Adjustment:**
```json
{
  "routine": "Morning Hygiene",
  "currentTime": "08:00",
  "suggestedTime": "08:15",
  "reason": "Robert consistently starts his morning hygiene around 8:12-8:18 AM. Adjusting to 8:15 would better match his natural rhythm.",
  "dataPoints": 12,
  "confidence": 0.85
}
```

### AI Integration for Demo

**Option A (With API Key):**
- Use Claude API to generate personalized prompts in real-time
- Pass patient profile + routine steps + context → get personalized output
- Cache results so demo doesn't re-call on every step

**Option B (Without API Key — Fallback):**
- Pre-generate a set of personalized prompts and store them as JSON
- Demo still shows the "Generating personalized prompt..." loading state
- Switches to cached prompts after 1 second
- This way the demo works offline and Som can run it without needing an API key

**Implement BOTH options.** Default to Option B (works out of the box), with a settings toggle to "Enable Live AI" that accepts a Claude API key.

### Key Interactions to Demo

1. **Caregiver opens the app → sees dashboard with today's routines and completion stats**
2. **Caregiver clicks "Create Routine" → fills in details, adds steps (or uses template)**
3. **Caregiver clicks "Preview as Patient" → enters Focus Mode**
4. **Focus Mode: greeting screen → first step → patient taps Done → next step → completion**
5. **Back to dashboard → routine now shows as "Completed" with time logged**
6. **Caregiver views "Weekly Insights" → sees charts + adaptive schedule suggestion**
7. **Caregiver approves schedule adjustment → time updates**

### What NOT to Build (Keep it Focused)

- No real authentication (use a simple "I'm the Caregiver" / "I'm Robert" toggle)
- No real database (in-memory state is fine)
- No real push notifications (show a mock notification in the UI)
- No real TTS (use browser's built-in speechSynthesis API, or just show a "playing audio" indicator)
- No real weather API (hardcode "Sunny, 72°F" or use a free API if easy)

---

## PART 4: TECHNICAL ARCHITECTURE DOC (Over-Delivery for Som)

### HIPAA Compliance Architecture

```
┌─────────────────────────────────────────┐
│         HIPAA Compliance Layer           │
│                                          │
│  ✓ Encryption at rest (AES-256)          │
│  ✓ Encryption in transit (TLS 1.3)       │
│  ✓ Row-Level Security (patient isolation)│
│  ✓ Audit logging (all data access)       │
│  ✓ BAA with cloud provider (Supabase)    │
│  ✓ No PHI in application logs            │
│  ✓ Data retention policies (configurable)│
│  ✓ Right to delete (GDPR + HIPAA)        │
│  ✓ Minimum necessary access principle    │
│  ✓ AI prompts: no PHI sent to LLM       │
│    (patient context is anonymized before  │
│     API call; re-personalized client-side)│
└─────────────────────────────────────────┘
```

**Critical design choice:** Patient PHI is anonymized before sending to Claude API. The API receives "The patient is a 68-year-old male who takes a blue heart pill." NOT "Robert Chen, DOB 3/15/1958, takes lisinopril 10mg." Re-personalization happens client-side.

### Adaptive Scheduling Algorithm

```python
# Simplified heuristic (not ML — intentionally simple for V1)

def suggest_new_time(routine_id, completions):
    """
    Given a routine's completion history, suggest an adjusted time.
    Uses weighted moving average — recent days weighted more.
    """
    # Get actual start times from last 14 days
    actual_starts = [c.started_at.time() for c in completions
                     if c.status in ('completed', 'partial')
                     and c.started_at is not None]

    if len(actual_starts) < 5:
        return None  # Not enough data

    # Weighted moving average (recent = higher weight)
    weights = [1.2 ** i for i in range(len(actual_starts))]
    weighted_avg = sum(t * w for t, w in zip(actual_starts, weights)) / sum(weights)

    # Round to nearest 5 minutes
    suggested = round_to_5min(weighted_avg)

    # Cap drift at ±15 min from original
    original = routine.scheduled_time
    if abs(suggested - original) > timedelta(minutes=15):
        suggested = original + timedelta(minutes=15) * sign(suggested - original)

    # Only suggest if meaningful difference (>= 5 min)
    if abs(suggested - original) < timedelta(minutes=5):
        return None

    return {
        "suggested_time": suggested,
        "confidence": min(len(actual_starts) / 14, 1.0),
        "reason": f"Based on {len(actual_starts)} days of data, {patient.preferred_name} typically starts this routine around {suggested.strftime('%I:%M %p')}."
    }
```

### Future Roadmap (Phase 2-3)

| Phase | Features | Timeline |
|---|---|---|
| **Phase 1 (MVP)** | Routine CRUD, AI prompts, basic dashboard, adaptive scheduling | 4 weeks |
| **Phase 2** | Caregiver voice recordings, multi-patient support, care team collaboration, medication integration (pharmacy APIs) | 8 weeks |
| **Phase 3** | Wearable integration (Apple Watch/Fitbit for activity detection), smart home sensors (motion/door), family sharing, clinical export for doctor visits | 12 weeks |

---

## PART 5: EMAIL TO SOM (Ready to Send)

**Subject:** CueGuide — Dementia Routine Assistant: Feature Spec + Working Demo

**Body:**

Hi Som,

Thanks again for the evaluation scenario. I enjoyed digging into this — it's a meaningful problem space and I can see why AdaptAILabs is focused here.

I've put together three deliverables:

1. **Agile Feature Spec** — Feature statement, 5 user stories with acceptance criteria, dependencies, business value, and a 30-day MVP roadmap.

2. **Working Demo App** — A web application you can run in your browser. It demonstrates the full core loop: caregiver creates routines, AI generates personalized step-by-step prompts, patient walks through Focus Mode, and the caregiver dashboard shows completion analytics + adaptive scheduling suggestions. The demo works offline with pre-generated prompts, but also supports live AI integration with an API key.

3. **Technical Architecture** — System design, data model, HIPAA compliance approach, AI prompt engineering strategy, and adaptive scheduling algorithm. This is how I'd approach building it for production.

A few design decisions worth highlighting:
- **PHI anonymization before AI calls** — patient context is de-identified before sending to any LLM API, then re-personalized client-side. This protects patient data while still enabling personalization.
- **Offline-first architecture** — routines and prompts are cached locally. The app works without internet, which matters for elderly users with unreliable connectivity.
- **Adaptive, not prescriptive** — the scheduling algorithm suggests changes based on actual behavior patterns, but always requires caregiver approval. No autonomous changes to a patient's routine.

Happy to walk you through everything on a 30-minute video call whenever works for you. I'm flexible on timing — just send me a couple of options.

Best,
Dhruv

---

## INSTRUCTIONS FOR CLAUDE CODE

Paste this into Claude Code:

```
Build a React (Vite) web application called CueGuide based on the spec in
/path/to/CUEGUIDE_BUILD_SPEC.md

Key requirements:
1. Single-page app with two views: Caregiver Dashboard and Patient Focus Mode
2. Toggle between views with a tab/button at the top
3. Pre-loaded with sample patient "Robert Chen" and 4 routines
4. AI integration: Claude API for personalized prompt generation (with fallback to pre-generated prompts if no API key)
5. Patient Focus Mode: full-screen, one step at a time, large text (28px+), warm colors, Done/Help/Skip buttons
6. Caregiver Dashboard: routine status cards, 7-day completion chart (use Recharts), adaptive schedule suggestions
7. Routine creator: form to create new routines with steps (drag to reorder)
8. Use Tailwind CSS for styling
9. Use browser speechSynthesis API for Read Aloud
10. All data in-memory (no database). Pre-load the sample data from the spec.
11. Settings panel with optional Claude API key input for live AI generation
12. Mobile-responsive (this would be used on tablets primarily)

The demo should work perfectly out of the box with zero configuration. Som (CTO, 20+ years dev experience) will be evaluating the code quality, architecture, and AI integration approach.

Read the full spec file for patient profile, sample routines, sample completion data, AI prompt templates, and UI/UX requirements.
```
