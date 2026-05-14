---
aliases: [source-map, evidence-map, product-sources]
tags: [project, research, som, youtube, product]
created: 2026-05-14
updated: 2026-05-15
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

## Market And Competitor Signals

| Source | Product Translation | Current App Surface |
| --- | --- | --- |
| [Alzheimer's Association 2025 Facts and Figures](https://www.alz.org/alzheimers-dementia/facts-figures): more than 7 million Americans live with Alzheimer's, nearly 13 million unpaid caregivers provide care, and care costs are projected at $409B in 2026. | The opportunity is large, but credibility depends on caregiver utility, not generic reminders. | Today, Alerts, Reports, Settings data readiness. |
| [AARP medication management guide](https://www.aarp.org/caregiving/health/info-2020/medication-management.html): caregivers describe medication management as time-consuming and stressful. | CueGuide should reduce caregiver coordination burden with schedules, refills, patient actions, and reviewable history. | Medication Manager, Reports, Live Session. |
| [Medisafe Medfriend](https://app.medisafe.com/tips/med-friend-in-need-is-med-friend-indeed/): caregiver/friend notifications after missed medication alerts. | Generic med reminder apps already cover reminders plus caregiver notifications; CueGuide must differentiate with dementia-safe patient guidance and event interpretation. | Patient Focus Mode, alert timeline, Som voice standard. |
| [Hero caregiver page](https://herohealth.com/caregivers/) and help docs: hardware dispenser plus caregiver app, missed-dose and low-supply notifications. | Hardware competitors can better prove dispensing; CueGuide must stay honest that `Done` is patient confirmation, not physical administration proof. | Live Session language, Reports interpretation, Settings caveat. |
| [Amazon Alexa Together update](https://www.aboutamazon.com/news/devices/alexa-together-launches-to-help-customers-remotely-care-for-loved-ones): service is no longer available as of May 21, 2025. | Voice-enabled remote caregiving is validated but unstable as a platform dependency; CueGuide should own its caregiver workflow and voice boundary. | ElevenLabs server proxy, fallback policy, future mobile path. |

## Product Implications From Research

- #product CueGuide cannot win as "another medication reminder." It needs to be the calm patient guidance layer plus caregiver interpretation layer.
- #risk Physical medication administration cannot be claimed without hardware, camera, caregiver confirmation, or pharmacy/dispenser integration.
- #ux Dementia-safe language remains a product differentiator: ask, do not command; one step at a time; caregiver sees clinical detail, patient sees calm guidance.
- #gtm Public GTM should wait for live data proof, onboarding/auth lifecycle, monitoring, compliance review, and real caregiver beta evidence.

## Current Decisions Backed By Sources

- [[decisions#2026-05-14 - Root Web App Is Production Demo]]
- [[decisions#2026-05-14 - Medication Workflow Is The MVP Spine]]
- [[decisions#2026-05-14 - ElevenLabs Must Stay Server-Side]]
- [[decisions#2026-05-14 - ElevenLabs Is A Production Voice Requirement]]
- [[decisions#2026-05-14 - Hybrid Care OS Visual Direction]]
- [[decisions#2026-05-14 - Use YouTube Course As Process Guide]]
- [[decisions#2026-05-14 - Meta-Optimization Review Completed]]

Linked: [[dashboard]], [[plans]], [[memory]], [[todo]], [[runbook]], [[qa-log]]
