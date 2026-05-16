---
aliases: [context, project-context, live-snapshot]
tags: [project, context, architecture, stack]
created: 2026-05-14
updated: 2026-05-16
---

# CueGuide Context

> [!note]
> Current live snapshot for future Codex sessions. Read this with [[plans]], [[memory]], [[todo]], [[decisions]], and [[dashboard]].

## Snapshot

- Workspace: `/Users/dj/Downloads/Official-CueGuide`
- Branch: `codex/production-revamp`
- Production URL: `https://cueguide-web.vercel.app`
- Draft PR: `https://github.com/DhruvJ19/cueguide-web/pull/1`
- Known unrelated local dirty file: `cueguide-test.png`, intentionally not staged.
- Current production-revamp working set also includes Obsidian notes, patient/caregiver UX trust polish, smoke QA, and Supabase RLS migration work.
- Current UI direction: [[decisions#2026-05-14 - Hybrid Care OS Visual Direction|Hybrid Care OS]] with light caregiver operations screens and a separate warm patient Focus Mode.
- Current Product Trust pass separates ElevenLabs API readiness from human voice acceptance and keeps medication prompts question-shaped.
- Current UI/UX Trust refactor splits caregiver screens into focused view modules and keeps production secondary routes in the same clinical shell.
- Current multi-POV UI refinement favors row-based care operations surfaces over repeated cards, with Patient Focus Mode showing one dominant `Done` action plus visible support controls.
- Current UI trust pass removes more nested section chrome, uses a system clinical font stack, and labels caregiver timing issues as `Needs attention` instead of harsh patient-facing failure language.
- Current 10/10 direction continues flattening caregiver screens into command rows and shortens patient greeting copy so Focus Mode feels like a calm care appliance instead of a generated poster.

## Technical Stack

| Area | Stack |
| --- | --- |
| Web | React 19, Vite 6, TypeScript, Tailwind CSS 4, Zustand, React Router |
| Icons/UI | lucide-react, motion, sonner, recharts |
| Backend target | Supabase client, migrations under `supabase/migrations` |
| Server APIs | Vercel-style API routes in `api/` plus Vite local API middleware |
| Voice | ElevenLabs via `/api/elevenlabs/tts` and `/api/elevenlabs/voices`; production voice `Bella - Professional, Bright, Warm` |
| AI | OpenRouter-compatible server route `/api/ai/cue` with fallback cue generation |
| Security | `.npmrc`, lockfile scanner, secret scanner, `npm audit signatures`, GitHub security workflow |

## Project Structure

| Path | Purpose |
| --- | --- |
| `src/views/CaregiverDashboard.tsx` | Main caregiver shell: Today, Medications, Routines, Live Session, Reports, Settings. |
| `src/components/caregiver/DashboardViews.tsx` | Focused caregiver view modules used by the main shell: Today, Medications, Routines, Session, Reports, and Settings. |
| `src/views/PatientFocusMode.tsx` | Patient one-step-at-a-time experience with open full-screen greeting and calm medication steps. |
| `src/components/caregiver/CaregiverPrimitives.tsx` | Shared caregiver UI primitives for sections, stats, empty states, and readiness rows. |
| `src/components/AuthLayout.tsx` | Shared light clinical auth/setup shell for login, signup, and onboarding. |
| `src/services/focusSession.ts` | Pure Focus Mode step-event and completion-status logic. |
| `src/services/medicationRoutine.ts` | Medication-to-routine generation. |
| `src/services/localBackup.ts` | Local fallback data export for browser-stored patient, medication, session, alert, settings, and voice-review data. |
| `src/services/careAlerts.ts` | Alert creation and medication validation. |
| `src/services/elevenlabs.ts` | Browser-side wrapper that calls server voice APIs. |
| `src/utils/audio.ts` | Audio orchestration and patient tone transformation. |
| `api/elevenlabs/tts.ts` | Production server TTS proxy. |
| `api/elevenlabs/voices.ts` | Production server voice list proxy. |
| `supabase/migrations/20260513093902_medication_alert_production_schema.sql` | Medication, alerts, and production data shape. |
| `supabase/migrations/20260514022823_production_rls_completion_medication_policies.sql` | Pending RLS/realtime hardening migration created for production policy coverage. |
| `scripts/smoke-careflow.ts` | Browser smoke flow for medication setup, Focus Mode, alerts/session summary, voice, and mobile overflow. |
| `scripts/prove-supabase-cloud.ts` | Authenticated Supabase proof for caregiver-owned patient, medication, completion, and alert save/load through RLS. |
| `src/components/CommandPalette.tsx` | Keyboard navigation for real care destinations only; no fake analytics/device/compliance routes. |
| `.mcp.json` | Read-only Supabase MCP project config; user OAuth/auth is still required before tools are available. |
| `src/data.ts` | Deterministic local seed data for default patient, medications, routines, and sample history. Sample completions must use generated medication routine IDs. |
| `Som_Evaluation/` | Som/Suman transcripts, specs, architecture, demo prep. |
| `CueGuide/` | Nested Expo app, later mobile port target. |

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Careflow logic tests. |
| `npm run lint` | TypeScript type check. |
| `npm run build` | Production build. |
| `npm run security:all` | Lockfile, secret exposure, audit, signature checks. |
| `npm ci --ignore-scripts --dry-run` | Supply-chain dry run. |
| `npm run smoke:careflow` | Production/local browser smoke test for the medication demo loop. |
| `npm run proof:supabase` | Authenticated Supabase save/load/RLS proof. Requires test caregiver email/password env. |

Local dev uses `http://127.0.0.1:3006` with `--strictPort` because `3000` and `3004` have served unrelated local apps during QA.

## Environment Notes

- `.env` and `.env.local` are ignored. Do not print secrets.
- `VITE_USE_ELEVENLABS` is public feature-gate config and must be trimmed before comparison.
- `VITE_ALLOW_BROWSER_TTS_FALLBACK` defaults to false. Keep it false in production so ElevenLabs failures do not play browser speech.
- `ELEVENLABS_API_KEY` is server-only.
- `ELEVENLABS_VOICE_ID` is server-side production voice selection; current target is `hpp4J3VqNfWAUOO0d1Us`.
- `ELEVENLABS_ENABLE_VOICE_SETTINGS` defaults to off because the current production key accepts plain TTS but rejects forwarded `voice_settings`; gentle tone is handled through prompt wording and playback rate unless this is explicitly enabled.
- Server env values are normalized before provider calls because Vercel values can contain quotes or literal `\n` escapes.
- Current funded ElevenLabs key is installed in Vercel production and local `.env.local`.
- `ELEVENLABS_MODEL_ID` must be `eleven_flash_v2_5`; `eleve_flash_v2_5` returns `model_not_found`.
- `ELEVENLABS_LOCAL_ADDRESS` is optional. If it fails due VPN or network routing, the server retries ElevenLabs TTS once without the local address.
- Supabase browser env values are public anon config, but placeholder or malformed values must trigger local fallback.
- Supabase MCP is configured read-only for project `kueqtpekkqapclczvahc`; Codex still needs user-completed OAuth/auth before live schema tools appear.
- Do not add `VITE_` or `EXPO_PUBLIC_` provider secrets. Public prefixes ship to the client bundle.

## Nested Expo App

The nested [[CueGuide/BUILD_SUMMARY|Expo app]] has useful medication/health ideas but is not the current production demo. See [[plans#4. Mobile Port]].

Before any mobile port, keep the nested app on `EXPO_PUBLIC_CUEGUIDE_API_BASE_URL` and route voice/AI through the root web app server APIs. Do not reintroduce public provider secrets. See [[meta-optimization#Codebase And Architecture]].

## Important Source Docs

- [[SOM_DEMO_BRIEF_May6]]
- [[EmailThread_Ongoing]]
- [[Som_Evaluation/DELIVERABLE_1_Agile_Feature_Spec]]
- [[Som_Evaluation/DELIVERABLE_2_Technical_Architecture]]
- [[Som_Evaluation/CUEGUIDE_BUILD_SPEC]]
- [[SECURITY]]
- [[meta-optimization]]
