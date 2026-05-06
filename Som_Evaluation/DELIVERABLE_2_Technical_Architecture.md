# CueGuide — Technical Architecture
### Prepared by Dhruv Jain | May 2026

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│          React Native (Expo) — Offline-First         │
│                                                      │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────┐ │
│  │  Patient      │  │  Caregiver    │  │ Onboarding│ │
│  │  Focus Mode   │  │  Dashboard    │  │ Wizard    │ │
│  │              │  │               │  │           │ │
│  │ - Greeting    │  │ - Status cards│  │ - Profile │ │
│  │ - Step prompt │  │ - Live view   │  │ - Routine │ │
│  │ - Done/Help   │  │ - Charts      │  │   setup   │ │
│  │ - TTS         │  │ - Alerts      │  │ - Prefs   │ │
│  └──────┬───────┘  └──────┬────────┘  └───────────┘ │
│         │                  │                          │
│    ┌────▼──────────────────▼─────┐                   │
│    │  Local Cache (AsyncStorage)  │                   │
│    │  Routines + prompts offline  │                   │
│    └────────────┬────────────────┘                   │
└─────────────────┼───────────────────────────────────┘
                  │ Sync when online
         ┌────────▼────────────┐
         │   SUPABASE BACKEND   │
         │                      │
         │  PostgreSQL + RLS    │
         │  ┌────────────────┐  │
         │  │ patients        │  │
         │  │ caregivers      │  │
         │  │ routines        │  │
         │  │ steps           │  │
         │  │ completions     │  │
         │  │ schedule_adj    │  │
         │  └────────────────┘  │
         │                      │
         │  Edge Functions      │
         │  ┌────────────────┐  │
         │  │ /generate-cue   │  │
         │  │ /adapt-schedule  │  │
         │  │ /weekly-report   │  │
         │  │ /alert           │  │
         │  └───────┬────────┘  │
         │          │           │
         │  Realtime (WebSocket)│
         └──────────┼──────────┘
                    │
            ┌───────▼───────┐
            │  Claude API    │
            │  (Anthropic)   │
            │                │
            │  Receives:     │
            │  - Anonymized  │
            │    patient ctx │
            │  - Routine     │
            │    steps       │
            │  - Context     │
            │    (weather,   │
            │     calendar)  │
            │                │
            │  Returns:      │
            │  - Personalized│
            │    prompt text  │
            │  - Audio text   │
            │  - Greeting     │
            └────────────────┘
```

---

## Data Model

### patients
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Unique patient identifier |
| name | text | Full legal name |
| preferred_name | text | What they like to be called ("Dad", "Robert") |
| date_of_birth | date | For age-appropriate interactions |
| stage | text | 'early' or 'moderate' |
| context_notes | text | Free-form context: living situation, pets, family, landmarks, favorite objects |
| preferences | jsonb | Font size, theme (warm/cool), voice preference |
| created_by | uuid (FK) | Caregiver who set up the profile |
| created_at | timestamptz | Record creation timestamp |

### caregivers
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Unique caregiver identifier |
| user_id | uuid (FK) | Links to Supabase Auth |
| name | text | Caregiver's name |
| relationship | text | "daughter", "spouse", "aide" |
| phone | text | For SMS fallback alerts |
| notification_prefs | jsonb | Quiet hours, max alerts/hr, channels |

### routines
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Unique routine identifier |
| patient_id | uuid (FK) | Which patient this routine belongs to |
| name | text | "Morning Hygiene", "Evening Medication" |
| category | text | hygiene, meals, medication, exercise, social |
| scheduled_time | time | When the routine should trigger |
| recurrence | text[] | ['daily'] or ['monday','wednesday','friday'] |
| is_active | boolean | Can be toggled off without deleting |
| template_source | text | null or template ID if created from template |
| created_by | uuid (FK) | Which caregiver created this |

### steps
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Unique step identifier |
| routine_id | uuid (FK) | Parent routine (CASCADE delete) |
| position | integer | Ordering within the routine |
| instruction | text | "Brush your teeth for 2 minutes" (max 50 words) |
| help_text | text | Expanded explanation for "Help" button |
| icon | text | Emoji or icon reference |
| image_url | text | Optional photo of the task/object |
| audio_url | text | Optional caregiver voice recording |
| estimated_seconds | integer | Expected duration (default 120) |

### completions
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Unique completion record |
| routine_id | uuid (FK) | Which routine was attempted |
| patient_id | uuid (FK) | Which patient |
| date | date | The calendar date |
| status | text | 'completed', 'partial', 'missed', 'in_progress' |
| started_at | timestamptz | When the patient started |
| completed_at | timestamptz | When they finished (null if incomplete) |
| steps_completed | integer | Count of steps marked "Done" |
| steps_total | integer | Total steps in the routine |
| step_times | jsonb | Per-step timing data for analytics |
| ai_prompts_used | jsonb | Audit log of AI-generated text |

### schedule_adjustments
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Unique adjustment record |
| routine_id | uuid (FK) | Which routine to adjust |
| suggested_time | time | Proposed new time |
| reason | text | Human-readable explanation |
| confidence | float | 0–1, based on data volume and consistency |
| status | text | 'pending', 'approved', 'rejected' |

---

## AI Integration Design

### Prompt Engineering Pipeline

```
Patient Profile     Routine Steps     Real-time Context
     │                   │                  │
     ▼                   ▼                  ▼
