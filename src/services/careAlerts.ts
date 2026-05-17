import { v4 as uuidv4 } from 'uuid';
import type { CareAlert, Medication, RoutineStatus, StepCompletion } from '../types';

interface AlertContext {
  patientName: string;
  routineName: string;
  nowIso?: string;
}

export function createCareAlertsFromStepEvents(events: StepCompletion[], context: AlertContext): CareAlert[] {
  const now = context.nowIso || new Date().toISOString();
  const alerts: CareAlert[] = [];

  events.forEach((event) => {
    if (event.helpRequested || event.status === 'help_requested') {
      alerts.push({
        id: uuidv4(),
        patientId: event.patientId,
        routineId: event.routineId,
        stepId: event.stepId,
        medicationId: event.medicationId,
        type: 'help_requested',
        severity: 'attention',
        title: 'Help requested',
        message: `${context.patientName} asked for help during ${context.routineName}.`,
        status: 'unread',
        createdAt: now,
      });
    }

    if (event.elapsedSeconds >= 300 || event.status === 'stuck') {
      alerts.push({
        id: uuidv4(),
        patientId: event.patientId,
        routineId: event.routineId,
        stepId: event.stepId,
        medicationId: event.medicationId,
        type: 'stuck_step',
        severity: 'attention',
        title: 'Step taking longer than usual',
        message: `${context.patientName} has spent more than five minutes on a step in ${context.routineName}.`,
        status: 'unread',
        createdAt: now,
      });
    }

    if (event.skipped || event.status === 'skipped') {
      alerts.push({
        id: uuidv4(),
        patientId: event.patientId,
        routineId: event.routineId,
        stepId: event.stepId,
        medicationId: event.medicationId,
        type: 'step_skipped',
        severity: 'info',
        title: 'Step skipped',
        message: `${context.patientName} skipped one step in ${context.routineName}.`,
        status: 'unread',
        createdAt: now,
      });
    }
  });

  return alerts;
}

export interface RoutineCompletionAlertInput {
  patientId: string;
  routineId: string;
  patientName: string;
  routineName: string;
  status: Extract<RoutineStatus, 'completed' | 'partial' | 'missed'>;
  stepsCompleted: number;
  stepsTotal: number;
  minutes: number;
  nowIso?: string;
}

export function createRoutineCompletionAlert(input: RoutineCompletionAlertInput): CareAlert {
  const needsReview = input.status !== 'completed';
  const title = needsReview ? 'Medication session reviewed' : 'Medication session complete';
  const message = needsReview
    ? `${input.patientName} completed ${input.stepsCompleted} of ${input.stepsTotal} steps in ${input.routineName}. Review the session notes when you have a moment.`
    : `${input.patientName} completed ${input.routineName} in about ${input.minutes} minute${input.minutes === 1 ? '' : 's'}.`;

  return {
    id: uuidv4(),
    patientId: input.patientId,
    routineId: input.routineId,
    type: 'routine_completed',
    severity: needsReview ? 'attention' : 'info',
    title,
    message,
    status: 'unread',
    createdAt: input.nowIso || new Date().toISOString(),
  };
}

export interface MedicationValidationResult {
  isValid: boolean;
  errors: Partial<Record<'name' | 'dosage' | 'purpose' | 'times', string>>;
  normalized: Medication;
}

function isMedicationTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(':').map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function validateMedicationDraft(medication: Medication): MedicationValidationResult {
  const normalized: Medication = {
    ...medication,
    name: medication.name.trim(),
    dosage: medication.dosage.trim(),
    purpose: medication.purpose.trim(),
    pillColor: medication.pillColor.trim().toLowerCase() || 'white',
    pillShape: medication.pillShape.trim().toLowerCase() || 'round',
    times: medication.times.map((time) => time.trim()).filter(Boolean),
    instructions: medication.instructions?.trim(),
    location: medication.location?.trim(),
    refillDate: medication.refillDate?.trim(),
  };
  const errors: MedicationValidationResult['errors'] = {};

  if (!normalized.name) errors.name = 'Medication name is required.';
  if (!normalized.dosage) errors.dosage = 'Dosage is required.';
  if (!normalized.purpose) errors.purpose = 'Plain-language purpose is required.';
  if (normalized.times.length === 0 || normalized.times.some((time) => !isMedicationTime(time))) {
    errors.times = 'Use 24-hour times like 08:00, separated by commas.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalized,
  };
}
