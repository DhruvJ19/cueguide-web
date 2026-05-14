---
aliases: [decisions, decision-log]
tags: [project, decisions, architecture, log]
created: 2026-05-14
updated: 2026-05-14
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
