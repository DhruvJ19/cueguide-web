---
aliases: [dashboard, home, moc]
tags: [project, dashboard, moc, obsidian]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide Dashboard

> [!note]
> Obsidian home page and Map of Content for CueGuide. Start here, then read [[plans]], [[memory]], [[context]], [[todo]], and [[decisions]].

## Plans

- [[plans]] - master roadmap, architecture direction, milestones, quality gates.
- Current stage: web-first stakeholder alpha hardening.
- Current priority: confirm live ElevenLabs audio, production data posture, and stakeholder readiness. See [[todo#P0 - Demo-Critical]].

## Memory

- [[memory]] - durable project/user/product lessons.
- Key lessons: server-side ElevenLabs, trimmed env values, local Supabase fallback, local-date completions.

## Todo

- [[todo]] - active queue and backlog.
- Top active work:
  - Live browser walkthrough pass.
  - Human-ear ElevenLabs quality check against Som's Google Maps standard.
  - Live Supabase migration/RLS verification.

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
