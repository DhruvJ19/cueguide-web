import type { Medication, PatientProfile, Routine, Step } from '../types';
import { v5 as uuidv5 } from 'uuid';

const MEDICATION_NAMESPACE = '6c8a9332-4e2d-4c87-a420-6c2f1a4ebc5f';

const WATER_STEP: Step = {
  id: 'med-water-step',
  position: 99,
  instruction: 'Drink a full glass of water after taking your medicine.',
  helpText: 'The water helps the medicine go down comfortably. Take your time.',
  icon: 'CupSoda',
  estimatedSeconds: 60,
};

function getTimeLabel(time: string) {
  const [hour] = time.split(':').map(Number);
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Bedtime';
}

export function getMedicationVisual(medication: Medication) {
  return `${medication.pillShape} ${medication.pillColor} pill`.trim();
}

export function getMedicationPrompt(medication: Medication, patient: PatientProfile) {
  const visual = getMedicationVisual(medication);
  const purpose = medication.purpose ? ` It ${medication.purpose}.` : '';
  const location = medication.location || 'the yellow pill box on the kitchen counter';
  const instruction = medication.instructions ? ` ${medication.instructions}` : '';
  return `${patient.preferredName}, next take the ${visual}. This is ${medication.name}, ${medication.dosage}. It is in ${location}.${purpose}${instruction}`;
}

export function buildMedicationRoutine({
  patient,
  medications,
  scheduledTime,
  nowIso,
}: {
  patient: PatientProfile;
  medications: Medication[];
  scheduledTime: string;
  nowIso?: string;
}): Routine {
  const activeAtTime = medications
    .filter((medication) => medication.isActive && medication.times.includes(scheduledTime))
    .sort((a, b) => a.name.localeCompare(b.name));

  const routineId = uuidv5(`${patient.id}:medication:${scheduledTime}`, MEDICATION_NAMESPACE);
  const steps: Step[] = activeAtTime.map((medication, index) => ({
    id: uuidv5(`${routineId}:step:${medication.id}`, MEDICATION_NAMESPACE),
    routineId,
    medicationId: medication.id,
    position: index + 1,
    instruction: getMedicationPrompt(medication, patient),
    helpText: `${medication.name} is the ${getMedicationVisual(medication)}. ${medication.purpose || 'It is part of your care plan.'}`,
    icon: 'Pill',
    estimatedSeconds: 120,
  }));

  if (steps.length > 0) {
    steps.push({ ...WATER_STEP, id: uuidv5(`${routineId}:step:water`, MEDICATION_NAMESPACE), routineId, position: steps.length + 1 });
  }

  return {
    id: routineId,
    patientId: patient.id,
    name: `${getTimeLabel(scheduledTime)} Medication`,
    category: 'medication',
    scheduledTime,
    recurrence: ['daily'],
    isActive: true,
    steps,
    createdAt: nowIso || new Date().toISOString(),
    updatedAt: nowIso || new Date().toISOString(),
  };
}

export function getMedicationScheduleTimes(medications: Medication[]) {
  return Array.from(
    new Set(medications.filter((medication) => medication.isActive).flatMap((medication) => medication.times))
  ).sort();
}
