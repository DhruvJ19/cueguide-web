---
aliases: [memory, long-term-memory]
tags: [project, memory, preferences, lessons]
created: 2026-05-14
updated: 2026-05-14
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
- Patient-facing UI must avoid failure language. Caregiver-facing UI can show skipped/help/partial status clearly.
- The accepted UI direction is **Hybrid Care OS**: light clinical caregiver operations UI, separate warm dementia-first patient mode, no dark card soup, no generic AI-demo styling.
- Second-pass UI quality standard: caregiver screens must act like operations surfaces, not static cards. Use attention queues, next-dose/refill states, session timelines, narrative reports, and grouped readiness rows.
- The YouTube course reinforces the same operating path: real product loop first, web-first verification, then real-phone mobile port. See [[YouTube_Mobile_App_Course_BMMcmmnjrM8]].

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
- Local hardening smoke at `127.0.0.1:3004` passed the full caregiver medication loop, patient action logging, report view, and mobile overflow check. See [[qa-log#2026-05-14 - Production-Hardening Local Gate]].
- Production smoke at `https://cueguide-web.vercel.app` passed strict ElevenLabs verification with six `200 audio/mpeg` TTS responses. See [[qa-log#2026-05-14 - Production Deploy Smoke]].
- Production voice hardening deploy `dpl_9coWq2n2muPJoHihUN5XbU1nkxqU` passed strict smoke with Bella selected and six `200 audio/mpeg` TTS responses. See [[qa-log#2026-05-14 - Production Voice Hardening Deploy]].
- Stakeholder alpha deploy `dpl_C1ScBDEzNWq57dXvrVe5NSWqe5nm` passed strict production smoke with explicit-Read-aloud ElevenLabs audio and no mobile overflow. See [[qa-log#2026-05-14 - Stakeholder Alpha Production Deploy]].
- Hybrid Care OS UI turnaround passed local gates, local care-flow smoke, screenshot QA, mobile/tablet overflow checks, and production ElevenLabs endpoint verification. See [[qa-log#2026-05-14 - Hybrid Care OS UI Turnaround Local Gate]].
- Hybrid Care OS second-pass UI passed local full gates, screenshot QA, care-flow smoke, and ElevenLabs `audio/mpeg` observation. See [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Local Gate]].
- Hybrid Care OS second-pass production deploy `dpl_GzDvHnVAT4D7FBrj1Z5nYYn3CNJv` passed strict smoke with ElevenLabs `200 audio/mpeg` and no mobile overflow. See [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Production Deploy]].

## Obsidian Maintenance Rules

- Every major implementation or decision should append to [[decisions]].
- Active priorities belong in [[todo]].
- Architectural state belongs in [[context]].
- Roadmap changes belong in [[plans]].
- High-level navigation belongs in [[dashboard]].
- Quality/debt reviews belong in [[meta-optimization]] so future chats can start from the same leverage map.
