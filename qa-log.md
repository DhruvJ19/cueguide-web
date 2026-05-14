---
aliases: [qa-log, verification-log, test-log]
tags: [project, qa, verification, release]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide QA Log

> [!note]
> Dated verification evidence for [[dashboard|CueGuide]]. Append new runs after each meaningful app, env, or deploy change.

## 2026-05-14 - Production-Hardening Local Gate

Status: passed locally.

Verified in this pass:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3004 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Smoke evidence:

- Medication created and edited.
- Validation errors appeared for invalid medication form input.
- Patient Focus Mode completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Live Session and Reports updated.
- ElevenLabs proxy observed `audio/mpeg` responses; one local `429` was tolerated because strict ElevenLabs was disabled for local smoke.
- Mobile-width caregiver view had no horizontal overflow.

Known caveats:

- Production strict ElevenLabs smoke must be rerun after the next deploy.
- Build still reports a large bundle warning.
- `cueguide-test.png` is unrelated local work and remains unstaged.

## Evidence To Add After Deploy

- Desktop caregiver screenshot or browser QA note.
- Tablet-sized Patient Focus Mode QA note.

Linked: [[runbook]], [[todo#P0 - Demo-Critical]], [[meta-optimization]]

## 2026-05-14 - Production Deploy Smoke

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-lece5xlxo-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_B82EJ3MhyBYuLUmGzrYaY8BxAyLe`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778750280302`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Live Session and Reports updated.
- ElevenLabs production proxy returned six `200 audio/mpeg` TTS responses.
- Mobile-width caregiver view had no horizontal overflow.

Known caveats:

- Build still reports a large bundle warning; this is a P2 performance optimization, not a launch blocker.
- `cueguide-test.png` is unrelated local work and remains unstaged.

## 2026-05-14 - Production Voice Hardening Local Gate

Status: passed locally with provider rate-limit caveat.

Selected production voice:

- Voice: `Bella - Professional, Bright, Warm`
- Voice id: `hpp4J3VqNfWAUOO0d1Us`
- Model: `eleven_flash_v2_5`

Verified:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- Local `/api/elevenlabs/voices` returned selected voice metadata.
- Local tiny TTS sample returned `200 audio/mpeg` and was saved to `/tmp/cueguide-elevenlabs-voice-sample.mp3`.
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3004 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Evidence:

- Settings now checks the live ElevenLabs server route before showing `ElevenLabs active`.
- Patient voice text is softened before TTS so medication prompts ask instead of command.
- Full local smoke observed five `200 audio/mpeg` TTS responses and one local `429`; the fallback path worked as an emergency resilience path.

Next production requirement:

- Completed in [[qa-log#2026-05-14 - Production Voice Hardening Deploy]].

## 2026-05-14 - Production Voice Hardening Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-a9ncb1rmh-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_9coWq2n2muPJoHihUN5XbU1nkxqU`

Selected production voice:

- Voice: `Bella - Professional, Bright, Warm`
- Voice id: `hpp4J3VqNfWAUOO0d1Us`
- Model: `eleven_flash_v2_5`

Verified:

- Production `/api/elevenlabs/voices` returned selected voice metadata.
- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778751634810`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Settings required `ElevenLabs active`.
- ElevenLabs production proxy returned six `200 audio/mpeg` TTS responses.
- Mobile-width caregiver view had no horizontal overflow.
- `npm run security:secrets`

Known caveat:

- Final subjective voice quality still needs human-ear review in a real browser or from `/tmp/cueguide-elevenlabs-voice-sample.mp3`.
