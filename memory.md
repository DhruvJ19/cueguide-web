---
aliases: [memory, long-term-memory]
tags: [project, memory, preferences, lessons]
created: 2026-05-14
updated: 2026-05-15
---

# CueGuide Memory

> [!note]
> This file stores durable project memory so future chats do not repeat context gathering. Link new takeaways back to [[plans]], [[context]], [[todo]], and [[decisions]].

## User Preferences

- The user wants autonomous senior-engineer execution: inspect the repo, implement, verify, deploy, and report clearly.
- The user is relying heavily on Codex and prefers non-technical explanations unless implementation detail matters.
- The project folder is also an Obsidian vault. Core notes must stay graph-ready with wikilinks and clean YAML frontmatter.
- Avoid generic AI-demo language. CueGuide must feel like a credible caregiver medication product.
- Preserve unrelated local changes. `cueguide-test.png` has repeatedly been left uncommitted intentionally.

## Product Memory

- Root web app is the production demo. The nested [[CueGuide/BUILD_SUMMARY|Expo app]] is a port target, not a competing UX system.
- The MVP loop is: caregiver medication setup -> patient Focus Mode -> patient action logging -> caregiver alerts/session summary.
- Som written feedback on 2026-05-14: patient audio should feel like Google Maps voice directions: human, soft, and gentle.
- Som also emphasized that dementia patients should be asked, not ordered; medication voice prompts must avoid command tone.
- Som's exact email standard is now the acceptance gate: do not mark voice accepted from API success alone; it must sound like calm Google Maps-style navigation in the live app.
- Patient-facing UI must avoid failure language. Caregiver-facing UI can show skipped/help/partial status clearly.
- The accepted UI direction is **Hybrid Care OS**: light clinical caregiver operations UI, separate warm dementia-first patient mode, no dark card soup, no generic AI-demo styling.
- Second-pass UI quality standard: caregiver screens must act like operations surfaces, not static cards. Use attention queues, next-dose/refill states, session timelines, narrative reports, and grouped readiness rows.
- UI Trust standard: reduce explanation copy until the next caregiver action is obvious. Today should lead with next medication, start session, attention state, and schedule; Reports should show care interpretation, not system plumbing.
- UI/UX Trust standard: keep production routes in one clinical shell, expose only real care destinations in navigation/command palette, and avoid fake enterprise surfaces that make the app feel like a prototype.
- Product Trust standard: technical ElevenLabs delivery is not the same as human voice acceptance. Settings must show human review pending until a person marks the voice accepted for the walkthrough.
- Patient medication prompts must never include caregiver-only instructions. Instructions like "ask, do not command" belong in caregiver notes, not patient Focus Mode.
- The YouTube course reinforces the same operating path: real product loop first, web-first verification, then real-phone mobile port. See [[YouTube_Mobile_App_Course_BMMcmmnjrM8]].
- Market review reinforces Som's concern: reminder apps and caregiver alerts already exist, so CueGuide must differentiate through dementia-safe patient guidance, caregiver event interpretation, and honest medication-confirmation language.
- `Done` is patient confirmation only, not proof the pill was swallowed. Keep this explicit in caregiver Session/Reports and never imply verified administration without hardware, caregiver observation, or another confirmation source.
- First-run local setup is a real supported path, even when Supabase browser env exists. Caregivers must always be able to choose local setup while cloud auth/proof is pending.
- Medication session names should expose the actual medicine when one scheduled medication drives the routine, for example `Morning Lisinopril` instead of generic `Morning Medication`.

## Technical Lessons

