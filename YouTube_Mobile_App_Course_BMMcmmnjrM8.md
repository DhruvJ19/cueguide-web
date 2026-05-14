---
aliases: [youtube-course, mobile-app-course, BMMcmmnjrM8]
tags: [project, research, youtube, mobile, production]
created: 2026-05-14
updated: 2026-05-14
---

# YouTube Mobile App Course Notes

Source: `https://www.youtube.com/watch?v=BMMcmmnjrM8`

> [!note]
> Transcript fetched locally with `yt-dlp` on 2026-05-14 and summarized for [[plans]], [[todo]], and [[context]]. Use this as a process guide, not as a reason to restart architecture.

## Useful Principles For CueGuide

- Build and prove the product loop first; avoid getting stuck in packaging, stores, or screenshots too early.
- Web-first is a valid path: design and harden the app in browser, then port the proven model to phone.
- Progression should be staged: local app -> API -> database -> cloud -> authentication -> app-store/testing path.
- Mobile should eventually be tested on a real phone, not only an emulator or desktop viewport.
- App-store prep requires privacy/support URLs, screenshots, review login details, and policy/compliance answers.
- Keep the first app surface simple enough to reason about: a few core screens, obvious actions, and a retention loop.

## CueGuide Translation

| Course Principle | CueGuide Action |
| --- | --- |
| Real app, not mockup | Keep [[plans#1. Web Demo Core Loop]] interactive and deployed. |
| Web-first development | Finish root web app before [[plans#4. Mobile Port]]. |
| Add API/database/auth in stages | Harden ElevenLabs, Supabase, and auth without blocking fallback demo. |
| Real-device testing | After web verification, test [[CueGuide/BUILD_SUMMARY|Expo]] on an actual phone. |
| Privacy/support assets | Keep [[context#Environment Notes]] and production policy pages ready before store submission. |

## Immediate Implications

- The next production slice should strengthen repeatable QA and production readiness, not jump straight to app-store packaging.
- The demo must prove caregiver value in under one minute: medication schedule -> patient action -> caregiver status.
- Mobile is important, but only after the web loop and production data boundaries are stable.

Linked: [[plans]], [[todo]], [[decisions]], [[memory]], [[context]]
