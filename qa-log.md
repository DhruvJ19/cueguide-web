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
- Deployment: `https://cueguide-f9v0vicdn-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_7oiAW2vDgjPinVX21gDjdvVc8F28`

Selected production voice:

- Voice: `Bella - Professional, Bright, Warm`
- Voice id: `hpp4J3VqNfWAUOO0d1Us`
- Model: `eleven_flash_v2_5`

Verified:

- Production `/api/elevenlabs/voices` returned selected voice metadata.
- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778751739965`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Settings required `ElevenLabs active`.
- ElevenLabs production proxy returned six `200 audio/mpeg` TTS responses.
- Mobile-width caregiver view had no horizontal overflow.
- `npm run security:secrets`

Known caveat:

- Final subjective voice quality still needs human-ear review in a real browser or from `/tmp/cueguide-elevenlabs-voice-sample.mp3`.

## 2026-05-14 - Stakeholder Alpha Local Gate

Status: passed locally.

Code and UX changes verified:

- Patient Focus Mode now sends ElevenLabs audio only when the patient taps `Read aloud`; greeting, Begin, Help, and step transitions no longer trigger unsolicited TTS calls.
- Caregiver Settings now reports `Local fallback active` when cloud persistence is not configured in the running build.
- README and [[dashboard]] now frame the current milestone as a stakeholder alpha instead of a generic demo shell.
- Som's written voice target is captured in [[source-map]] and [[production-voice]]: Google Maps-like directions that sound human, soft, and gentle.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3004 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Smoke evidence:

- Medication created and edited: `Smoke Omega 1778753072082`.
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Local smoke observed one `200 audio/mpeg` ElevenLabs TTS response after reducing automatic voice calls.
- Mobile-width caregiver view had no horizontal overflow.
- Desktop caregiver, mobile caregiver, and tablet Patient Focus Mode screenshots showed no horizontal overflow or console problems.

Production env posture checked:

- Vercel production has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_USE_ELEVENLABS`, `ELEVENLABS_API_KEY`, `ELEVENLABS_MODEL_ID`, and `ELEVENLABS_VOICE_ID` configured.
- Supabase CLI is installed, but the local session is not authenticated; live migration/RLS application could not be verified from this machine in this pass.
- Local migrations cover medications, completions, care alerts, RLS policies, and realtime publication entries.

Known caveats:

- Production smoke must be rerun after deploying this reduced-audio build.
- Full public GTM is still blocked by live Supabase migration verification, auth lifecycle QA, monitoring, legal/compliance review, and real caregiver beta evidence.
- Subjective human-ear voice acceptance remains a real-person QA item; automated checks only prove ElevenLabs audio delivery.
- Build still reports a large bundle warning.

## 2026-05-14 - Stakeholder Alpha Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-gkmrvwx2z-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_C1ScBDEzNWq57dXvrVe5NSWqe5nm`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778753386597`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Live Session and Reports updated.
- Caregiver Settings required `ElevenLabs active`.
- ElevenLabs production proxy returned one `200 audio/mpeg` TTS response after explicit-Read-aloud voice gating.
- Mobile-width caregiver view had no horizontal overflow.
- Production desktop caregiver, mobile caregiver, and tablet Patient Focus Mode screenshots showed no horizontal overflow or console problems.

Known caveats:

- Human-ear review against Som's Google Maps standard is still required before calling voice quality accepted.
- Live Supabase migrations/RLS still need authenticated verification before claiming cloud-data production readiness.
- Build still reports a large bundle warning.
