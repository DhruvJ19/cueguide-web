---
aliases: [qa-log, verification-log, test-log]
tags: [project, qa, verification, release]
created: 2026-05-14
updated: 2026-05-16
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

## 2026-05-15 - Product Trust Local Gate

Status: passed locally.

Verified changes:

- Patient medication prompts now ask instead of command: `Dad, would you like to take the small round blue pill with a sip of water? It is in the yellow pill box on the kitchen counter.`
- Caregiver-only medication instructions no longer leak into Patient Focus Mode.
- Settings now separates technical voice delivery from human voice acceptance: `Human voice review pending` until a caregiver/operator marks the voice accepted.
- Focus Mode step events now use a pure session module for started, help, skipped, stuck, done, mood, and completion status logic.
- Build output is chunked; the previous large-bundle warning is gone.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3005 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Browser QA:

- Browser plugin connection timed out twice, so direct Playwright was used for local rendered QA.
- Desktop caregiver Today, Settings, Medications, Live Session, and Reports rendered without console errors, page errors, framework overlays, or horizontal overflow.
- Mobile Settings and tablet Patient Focus Mode rendered without horizontal overflow.
- Patient prompt QA explicitly rejected `next take`, `Ask, do not command`, and caregiver instructions.

Voice sample evidence:

- Production `/api/elevenlabs/tts` returned `200 audio/mpeg` for all three Som-standard sample prompts.
- Samples saved outside the repo:
  - `/tmp/cueguide-elevenlabs-product-trust-sample-1.mp3`
  - `/tmp/cueguide-elevenlabs-product-trust-sample-2.mp3`
  - `/tmp/cueguide-elevenlabs-product-trust-sample-3.mp3`

Screenshots captured outside the repo:

- `/tmp/cueguide-product-trust-desktop-today-fixed.png`
- `/tmp/cueguide-product-trust-desktop-settings-fixed.png`
- `/tmp/cueguide-product-trust-desktop-medications-fixed.png`
- `/tmp/cueguide-product-trust-tablet-patient-fixed.png`
- `/tmp/cueguide-product-trust-desktop-live-session-fixed.png`
- `/tmp/cueguide-product-trust-desktop-reports-fixed.png`
- `/tmp/cueguide-product-trust-mobile-settings-fixed.png`

Known caveats:

- Human-ear voice acceptance is still pending; API delivery is verified, but voice quality must be accepted by a person against Som's Google Maps standard.
- Supabase CLI is not authenticated on this machine, so live Supabase migrations/RLS/authenticated save-load proof remains blocked.
- `cueguide-test.png` is unrelated local work and remains unstaged.

## 2026-05-15 - Product Trust Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-ak0wpvkak-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_483NEJGpLeJ9fqHoyipJpY6TCeMo`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778777270596`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Caregiver Live Session and Reports updated.
- Settings accepted `Human voice review pending` as the honest voice state while ElevenLabs returned `200 audio/mpeg`.
- Mobile-width caregiver view had no horizontal overflow.
- Production tablet Patient Focus Mode rendered the question-shaped prompt: `Dad, would you like to take the small round blue pill with a sip of water? It is in the yellow pill box on the kitchen counter.`
- Production tablet Patient Focus Mode screenshot: `/tmp/cueguide-product-trust-production-tablet-patient.png`

Known caveats:

- Human-ear voice acceptance is still pending.
- Live Supabase migrations/RLS still need authenticated verification.

## 2026-05-15 - Auth And Setup Trust Pass

Status: passed locally with cloud-data caveat.

Why this pass happened:

