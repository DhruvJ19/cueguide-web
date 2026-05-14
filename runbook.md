---
aliases: [runbook, release-runbook, demo-runbook]
tags: [project, operations, qa, demo]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide Runbook

> [!note]
> Operational checklist for [[dashboard|CueGuide]]. Use this with [[qa-log]], [[todo]], and [[SECURITY]] before demos or deploys.

## Local Verification

Run from `/Users/dj/Downloads/Official-CueGuide`:

```bash
npm test
npm run lint
npm run build
npm run security:all
```

For local browser smoke:

```bash
CUEGUIDE_SMOKE_URL=http://127.0.0.1:3000 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow
```

Use the actual local port if Vite starts somewhere else.

## Production Smoke

After deploy:

```bash
npm run smoke:careflow
```

This uses `https://cueguide-web.vercel.app` by default and requires ElevenLabs `audio/mpeg`.

## Production Voice

- Production voice must be ElevenLabs through `/api/elevenlabs/tts`.
- Current selected voice: `Bella - Professional, Bright, Warm` (`hpp4J3VqNfWAUOO0d1Us`).
- Settings must show `ElevenLabs active` from a live server check before stakeholder use.
- Browser TTS is only an emergency fallback; it is not production-ready voice quality.

## Demo Walkthrough

1. Open Today and show active medication schedule.
2. Open Medications and create or edit one medication.
3. Start a medication session.
4. In Patient Focus Mode, tap Begin, Read aloud, Help, Skip, Done, then choose Okay.
5. Return to Live Session and show action history.
6. Open Reports and show adherence, help, skip, and mood metrics.
7. Open Settings and show ElevenLabs, AI, Supabase/local fallback, alerts, and event readiness.

## Stop Conditions

- ElevenLabs production smoke does not return `audio/mpeg`.
- Settings does not show `ElevenLabs active`.
- Browser console shows unhandled app errors.
- Mobile-width smoke reports horizontal overflow.
- Provider secrets appear in tracked files or `dist`.
- Supabase RLS migration is incomplete when claiming production data readiness.

Linked: [[plans#Quality Gates]], [[todo#P0 - Demo-Critical]], [[qa-log]], [[source-map]]
