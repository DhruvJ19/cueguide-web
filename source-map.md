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
| Som email, 2026-05-14: "Think about Google Maps' voice directions. Sounds human, soft, and gentle." | Production voice must feel like calm navigation, not a chatbot, alarm, or instruction bark. | [[production-voice]], Bella ElevenLabs voice, gentle audio transform. |
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

## Dementia And Accessibility Research

| Source | Product Translation | Current App Surface |
| --- | --- | --- |
| [Alzheimer's Association communication guidance](https://www.alz.org/help-support/caregiving/daily-care/communications) | Keep communication quiet, simple, and step-by-step. | Patient Focus Mode one-action screens and large calm prompts. |
| [Alzheimer's Association agitation guidance](https://www.alz.org/Help-Support/Caregiving/Stages-Behaviors/Anxiety-Agitation) | Use calm positive language, slow down, and ask permission. | Gentle medication wording and explicit Read aloud control. |
| [Alzheimer's Society communication guidance](https://www.alzheimers.org.uk/about-dementia/stages-and-symptoms/dementia-symptoms/how-to-communicate-dementia) | Use short sentences, calm settings, and good lighting. | Warm patient palette, reduced distractions, high-contrast patient panel. |
| [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum) | Normal text needs strong contrast; large text also needs reliable contrast. | Light caregiver UI with dark text and restrained clinical accent colors. |

## Current Decisions Backed By Sources

- [[decisions#2026-05-14 - Root Web App Is Production Demo]]
- [[decisions#2026-05-14 - Medication Workflow Is The MVP Spine]]
- [[decisions#2026-05-14 - ElevenLabs Must Stay Server-Side]]
- [[decisions#2026-05-14 - ElevenLabs Is A Production Voice Requirement]]
- [[decisions#2026-05-14 - Hybrid Care OS Visual Direction]]
- [[decisions#2026-05-14 - Use YouTube Course As Process Guide]]
- [[decisions#2026-05-14 - Meta-Optimization Review Completed]]

Linked: [[dashboard]], [[plans]], [[memory]], [[todo]], [[runbook]], [[qa-log]]
