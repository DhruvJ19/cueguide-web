---
aliases: [decisions, decision-log]
tags: [project, decisions, architecture, log]
created: 2026-05-14
updated: 2026-05-15
---

# CueGuide Decisions

> [!note]
> Append-only decision log. Each decision should link to [[plans]], [[context]], [[todo]], or [[memory]] where useful.

## 2026-05-14 - Root Web App Is Production Demo

#decision #architecture

Decision: Use the root React/Vite web app as the production demo and treat [[CueGuide/BUILD_SUMMARY|nested Expo]] as a later port target.

Reasoning: Maintaining two separate UX systems during the 7-day push slows delivery and creates inconsistent product behavior. The web app now contains the stronger caregiver medication loop.

Linked: [[plans#1. Web Demo Core Loop]], [[context#Nested Expo App]]

## 2026-05-14 - Medication Workflow Is The MVP Spine

#decision #product

Decision: Center the product around medication setup, patient Focus Mode, patient actions, and caregiver alert/session review.

Reasoning: This is the clearest demo path for Som and the most credible caregiver value loop.

Linked: [[plans#North Star]], [[todo#P0 - Demo-Critical]]

## 2026-05-14 - ElevenLabs Must Stay Server-Side

#decision #security #voice

Decision: Use `/api/elevenlabs/tts` and `/api/elevenlabs/voices` as the only ElevenLabs integration boundary.

Reasoning: Provider secrets must never be exposed in browser `VITE_*` variables. Browser code may only call local app APIs.

Linked: [[memory#Technical Lessons]], [[context#Environment Notes]]

## 2026-05-14 - Trim Environment Values Before Feature Gates

#decision #bugfix #deployment

Decision: Trim Vercel/client env values before comparing or sending them.

Reasoning: Vercel env values contained hidden newlines. `VITE_USE_ELEVENLABS` became `"true\n"` and disabled ElevenLabs in the UI even while the server endpoint worked. Server-side API keys with hidden whitespace can also break HTTP headers.

Linked: [[memory#Technical Lessons]], [[todo#P1 - Production Hardening]]

## 2026-05-14 - Demo Fallback Must Handle Bad Supabase Config

#decision #resilience #supabase

Decision: Treat placeholder or malformed Supabase anon keys as unconfigured and use local fallback.

Reasoning: A placeholder browser key caused repeated 401s and made the app feel broken. Demo mode must remain resilient when production credentials are missing or wrong.

Linked: [[context#Environment Notes]], [[memory#Technical Lessons]]

## 2026-05-14 - Completion Dates Use Local Calendar Time

#decision #bugfix #timezone

Decision: Use local `yyyy-MM-dd` dates for completions instead of splitting UTC ISO strings.

Reasoning: Around midnight in Hong Kong, UTC dates can make the current session disappear from Today/Live Session.

Linked: [[memory#Technical Lessons]], [[todo#P1 - Production Hardening]]

## 2026-05-14 - Obsidian Vault Spine Created

#decision #obsidian #knowledge-management

Decision: Create six core project notes: [[plans]], [[memory]], [[context]], [[todo]], [[decisions]], and [[dashboard]].

Reasoning: Future chats need durable project state, Obsidian graph navigation, and less repeated context setup.

Linked: [[dashboard#Quick Links]]

## 2026-05-14 - Use YouTube Course As Process Guide

#decision #production #mobile

Decision: Treat [[YouTube_Mobile_App_Course_BMMcmmnjrM8]] as an execution model: real app loop first, browser/mobile-width verification next, Expo/real-phone port after the web loop is stable.

Reasoning: The course aligns with the existing plan and avoids premature app-store packaging before CueGuide proves the caregiver medication workflow.

Linked: [[plans#Plans Stage]], [[todo#P0 - Demo-Critical]]

## 2026-05-14 - Meta-Optimization Review Completed

#decision #architecture #obsidian #quality

Decision: Use [[meta-optimization]] as the prioritized quality/debt review for the next production pass.

Reasoning: The app now has the right web-first product loop, so the highest leverage is backend policy hardening, server-only provider boundaries, repeatable smoke QA, typed persistence, and source-faithful Obsidian knowledge management.

Linked: [[plans#0. Meta-Optimization Direction]], [[todo#P0 - Demo-Critical]], [[memory#Technical Lessons]], [[context#Project Structure]]

## 2026-05-14 - Production Hardening Local Gate Passed

#decision #qa #release

Decision: Treat the current hardening pass as locally release-ready after tests, type check, build, supply-chain/security checks, dry-run install, and care-flow smoke pass.

Reasoning: The branch now verifies the medication-centered loop end to end before deploy: create/edit medication, patient Begin/Read aloud/Help/Skip/Done, caregiver summary, reports, voice proxy observation, and mobile-width overflow.

Linked: [[qa-log#2026-05-14 - Production-Hardening Local Gate]], [[runbook]], [[todo#P0 - Demo-Critical]]

## 2026-05-14 - ElevenLabs Is A Production Voice Requirement

#decision #voice #production

Decision: Treat ElevenLabs as the required production patient voice path, with browser TTS only as an emergency patient-safety fallback.

Reasoning: Som explicitly rejected robotic/scolding audio and described dementia medication prompts as something that must ask gently rather than order. A production caregiver product cannot make voice quality feel optional.

Linked: [[source-map#Som Feedback]], [[qa-log#2026-05-14 - Production Voice Hardening Local Gate]], [[memory#Product Memory]]

## 2026-05-14 - Patient Voice Plays On Explicit Read Aloud

#decision #voice #ux #resilience

Decision: Patient Focus Mode should call ElevenLabs when the patient taps `Read aloud`, not automatically on greeting, Begin, Help, or every step transition.

Reasoning: Som's direction is gentle navigation, not surprise audio. Explicit playback keeps the patient in control, reduces repeated provider calls during one walkthrough, and lowers ElevenLabs rate-limit risk while preserving the required production voice path.

Linked: [[production-voice#Tone Rules]], [[qa-log#2026-05-14 - Stakeholder Alpha Local Gate]], [[todo#P0 - Demo-Critical]]

## 2026-05-14 - Hybrid Care OS Visual Direction

#decision #ux #accessibility #product

Decision: Redesign CueGuide as a **Hybrid Care OS**: a restrained light clinical operations workspace for caregivers, paired with a separate warm, high-contrast, one-action-at-a-time patient mode.

Reasoning: The dark card-heavy dashboard made the product feel cheap, repetitive, and hard to navigate. Som's guidance and dementia communication research point toward calm language, clear hierarchy, minimal distractions, and patient prompts that ask rather than command.

Linked: [[source-map#Dementia And Accessibility Research]], [[qa-log#2026-05-14 - Hybrid Care OS UI Turnaround Local Gate]], [[todo#P2 - Product Polish]]

## 2026-05-14 - Second-Pass UI Must Behave Like Operations

#decision #ux #product #qa

Decision: Move the caregiver UI beyond visual cleanup into operational surfaces: attention queue, past-due language, medication rows with next-dose/refill status, Live Session timeline, narrative Reports, and grouped readiness Settings.

Reasoning: The first Hybrid Care OS pass improved contrast and navigation but still felt around 5/10. A credible stakeholder alpha needs workflow clarity, not just better colors.

Linked: [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Local Gate]], [[todo#P2 - Product Polish]], [[plans#2. Final Production Hardening]]

## 2026-05-15 - Human Voice Acceptance Is Separate From API Readiness

#decision #voice #qa #product

Decision: Settings must show `Human voice review pending` until a person explicitly marks the ElevenLabs voice accepted for the stakeholder walkthrough.

Reasoning: `/api/elevenlabs/tts` returning `audio/mpeg` proves delivery, not subjective quality. Som's standard is human, soft, gentle, and non-commanding, so the app should not imply voice acceptance from a config flag or machine check alone.

Linked: [[qa-log#2026-05-15 - Product Trust Local Gate]], [[production-voice]], [[todo#P0 - Demo-Critical]]

## 2026-05-15 - Patient Medication Prompts Exclude Caregiver Notes

#decision #ux #safety #product

Decision: Patient Focus Mode medication prompts use only patient-safe pill appearance and location cues. Caregiver instructions stay in caregiver surfaces and never flow into patient prompt text.

Reasoning: Browser QA showed caregiver notes could leak into patient text and create command-like phrasing. Dementia-safe guidance must stay short, question-shaped, and free of operational notes meant for caregivers.

Linked: [[qa-log#2026-05-15 - Product Trust Local Gate]], [[source-map#Som Feedback]], [[memory#Product Memory]]

## 2026-05-15 - Auth And Setup Must Be Honest About Data Mode

#decision #auth #ux #supabase

Decision: Login, signup, onboarding, and `/settings` now use the same light clinical product system and explicitly distinguish cloud auth from local data fallback.

Reasoning: A stakeholder or caregiver should not see a dark starter-style account flow, and the app must not imply cloud production readiness when Supabase authenticated save/load has not been verified. Local mode remains useful, but it is labeled as local data.

Linked: [[qa-log#2026-05-15 - Auth And Setup Trust Pass]], [[todo#P0 - Demo-Critical]], [[context#Commands]]

## 2026-05-15 - Local QA Uses An Isolated CueGuide Port

#decision #qa #developer-experience

Decision: `npm run dev` now serves CueGuide on `127.0.0.1:3006` with strict port behavior.

Reasoning: Browser QA on `3000` and `3004` returned unrelated local apps, creating false test evidence. CueGuide needs a stable local target so screenshots, smoke tests, and manual QA actually inspect this product.

Linked: [[runbook#Local Verification]], [[qa-log#2026-05-15 - Auth And Setup Trust Pass]], [[memory#Verification Memory]]

## 2026-05-15 - UI Trust Pass Prioritizes Clarity Over Explanation

#decision #ux #product #qa

Decision: Caregiver screens should open with the next clinical action, not a product explanation. Today now prioritizes the next medication, session start, attention state, and schedule; Reports prioritizes caregiver interpretation instead of system readiness.

Reasoning: The app still felt crowded and AI-generated because too many surfaces explained CueGuide instead of letting caregivers act. For dementia-care credibility, the UI must feel calm, direct, and operational.

Linked: [[qa-log#2026-05-15 - UI Trust Pass Production Deploy]], [[todo#P2 - Product Polish]], [[source-map#Dementia And Accessibility Research]]

## 2026-05-15 - Google Maps Voice Standard Is The Acceptance Gate

#decision #voice #som #product

Decision: Som's exact written standard — Google Maps voice directions that sound human, soft, and gentle — is the patient voice acceptance gate. ElevenLabs `audio/mpeg` delivery is necessary but not sufficient.

Reasoning: Som did not ask for generic TTS. He gave a specific interaction model: navigation-like guidance that feels calm, human, and gentle. CueGuide should not mark voice accepted until a human confirms that standard in the live product.

Linked: [[production-voice#Requirement]], [[source-map#Som Feedback]], [[todo#P0 - Demo-Critical]]

## 2026-05-15 - Patient Done Is Confirmation Not Proof

#decision #safety #ux #product

Decision: Caregiver Session and Reports must explicitly state that `Done` means patient confirmation inside CueGuide, not proof that medication was physically swallowed.

Reasoning: Som asked how a caregiver knows medication was administered, and hardware competitors can provide stronger dispensing evidence. CueGuide should be useful without overstating what it can verify.

Linked: [[source-map#Som Feedback]], [[qa-log#2026-05-15 - Product Trust QA And Safety Pass]], [[memory#Product Memory]]

## 2026-05-15 - First Run Local Setup Is First-Class

#decision #auth #ux #resilience

Decision: Signup, login, and onboarding must always expose a clear local setup path, even when Supabase browser env is present.

Reasoning: During stakeholder QA, a configured-but-unauthenticated cloud path could make a first-time caregiver feel blocked. Until authenticated cloud save/load is proven, CueGuide must let the full medication loop run locally and label the data mode honestly.

Linked: [[qa-log#2026-05-15 - Fresh User Onboarding Trust Pass]], [[todo#P0 - Demo-Critical]], [[memory#Product Memory]]

## 2026-05-15 - Medication Sessions Name The Medicine

#decision #medication #ux #som

Decision: A medication-generated routine with one scheduled medicine should use the actual medication name, for example `Morning Lisinopril`.

Reasoning: Som pushed that `Medication` cannot be a generic category. The caregiver and patient flow should make the specific medicine visible wherever it drives the session.

Linked: [[source-map#Som Feedback]], [[qa-log#2026-05-15 - Fresh User Onboarding Trust Pass]], [[context#Project Structure]]

## 2026-05-15 - Public Provider Secret Names Are Blocked

#decision #security #mobile #production

Decision: Security checks now fail when provider-secret-style names use browser-public prefixes such as `VITE_*` or `EXPO_PUBLIC_*`, except for approved non-secret public config like Supabase anon keys and public phone/display settings.

Reasoning: Local ignored env files and nested mobile examples can silently teach the wrong integration pattern. The root web app and future Expo port must keep ElevenLabs, AI, and SMS provider secrets server-side.

Linked: [[qa-log#2026-05-15 - Product Trust QA And Safety Pass]], [[runbook#Stop Conditions]], [[todo#P1 - Production Hardening]]
