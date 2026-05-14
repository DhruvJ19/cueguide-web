---
aliases: [meta-optimization, optimization-review, quality-review]
tags: [project, meta, architecture, obsidian, review]
created: 2026-05-14
updated: 2026-05-14
---

# CueGuide Meta-Optimization Review

> [!note]
> This review cross-references [[plans]], [[memory]], [[context]], [[todo]], [[decisions]], [[dashboard]], the Som transcripts, and the root web codebase. It is the quality leverage map for the next production pass.

## Executive Summary

CueGuide's web-first direction is correct. The root app now has the right product spine: medication setup -> patient Focus Mode -> action logging -> caregiver alerts. The next leverage is not more screens; it is hardening the backend contract, making voice/AI boundaries impossible to misuse, turning smoke QA into a release gate, and cleaning the vault so future chats start from source-of-truth context instead of rediscovering the same risks.

## Codebase And Architecture

| Priority | Recommendation | Benefit | Files Changed Or Created | Action |
| --- | --- | --- | --- | --- |
| P0 | Finish Supabase RLS and realtime coverage for medications, completions, care alerts, and patient ownership. | Prevents cloud data from becoming demo-only or overexposed; aligns with [[decisions#2026-05-14 - Demo Fallback Must Handle Bad Supabase Config]]. | `supabase/migrations/20260514022823_production_rls_completion_medication_policies.sql`, `supabase/migrations/20260513093902_medication_alert_production_schema.sql` | Implement immediately. |
| P0 | Remove all public-provider-secret patterns before mobile work, especially nested Expo direct ElevenLabs usage. | Prevents the mobile port from copying a browser-exposed provider key pattern; preserves [[decisions#2026-05-14 - ElevenLabs Must Stay Server-Side]]. | `CueGuide/src/services/voice.ts`, `CueGuide/src/services/ai.ts`, `CueGuide/.env.example`, future mobile API proxy | Implement before Expo port. |
| P0 | Make the care-flow smoke test an actual gate and keep screenshots/console evidence outside the repo. | Converts the YouTube "real product loop first" advice into repeatable proof. | `scripts/smoke-careflow.ts`, `package.json`, future CI workflow | Implement immediately. |
| P1 | Replace broad `any` and silent `console.error` persistence failures with a typed data gateway and explicit save status. | Makes Supabase/local fallback behavior debuggable and production-grade instead of optimistic-only. | `src/services/supabase.ts`, `src/store/*Store.ts`, `src/services/dataSync.ts`, `src/types.ts` | Implement next. |
| P1 | Extract patient session flow into a pure state machine. | Makes Help/Skip/Done/timer behavior testable without browser automation and protects the patient UX from regressions. | `src/views/PatientFocusMode.tsx`, new `src/services/patientSession.ts`, `src/__tests__/careflows.test.ts` | Implement next. |
| P1 | Add structured AI cue validation with PHI minimization at the server boundary. | Makes AI optional, reviewable, and safer; prevents malformed model output from reaching patient prompts. | `src/services/ai.ts`, `api/ai/cue.ts`, possible `src/services/cueSchema.ts` | Implement next. |
| P2 | Replace starter-app docs and legacy glass/demo surfaces with CueGuide-specific runbooks and design primitives. | Removes AI-slop residue and keeps future contributors aligned with the healthcare SaaS tone. | `README.md`, `SECURITY.md`, `src/index.css`, legacy `src/components/*` pages | Park in [[todo#P2 - Product Polish]]. |

## System Instructions And Obsidian Workflow

| Priority | Recommendation | Benefit | Files Changed Or Created | Action |
| --- | --- | --- | --- | --- |
| P0 | Keep this note as the permanent quality leverage map. | Gives future chats one review artifact instead of repeating a full codebase audit. | [[meta-optimization]], [[dashboard]] | Implemented now. |
| P0 | Add a release runbook after the current smoke gate passes. | Makes "test, verify, deploy" teachable and repeatable for a non-technical operator. | New `runbook.md`, [[dashboard]], [[todo]] | Implement immediately after QA pass. |
| P1 | Add a QA log for dated browser/security/deploy evidence. | Preserves proof across chats and stops "did we verify this?" loops. | New `qa-log.md`, [[dashboard]], [[memory]] | Implement next. |
| P1 | Add a source map that links Som feedback and YouTube guidance to product decisions. | Improves Obsidian graph value and keeps the demo narrative source-faithful. | New `source-map.md`, [[dashboard]], [[decisions]] | Implement next. |
| P1 | Extend YAML frontmatter with `status`, `owner`, and `next_review` on core notes. | Improves sorting and review cadence inside Obsidian. | [[plans]], [[memory]], [[context]], [[todo]], [[decisions]], [[dashboard]] | Park until current production pass is stable. |
| P2 | Simplify the permanent prompt into a short operating contract plus links to vault notes. | Reduces prompt drag while keeping behavior consistent through [[memory]] and [[context]]. | Future `codex-operating-system.md` | Park in [[todo#P2 - Product Polish]]. |

## Exact Diffs To Apply Later

### Supabase RLS Migration Sketch

```sql
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_alerts ENABLE ROW LEVEL SECURITY;

-- Policy ownership should accept either patients.caregiver_id = auth.uid()
-- or patients.caregiver_id referencing caregivers.id where caregivers.user_id = auth.uid().
```

### Mobile Voice Boundary Sketch

```ts
// Expo/mobile should call the CueGuide backend, not ElevenLabs directly.
await fetch(`${apiBaseUrl}/api/elevenlabs/tts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, voiceId }),
});
```

### Data Gateway Sketch

```ts
type SaveResult<T> =
  | { ok: true; data: T | null; source: 'supabase' | 'local' }
  | { ok: false; error: string; source: 'supabase' | 'local' };
```

## Immediate Next Slice

1. Complete the blank Supabase RLS migration.
2. Run `npm test`, `npm run lint`, `npm run build`, `npm run security:all`, and `npm run smoke:careflow`.
3. Add `runbook.md` and `qa-log.md` only after the smoke loop has evidence.
4. Then tighten README/security/env docs and remove mobile public-secret patterns before Expo work.

Linked: [[plans#2. Final Production Hardening]], [[todo#P0 - Demo-Critical]], [[decisions#2026-05-14 - Meta-Optimization Review Completed]], [[YouTube_Mobile_App_Course_BMMcmmnjrM8]]
