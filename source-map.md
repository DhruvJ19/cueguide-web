---
aliases: [source-map, evidence-map, product-sources]
tags: [project, research, som, youtube, product]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide Source Map

> [!note]
> Maps source feedback to product decisions so future work stays aligned with [[plans]], [[decisions]], and [[memory]].

## Som Feedback

| Source | Product Translation | Current App Surface |
| --- | --- | --- |
| [[Som_Evaluation/1st Call with Suman & Som - 6_5_26]] voice feedback: natural, pleasant, not robotic or scolding. | ElevenLabs must be real for demos; fallback voice must still be gentle. | `/api/elevenlabs/tts`, `src/utils/audio.ts`, Patient Focus Mode Read aloud. |
| [[Som_Evaluation/1st Call with Suman & Som - 6_5_26]] medication voice feedback: patients should be asked, not ordered. | Production prompts should use question-shaped, non-commanding audio text. | Gentle audio transform, Bella ElevenLabs voice, caregiver Settings voice status. |
| Som medication feedback: medication category is not enough without real medicines, times, and alerts. | Medication profile and schedule drive patient prompts. | Medications tab, generated medication routines, Today's Schedule. |
| Som asked how caregiver knows medication was administered. | Patient action logging is explicit but honest: Done means patient confirmed, Help/Skip are logged. | Live Session, Alert Feed, Reports. |
| Som/Suman emphasized real healthcare patients and caregiver usefulness. | Avoid gimmicks, failure language, and generic AI-demo styling. | Patient Focus Mode, caregiver dashboard language. |

## YouTube Course Guidance

| Source | Product Translation | Current App Surface |
| --- | --- | --- |
| [[YouTube_Mobile_App_Course_BMMcmmnjrM8]]: build the real app loop before packaging. | Web loop must pass browser QA before Expo work. | [[plans#1. Web Demo Core Loop]], [[runbook]]. |
| Course path: local -> API -> database -> cloud -> auth -> mobile/store. | Harden ElevenLabs, Supabase, and smoke tests first. | `/api/*`, Supabase migrations, `scripts/smoke-careflow.ts`. |
| Real-device testing comes after the core loop works. | Expo remains a port target, not a competing app. | [[context#Nested Expo App]]. |

## Current Decisions Backed By Sources

- [[decisions#2026-05-14 - Root Web App Is Production Demo]]
- [[decisions#2026-05-14 - Medication Workflow Is The MVP Spine]]
- [[decisions#2026-05-14 - ElevenLabs Must Stay Server-Side]]
- [[decisions#2026-05-14 - ElevenLabs Is A Production Voice Requirement]]
- [[decisions#2026-05-14 - Use YouTube Course As Process Guide]]
- [[decisions#2026-05-14 - Meta-Optimization Review Completed]]

Linked: [[dashboard]], [[plans]], [[memory]], [[todo]], [[runbook]], [[qa-log]]