┌─────────────────────────────────────────────┐
│           ANONYMIZATION LAYER                │
│                                              │
│  "Robert Chen" → "the patient"               │
│  DOB 3/15/1958 → "68 years old"             │
│  lisinopril 10mg → "blue heart pill"         │
│  (PHI stripped, descriptors preserved)        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              CLAUDE API CALL                 │
│                                              │
│  System: "You are CueGuide, a compassionate  │
│  AI assistant helping people with early-stage │
│  dementia. Generate warm, simple, personal   │
│  step-by-step prompts..."                    │
│                                              │
│  Input: anonymized context + steps           │
│  Output: structured JSON                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         RE-PERSONALIZATION (Client-side)      │
│                                              │
│  "the patient" → "Dad"                       │
│  Generic refs → familiar object names        │
│  Inject: real weather, calendar events       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
            Personalized Prompt
            Displayed to Patient
```

### Why This Matters

Patient PHI never reaches the LLM API. The model works with anonymized descriptors, and re-personalization happens entirely on the client device. This satisfies the HIPAA Minimum Necessary standard and eliminates the risk of PHI appearing in third-party API logs.

### AI Output Structure

```json
{
  "greeting": "Good morning, Dad. It's Tuesday, May 6th — sunny and warm today.",
  "steps": [
    {
      "text": "Time for your small blue heart pill. It's in the yellow box on the kitchen counter.",
      "audio_text": "Time for your small blue heart pill, Dad. Look for the yellow box on the kitchen counter."
    }
  ],
  "encouragement": "All done with your morning meds. You're doing great, Dad."
}
```

The `audio_text` field is slightly more conversational than `text` because spoken language benefits from additional warmth and address by name.

---

## Adaptive Scheduling Algorithm

The algorithm uses a weighted moving average of actual routine start times, with recent days weighted more heavily. It is deliberately simple — a heuristic, not ML — because:

1. Small data volume (days, not thousands of records) makes ML unreliable
2. Caregivers need to understand and trust the suggestions
3. Deterministic behavior is safer in a healthcare context

```
Input:  Last 14 days of actual start times for a routine
Weight: Recent days weighted 1.2x per day (exponential decay)
Output: Suggested new time (rounded to nearest 5 min)

Constraints:
- Minimum 5 data points before any suggestion
- Maximum drift: ±15 min from original scheduled time per week
- Minimum change: 5 min (don't suggest trivial adjustments)
- Always requires caregiver approval
```

**Example output:**
> "Based on 12 days of data, Robert usually starts Morning Hygiene around 8:15 AM instead of 8:00 AM. Adjusting the schedule to 8:15 would better match his natural rhythm. Confidence: 85%."

---

## HIPAA Compliance Architecture

| Requirement | Implementation |
|---|---|
| Encryption at rest | Supabase PostgreSQL with AES-256 |
| Encryption in transit | TLS 1.3 for all API communication |
| Access control | Row-Level Security — each caregiver sees only their patients |
| Audit logging | All data access logged with timestamp, user, action |
| BAA | Business Associate Agreement with Supabase |
| PHI in AI calls | Anonymized before API call, re-personalized client-side |
| PHI in logs | Application logs contain no identifiable patient data |
| Data retention | Configurable per account, default 2 years |
| Right to delete | Full data deletion on caregiver request (GDPR + HIPAA) |
| Minimum necessary | Each role sees only the data needed for their function |

---

## Security Considerations

- **Authentication:** Supabase Auth with email/password + optional MFA for caregivers
- **Authorization:** Role-based (caregiver, patient, admin) with RLS policies
- **API keys:** Stored in environment variables, never client-side
- **Patient device:** No login required on patient device after initial pairing (reduces friction). Device is paired to caregiver account via one-time code.
- **Session management:** Long-lived sessions on patient device (don't force re-login on a dementia patient). Caregiver can remotely revoke device access.

---

## Future Roadmap

| Phase | Timeline | Features |
|---|---|---|
| **Phase 1 — MVP** | 4 weeks | Routine CRUD, AI prompts, caregiver dashboard, adaptive scheduling |
| **Phase 2 — Depth** | +8 weeks | Multi-patient support, caregiver voice recordings, medication integration (pharmacy APIs), care team collaboration |
| **Phase 3 — Ecosystem** | +12 weeks | Apple Watch/Fitbit integration (activity detection), smart home sensors (motion, door), family sharing, clinical export for doctor visits |
