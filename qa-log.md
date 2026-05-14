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
- Deployment: `https://cueguide-k1ajd0kow-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_6pJUsEwH6y1LTn5nYYZAkGEziNLY`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778750185222`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Live Session and Reports updated.
- ElevenLabs production proxy returned six `200 audio/mpeg` TTS responses.
- Mobile-width caregiver view had no horizontal overflow.

Known caveats:

- Build still reports a large bundle warning; this is a P2 performance optimization, not a launch blocker.
- `cueguide-test.png` is unrelated local work and remains unstaged.
