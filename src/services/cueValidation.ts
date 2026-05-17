import type { AICueData, AICueStep } from '../types';

const MAX_GREETING_CHARS = 180;
const MAX_STEP_CHARS = 160;
const MAX_HELP_CHARS = 180;
const MAX_CONTEXT_CHARS = 480;
const DISALLOWED_PATIENT_TERMS = /\b(dementia|memory loss|forgot|failure|failed|must|hurry|urgent|immediately|noncompliant)\b/i;
const COMMANDING_PREFIX = /^(take|swallow|drink|pick up|open)\b/i;

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maxLength: number): string {
  const cleaned = compactWhitespace(value);
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1).trim()}.` : cleaned;
}

function isPatientSafe(value: string): boolean {
  const cleaned = compactWhitespace(value);
  return Boolean(cleaned) && !DISALLOWED_PATIENT_TERMS.test(cleaned) && !COMMANDING_PREFIX.test(cleaned);
}

export function minimizeCareContext(notes: string, names: string[]): string {
  const redacted = names.reduce((current, name) => {
    const trimmed = name.trim();
    if (!trimmed) return current;
    return current.replace(new RegExp(`\\b${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), 'the caregiver');
  }, notes);

  return truncate(
    redacted
      .replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, 'a saved date')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, 'a saved date')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, 'an email address')
      .replace(/\b\+?\d[\d\s().-]{7,}\d\b/g, 'a phone number'),
    MAX_CONTEXT_CHARS,
  );
}

export function buildFallbackCueData(
  preferredName: string,
  day: string,
  date: string,
  fallbackSteps: AICueStep[],
): AICueData {
  return {
    greeting: `Good morning, ${preferredName}. We will go one step at a time.`,
    steps: fallbackSteps,
    encouragement: `All set, ${preferredName}. Thank you for taking care of yourself.`,
    reviewed: true,
    source: 'fallback',
  };
}

export function validateCueData(
  parsed: unknown,
  fallback: AICueData,
): AICueData {
  if (!parsed || typeof parsed !== 'object') return fallback;
  const candidate = parsed as {
    greeting?: unknown;
    steps?: unknown;
    encouragement?: unknown;
  };

  if (typeof candidate.greeting !== 'string' || !Array.isArray(candidate.steps)) return fallback;

  const steps = candidate.steps
    .map((step): AICueStep | null => {
      if (!step || typeof step !== 'object') return null;
      const candidateStep = step as Partial<Record<keyof AICueStep, unknown>>;
      const text = typeof candidateStep.text === 'string' ? truncate(candidateStep.text, MAX_STEP_CHARS) : '';
      const audioText = typeof candidateStep.audio_text === 'string'
        ? truncate(candidateStep.audio_text, MAX_STEP_CHARS)
        : text;
      const helpText = typeof candidateStep.help_text === 'string'
        ? truncate(candidateStep.help_text, MAX_HELP_CHARS)
        : undefined;

      if (!isPatientSafe(text) || !isPatientSafe(audioText)) return null;
      if (helpText && !isPatientSafe(helpText)) return null;

      return {
        stepId: typeof candidateStep.stepId === 'string' ? candidateStep.stepId : undefined,
        text,
        audio_text: audioText,
        help_text: helpText,
      };
    })
    .filter((step): step is AICueStep => Boolean(step));

  if (steps.length !== fallback.steps.length) return fallback;

  const greeting = truncate(candidate.greeting, MAX_GREETING_CHARS);
  const encouragement = typeof candidate.encouragement === 'string'
    ? truncate(candidate.encouragement, MAX_GREETING_CHARS)
    : fallback.encouragement;

  if (!isPatientSafe(greeting) || !isPatientSafe(encouragement)) return fallback;

  return {
    greeting,
    steps,
    encouragement,
    reviewed: false,
    source: 'ai',
  };
}

export function parseCueJson(text: string): unknown {
  return JSON.parse(text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
}
