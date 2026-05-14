---
aliases: [qa-log, verification-log, test-log]
tags: [project, qa, verification, release]
created: 2026-05-14
updated: 2026-05-15
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
