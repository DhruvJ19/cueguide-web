---
aliases: [todo, tasks, backlog]
tags: [project, todo, priorities, backlog]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide Todo

> [!note]
> Active work queue. Keep this aligned with [[plans#Milestones]] and append significant outcomes to [[decisions]].

## P0 - Demo-Critical

- [x] Complete `supabase/migrations/20260514022823_production_rls_completion_medication_policies.sql` so medication, completion, and alert data have explicit production RLS/realtime coverage.
- [ ] Run `npm run smoke:careflow` as a release gate after the next deploy and keep evidence in [[qa-log]].
- [ ] Run one manual live demo in a real browser after hard refresh: medication session -> Begin -> Read aloud -> Help -> Skip -> Done -> caregiver session summary.
- [ ] Verify the audible voice is ElevenLabs in the user-facing browser, not browser speech fallback. See [[memory#Technical Lessons]].
- [ ] Confirm production Supabase env values are valid or intentionally disable Supabase for demo fallback.
- [ ] Review Som demo flow against [[SOM_DEMO_BRIEF_May6]] and prepare a short talk track.

## P1 - Production Hardening

- [x] Refactor `src/services/supabase.ts` and store save paths into a typed data gateway with explicit success/failure status.
- [ ] Extract patient Focus Mode event handling into a pure session state module and cover Help/Skip/Done/timer behavior in tests.
- [x] Add structured AI cue validation at the server/client boundary with PHI-minimized context.
- [x] Remove public-provider-secret patterns from the nested [[CueGuide/BUILD_SUMMARY|Expo app]] before mobile porting.
- [x] Verify Supabase RLS policies and table coverage against [[context#Project Structure]].
- [x] Audit generated bundle for provider secrets after every env/deploy change.
- [ ] Reduce large bundle warning through route/component chunking if time allows.

## P2 - Product Polish

- [x] Tighten README so it describes CueGuide, not the original AI Studio starter.
- [x] Add [[runbook]] for demo/test/deploy steps after browser QA passes.
- [x] Add [[qa-log]] for dated verification evidence.
- [x] Add [[source-map]] linking Som feedback and YouTube guidance to product decisions.
- [ ] Improve core note frontmatter with `status`, `owner`, and `next_review` after the current production pass is stable.
- [x] Expand Reports from placeholder summary into useful caregiver/clinician review.
- [x] Make medication editing first-class, not just add/toggle.
- [x] Add clearer voice fallback language in caregiver-only surfaces.
- [ ] Simplify the permanent Codex operating prompt into a short contract plus links to [[memory]], [[context]], and [[meta-optimization]].

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