- ElevenLabs must stay server-side through `/api/elevenlabs/*`; never expose provider secrets as `VITE_*`.
- The nested Expo app still contains historical public-provider-secret patterns. Do not port or ship mobile voice/AI until those calls use a server boundary like the root web app.
- The nested Expo app has now been moved to a backend-proxy pattern through `EXPO_PUBLIC_CUEGUIDE_API_BASE_URL`; do not reintroduce public ElevenLabs/OpenRouter keys during the mobile port.
- Hidden newlines in Vercel env vars caused `VITE_USE_ELEVENLABS` to evaluate as disabled in the frontend. Trim env values before using them. See [[decisions#2026-05-14 - Trim Environment Values Before Feature Gates]].
- Hidden newlines in `ELEVENLABS_API_KEY` caused invalid header errors. Server handlers must trim provider keys.
- Placeholder Supabase values can look "configured" unless validated. Demo fallback should activate for mock, placeholder, or malformed anon keys.
- Completion dates must use local calendar time, not UTC string splitting, or late-night Hong Kong sessions can disappear from "today."
- A blank Supabase migration is a real production risk. Schema files should not be left as placeholders once created with the CLI.
- The highest leverage refactor is a typed data gateway with explicit save results; silent persistence errors make the app look fine while cloud writes fail.
- Medication save paths now report typed persistence results, so caregiver UI can surface cloud save failures instead of silently swallowing them.
- Browser-public env prefixes are blocked for provider secrets. Do not introduce ElevenLabs, AI, SMS auth, or other provider secrets as `VITE_*` or `EXPO_PUBLIC_*`; route through server APIs.
- Supabase MCP is configured through `.mcp.json` in read-only mode for project `kueqtpekkqapclczvahc`. It still requires user OAuth/auth before MCP tools appear in Codex.

## Verification Memory

Recent verified checks:

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run security:all`
- `CUEGUIDE_SMOKE_URL=http://127.0.0.1:3004 CUEGUIDE_REQUIRE_ELEVENLABS=false npm run smoke:careflow`
- `npm ci --ignore-scripts --dry-run`
- Production page: `https://cueguide-web.vercel.app`
- Production ElevenLabs TTS: `/api/elevenlabs/tts` returns `audio/mpeg`.
- Production voice target is ElevenLabs Bella (`hpp4J3VqNfWAUOO0d1Us`) using `eleven_flash_v2_5`, routed only through `/api/elevenlabs/*`.
- Patient Focus Mode should trigger ElevenLabs from explicit `Read aloud` actions rather than automatic step transitions, reducing surprise audio and provider rate-limit risk.
- Patient Focus Mode event handling now has a pure session module for started, help requested, skipped, stuck, completed, and completion-status logic.
- Medication prompts are question-shaped by default: "Would you like to..." instead of "next take" or direct command language.
- Vite build uses manual vendor chunks for Supabase, motion, charts, PDF, AI, and general vendor code; the large-bundle warning is cleared.
- Local hardening smoke at `127.0.0.1:3004` passed the full caregiver medication loop, patient action logging, report view, and mobile overflow check. See [[qa-log#2026-05-14 - Production-Hardening Local Gate]].
- Production smoke at `https://cueguide-web.vercel.app` passed strict ElevenLabs verification with six `200 audio/mpeg` TTS responses. See [[qa-log#2026-05-14 - Production Deploy Smoke]].
- Production voice hardening deploy `dpl_9coWq2n2muPJoHihUN5XbU1nkxqU` passed strict smoke with Bella selected and six `200 audio/mpeg` TTS responses. See [[qa-log#2026-05-14 - Production Voice Hardening Deploy]].
- Stakeholder alpha deploy `dpl_C1ScBDEzNWq57dXvrVe5NSWqe5nm` passed strict production smoke with explicit-Read-aloud ElevenLabs audio and no mobile overflow. See [[qa-log#2026-05-14 - Stakeholder Alpha Production Deploy]].
- Hybrid Care OS UI turnaround passed local gates, local care-flow smoke, screenshot QA, mobile/tablet overflow checks, and production ElevenLabs endpoint verification. See [[qa-log#2026-05-14 - Hybrid Care OS UI Turnaround Local Gate]].
- Hybrid Care OS second-pass UI passed local full gates, screenshot QA, care-flow smoke, and ElevenLabs `audio/mpeg` observation. See [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Local Gate]].
- Hybrid Care OS second-pass production deploy `dpl_GzDvHnVAT4D7FBrj1Z5nYYn3CNJv` passed strict smoke with ElevenLabs `200 audio/mpeg` and no mobile overflow. See [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Production Deploy]].
- Product Trust local gate passed on 2026-05-15 with tests, lint, build, security checks, dry-run install, local smoke, browser QA, production TTS samples, and no patient prompt leakage. See [[qa-log#2026-05-15 - Product Trust Local Gate]].
- Product Trust production deploy `dpl_483NEJGpLeJ9fqHoyipJpY6TCeMo` passed strict smoke and production tablet prompt QA. See [[qa-log#2026-05-15 - Product Trust Production Deploy]].
- Local ports `3000` and `3004` served unrelated apps during QA; CueGuide local dev now uses strict `127.0.0.1:3006`. See [[qa-log#2026-05-15 - Auth And Setup Trust Pass]].
- Login, signup, onboarding, and `/settings` now use the light clinical CueGuide shell and label local fallback honestly. See [[decisions#2026-05-15 - Auth And Setup Must Be Honest About Data Mode]].
- UI Trust production deploy `dpl_BgUFtUjB5KxEVManqvgPL2GHRcrL` passed strict smoke with ElevenLabs `200 audio/mpeg`, no mobile overflow, and screenshot QA for Today, Medications, Reports, Settings, and mobile Login. See [[qa-log#2026-05-15 - UI Trust Pass Production Deploy]].
- Product Trust QA and Safety Pass passed locally on 2026-05-15 with confirmation-limit UI, expanded secret scanning, local smoke, security checks, screenshot QA, and Supabase auth caveat documented. See [[qa-log#2026-05-15 - Product Trust QA And Safety Pass]].
- Product Trust QA production deploy `dpl_HZcXhLtPUhh4pBGiqSXrjMpJeVjQ` passed strict smoke with ElevenLabs `200 audio/mpeg`, confirmation-limit assertions, and no mobile overflow. See [[qa-log#2026-05-15 - Product Trust QA Production Deploy]].
- Fresh-user onboarding trust pass verified signup -> local setup -> first medication -> dashboard on `127.0.0.1:3006`; dashboard showed `Morning Smoke Starter Med` and no mobile overflow. See [[qa-log#2026-05-15 - Fresh User Onboarding Trust Pass]].
- Fresh-user onboarding production deploy `dpl_3i1nbfSpDKHbURc6E3XV9in2oZDE` passed strict smoke with ElevenLabs `200 audio/mpeg`, local onboarding coverage, exact medication naming, and no mobile overflow. See [[qa-log#2026-05-15 - Fresh User Onboarding Production Deploy]].
- UI/UX Trust Refactor local gate passed on 2026-05-15 with focused caregiver view modules, clinical secondary routes, real-route command palette, full local gates, local smoke, and screenshot QA. See [[qa-log#2026-05-15 - UI/UX Trust Refactor Local Gate]].

## Obsidian Maintenance Rules

- Every major implementation or decision should append to [[decisions]].
- Active priorities belong in [[todo]].
- Architectural state belongs in [[context]].
- Roadmap changes belong in [[plans]].
- High-level navigation belongs in [[dashboard]].
- Quality/debt reviews belong in [[meta-optimization]] so future chats can start from the same leverage map.
