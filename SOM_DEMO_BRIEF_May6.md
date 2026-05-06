# Som Demo Brief — May 6, 2026 | 7:30 AM HKT
### TACTICAL. Read this before the call. 5 minutes.

---

## The Setup

Suman told you privately: "Your job is to make Som happy." Som doesn't know Suman said this. Act as if you're independently delivering great work — not performing for Suman's benefit.

Som is a **hardcore full-stack developer** (CS degree, not "somewhat technical"). Suman corrected you on this. Treat him with technical respect. He will spot shallow work instantly.

Som is **excited.** Suman confirmed this. You have goodwill — don't squander it by overselling.

---

## What to Show (Order Matters)

### 1. Live Demo First (2-3 min)
- Open the deployed URL
- Walk through Patient Focus Mode: show "Robert" getting his morning greeting, stepping through a routine one step at a time, the Done/Help/Skip buttons
- Switch to Caregiver Dashboard: show status cards, completion analytics, the adaptive scheduling suggestion
- **Let him click around.** Don't narrate every pixel. Developers respect clean UX that speaks for itself.

### 2. Technical Architecture (3-5 min)
- Open the Technical Architecture PDF
- Walk through the PHI anonymization pipeline — this is your smartest design decision. Explain: "Patient data gets stripped before it ever hits the LLM. Re-personalization happens client-side. The model never sees a name, DOB, or medical record number."
- Show the data model briefly — 6 tables, clean normalization, RLS for multi-tenant isolation
- Mention the adaptive scheduling algorithm: "It's a weighted moving average, not ML. Small data volume makes ML unreliable. Caregivers need to understand and trust the suggestions. Deterministic is safer in healthcare."

### 3. Feature Spec (1-2 min)
- Mention you wrote a full Agile spec with 5 user stories, acceptance criteria, risk matrix, and 30-day MVP roadmap
- Don't read it to him. Hand it over. "This is how I'd scope the MVP if we were building it for production."

---

## What to Say

**Opening (after hellos):**
"I spent real time on this. Dementia care is a space where AI can make a meaningful difference, and I wanted to go beyond just answering the question — I wanted to show how I think about building something like this."

**Key phrases to hit:**
- "PHI never reaches the LLM" — say this explicitly
- "Adaptive, not autonomous" — caregivers approve everything
- "Offline-first" — routines cache locally, works without internet
- "I'd build this on Supabase with Row-Level Security for multi-tenant patient isolation"
- "The AI varies phrasing daily to avoid habituation — same instruction, different words"

**If he asks how long this took:**
"About a day of focused work. The spec took the most thought — the architecture decisions around HIPAA and the anonymization pipeline required real research."

**If he asks about your AI/LLM experience:**
Focus on implementation, not theory. "I've built production AI workflows — prompt engineering pipelines, structured output parsing, context management. The key isn't calling an API, it's designing the data flow so the AI gets the right context without the wrong data."

---

## What NOT to Say

- **Don't mention Suman told you anything.** "It's between you and me" — Suman's exact words.
- **Don't say "marketing" in any context.** Not even "I've done marketing automation." Reframe: "I've built AI-powered workflow automation and content systems."
- **Don't oversell.** Som is technical. Puffery will backfire. Let the work speak.
- **Don't pitch for a role or contract.** Let him come to you. The demo IS the pitch.
- **Don't ask about compensation.** Way too early. Suman handles that track.
- **Don't compare yourself to Samar.** Different lanes. If Samar comes up, say: "I think his compliance engine work is interesting — different problem domain but the architectural thinking is solid."

---

## Som's Evaluation Criteria (Inferred)

Based on his email and Suman's feedback, Som is checking:

| Criterion | How to Win |
|-----------|-----------|
| **Can Dhruv build?** | The working demo answers this. Let him click it. |
| **Does he think architecturally?** | The HIPAA compliance design + data model shows systems thinking |
| **Does he understand the domain?** | Mention: "6.9M Americans with Alzheimer's. Early-stage is the addressable window where tech can extend independence." |
| **Can he work independently?** | You built this without hand-holding. That's the proof. |
| **Is he someone I'd want to work with?** | Be respectful, be curious about HIS vision, ask good questions |

---

## Questions to Ask Som

Ask 2-3 of these. They show you're thinking beyond the demo:

1. "What's your vision for the first real user test? Are you thinking caregiver-patient pairs from a specific facility, or individual families?"
2. "How are you thinking about the data collection phase — do we need a certain volume of routine completions before the adaptive scheduling becomes useful?"
3. "Is there a specific compliance framework you're targeting first, or is HIPAA the primary gate for MVP?"
4. "What's your take on the voice interaction angle — should we prioritize TTS early, or is visual-first the right MVP scope?"

**DO NOT ask more than 3.** You're there to show work, not interrogate.

---

## After the Call

- If it went well: text Suman a brief update. "Great call with Som. He seemed engaged. Looking forward to next steps."
- Wait for Som/Suman to define next steps. Don't propose a timeline or contract — let them come to you with the scope.
- If Som gives feedback or asks for changes, respond fast. Speed of iteration is your edge at 23.

---

## Confidence Level

You have a strong hand. The deliverables are objectively impressive for what was asked. Som expected a spec — you gave him a spec, a technical architecture, AND a working demo. That's over-delivery, which is exactly what Suman coached you toward without saying it directly.

The only way this goes wrong is if:
1. The demo doesn't load (test the URL one more time right now)
2. You talk too much and sound like you're selling
3. You accidentally signal that Suman coached you

Keep it tight. Let the work do the talking. You've got this.
