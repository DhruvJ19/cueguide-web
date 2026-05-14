import assert from 'node:assert/strict';
import { buildMedicationRoutine } from '../services/medicationRoutine';
import {
  createCareAlertsFromStepEvents,
  createRoutineCompletionAlert,
  validateMedicationDraft,
} from '../services/careAlerts';
import { isUsableSupabaseKey, isUsableSupabaseUrl } from '../services/supabase';
import { buildFallbackCueData, minimizeCareContext, validateCueData } from '../services/cueValidation';
import type { Medication, PatientProfile, StepCompletion } from '../types';

const patient: PatientProfile = {
  id: 'patient-1',
  caregiverId: 'caregiver-1',
  name: 'Robert Chen',
  preferredName: 'Dad',
  primaryCaregiverName: 'Sarah',
  dateOfBirth: '1958-03-15',
  stage: 'early',
  context: 'Keeps medications in the yellow pill box on the kitchen counter.',
  preferences: { fontSize: 30, theme: 'calm', voice: 'female' },
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-13T00:00:00.000Z',
};

const medications: Medication[] = [
  {
    id: 'med-1',
    patientId: 'patient-1',
    name: 'Lisinopril',
    purpose: 'helps keep your blood pressure steady',
    dosage: '10 mg',
    pillColor: 'blue',
    pillShape: 'small round',
    times: ['08:00'],
    instructions: 'Take with breakfast and water.',
    isActive: true,
    createdAt: '2026-05-13T00:00:00.000Z',
    updatedAt: '2026-05-13T00:00:00.000Z',
  },
  {
    id: 'med-2',
    patientId: 'patient-1',
    name: 'Night medicine',
    purpose: 'helps you rest',
    dosage: '1 tablet',
    pillColor: 'white',
    pillShape: 'oval',
    times: ['21:00'],
    isActive: true,
    createdAt: '2026-05-13T00:00:00.000Z',
    updatedAt: '2026-05-13T00:00:00.000Z',
  },
];

const routine = buildMedicationRoutine({
  patient,
  medications,
  scheduledTime: '08:00',
  nowIso: '2026-05-13T08:00:00.000Z',
});

assert.equal(routine.name, 'Morning Medication');
assert.equal(routine.category, 'medication');
assert.equal(routine.steps.length, 2);
assert.equal(routine.steps[0].medicationId, 'med-1');
assert.match(routine.steps[0].instruction, /small round blue pill/i);
assert.match(routine.steps[0].instruction, /blood pressure/i);
assert.match(routine.steps[1].instruction, /water/i);

const events: StepCompletion[] = [
  {
    stepId: 'step-1',
    routineId: 'routine-med-0800',
    patientId: 'patient-1',
    startedAt: '2026-05-13T08:00:00.000Z',
    completedAt: '2026-05-13T08:07:00.000Z',
    status: 'help_requested',
    elapsedSeconds: 420,
    helpRequested: true,
  },
  {
    stepId: 'step-2',
    routineId: 'routine-med-0800',
    patientId: 'patient-1',
    startedAt: '2026-05-13T08:08:00.000Z',
    completedAt: '2026-05-13T08:08:20.000Z',
    status: 'skipped',
    elapsedSeconds: 20,
    skipped: true,
  },
];

const alerts = createCareAlertsFromStepEvents(events, {
  patientName: 'Robert',
  routineName: 'Morning Medication',
  nowIso: '2026-05-13T08:09:00.000Z',
});

assert.equal(alerts.length, 3);
assert.deepEqual(alerts.map((alert) => alert.type), ['help_requested', 'stuck_step', 'step_skipped']);
assert.ok(alerts.every((alert) => alert.patientId === 'patient-1'));
assert.ok(alerts.every((alert) => alert.status === 'unread'));

const completionAlert = createRoutineCompletionAlert({
  patientId: 'patient-1',
  routineId: 'routine-med-0800',
  patientName: 'Robert',
  routineName: 'Morning Medication',
  status: 'partial',
  stepsCompleted: 2,
  stepsTotal: 3,
  minutes: 4,
  nowIso: '2026-05-13T08:14:00.000Z',
});

assert.equal(completionAlert.type, 'routine_completed');
assert.equal(completionAlert.severity, 'attention');
assert.match(completionAlert.title, /Medication session reviewed/i);
assert.match(completionAlert.message, /2 of 3/i);
assert.doesNotMatch(completionAlert.message, /fail|failed|missed/i);

const invalidDraft = validateMedicationDraft({
  ...medications[0],
  name: '  ',
  dosage: '',
  times: ['25:99', '08:00'],
});

assert.equal(invalidDraft.isValid, false);
assert.deepEqual(invalidDraft.errors, {
  name: 'Medication name is required.',
  dosage: 'Dosage is required.',
  times: 'Use 24-hour times like 08:00, separated by commas.',
});

const validDraft = validateMedicationDraft({
  ...medications[0],
  name: ' Lisinopril ',
  dosage: ' 10 mg ',
  times: ['08:00', ' 21:30 '],
});

assert.equal(validDraft.isValid, true);
assert.deepEqual(validDraft.normalized.times, ['08:00', '21:30']);

assert.equal(isUsableSupabaseUrl('https://kueqtpekkqapclczvahc.supabase.co'), true);
assert.equal(isUsableSupabaseUrl('https://mock-supabase-url.supabase.co'), false);
assert.equal(isUsableSupabaseKey('your_supabase_anon_key_here'), false);
assert.equal(isUsableSupabaseKey('mock-anon-key'), false);
assert.equal(isUsableSupabaseKey('placeholder'), false);
assert.equal(isUsableSupabaseKey('header.payload.signature'), true);

const minimizedContext = minimizeCareContext('Robert Chen keeps medicine near Sarah. Phone +1 555 123 4567.', ['Robert Chen', 'Sarah']);
assert.doesNotMatch(minimizedContext, /Robert Chen|Sarah|\+1 555/i);
assert.match(minimizedContext, /caregiver/i);

const fallbackCue = buildFallbackCueData('Dad', 'Thursday', 'May 14', [
  {
    stepId: 'step-1',
    text: 'Pick up the blue pill.',
    audio_text: 'Dad, pick up the blue pill.',
    help_text: 'The blue pill is in the yellow box.',
  },
]);

const unsafeCue = validateCueData({
  greeting: 'Dad, you forgot your medicine.',
  steps: [{ text: 'Hurry and take it now.', audio_text: 'Hurry and take it now.' }],
  encouragement: 'Done.',
}, fallbackCue);
assert.equal(unsafeCue.source, 'fallback');

const safeCue = validateCueData({
  greeting: 'Good morning, {{preferredName}}.',
  steps: [{ stepId: 'step-1', text: 'Pick up the blue pill.', audio_text: 'Pick up the blue pill.', help_text: 'It is in the yellow box.' }],
  encouragement: 'All set.',
}, fallbackCue);
assert.equal(safeCue.source, 'ai');
assert.equal(safeCue.steps.length, 1);

console.log('careflows tests passed');
