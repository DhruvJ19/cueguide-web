---
aliases: [todo, tasks, backlog]
tags: [project, todo, priorities, backlog]
created: 2026-05-14
updated: 2026-05-15
---

# CueGuide Todo

> [!note]
> Active work queue. Keep this aligned with [[plans#Milestones]] and append significant outcomes to [[decisions]].

## P0 - Demo-Critical

- [x] Commit, push, deploy, and rerun strict production smoke for the Hybrid Care OS second-pass UI.
- [x] Complete `supabase/migrations/20260514022823_production_rls_completion_medication_policies.sql` so medication, completion, and alert data have explicit production RLS/realtime coverage.
- [x] Run `npm run smoke:careflow` as a release gate after the next deploy and keep evidence in [[qa-log]].
- [ ] Run one human-operated live walkthrough after hard refresh: medication session -> Begin -> Read aloud -> Help -> Skip -> Done -> caregiver session summary.
- [x] Verify the audible voice is ElevenLabs in the user-facing browser, not browser speech fallback. See [[memory#Technical Lessons]].
- [x] Verify the three Som-standard production TTS sample prompts return `audio/mpeg` through `/api/elevenlabs/tts`. See [[qa-log#2026-05-15 - Product Trust Local Gate]].
- [ ] Verify production voice quality with human ears against Som's exact email standard: Google Maps-like, human, soft, gentle, and non-commanding.
- [x] Confirm production Vercel Supabase env names exist. See [[qa-log#2026-05-14 - Stakeholder Alpha Local Gate]].
- [ ] Verify live Supabase migrations/RLS with an authenticated Supabase session before claiming cloud data production readiness.
- [x] Add read-only Supabase MCP project config so cloud schema verification is ready once user OAuth/auth is complete.
- [ ] Review Som demo flow against [[SOM_DEMO_BRIEF_May6]] and prepare a short talk track.
- [x] Fix local QA false-positive risk by moving CueGuide dev to isolated strict port `3006`.
- [x] Replace legacy dark `/login`, `/signup`, `/onboarding`, and `/settings` surfaces with production-aligned care setup/readiness flows.

## P1 - Production Hardening

- [x] Refactor `src/services/supabase.ts` and store save paths into a typed data gateway with explicit success/failure status.
- [x] Extract patient Focus Mode event handling into a pure session state module and cover Help/Skip/Done/timer behavior in tests.
- [x] Add structured AI cue validation at the server/client boundary with PHI-minimized context.
- [x] Remove public-provider-secret patterns from the nested [[CueGuide/BUILD_SUMMARY|Expo app]] before mobile porting.
- [x] Verify Supabase RLS policies and table coverage against [[context#Project Structure]].
- [x] Audit generated bundle for provider secrets after every env/deploy change.
- [x] Block browser-public provider-secret env names across root web and nested Expo examples.
- [x] Reduce large bundle warning through route/component chunking if time allows.

## P2 - Product Polish

- [x] Replace the dark card-heavy caregiver shell with the [[decisions#2026-05-14 - Hybrid Care OS Visual Direction|Hybrid Care OS]] light clinical UI direction.
- [x] Upgrade the caregiver shell from visual cleanup into operational surfaces: attention queue, next-dose/refill medication rows, Live Session timeline, narrative Reports, and grouped readiness Settings.
- [x] Run the UI Trust Pass: reduce crowded copy, compact Today, simplify mobile header, make Reports caregiver-focused, and redeploy with strict production smoke.
- [x] Tighten README so it describes CueGuide, not the original AI Studio starter.
- [x] Add [[runbook]] for demo/test/deploy steps after browser QA passes.
- [x] Add [[qa-log]] for dated verification evidence.
- [x] Add [[source-map]] linking Som feedback and YouTube guidance to product decisions.
- [ ] Improve core note frontmatter with `status`, `owner`, and `next_review` after the current production pass is stable.
- [x] Expand Reports from placeholder summary into useful caregiver/clinician review.
- [x] Make medication editing first-class, not just add/toggle.
- [x] Add clearer voice fallback language in caregiver-only surfaces.
- [x] Make ElevenLabs readiness depend on a live server check instead of only the public feature flag.
- [ ] Simplify the permanent Codex operating prompt into a short contract plus links to [[memory]], [[context]], and [[meta-optimization]].
- [ ] Add a true authenticated production signup/save/load test account once Supabase CLI or MCP auth is available.
- [x] Extend first-run smoke to cover signup -> local setup -> onboarding -> first medication -> dashboard.
- [ ] Continue market-backed product differentiation work: caregiver interpretation, proof of confirmation limits, and voice-first patient support beyond generic med reminders.

## P3 - Mobile Path

- [ ] Map root web data model into nested [[CueGuide/BUILD_SUMMARY|Expo app]].
- [ ] Test on real phone after web loop is stable.
- [ ] Delay EAS/App Store work until mobile core loop matches web.

## Done Recently

- [x] Rebuilt web app around caregiver medication dashboard and patient Focus Mode.
- [x] Added server-side ElevenLabs proxy.
- [x] Fixed hidden-newline env parsing for ElevenLabs.
- [x] Fixed Supabase placeholder fallback detection.
- [x] Fixed local-date completion handling.
- [x] Added npm supply-chain/security checks.
- [x] Added [[meta-optimization]] review note and linked it from the Obsidian operating system.
- [x] Verified local care-flow smoke in fallback-tolerant mode with no mobile overflow.
- [x] Verified the hardening pass locally with tests, lint, build, security checks, dry-run install, and care-flow smoke. See [[qa-log#2026-05-14 - Production-Hardening Local Gate]].
- [x] Deployed production and verified strict ElevenLabs `audio/mpeg` smoke. See [[qa-log#2026-05-14 - Production Deploy Smoke]].
- [x] Selected a production ElevenLabs stock voice and verified local TTS sample generation. See [[qa-log#2026-05-14 - Production Voice Hardening Local Gate]].
- [x] Deployed production voice hardening and verified strict production ElevenLabs smoke. See [[qa-log#2026-05-14 - Production Voice Hardening Deploy]].
- [x] Verified the Hybrid Care OS UI turnaround locally with screenshots, local care-flow smoke, security checks, and production ElevenLabs endpoint evidence. See [[qa-log#2026-05-14 - Hybrid Care OS UI Turnaround Local Gate]].
- [x] Verified the Hybrid Care OS second-pass UI locally with full gates, screenshot QA, and care-flow smoke. See [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Local Gate]].
- [x] Deployed Hybrid Care OS second-pass UI and verified strict production smoke with ElevenLabs `audio/mpeg`. See [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Production Deploy]].
- [x] Completed Product Trust local gate: question-shaped medication prompts, voice review state, Focus Mode state tests, browser QA, production TTS samples, and chunked build. See [[qa-log#2026-05-15 - Product Trust Local Gate]].
- [x] Deployed Product Trust pass and verified strict production smoke plus production tablet prompt QA. See [[qa-log#2026-05-15 - Product Trust Production Deploy]].
- [x] Deployed UI Trust Pass and verified strict production smoke plus production screenshot QA. See [[qa-log#2026-05-15 - UI Trust Pass Production Deploy]].
- [x] Completed Product Trust QA and Safety Pass locally: multi-POV audit, confirmation-limit UI, stricter secret scanner, local smoke, and Supabase auth caveat. See [[qa-log#2026-05-15 - Product Trust QA And Safety Pass]].
- [x] Deployed Product Trust QA and Safety Pass and verified strict production smoke with ElevenLabs plus confirmation-limit assertions. See [[qa-log#2026-05-15 - Product Trust QA Production Deploy]].
- [x] Verified fresh-user local setup with a real first medication and dashboard naming. See [[qa-log#2026-05-15 - Fresh User Onboarding Trust Pass]].
- [x] Deployed fresh-user onboarding hardening and verified strict production smoke. See [[qa-log#2026-05-15 - Fresh User Onboarding Production Deploy]].
