---
aliases: [production-voice, elevenlabs-voice]
tags: [project, voice, production, elevenlabs]
created: 2026-05-14
updated: 2026-05-15
---

# Production Voice

> [!note]
> Production voice decisions for [[dashboard|CueGuide]]. Keep this aligned with [[source-map]], [[runbook]], [[qa-log]], and [[decisions]].

## Requirement

ElevenLabs is the production patient voice path. Browser speech is only an emergency fallback so the patient is never blocked.

Acceptance is not just technical playback. The voice must pass Som's written standard: it should feel like Google Maps voice directions: human, soft, and gentle.

## Current Voice

| Setting | Value |
| --- | --- |
| Provider | ElevenLabs |
| Route | `/api/elevenlabs/tts` |
| Voice | Bella - Professional, Bright, Warm |
| Voice id | `hpp4J3VqNfWAUOO0d1Us` |
| Model | `eleven_flash_v2_5` |
| Voice settings forwarding | Off by default; enable only with `ELEVENLABS_ENABLE_VOICE_SETTINGS=true` after strict smoke proves `audio/mpeg` |
| Human review | Pending until marked accepted in Settings |

## Tone Rules

- Match Som's written target: Google Maps-style voice directions that sound human, soft, and gentle.
- Ask instead of command.
- Use short, warm, physical directions.
- Avoid robotic phrasing, urgency, blame, and celebration effects.
- Do not mark Settings as accepted if the voice sounds like a chatbot, alarm, nurse command, or scolding assistant.
- Medication prompts should sound like gentle navigation: calm, specific, and non-scolding.
- Trigger audio from explicit `Read aloud` actions so the patient controls when voice plays and one walkthrough does not overload the voice provider.
- Treat `audio/mpeg` API success as delivery proof only. Human acceptance must be recorded separately before calling voice quality accepted.
- Do not forward ElevenLabs `voice_settings` unless the selected account/key/model accepts them. Current production proof shows plain TTS succeeds while forwarded settings can return `401`, so prompt wording and playback rate remain the stable gentle-tone controls.

## Source

Som email, 2026-05-14: "Think about Google Maps' voice directions. Sounds human, soft, and gentle."

Som feedback in [[Som_Evaluation/1st Call with Suman & Som - 6_5_26]]: the old voice felt robotic/scolding, and dementia patients should be asked gently rather than ordered.

Linked: [[source-map#Som Feedback]], [[decisions#2026-05-14 - ElevenLabs Is A Production Voice Requirement]], [[decisions#2026-05-15 - Human Voice Acceptance Is Separate From API Readiness]]
