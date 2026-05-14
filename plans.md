---
aliases: [plans, roadmap, master-plan]
tags: [project, plan, roadmap, architecture]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide Plans

> [!note]
> This is the master roadmap for [[dashboard|CueGuide]]. Keep it aligned with [[todo]], [[decisions]], [[context]], and [[memory]] before starting new work.

## Plans Stage

CueGuide is in the **web-first production hardening** stage: the root Vite/React web app is the source of truth, while the nested [[context#Nested Expo App|Expo app]] remains a later port target.

The current operating model is reinforced by [[YouTube_Mobile_App_Course_BMMcmmnjrM8]]: finish the real web product loop, verify it in browser/mobile-width views, then port the proven experience to a real phone.

## North Star

Build a credible caregiver medication product for dementia support:

- Caregiver schedules medications.
- Patient receives one calm prompt at a time.
- Patient can use **Read aloud**, **Help**, **Skip**, and **Done**.
- Caregiver sees status, alerts, session history, and reports.
- AI and voice remain server-mediated and fallback-safe.

## Current Architecture

See [[context#Technical Stack]] and [[context#Project Structure]].

| Layer | Direction | Notes |
| --- | --- | --- |
| Web app | Root React/Vite app | Production demo and primary UX. |
| Data | Supabase target plus local fallback | Demo must work when Supabase is missing or misconfigured. |
| Voice | ElevenLabs through `/api/elevenlabs/*` only | No provider secret in browser env. |
| AI cues | Server API with structured fallback | PHI-minimized, caregiver-reviewable. |
| Mobile | Expo later | Port only after web loop is stable. |

## Milestones

### 0. Meta-Optimization Direction

Status: active.

Use [[meta-optimization]] as the quality leverage map for the production pass. The highest-impact sequence is:

- Finish Supabase RLS/realtime coverage before claiming cloud data readiness.
- Keep ElevenLabs and AI provider keys server-side across web and future mobile.
- Turn the care-flow smoke test into a release gate.
- Refactor persistence/session logic only where it improves demo reliability.

### 1. Web Production Core Loop

Status: built, deployed, and being hardened.

- [[todo#P0 - Demo-Critical|P0]] caregiver dashboard, medication workflows, Focus Mode, alerts, reports.
- Production deploy: `https://cueguide-web.vercel.app`.
- Branch: `codex/production-revamp`.

### 2. Final Production Hardening

Status: active.

- Use the [[decisions#2026-05-14 - Hybrid Care OS Visual Direction|Hybrid Care OS]] direction for all web UI work: light clinical caregiver operations, warm patient Focus Mode, and no generic dark AI-demo styling.
- Keep improving the caregiver UI as an operational care surface, following [[decisions#2026-05-14 - Second-Pass UI Must Behave Like Operations]].
- Confirm Supabase schema, RLS, and realtime readiness.
- Remove remaining placeholder/demo friction.
- Add browser-level regression coverage for the medication loop.
- Add caregiver-visible production readiness status for voice, AI, data, alerts, and local fallback.
- Keep security checks green after every dependency or API change.
- Replace starter-app residue in docs and env examples with CueGuide-specific production guidance.

### 3. Som Demo Readiness

Status: active.

Use [[SOM_DEMO_BRIEF_May6]] plus [[Som_Evaluation/DELIVERABLE_1_Agile_Feature_Spec]] and [[Som_Evaluation/DELIVERABLE_2_Technical_Architecture]] as source material.

Demo priorities:

- Show product first, not architecture first.
- Emphasize caregiver control and calm patient prompts.
- Mention "adaptive, not autonomous" and server-side voice/AI boundaries.
- Avoid overselling.

### 4. Mobile Port

Status: pending.

Use [[CueGuide/BUILD_SUMMARY]] and the nested app as reference only. Port the proven web medication/session model into Expo after web QA is stable.

Do not start app-store submission prep until the mobile app has the same core loop working on a real phone.

## Quality Gates

Before calling a branch demo-ready:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- Browser QA for desktop caregiver, mobile caregiver, tablet patient Focus Mode.
- Production smoke check for page load and `/api/elevenlabs/tts`.

## Linked Notes

- [[dashboard]]
- [[context]]
- [[todo]]
- [[decisions]]
- [[memory]]
- [[meta-optimization]]
