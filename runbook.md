---
aliases: [runbook, release-runbook, demo-runbook]
tags: [project, operations, qa, demo]
created: 2026-05-14
updated: 2026-05-15
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

Start CueGuide on its isolated local port:

```bash
npm run dev
```

Local URL:

```text
http://127.0.0.1:3006
```

For local browser smoke:

```bash
CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow
```

Do not reuse `3000` for CueGuide QA on this machine unless you first verify the page is actually CueGuide; other local projects have occupied that port.

## Production Smoke

After deploy:

```bash
npm run smoke:careflow
```

This uses `https://cueguide-web.vercel.app` by default and requires ElevenLabs `audio/mpeg`.

## Production Voice

- Production voice must be ElevenLabs through `/api/elevenlabs/tts`.
- Acceptance target is Som's exact email standard: Google Maps voice directions that sound human, soft, and gentle.
- Current selected voice: `Bella - Professional, Bright, Warm` (`hpp4J3VqNfWAUOO0d1Us`).
- Settings must show `ElevenLabs active` from a live server check, then `Human voice review pending` until a person marks the voice accepted.
- Test the three Som-standard samples in Settings: small blue pill with water, yellow box location, and "Take your time. I can wait with you."
- Only mark `Voice accepted` after a human hears the output as Google Maps-like: human, soft, gentle, and non-commanding.
- Patient voice should play from explicit `Read aloud` actions, not automatic step transitions.
- Browser TTS is only an emergency fallback; it is not production-ready voice quality.

## Demo Walkthrough

1. Open Today and show active medication schedule.
2. Open Medications and create or edit one medication.
3. Start a medication session.
4. In Patient Focus Mode, tap Begin, Read aloud, Help, Skip, Done, then choose Okay.
5. Return to Live Session and show action history.
6. Open Reports and show adherence, help, skip, and mood metrics.
7. Open Settings and show ElevenLabs, AI, Supabase/local fallback, alerts, and event readiness.

## UI Review Standard

- Today must show the next medication and `Start patient session` before explanatory content.
- Mobile Today should reach `Today’s Schedule` in the first viewport.
- Reports should explain caregiver review signals, not internal system readiness.
- Settings can expose readiness, but copy should stay short and row-based.
- If a surface needs more than one sentence to explain itself, simplify the surface before adding copy.

## Stop Conditions

- ElevenLabs production smoke does not return `audio/mpeg`.
- Settings does not show `ElevenLabs active`, `Human voice review pending`, or `Voice accepted` accurately.
- Patient medication prompt includes caregiver-only instructions or command language such as `next take`.
- Caregiver Session or Reports imply `Done` proves the medication was physically swallowed.
- Browser console shows unhandled app errors.
- Mobile-width smoke reports horizontal overflow.
- Provider secrets appear in tracked files or `dist`.
- Provider-secret-style env names use browser-public prefixes such as `VITE_*` or `EXPO_PUBLIC_*`.
- Supabase RLS migration is incomplete when claiming production data readiness.
- Supabase production env names exist but live migrations/RLS have not been verified with an authenticated Supabase session.

Linked: [[plans#Quality Gates]], [[todo#P0 - Demo-Critical]], [[qa-log]], [[source-map]]
