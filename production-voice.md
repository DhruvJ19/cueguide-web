---
aliases: [production-voice, elevenlabs-voice]
tags: [project, voice, production, elevenlabs]
created: 2026-05-14
updated: 2026-05-14
---

# Production Voice

> [!note]
> Production voice decisions for [[dashboard|CueGuide]]. Keep this aligned with [[source-map]], [[runbook]], [[qa-log]], and [[decisions]].

## Requirement

ElevenLabs is the production patient voice path. Browser speech is only an emergency fallback so the patient is never blocked.

## Current Voice

| Setting | Value |
| --- | --- |
| Provider | ElevenLabs |
| Route | `/api/elevenlabs/tts` |
| Voice | Bella - Professional, Bright, Warm |
| Voice id | `hpp4J3VqNfWAUOO0d1Us` |
| Model | `eleven_flash_v2_5` |

## Tone Rules

- Ask instead of command.
- Use short, warm, physical directions.
- Avoid robotic phrasing, urgency, blame, and celebration effects.
- Medication prompts should sound like gentle navigation: calm, specific, and non-scolding.

## Source

Som feedback in [[Som_Evaluation/1st Call with Suman & Som - 6_5_26]]: the old voice felt robotic/scolding, and dementia patients should be asked gently rather than ordered.

Linked: [[source-map#Som Feedback]], [[decisions#2026-05-14 - ElevenLabs Is A Production Voice Requirement]]