- Multi-project local ports were returning unrelated apps: `3000` served Robossist and `3004` served Cortex.
- CueGuide local dev is now isolated at `http://127.0.0.1:3006`.
- `/login`, `/signup`, `/onboarding`, and `/settings` still had legacy dark/starter surfaces that did not match [[decisions#2026-05-14 - Hybrid Care OS Visual Direction]].

Code changes verified:

- `package.json` and `package-lock.json` now identify the app as `cueguide-web`.
- `npm run dev` uses `127.0.0.1:3006 --strictPort`.
- New shared `src/components/AuthLayout.tsx` gives auth/setup screens a light clinical CueGuide shell.
- `/login` and `/signup` show Supabase magic-link flows when configured and a clearly labeled local-data path when Supabase is absent.
- `/onboarding` now creates the first medication loop instead of a generic hygiene routine.
- `/settings` now opens the production readiness console inside the real caregiver dashboard, not the legacy standalone settings page.
- `AuthCallbackPage` now creates/loads the caregiver row and supports both current `caregivers.id` and legacy direct `auth.uid()` patient ownership.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Smoke evidence:

- Local smoke medication: `Smoke Omega 1778816038405`
- Local smoke observed ElevenLabs `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding reported `localOnboarding: true`.

Rendered QA:

- Browser plugin connection timed out twice; direct Playwright was used.
- Desktop and mobile `/login`, `/signup`, `/onboarding`, `/dashboard`, and `/settings` rendered without app console errors or horizontal overflow.
- Local setup flow verified: signup -> local setup -> caregiver name -> patient name -> first medication -> dashboard.
- Verified created patient `Anika Patel`, preferred name `Mom`, and medication `Amlodipine` appeared in the caregiver dashboard.
- Mobile login screenshot after refinement: `/tmp/cueguide-qa-20260515-after-auth/mobile-login-final.png`.
- Desktop settings route screenshot: `/tmp/cueguide-qa-20260515-after-auth/desktop-settings-route.png`.

Known caveats:

- Supabase CLI is still unauthenticated: `Access token not provided`.
- Cloud signup, migration state, RLS behavior, and authenticated save/load still need proof before public production claims.
- Human-ear ElevenLabs voice acceptance is still pending.

## 2026-05-15 - UI Trust Pass Production Deploy

Status: passed.

Why this pass happened:

- The caregiver UI was still too wordy, crowded, and card-heavy after the previous pass.
- Mobile Today spent too much height explaining the app before showing the schedule.
- Reports showed system readiness where caregivers expect care interpretation.

Design changes verified:

- Today now opens with a compact operations board: next medication, time, step count, active med count, one primary patient-session action, medication list, and attention row.
- Mobile Today hides noncritical header actions and reaches `Today’s Schedule` in the first viewport.
- Medications keeps the table-like row layout but uses shorter actions: `On` and `Edit`.
- Reports replaces the system-readiness side panel with caregiver review actions.
- Settings copy is shorter and keeps voice/data/AI/alert/privacy state visible without a large explanatory console.
- Auth/setup copy now uses shorter medication-care language.
- Smoke selectors were updated for the new labels: `Care overview`, `Start patient session`, `Patient Session`, and `Edit`.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `npm run smoke:careflow`

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-jt36n59md-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_BgUFtUjB5KxEVManqvgPL2GHRcrL`

Smoke evidence:

- Local smoke medication: `Smoke Omega 1778780148141`
- Production smoke medication: `Smoke Omega 1778780223376`
- Production ElevenLabs proxy returned `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.

Rendered QA:

- Browser plugin connection timed out, so direct Playwright was used.
- Production desktop Today, Medications, Reports, Settings, and mobile Login rendered without framework overlays or horizontal overflow.
- Production mobile Today rendered without horizontal overflow and showed `Today’s Schedule` in the first viewport.
- Only expected warning observed: Sentry DSN not configured.
- Screenshots captured outside the repo:
  - `/tmp/cueguide-qa-20260515-production-ui-trust-pass/desktop-today.png`
  - `/tmp/cueguide-qa-20260515-production-ui-trust-pass/mobile-today.png`
  - `/tmp/cueguide-qa-20260515-production-ui-trust-pass/desktop-meds.png`
  - `/tmp/cueguide-qa-20260515-production-ui-trust-pass/desktop-reports.png`
  - `/tmp/cueguide-qa-20260515-production-ui-trust-pass/desktop-settings.png`
  - `/tmp/cueguide-qa-20260515-production-ui-trust-pass/mobile-login.png`

Known caveats:

- Human-ear voice acceptance is still pending and should be done by the user in the live browser.
- Supabase cloud signup, migration state, RLS behavior, and authenticated save/load still need proof before public production claims.
- Vercel still warns that `name` in `vercel.json` is deprecated.

## 2026-05-15 - Som Exact Voice Standard Alignment

Status: passed and deployed.

Why this pass happened:

- Som's exact email says: "Think about Google Maps' voice directions. Sounds human, soft, and gentle."
- The app already verified ElevenLabs `audio/mpeg`, but Settings needed to state the acceptance target more explicitly.

Verified change:

- Settings now says `Google Maps voice standard`.
- Settings voice detail now says to accept only if the voice sounds like calm Google Maps directions.
- [[production-voice]], [[todo]], [[decisions]], [[memory]], and [[runbook]] now separate API delivery from Som-standard voice acceptance.
- Production deploy: `https://cueguide-azu5gyz0q-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_BL2tqkZd8GErtE7TXpKXef8PJQGR`
- `npm run lint` passed.
- `npm run build` passed.
- `npm run smoke:careflow` passed after updating the smoke selector from `Som voice standard` to `Google Maps voice standard`.
- Production smoke medication: `Smoke Omega 1778780754483`
- Production ElevenLabs proxy returned `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.

Known caveat:

- Human-ear review is still pending and must happen in the live product before voice quality is marked accepted.

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

## 2026-05-14 - Hybrid Care OS UI Turnaround Local Gate

Status: passed locally; not deployed yet.

Design change verified:

- Default caregiver UI is now light clinical instead of dark card-heavy.
- Desktop navigation has a collapsible sidebar with stable icon/label tabs.
- Mobile caregiver navigation uses a bottom tab bar without the desktop collapse control.
- Today now prioritizes next medication, schedule, patient context, and alerts.
- Medications now uses a structured full-width row/table layout with edit actions.
- Reports now uses caregiver-useful adherence/help/skip/mood/session sections and avoids dominant `0%` empty-state language.
- Settings now uses operational rows for Voice, AI, Data, Monitoring, and Session Events.
- Patient Focus Mode remains visually separate, warm, high-contrast, and one action per screen.
- One-time theme migration resets stale stored dark-mode users into the new light clinical caregiver UI.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3004 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Browser QA evidence:

- Desktop screenshots captured for Today, Medications, Reports, and Settings.
- Mobile screenshots captured for Today and Settings.
- Tablet Patient Focus Mode screenshot captured after starting a medication session.
- No horizontal overflow at 1440 desktop, 390 mobile, or 834 tablet patient viewport.
- No framework error overlay detected.
- Only console warning observed: Sentry DSN not configured, which is expected for local development.
- Stale `cueguide-theme=dark` storage migrated to `cueguide-theme=light` with `cueguide-theme-version=hybrid-care-os-v1`.

Voice evidence:

- Local smoke observed ElevenLabs `200 audio/mpeg`.
- Production `/api/elevenlabs/tts` returned `200 audio/mpeg` with a 40,169 byte MP3 sample.

Known caveats:

- This UI pass is local only until committed, pushed, deployed, and strict production smoke is rerun.
- Human-ear voice review against Som's Google Maps standard remains required.
- Live Supabase migrations/RLS still need authenticated verification before cloud-data production readiness.
- Build still reports a large bundle warning.

## 2026-05-14 - Hybrid Care OS Second-Pass Local Gate

Status: passed locally; not deployed yet.

Second-pass changes verified:

- Today now behaves more like an operations console: voice/data/alert readiness chips, four-part status strip, attention queue, and caregiver-only past-due language.
- Medication Manager now uses table-like rows with next dose, schedule chips, refill status, location cue, instructions, active toggle, and edit action.
- Live Session now shows a caregiver event timeline, step progress, help count, skipped count, and patient-safe session interpretation.
- Reports now include narrative adherence interpretation, a meter, medication review, caregiver attention, comfort signals, and recent session log.
- Settings now groups readiness into Voice/Cue Quality, Data/Monitoring, and Privacy/Account posture.
- Smoke selectors were updated for the new Live Session and Reports wording.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3005 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Browser QA evidence:

- Desktop screenshots captured for Today, Medications, Live Session, Reports, and Settings.
- Mobile screenshots captured for Today, Medications, and Settings.
- Tablet Patient Focus Mode screenshot captured after starting medication session.
- No horizontal overflow at 1440 desktop, 390 mobile, or 834 tablet patient viewport.
- No framework error overlay detected.
- Only expected local warning observed: Sentry DSN not configured.

Smoke evidence:

- Medication created and edited: `Smoke Omega 1778772385090`.
- Patient flow reached Read aloud, Help, Skip, Done, and caregiver summary.
- ElevenLabs proxy observed `200 audio/mpeg`.
- Mobile-width caregiver view had no horizontal overflow.

Known caveats:

- This second-pass UI is local until committed, pushed, deployed, and strict production smoke is rerun.
- Human-ear voice review remains required.
- Live Supabase migrations/RLS still need authenticated verification before cloud-data production readiness.
- Build still reports a large bundle warning.

## 2026-05-14 - Hybrid Care OS Second-Pass Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-337yqe296-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_GzDvHnVAT4D7FBrj1Z5nYYn3CNJv`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778772713850`
- Patient flow reached Read aloud, Help, Skip, Done, and caregiver summary.
- Caregiver Live Session and Reports reflected the upgraded wording.
- ElevenLabs production proxy returned one `200 audio/mpeg` TTS response.
- Mobile-width caregiver view had no horizontal overflow.

Known caveats:

- Human-ear voice review against Som's Google Maps standard remains required.
- Live Supabase migrations/RLS still need authenticated verification before cloud-data production readiness.
- Build still reports a large bundle warning.

## 2026-05-15 - Product Trust QA And Safety Pass

Status: passed locally; production deploy pending.

Why this pass happened:

- Today was reframed as truth-finding from caregiver, patient, Som/CTO, buyer, and devil's-advocate perspectives.
- Live production audit confirmed basic rendering health, but caregiver surfaces did not clearly state the biggest safety caveat: `Done` is patient confirmation only, not proof the pill was swallowed.
- Local ignored `.env` still had legacy browser-public provider-secret-style names; those were hardened before the next build.

Multi-POV findings:

- Caregiver: core loop is understandable, but Live Session and Reports needed explicit confirmation-limit language.
- Patient: Focus Mode stayed large, readable, one-action-at-a-time, and non-commanding in screenshot QA.
- Som/CTO: ElevenLabs production TTS returned `200 audio/mpeg`; human-ear voice acceptance is still pending against the Google Maps standard.
- Buyer/investor: Reports now avoids implying physical administration proof and frames Help/Skip/Done as review signals.
- Devil's advocate: Supabase production proof is still blocked without CLI/MCP auth; Settings must continue showing local fallback/cloud-proof caveats.

Code changes verified:

- Live Session now says pressing Done means the patient confirmed the prompt in CueGuide and is not proof the pill was swallowed.
- Reports now includes the same confirmation limit beside adherence signals.
- Caregiver timeline uses `Confirmed` instead of `Done` for completed patient events.
- Header and alert microcopy were tightened for grammar and professional casing.
- AI readiness copy now states AI does not change schedules or create urgency autonomously.
- Secret scanner now blocks browser-public provider secret names across tracked files and local env files, and scans built `dist` output for bundled provider secrets.
- Nested Expo `.env.example` no longer suggests a public Twilio account SID.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Smoke evidence:

- Local smoke medication: `Smoke Omega 1778813866462`
- Local smoke observed ElevenLabs `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.

Browser QA evidence:

- Live production audit before patch captured desktop Today, Medications, Session, Reports, Settings; mobile Today, Medications, Settings, Login, Signup, Onboarding; and tablet Patient Focus Mode.
- Patched local screenshot QA captured confirmation-limit Session and Reports screens.
- No console errors, page errors, framework overlays, tiny controls, or horizontal overflow were observed in the automated pass.
- Screenshot folders outside the repo:
  - `/tmp/cueguide-qa-20260515-trust-sprint-audit`
  - `/tmp/cueguide-qa-20260515-trust-sprint-patched`

Supabase/data evidence:

- `supabase --version` returned `2.98.2`.
- Supabase MCP endpoint returned `401`, which means the endpoint is reachable but unauthenticated.
- `supabase projects list` is blocked: `Access token not provided`.
- Local Supabase database is not running on `127.0.0.1:54322`, so local migration list is blocked.
- Migration file `supabase/migrations/20260514022823_production_rls_completion_medication_policies.sql` contains RLS policies, grants, indexes, and realtime publication coverage for `medications`, `completions`, and `care_alerts`, but live cloud proof remains pending.

Known caveats:

- Human-ear voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[source-map#Som Feedback]], [[decisions#2026-05-15 - Patient Done Is Confirmation Not Proof]], [[runbook]], [[todo#P0 - Demo-Critical]]

## 2026-05-15 - Product Trust QA Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-qw2luwq7n-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_HZcXhLtPUhh4pBGiqSXrjMpJeVjQ`
- Commit: `49c79624`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778814819747`
- Patient flow completed Begin, Read aloud, Help, Skip, Done, and mood close.
- Production ElevenLabs proxy returned `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- Smoke now asserts the caregiver Session says `not proof the pill was swallowed`.
- Smoke now asserts Reports says `Done is patient confirmation only`.

Rendered QA:

- Production Reports rendered the confirmation-limit note without console errors, page errors, or horizontal overflow.
- Production Settings rendered the Google Maps voice standard.
- Production mobile Signup rendered without horizontal overflow.
- Screenshot folder outside the repo: `/tmp/cueguide-qa-20260515-product-trust-production`.

Deployment notes:

- Initial Vercel deploy stayed queued for several minutes, then became ready.
- A redundant prebuilt deploy was started while troubleshooting the queue and remains nonessential because the first production deployment passed smoke.
- `vercel pull --environment production` created ignored `.vercel/.env.production.local`; `.vercel/` remains gitignored.

Known caveats:

- Human-ear voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

## 2026-05-15 - Fresh User Onboarding Trust Pass

Status: passed locally; production deploy pending.

Why this pass happened:

- A first-time caregiver needs an obvious path even before cloud auth is proven.
- The smoke test exposed a real trust issue: after onboarding with one medication, the dashboard could still show a generic `Morning Medication` session name.
- Som's feedback requires medication to mean the actual medicine, not just a category.

Code changes verified:

- `/signup` always shows `Continue local setup`, even when Supabase env is configured.
- `/login` always shows `Continue with local data`.
- `/onboarding` now explains the three setup steps, labels local/cloud data mode, and shows a patient prompt preview.
- If Supabase is configured but there is no signed-in user, onboarding now completes locally instead of failing at the end.
- Medication-generated routines now use the actual medication name when there is one scheduled medicine, such as `Morning Smoke Starter Med`.
- `.mcp.json` configures the Supabase MCP server in read-only mode for project `kueqtpekkqapclczvahc`; user OAuth/auth is still required before live tools appear.
- `scripts/smoke-careflow.ts` now covers signup -> local setup -> onboarding -> first medication -> dashboard.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Rendered QA:

- Browser plugin connection timed out twice, so direct Playwright was used for the local rendered check.
- Mobile signup, medication onboarding, and dashboard rendered without page errors, framework overlays, or horizontal overflow.
- Dashboard showed `Morning Smoke Starter Med` in the first viewport.
- Body and main opacity both measured `1`; the UI was not faded or covered by a transition overlay.
- Screenshot folder outside the repo: `/tmp/cueguide-qa-20260515-onboarding-trust-fresh`.

Supabase/data evidence:

- `supabase --version` returned `2.98.2`.
- `supabase projects list -o json` remains blocked by missing access token.
- `https://mcp.supabase.com/mcp` returned unauthenticated `401`, confirming the MCP endpoint is reachable.
- Live cloud save/load/RLS proof remains pending until Supabase CLI or MCP auth is completed.

Known caveats:

- Human-ear voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[decisions#2026-05-15 - First Run Local Setup Is First-Class]], [[decisions#2026-05-15 - Medication Sessions Name The Medicine]], [[runbook#First-Run QA]], [[todo#P0 - Demo-Critical]]

## 2026-05-15 - Fresh User Onboarding Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-2x6w7d0ue-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_3i1nbfSpDKHbURc6E3XV9in2oZDE`
- Commit: `b399fb9f`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778816160998`
- Production ElevenLabs proxy returned `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding path reported `localOnboarding: true`.
- Production rendered QA showed `Continue local setup` on signup, completed onboarding, and rendered `Morning Production Starter Med` in the dashboard.

Rendered QA:

- Browser plugin connection timed out, so direct Playwright was used.
- Production mobile signup, onboarding medication step, and dashboard rendered without page errors, framework overlays, or horizontal overflow.
- Only expected warning observed: Sentry DSN not configured.
- Screenshot folder outside the repo: `/tmp/cueguide-qa-20260515-first-run-production`.

Known caveats:

- Human-ear voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

## 2026-05-15 - UI/UX Trust Refactor Local Gate

Status: passed locally; production deploy pending.

Why this pass happened:

- The caregiver UI still felt too crowded, wordy, and uneven after earlier passes.
- The next trust blocker was not a new feature; it was structure, visual hierarchy, real navigation surfaces, and removing leftover starter/AI-demo residue.

Code changes verified:

- `src/views/CaregiverDashboard.tsx` now delegates Today, Medications, Routines, Session, Reports, and Settings to focused caregiver view components.
- `src/components/caregiver/DashboardViews.tsx` centralizes the main caregiver screen layouts and keeps the public route behavior stable.
- The command palette now exposes real care destinations only: Today, Medications, Routines, Session, Reports, Settings, and Patient mode.
- Privacy, Terms, Not Found, Auth Callback, and error surfaces now use the light clinical CueGuide shell instead of dark/glass starter styling.
- App metadata now describes caregiver medication support instead of an AI companion starter app.
- Patient Focus Mode button hierarchy, spacing, and type sizing were tightened without changing the one-action-at-a-time workflow.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Smoke evidence:

- Target URL: `http://127.0.0.1:3006`
- Medication created and edited: `Smoke Omega 1778835520950`
- Local smoke observed ElevenLabs `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding path reported `localOnboarding: true`.

Rendered QA:

- Browser plugin connection timed out, so direct Playwright was used for rendered QA.
- Desktop Today, Command Palette, Medications, Reports, Settings, and Session rendered without page errors, framework overlays, or horizontal overflow.
- Mobile Today, Medications, Signup, Onboarding, and Settings rendered without horizontal overflow.
- Tablet Patient Focus Mode rendered greeting and step prompt with Read aloud, Help, Skip, and Done visible.
- Privacy, Terms, and Not Found routes rendered with the clinical shell.
- Screenshot folder outside the repo: `/tmp/cueguide-qa-20260515-ui-trust-refactor-local-final`.

Known caveats:

- Human-ear ElevenLabs voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[decisions#2026-05-15 - Caregiver Views Are Focused Operations Modules]], [[todo#P2 - Product Polish]], [[context#Project Structure]]

## 2026-05-15 - UI/UX Trust Refactor Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-m1kzcs9p4-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_HbKpCDmC2n3oxAFPoHtMvWGiW66k`
- Commit: `cdd2bc9b`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778835685864`
- Production ElevenLabs proxy returned `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding path reported `localOnboarding: true`.

Rendered QA:

- Browser plugin connection had timed out locally earlier, so direct Playwright was used for production rendered QA.
- Desktop Today, Command Palette, Medications, Reports, Settings, and Session rendered without page errors, framework overlays, console errors, or horizontal overflow.
- Mobile Today, Medications, Signup, Onboarding, and Settings rendered without horizontal overflow.
- Tablet Patient Focus Mode rendered greeting and step prompt with Read aloud, Help, Skip, and Done visible.
- Privacy, Terms, and Not Found routes rendered with the clinical shell.
- Screenshot folder outside the repo: `/tmp/cueguide-qa-20260515-ui-trust-refactor-production`.

Deployment notes:

- Vercel build completed successfully and aliased the deployment to production.
- Vercel warned that the `name` property in `vercel.json` is deprecated; this is non-blocking cleanup.

Known caveats:

- Human-ear ElevenLabs voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[decisions#2026-05-15 - Caregiver Views Are Focused Operations Modules]], [[dashboard#Release Evidence]], [[todo#P2 - Product Polish]]

## 2026-05-15 - Daily Use Refinement Local Gate

Status: passed locally; production deploy pending.

Why this pass happened:

- The next QA lens was signup-to-daily-use, not another visual-only pass.
- Research and Som transcript review pointed to three practical gaps: medication prompts were still too dense, refill management was incomplete, and local fallback data needed a caregiver-manageable export path.

Code changes verified:

- Medication prompt headline now contains one action only; medication location appears as separate patient guidance.
- Onboarding and medication edit now include `Refill date`.
- Settings now includes `Export local backup` for local fallback data: patient, medications, routines, completions, alerts, settings, and voice review state.
- Local backup logic is covered in the careflow test suite.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Smoke evidence:

- Target URL: `http://127.0.0.1:3006`
- Medication created and edited: `Smoke Omega 1778840415040`
- Local smoke observed ElevenLabs `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding path reported `localOnboarding: true`.

Rendered QA:

- Browser plugin connection timed out, so direct Playwright was used.
- Full local flow passed: signup -> local setup -> onboarding with refill date -> dashboard -> edit medication refill/schedule -> patient session -> Help -> Skip -> Done -> caregiver session -> Settings export.
- Patient headline: `Mom, would you like to take the small oval white pill with a sip of water?`
- Patient guidance: `The small oval white pill is in the Sunday pill organizer by the kettle. Take your time.`
- Local backup download filename matched `cueguide-local-backup-YYYY-MM-DD.json`.
- Mobile onboarding and mobile Settings rendered without horizontal overflow.
- Screenshot folder outside the repo: `/tmp/cueguide-daily-use-refinement-20260515-local-v3`.

Research applied:

- Alzheimer's Association communication/agitation guidance: one step, calm permission-shaped language.
- AARP medication management guidance: caregiver workflows need medication details, refill coordination, and practical review.
- Hero and Medisafe competitor signals: missed-dose/refill/caregiver notifications are table stakes, so CueGuide must differentiate with dementia-safe guidance and honest confirmation limits.
- HHS/FTC health app guidance: data controls and privacy claims must stay honest.

Known caveats:

- Production deploy and strict production smoke are still pending for this refinement.
- Human-ear ElevenLabs voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[source-map#Market And Competitor Signals]], [[decisions#2026-05-15 - Patient Medication Prompts Separate Action From Location]], [[todo#P2 - Product Polish]]

## 2026-05-15 - Daily Use Refinement Production Deploy

Status: passed.

Production deployment:

- Alias: `https://cueguide-web.vercel.app`
- Deployment: `https://cueguide-2s5b0eryq-dhruvjainhk-4433s-projects.vercel.app`
- Vercel deployment id: `dpl_C63RmJYmnWC6BBvv2uNBAP2JQTQ9`
- Commit: `096636eb`

Verified:

- `npm run smoke:careflow`
- Target URL: `https://cueguide-web.vercel.app`
- Medication created and edited: `Smoke Omega 1778840601097`
- Production ElevenLabs proxy returned `200 audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding path reported `localOnboarding: true`.

Rendered QA:

- Production flow passed: onboarding refill date -> patient medication prompt -> caregiver Settings backup export.
- Patient headline: `Mom, would you like to take the small oval white pill with a sip of water?`
- Patient guidance: `The small oval white pill is in the Sunday pill organizer by the kettle. Take your time.`
- Local backup download filename: `cueguide-local-backup-2026-05-15.json`.
- Mobile onboarding and mobile Settings rendered without horizontal overflow.
- Screenshot folder outside the repo: `/tmp/cueguide-daily-use-refinement-20260515-production`.

Known caveats:

- Human-ear ElevenLabs voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[source-map#Dementia And Accessibility Research]], [[decisions#2026-05-15 - Local Fallback Needs Data Export]], [[dashboard#Release Evidence]]

## 2026-05-15 - Supabase Proof Gate Added

Status: gate added; cloud proof still blocked pending test caregiver credentials.

Code changes verified:

- Added `npm run proof:supabase`.
- The proof signs in as a normal caregiver through Supabase anon auth.
- The proof attempts caregiver-owned patient, medication, completion, and care alert create/read/delete.
- The proof checks anonymous reads cannot see the proof patient.
- The proof intentionally avoids service-role keys because they bypass RLS.

Commands:

- `npm run lint`
- `npm run security:secrets`
- `npm run proof:supabase`

Observed result:

- `npm run proof:supabase` is blocked as expected because `CUEGUIDE_SUPABASE_TEST_EMAIL` is not present in local env.
- Supabase CLI still reports `Access token not provided` for project-list access.
- Supabase changelog/docs note to preserve: RLS and grants are separate; newer Supabase projects may not expose public-schema tables to the Data API by default. The proof therefore checks live authenticated app behavior rather than trusting migration files only.

Known caveats:

- Authenticated cloud save/load/RLS proof is still pending until a test caregiver account exists.
- The proof may expose schema mismatches when first run against the live project; those should be fixed before claiming cloud production readiness.

Linked: [[runbook#Supabase Verification]], [[decisions#2026-05-15 - Supabase Proof Must Use Normal Auth]], [[todo#P0 - Demo-Critical]]

## 2026-05-15 - Multi-POV UI Trust Refinement Local Gate

Status: passed locally; production deploy pending.

Audit lens:

- Caregiver: Today now leads with next medication, start action, concise dose/alert/review/refill signals, and a row-based medication plan.
- Patient: Focus Mode now makes `Done` the dominant action while keeping `Read aloud`, `Help`, and `Skip` visible.
- Som/CTO: Reports and Session keep the confirmation-limit language; patient prompt remains question-shaped and non-commanding.
- Buyer/devil's advocate: Settings now separates voice acceptance and cloud proof instead of implying production readiness.
- UI critic: Reports moved from stat-card blocks to care-signal rows; Settings moved away from crowded two-column readiness cards.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `npm run proof:supabase`

Observed:

- Careflow tests passed.
- Type check passed.
- Production build passed.
- Security checks passed with 0 vulnerabilities, 346 verified registry signatures, and 48 verified attestations.
- Supply-chain dry run passed.
- Local care-flow smoke passed at `http://127.0.0.1:3006`.
- Smoke medications included `Smoke Omega 1778860084567`, `Smoke Omega 1778860287139`, and `Smoke Omega 1778860423103`.
- Local fallback-mode smoke tolerated local ElevenLabs `401` and confirmed browser fallback path; strict production smoke still requires `audio/mpeg`.
- Mobile-width caregiver smoke reported no horizontal overflow.
- First-run local onboarding path reported `localOnboarding: true`.
- `npm run proof:supabase` remained blocked as expected because `CUEGUIDE_SUPABASE_TEST_EMAIL` is missing.
- Direct production TTS without forwarded `voice_settings` returned `200 audio/mpeg`.
- Direct production TTS with forwarded `voice_settings` returned `401`, so the server now gates forwarding behind `ELEVENLABS_ENABLE_VOICE_SETTINGS=true`.
- Vercel production env inspection showed the voice id could be shaped with quotes and a literal newline escape. Server API routes, Vite dev middleware, and public config parsing now normalize quoted and escaped env values before use.

Rendered QA:

- Screenshot folder outside the repo: `/tmp/cueguide-multipov-refined-20260515`.
- Desktop Today, Reports, Settings rendered without framework overlay or console errors.
- Mobile Today rendered without horizontal overflow and now has `110px` bottom padding for fixed navigation.
- Tablet Patient Focus Mode rendered without overflow; action order is `Done`, `Read aloud`, `Help`, `Skip`.
- Browser plugin path timed out during setup, so Playwright was used as the validation fallback.

Known caveats:

- Production deploy and strict production smoke are still pending for this refinement.
- Human-ear ElevenLabs voice acceptance is still pending.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[decisions#2026-05-15 - Patient Focus Mode Prioritizes The Primary Action]], [[source-map#Som Feedback]], [[todo#P2 - Product Polish]]

## 2026-05-15 - POV Trust Audit And Data Realism Gate

Status: passed locally; production voice key blocked.

Audit lens:

- Caregiver: default Today now starts with the real next medication and no fake unread alert before the caregiver acts.
- Patient: tablet Focus Mode still renders one large question-shaped medication prompt with `Done`, `Read aloud`, `Help`, and `Skip` available.
- Som/CTO: voice readiness remains explicit; Settings does not claim acceptance until human hearing review passes.
- Buyer/devil's advocate: Reports no longer depend on random sample data and now show deterministic medication-session adherence tied to generated medication routine IDs.
- UI critic: mobile bottom navigation is reduced to five core care surfaces: Today, Medications, Session, Reports, Settings.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Observed:

- Careflow tests passed.
- Type check passed.
- Production build passed.
- Security checks passed with 0 vulnerabilities, 346 verified registry signatures, and 48 verified attestations.
- Supply-chain dry run passed.
- Local care-flow smoke passed at `http://127.0.0.1:3006`.
- Local smoke medication: `Smoke Omega 1778862650733`.
- Local smoke confirmed mobile no-overflow and first-run local onboarding.
- Local ElevenLabs provider check returned `401`, matching the known invalid local key state.
- Chrome/Computer Use could open the ElevenLabs dashboard URL but the page stayed blank, so key rotation could not be completed from the current automated session.

Rendered QA:

- Screenshot folder outside the repo: `/tmp/cueguide-pov-refined-20260515c`.
- Desktop Today, Reports, Settings, and Medications rendered without framework overlay or relevant console errors.
- Mobile Today, Medications, Reports, Settings, and Signup rendered without horizontal overflow.
- Tablet patient step rendered without overflow; action order remained `Done`, `Read aloud`, `Help`, `Skip`.

Known caveats:

- Strict production ElevenLabs smoke is blocked until `ELEVENLABS_API_KEY` is rotated and re-set in Vercel.
- Authenticated Supabase cloud save/load/RLS proof remains pending.
- `cueguide-test.png` remains unrelated local work and must not be staged.

Linked: [[decisions#2026-05-15 - Seed Data Must Be Deterministic And Honest]], [[source-map#Market And Competitor Signals]], [[todo#P0 - Demo-Critical]]

## 2026-05-15 - POV Trust Audit Production Deploy

Status: deployed; fallback smoke passed; strict ElevenLabs blocked.

Deployment:

- Vercel deployment: `dpl_47yk2DiuRXwoh6RhAByhZ35Qvtcv`
- Production URL: `https://cueguide-web.vercel.app`

Commands:

- `vercel --prod --yes`
- Direct production TTS curl to `/api/elevenlabs/tts`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`

Observed:

- Deploy succeeded and aliased to `https://cueguide-web.vercel.app`.
- Fallback-tolerant production smoke passed.
- Smoke medication: `Smoke Omega 1778862981700`.
- Production mobile overflow check passed.
- Production local onboarding flow passed.
- Direct production TTS returned `401 application/json`.
- Strict production smoke failed with `Expected ElevenLabs audio/mpeg response` and observed `401 application/json`.
- Production visual sanity check rendered desktop Today, desktop Reports, mobile Today, and mobile Settings without horizontal overflow or framework overlays.
- Production screenshot folder outside the repo: `/tmp/cueguide-prod-pov-trust-20260515`.

Known caveats:

- Production voice is not ready until a valid `ELEVENLABS_API_KEY` is rotated/re-set in Vercel and strict smoke returns `audio/mpeg`.
- Browser speech remains the emergency fallback only; it is not accepted as production-quality voice for Som.
- Authenticated Supabase cloud proof is still pending.

Linked: [[production-voice]], [[runbook#Production Voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-16 - ElevenLabs Fallback Masking Fix

Status: local fix passed; production deploy pending.

Root cause:

- Production `/api/elevenlabs/tts` returns `401 application/json`.
- The frontend previously caught that failure and automatically played browser TTS.
- That made the app sound like the same old robotic voice even when `VITE_USE_ELEVENLABS=true`.

Change:

- Added `VITE_ALLOW_BROWSER_TTS_FALLBACK`, defaulting to `false`.
- `speakWithElevenLabs` now reports success/failure instead of silently falling back.
- `playAudio` only uses browser TTS after an ElevenLabs failure when fallback is explicitly enabled.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `vercel env ls production`
- Instrumented local browser check for `speechSynthesis.speak()`

Observed:

- Careflow tests passed.
- Type check passed.
- Production build passed.
- Security checks passed with 0 vulnerabilities, 346 verified registry signatures, and 48 verified attestations.
- Local care-flow smoke passed at `http://127.0.0.1:3006`.
- Local smoke medication: `Smoke Omega 1778863386521`.
- Instrumented browser check observed ElevenLabs `401 application/json` and `speechSynthesis.speak()` call count `0`.
- Vercel production env has `VITE_USE_ELEVENLABS`, but no `VITE_ALLOW_BROWSER_TTS_FALLBACK`, so the production default is false.

Known caveats:

- This stops the bad fallback voice. It does not fix the invalid ElevenLabs key.
- Strict production voice still requires rotating/re-setting `ELEVENLABS_API_KEY` and verifying `200 audio/mpeg`.

Linked: [[decisions#2026-05-16 - Broken ElevenLabs Must Not Masquerade As Browser Voice]], [[production-voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-16 - ElevenLabs Fallback Masking Production Deploy

Status: deployed; production no longer masks a broken ElevenLabs key with browser speech.

Deployment:

- Vercel deployment: `dpl_CP6t3LuXNyebJJt9WTqQLn5W1MBq`
- Production URL: `https://cueguide-web.vercel.app`

Commands:

- `vercel --prod --yes`
- Direct production TTS curl to `/api/elevenlabs/tts`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- Instrumented production browser check for `speechSynthesis.speak()`

Observed:

- Deploy succeeded and aliased to `https://cueguide-web.vercel.app`.
- Direct production TTS still returns `401 application/json`, confirming the current Vercel `ELEVENLABS_API_KEY` is not valid.
- Fallback-tolerant production smoke passed.
- Smoke medication: `Smoke Omega 1778863612372`.
- Production mobile overflow check passed.
- Production local onboarding flow passed.
- Strict production smoke failed as intended with `Expected ElevenLabs audio/mpeg response` and observed `401 application/json`.
- Instrumented production browser check observed ElevenLabs `401 application/json` and `speechSynthesis.speak()` call count `0`.

Known caveats:

- Production will not play the old browser voice while ElevenLabs is broken.
- Real production voice remains blocked until a fresh valid `ELEVENLABS_API_KEY` is saved in Vercel and strict smoke returns `200 audio/mpeg`.

Linked: [[decisions#2026-05-16 - Broken ElevenLabs Must Not Masquerade As Browser Voice]], [[production-voice]], [[runbook#Production Voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-16 - Voice Acceptance UX Local Gate

Status: production deployed; app-level voice gate passed; strict ElevenLabs audio still blocked by invalid key.

Change:

- Settings voice readiness now requires a tiny `/api/elevenlabs/tts` `audio/mpeg` check, not only `/api/elevenlabs/voices`.
- `Read aloud` returns a typed playback result.
- Patient Focus Mode shows calm text when audio is unavailable: `Let us use the words on screen for now.`
- Settings disables `Mark accepted` until an actual ElevenLabs sample plays.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- In-app Browser QA at `http://127.0.0.1:3006`
- Instrumented Playwright QA for blocked voice behavior

Observed:

- Careflow tests passed.
- Type check passed.
- Production build passed.
- Security checks passed with 0 vulnerabilities, 346 verified registry signatures, and 48 verified attestations.
- Dry-run clean install passed.
- Local fallback-tolerant smoke passed.
- Smoke medication: `Smoke Omega 1778905471847`.
- Local mobile overflow check passed.
- Local onboarding flow passed.
- Instrumented blocked-voice check observed ElevenLabs JSON failures and `speechSynthesis.speak()` call count `0`.
- Patient screen showed `Let us use the words on screen for now.`
- Settings showed blocked voice state and disabled `Mark accepted`.

Known caveats:

- Local and production voice are still blocked until a fresh valid `ELEVENLABS_API_KEY` is saved and strict smoke returns `200 audio/mpeg`.

Linked: [[decisions#2026-05-16 - Voice Acceptance Requires A Heard ElevenLabs Sample]], [[production-voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-16 - ElevenLabs Key Rotation And Quota Gate

Status: fresh production key installed; ElevenLabs TTS blocked by account credits, not invalid credentials.

Actions:

- Rotated `ELEVENLABS_API_KEY` in Vercel production using the secure env store.
- Updated ignored `.env.local` with the same server-only key.
- Verified the key can read the ElevenLabs voice library.
- Updated the app so Settings does not consume TTS credits on page load and quota errors are visible to caregivers.

Commands:

- `vercel env rm ELEVENLABS_API_KEY production --yes`
- `vercel env add ELEVENLABS_API_KEY production --sensitive`
- Direct ElevenLabs `/v1/voices` validation
- Direct ElevenLabs `/v1/text-to-speech/.../stream` validation
- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`

Observed:

- Vercel production now shows `ELEVENLABS_API_KEY` created on 2026-05-16.
- ElevenLabs `/v1/voices` returned `200` with `21` voices.
- ElevenLabs TTS returned `quota_exceeded`: account had `1` credit remaining and the sample required `32` credits.
- Careflow tests passed.
- Type check passed.
- Production build passed.
- Security checks passed with 0 vulnerabilities, 346 verified registry signatures, and 48 verified attestations.
- Dry-run clean install passed.
- Local fallback-tolerant smoke passed.
- Smoke medication: `Smoke Omega 1778920744785`.
- Local mobile overflow check passed.
- Local onboarding flow passed.

Known caveats:

- Strict ElevenLabs production smoke cannot pass until the ElevenLabs account has enough TTS credits.
- Human voice acceptance is still pending because a real sample cannot be heard while the account is quota-blocked.

Linked: [[decisions#2026-05-16 - Voice Readiness Must Not Burn TTS Credits]], [[runbook#Production Voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-16 - ElevenLabs Quota Handling Production Deploy

Status: deployed; production now reports the accurate ElevenLabs quota blocker.

Deployment:

- Vercel deployment: `dpl_Ff54ZYNNJ7RqnJ6mgKhbyStCaeuN`
- Final docs-aligned Vercel deployment: `dpl_C8Nh7XdUavTHpmhBt58CM1Ps1en9`
- Production URL: `https://cueguide-web.vercel.app`
- Code commit: `3a560a07`
- Evidence commit: `82bf2427`

Commands:

- `vercel --prod --yes`
- Direct production `/api/elevenlabs/voices` check
- Direct production `/api/elevenlabs/tts` check
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- Production Playwright visual QA for Settings quota state, Reports, desktop, and mobile Today

Observed:

- Deploy succeeded and aliased to `https://cueguide-web.vercel.app`.
- Production `/api/elevenlabs/voices` returned `200 application/json`.
- Production `/api/elevenlabs/tts` returned `401 application/json` with `code: quota_exceeded`.
- Settings showed: `ElevenLabs is connected, but the account is out of TTS credits. Add credits before stakeholder voice review.`
- Fallback-tolerant production smoke passed.
- Smoke medication: `Smoke Omega 1778921139238`.
- Production mobile Today no-overflow check passed.
- Production visual QA found no desktop or mobile overflow.

Known caveats:

- Strict voice smoke remains intentionally blocked until ElevenLabs credits are added.
- The user still needs to do human-ear acceptance after credits are available.

Linked: [[decisions#2026-05-16 - Voice Readiness Must Not Burn TTS Credits]], [[todo#P0 - Demo-Critical]], [[runbook#Production Voice]]

## 2026-05-16 - Funded ElevenLabs Key Strict Production Smoke

Status: passed; production now returns real ElevenLabs `audio/mpeg`.

Deployment:

- Vercel deployment: `dpl_5VpzgfDzjSEmPx7KqFV4j7BZNUfH`
- Production URL: `https://cueguide-web.vercel.app`

Actions:

- Replaced `ELEVENLABS_API_KEY` in Vercel production with a funded-account key.
- Confirmed the funded account includes the selected Bella voice: `Bella - Professional, Bright, Warm` (`hpp4J3VqNfWAUOO0d1Us`).
- Corrected `ELEVENLABS_MODEL_ID` to `eleven_flash_v2_5`.
- Updated ignored `.env.local` with the funded server-only key and corrected model id.

Commands:

- Direct ElevenLabs `/v1/voices` validation against the funded key.
- Direct ElevenLabs TTS validation with `Voice check.`
- `vercel env rm/add ELEVENLABS_API_KEY production`
- `vercel env rm/add ELEVENLABS_MODEL_ID production`
- `vercel --prod --yes`
- Direct production `/api/elevenlabs/voices` check.
- Direct production `/api/elevenlabs/tts` check.
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`

Observed:

- Funded key `/v1/voices` returned `21` voices.
- The configured Bella voice exists in the funded account.
- Local direct TTS with the funded key returned `200 audio/mpeg` with `14,673` bytes after correcting the model id.
- Production `/api/elevenlabs/voices` returned `200 application/json`.
- Production `/api/elevenlabs/tts` returned `200 audio/mpeg` with `50,618` bytes for the Som-standard blue-pill prompt.
- Strict production care-flow smoke passed with ElevenLabs required.
- Smoke medication: `Smoke Omega 1778922456370`.
- Production mobile no-overflow check passed.
- Local onboarding smoke path passed inside strict production smoke.

Known caveats:

- Human-ear acceptance is still required before marking `Voice accepted` for Som: the voice must sound Google Maps-like, human, soft, gentle, and non-commanding.

Linked: [[decisions#2026-05-16 - Validate Voice Key, Voice Id, And Model Before Deploy]], [[todo#P0 - Demo-Critical]], [[runbook#Production Voice]]

## 2026-05-16 - Voice Acceptance UX Production Deploy

Status: deployed; production voice behavior is honest, but real ElevenLabs audio is still blocked.

Deployment:

- Vercel deployment: `dpl_9N2T8gu1ZRF5NVtPVG3xarHdnj2T`
- Production URL: `https://cueguide-web.vercel.app`
- Commit: `2fb63b84`

Commands:

- `vercel --prod --yes`
- Direct production TTS curl to `/api/elevenlabs/tts`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- Instrumented production browser check for blocked voice behavior

Observed:

- Deploy succeeded and aliased to `https://cueguide-web.vercel.app`.
- Direct production TTS still returns `401 application/json`, confirming the current Vercel `ELEVENLABS_API_KEY` is invalid.
- Fallback-tolerant production smoke passed.
- Smoke medication: `Smoke Omega 1778915964924`.
- Production mobile overflow check passed.
- Production local onboarding flow passed.
- Instrumented production check saw ElevenLabs `401 application/json`, `speechSynthesis.speak()` call count `0`, and disabled `Mark accepted`.
- Strict production smoke failed because ElevenLabs did not return `audio/mpeg`; this remains the correct release blocker.

Known caveats:

- This deploy improves honesty and patient/caregiver UX around voice failure. It does not solve the missing valid ElevenLabs key.

Linked: [[decisions#2026-05-16 - Voice Acceptance Requires A Heard ElevenLabs Sample]], [[production-voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-16 - UI Trust And Voice Network Fallback Production Deploy

Status: passed; production deploy is live with stricter ElevenLabs smoke and cleaner caregiver UI.

Deployment:

- Vercel deployment: `dpl_86m78SA1jHwkfAaA184Pu1GXzoSb`
- Production URL: `https://cueguide-web.vercel.app`

Changes verified:

- Reduced caregiver card nesting by opening primary sections and keeping rows/tables as the main layout.
- Replaced the remote Inter import with a system clinical font stack and normalized nonstandard font weights.
- Renamed caregiver `Session` navigation to `Live Session` on desktop while keeping compact mobile navigation.
- Replaced harsh `Past due` primary language with `Needs attention` and caregiver-review language.
- Tightened Settings copy from repeated page-level cards into `System readiness`, voice, data, AI/alerts, and privacy sections.
- Added ElevenLabs TTS network fallback: if a configured local network address fails, the server retries without that address before returning a provider failure.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- Direct local `/api/elevenlabs/tts` check
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- `vercel --prod --yes`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- Production screenshot QA for desktop Today, desktop Settings, mobile Today, and mobile Settings.

Observed:

- Local direct TTS returned `200 audio/mpeg` with `51,871` bytes.
- Strict local smoke passed with ElevenLabs `200 audio/mpeg`, no mobile overflow, and local onboarding coverage.
- Production strict smoke passed with ElevenLabs `200 audio/mpeg`.
- Production smoke medication: `Smoke Omega 1778924452174`.
- Production mobile viewport reported no horizontal overflow.
- Browser console only reported the expected Sentry-disabled warning.

Known caveats:

- Human-ear voice acceptance is still pending; do not mark `Voice accepted` until the user confirms the live voice meets Som's human, soft, gentle standard.
- Supabase authenticated cloud persistence proof remains pending until test credentials are available.

Linked: [[decisions#2026-05-16 - Local Voice Networking Must Fail Softly]], [[source-map#Som Feedback]], [[todo#P2 - Product Polish]]

## 2026-05-16 - Patient Focus Visual Repair Production Deploy

Status: passed; production patient mode no longer uses the boxed poster-card treatment from the screenshot critique.

Deployment:

- Vercel deployment: `dpl_HiysoHKRXRz9GL7cZw1D8rAG6qM1`
- Production URL: `https://cueguide-web.vercel.app`

Changes verified:

- Patient greeting now uses an open full-screen dementia-first layout instead of a centered card slab.
- Greeting copy is split into a short headline and softer support line: `Good morning.` and `Dad, we will go one step at a time.`
- AI/fallback greeting rules no longer force a date into the largest text.
- Medication step screen keeps one question-shaped action, separate location guidance, and visible `Done`, `Read aloud`, `Help`, and `Skip`.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- `vercel --prod --yes`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- Production screenshot QA for tablet greeting, tablet step, and mobile step.

Observed:

- Strict local smoke passed with ElevenLabs `200 audio/mpeg`, local onboarding coverage, and no mobile overflow.
- Strict production smoke passed with ElevenLabs `200 audio/mpeg`.
- Production smoke medication: `Smoke Omega 1778934770846`.
- Production tablet and mobile Patient Focus Mode reported no horizontal overflow.
- Browser console only reported the expected Sentry-disabled warning.

Known caveats:

- Human-ear voice acceptance is still user-owned; the code proves ElevenLabs audio delivery, not subjective voice quality.
- Supabase authenticated cloud persistence proof remains pending until test credentials are available.

Linked: [[decisions#2026-05-16 - Patient Focus Mode Should Feel Like A Calm Room]], [[source-map#Som Feedback]], [[todo#P2 - Product Polish]]

## 2026-05-16 - 10/10 UI Direction Production Deploy

Status: passed; production deploy is live with strict ElevenLabs smoke.

Deployment:

- Commit: `63400bea`
- Vercel deployment: `dpl_CpmA8pXcC84ZNAUJa39ZFgaNq1xn`
- Production URL: `https://cueguide-web.vercel.app`

Changes verified:

- Caregiver Today now reads as a care command surface: `Care dashboard`, next medication, one primary patient-session action, compact status rows, and a flatter medication plan.
- Patient Focus Mode greeting is no longer a boxed poster-card; it uses a calm open layout, shorter greeting, session meta, and question-shaped medication prompts.
- Settings copy is shorter and voice readiness keeps Som's standard visible without hiding that human voice review is still pending.
- Smoke selectors now accept the current `Care dashboard` heading while preserving coverage for the same care loop.

Commands:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `npm ci --ignore-scripts --dry-run`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3006 CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- `vercel --prod --yes`
- `CUEGUIDE_SMOKE_URL=https://cueguide-web.vercel.app CUEGUIDE_REQUIRE_ELEVENLABS=true npm run smoke:careflow`
- Browser QA for desktop Today, tablet Patient Focus Mode greeting/step, Medications, Reports, and Settings.

Observed:

- Type check passed after the smoke selector update.
- Build passed in `2.27s`.
- Security gate passed: lockfile, secret scan, npm audit, registry signatures, and attestations.
- Strict local smoke passed with ElevenLabs `200 audio/mpeg`.
- Local smoke medication: `Smoke Omega 1778937347598`.
- Strict production smoke passed with ElevenLabs `200 audio/mpeg`.
- Production smoke medication: `Smoke Omega 1778937563542`.
- Mobile/local onboarding and no-overflow assertions passed.
- Production mobile no-overflow and local onboarding assertions passed.
- Browser QA showed no horizontal overflow on desktop, tablet patient, or smoke mobile checks.

Known caveats:

- This is a meaningful UI trust improvement, not a 10/10 endpoint. The next pass should continue reducing wordiness, improving visual hierarchy, and testing signup/data flows from fresh-user POVs.
- Human-ear voice acceptance is still user-owned.
- Supabase authenticated cloud persistence proof remains pending until test credentials are available.

Linked: [[decisions#2026-05-16 - Visual Trust Requires Fewer Boxes And Shorter Patient Copy]], [[source-map#Som Feedback]], [[todo#P2 - Product Polish]]
