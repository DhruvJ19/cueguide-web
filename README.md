# CueGuide

CueGuide is a caregiver medication-management and patient guidance demo for dementia care. The root web app is the current production target: caregivers configure medications, launch a calm patient Focus Mode, and review completion events, help requests, skipped steps, alerts, and reports.

## Current Direction

- Root React/Vite web app is the production demo.
- Nested `CueGuide/` Expo app is a later mobile port target.
- ElevenLabs and AI providers are called only through server-side `/api/*` routes.
- Supabase is the production backend target; local persisted fallback keeps demos resilient.

## Local Setup

1. Install dependencies with lifecycle scripts disabled by default:

   ```bash
   npm ci --ignore-scripts
   ```

2. Copy `.env.example` to `.env.local` and fill only the values you need.

3. Start the web app:

   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite.

## Required Checks

Run these before deployment or handoff:

```bash
npm test
npm run lint
npm run build
npm run security:all
CUEGUIDE_SMOKE_URL=http://127.0.0.1:3000 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow
```

Use `CUEGUIDE_REQUIRE_ELEVENLABS=true` or omit it for production smoke when ElevenLabs must return real `audio/mpeg`.

## Production Demo Flow

1. Caregiver opens Today.
2. Caregiver adds or edits a medication.
3. Caregiver starts medication session.
4. Patient taps Begin, Read aloud, Help, Skip, and Done.
5. Caregiver reviews Live Session, Alert Feed, and Reports.

## Security Rules

- Never commit `.env`, `.env.local`, provider keys, or screenshots containing keys.
- `ELEVENLABS_API_KEY`, `OPENROUTER_API_KEY`, Twilio auth tokens, and VAPID private keys must remain server-side.
- No `VITE_` or `EXPO_PUBLIC_` provider secrets.
- Run `npm run security:all` after dependency or env changes.

## Project Notes

This repository is also an Obsidian vault. Start with `dashboard.md`, then read `plans.md`, `memory.md`, `context.md`, `todo.md`, and `decisions.md`.
