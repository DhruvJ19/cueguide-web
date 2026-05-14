import type { Step, StepCompletion, StepEventStatus } from '../types';

export type FocusSessionState = 'step' | 'mood';

export interface BuildFocusStepEventInput {
  status: StepEventStatus;
  step: Step;
  routineId: string;
  patientId: string;
  startedAt: string;
  completedAt: string;
}

export interface AdvanceFocusStepInput {
  events: StepCompletion[];
  currentStepIndex: number;
  steps: Step[];
  routineId: string;
  patientId: string;
  newEvent?: StepCompletion;
  nextStartedAt: string;
}

export interface AdvanceFocusStepResult {
  events: StepCompletion[];
  currentStepIndex: number;
  stepStartedAt: string;
  focusState: FocusSessionState;
}

export function buildFocusStepEvent(input: BuildFocusStepEventInput): StepCompletion {
  const elapsedSeconds = input.status === 'started'
    ? 0
    : Math.max(1, Math.round((Date.parse(input.completedAt) - Date.parse(input.startedAt)) / 1000));

  return {
    stepId: input.step.id,
    routineId: input.routineId,
    patientId: input.patientId,
    medicationId: input.step.medicationId,
    startedAt: input.startedAt,
    completedAt: input.status === 'started' ? undefined : input.completedAt,
    status: input.status,
    elapsedSeconds,
    skipped: input.status === 'skipped',
    helpRequested: input.status === 'help_requested',
  };
}

export function countCompletedSteps(events: StepCompletion[]): number {
  return events.filter((event) => event.status === 'completed').length;
}

export function getFocusCompletionStatus(events: StepCompletion[], stepsTotal: number): 'completed' | 'partial' | 'missed' {
  const completed = countCompletedSteps(events);
  if (completed === stepsTotal) return 'completed';
  if (completed === 0) return 'missed';
  return 'partial';
}

export function advanceFocusStep(input: AdvanceFocusStepInput): AdvanceFocusStepResult {
  const nextEvents = input.newEvent ? [...input.events, input.newEvent] : [...input.events];
  if (input.currentStepIndex >= input.steps.length - 1) {
    return {
      events: nextEvents,
      currentStepIndex: input.currentStepIndex,
      stepStartedAt: input.nextStartedAt,
      focusState: 'mood',
    };
  }

  const nextIndex = input.currentStepIndex + 1;
  const startedEvent = buildFocusStepEvent({
    status: 'started',
    step: input.steps[nextIndex],
    routineId: input.routineId,
    patientId: input.patientId,
    startedAt: input.nextStartedAt,
    completedAt: input.nextStartedAt,
  });

  return {
    events: [...nextEvents, startedEvent],
    currentStepIndex: nextIndex,
    stepStartedAt: input.nextStartedAt,
    focusState: 'step',
  };
}
