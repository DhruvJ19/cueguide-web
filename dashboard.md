---
aliases: [dashboard, home, moc]
tags: [project, dashboard, moc, obsidian]
created: 2026-05-14
updated: 2026-05-16
---

# CueGuide Dashboard

> [!note]
> Obsidian home page and Map of Content for CueGuide. Start here, then read [[plans]], [[memory]], [[context]], [[todo]], and [[decisions]].

## Plans

- [[plans]] - master roadmap, architecture direction, milestones, quality gates.
- Current stage: web-first stakeholder alpha hardening.
- Current priority: confirm live ElevenLabs audio, production data posture, and stakeholder readiness. See [[todo#P0 - Demo-Critical]].
- Product Trust priority: keep voice acceptance honest, patient prompts question-shaped, and caregiver walkthrough evidence current. See [[qa-log#2026-05-15 - Product Trust Local Gate]].
- Current trust pass: auth/setup and local QA target repaired. See [[qa-log#2026-05-15 - Auth And Setup Trust Pass]].
- Current UI/UX refactor: caregiver dashboard split into focused view modules and production secondary routes cleaned up. See [[qa-log#2026-05-15 - UI/UX Trust Refactor Local Gate]].
- Latest production UI/UX refactor passed strict smoke and rendered QA. See [[qa-log#2026-05-15 - UI/UX Trust Refactor Production Deploy]].
- Latest daily-use refinement local gate added refill dates, shorter patient prompts, and local backup export. See [[qa-log#2026-05-15 - Daily Use Refinement Local Gate]].
- Latest daily-use production deploy passed strict smoke and rendered QA. See [[qa-log#2026-05-15 - Daily Use Refinement Production Deploy]].
- Supabase proof gate exists but needs a normal test caregiver account before cloud readiness can be claimed. See [[qa-log#2026-05-15 - Supabase Proof Gate Added]].
- Latest multi-POV UI trust refinement passed locally and is ready for production deploy/smoke. See [[qa-log#2026-05-15 - Multi-POV UI Trust Refinement Local Gate]].

## Memory

- [[memory]] - durable project/user/product lessons.
- Key lessons: server-side ElevenLabs, trimmed env values, local Supabase fallback, local-date completions.

## Todo

- [[todo]] - active queue and backlog.
- Top active work:
  - Live browser walkthrough pass.
  - Human-ear ElevenLabs quality check against Som's Google Maps standard.
  - Live Supabase migration/RLS verification.
  - Authenticated cloud signup/save/load proof.

## Decisions

- [[decisions]] - append-only architecture/product log.
- Recent important decisions:
  - [[decisions#2026-05-14 - Root Web App Is Production Demo]]
  - [[decisions#2026-05-14 - ElevenLabs Must Stay Server-Side]]
  - [[decisions#2026-05-14 - Trim Environment Values Before Feature Gates]]
  - [[decisions#2026-05-14 - Meta-Optimization Review Completed]]

## Meta-Optimization

- [[meta-optimization]] - prioritized quality, architecture, security, and Obsidian workflow review.
- Top leverage now:
  - Complete Supabase RLS/realtime policy coverage.
  - Keep provider secrets server-side across web and future mobile.
  - Promote the care-flow smoke test into a release gate.
  - Refactor persistence/session logic only where it improves demo reliability.

## Release Evidence

- [[runbook]] - local checks, production smoke, and demo walkthrough.
- [[qa-log]] - dated verification evidence.
- [[source-map]] - Som and YouTube guidance mapped to product decisions.
- [[production-voice]] - ElevenLabs production voice requirement, selected voice, and tone rules.
- Latest local gate: [[qa-log#2026-05-14 - Stakeholder Alpha Local Gate]].
- Latest production gate: [[qa-log#2026-05-14 - Stakeholder Alpha Production Deploy]].
- Latest production voice gate: [[qa-log#2026-05-14 - Production Voice Hardening Deploy]].
- Latest UI gate: [[qa-log#2026-05-14 - Hybrid Care OS UI Turnaround Local Gate]].
- Latest second-pass UI gate: [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Local Gate]].
- Latest second-pass production gate: [[qa-log#2026-05-14 - Hybrid Care OS Second-Pass Production Deploy]].
- Latest Product Trust local gate: [[qa-log#2026-05-15 - Product Trust Local Gate]].
- Latest Product Trust production gate: [[qa-log#2026-05-15 - Product Trust Production Deploy]].
- Latest auth/setup gate: [[qa-log#2026-05-15 - Auth And Setup Trust Pass]].
- Latest UI trust gate: [[qa-log#2026-05-15 - UI Trust Pass Production Deploy]].
- Latest product-trust safety gate: [[qa-log#2026-05-15 - Product Trust QA And Safety Pass]].
- Latest production product-trust gate: [[qa-log#2026-05-15 - Product Trust QA Production Deploy]].
- Latest first-run trust gate: [[qa-log#2026-05-15 - Fresh User Onboarding Trust Pass]].
- Latest first-run production gate: [[qa-log#2026-05-15 - Fresh User Onboarding Production Deploy]].
- Latest UI/UX refactor local gate: [[qa-log#2026-05-15 - UI/UX Trust Refactor Local Gate]].
- Latest UI/UX refactor production gate: [[qa-log#2026-05-15 - UI/UX Trust Refactor Production Deploy]].
- Latest daily-use refinement gate: [[qa-log#2026-05-15 - Daily Use Refinement Local Gate]].
- Latest daily-use production gate: [[qa-log#2026-05-15 - Daily Use Refinement Production Deploy]].
- Latest Supabase proof gate: [[qa-log#2026-05-15 - Supabase Proof Gate Added]].
- Latest multi-POV UI refinement gate: [[qa-log#2026-05-15 - Multi-POV UI Trust Refinement Local Gate]].
- Latest POV trust/data realism gate: [[qa-log#2026-05-15 - POV Trust Audit And Data Realism Gate]].
- Latest POV trust production deploy: [[qa-log#2026-05-15 - POV Trust Audit Production Deploy]].
- Latest ElevenLabs fallback fix: [[qa-log#2026-05-16 - ElevenLabs Fallback Masking Production Deploy]].

## Context

- [[context]] - live technical snapshot.
- Production: `https://cueguide-web.vercel.app`
- Branch: `codex/production-revamp`
- Draft PR: `https://github.com/DhruvJ19/cueguide-web/pull/1`

## Quick Links

### Core Notes

- [[plans]]
- [[memory]]
- [[context]]
- [[todo]]
- [[decisions]]
- [[dashboard]]

### Product And Stakeholder Walkthrough

- [[YouTube_Mobile_App_Course_BMMcmmnjrM8]]
- [[meta-optimization]]
- [[SOM_DEMO_BRIEF_May6]]
- [[EmailThread_Ongoing]]
- [[Som_Evaluation/DELIVERABLE_1_Agile_Feature_Spec]]
- [[Som_Evaluation/DELIVERABLE_2_Technical_Architecture]]
- [[Som_Evaluation/CUEGUIDE_BUILD_SPEC]]

### Code Areas

- [[context#Project Structure]]
- `src/views/CaregiverDashboard.tsx`
- `src/views/PatientFocusMode.tsx`
- `src/services/elevenlabs.ts`
- `api/elevenlabs/tts.ts`
- `supabase/migrations/20260513093902_medication_alert_production_schema.sql`

### Operations

- [[context#Commands]]
- [[SECURITY]]
- [[todo#P1 - Production Hardening]]
