import type { PatientProfile, Routine, Completion, ScheduleAdjustment, SensorReading, Medication, CareAlert, RoutineStatus, StepCompletion } from './types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, format } from 'date-fns';
import { buildMedicationRoutine } from './services/medicationRoutine';

export const PATIENT_PROFILE: PatientProfile = {
  id: 'patient-1',
  caregiverId: 'caregiver-1',
  name: 'Robert Chen',
  preferredName: 'Dad',
  primaryCaregiverName: 'Sarah',
  dateOfBirth: '1958-03-15',
  stage: 'early',
  context: 'Lives with wife Margaret in San Jose. Orange tabby cat named Ginger. Daughter Sarah visits Tuesdays and Thursdays. Takes lisinopril (small blue pill) and vitamin D (white round). Keeps meds in yellow pill box on kitchen counter. Blue cup by the sink is his favorite. Loves morning walks in the neighborhood. Retired engineer — likes when things are organized.',
  preferences: {
    fontSize: 28,
    theme: 'warm',
    voice: 'female'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'routine-1',
    patientId: 'patient-1',
    name: 'Morning Hygiene',
    category: 'hygiene',
    scheduledTime: '08:00',
    recurrence: ['daily'],
    isActive: true,
    steps: [
      { id: uuidv4(), position: 1, instruction: 'Wash your face with warm water', icon: '🚿' },
      { id: uuidv4(), position: 2, instruction: 'Brush your teeth with AI-guided 2-minute audio cues', icon: '🪥' },
      { id: uuidv4(), position: 3, instruction: 'Comb your hair', icon: '💇' },
      { id: uuidv4(), position: 4, instruction: 'Put on your clothes for the day', icon: '👔' },
      { id: uuidv4(), position: 5, instruction: 'Put on your watch and glasses', icon: '👓' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'routine-2',
    patientId: 'patient-1',
    name: 'Morning Medication',
    category: 'medication',
    scheduledTime: '08:30',
    recurrence: ['daily'],
    isActive: true,
    steps: [
      { id: uuidv4(), position: 1, instruction: 'Take your small blue heart pill from the yellow box', icon: '💊' },
      { id: uuidv4(), position: 2, instruction: 'Take your vitamin D — the white round one', icon: '☀️' },
      { id: uuidv4(), position: 3, instruction: 'Drink a full glass of water', icon: '🥤' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'routine-3',
    patientId: 'patient-1',
    name: 'Afternoon Walk',
    category: 'exercise',
    scheduledTime: '14:00',
    recurrence: ['monday', 'wednesday', 'friday'],
    isActive: true,
    steps: [
      { id: uuidv4(), position: 1, instruction: "Put on your walking shoes — they're by the front door", icon: '👟' },
      { id: uuidv4(), position: 2, instruction: 'Grab your hat and sunglasses', icon: '🧢' },
      { id: uuidv4(), position: 3, instruction: 'Take your phone and house key', icon: '🔑' },
      { id: uuidv4(), position: 4, instruction: 'Walk around the block — about 15 minutes', icon: '🚶' },
      { id: uuidv4(), position: 5, instruction: 'When you get home, have a glass of water', icon: '💧' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'routine-4',
    patientId: 'patient-1',
    name: 'Bedtime Routine',
    category: 'hygiene',
    scheduledTime: '21:00',
    recurrence: ['daily'],
    isActive: true,
    steps: [
      { id: uuidv4(), position: 1, instruction: 'Brush your teeth', icon: '🪥' },
      { id: uuidv4(), position: 2, instruction: 'Change into your pajamas', icon: '🛏️' },
      { id: uuidv4(), position: 3, instruction: 'Make sure the front door is locked', icon: '🔒' },
      { id: uuidv4(), position: 4, instruction: 'Set your phone on the nightstand to charge', icon: '🔌' },
      { id: uuidv4(), position: 5, instruction: 'Turn off the lights — goodnight, Dad', icon: '🌙' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-lisinopril',
    patientId: 'patient-1',
    name: 'Lisinopril',
    purpose: 'helps keep your blood pressure steady',
    dosage: '10 mg',
    pillColor: 'blue',
    pillShape: 'small round',
    times: ['08:00'],
    instructions: 'Take with breakfast and water.',
    location: 'the yellow pill box on the kitchen counter',
    refillDate: format(new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), 'yyyy-MM-dd'),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-vitamin-d',
    patientId: 'patient-1',
    name: 'Vitamin D',
    purpose: 'helps keep your bones strong',
    dosage: '1000 IU',
    pillColor: 'white',
    pillShape: 'round',
    times: ['08:00'],
    instructions: 'Take one tablet after breakfast.',
    location: 'the yellow pill box on the kitchen counter',
    refillDate: format(new Date(Date.now() + 1000 * 60 * 60 * 24 * 22), 'yyyy-MM-dd'),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-melatonin',
    patientId: 'patient-1',
    name: 'Melatonin',
    purpose: 'supports your bedtime routine',
    dosage: '3 mg',
    pillColor: 'white',
    pillShape: 'oval',
    times: ['21:00'],
    instructions: 'Take with a small sip of water.',
    location: 'the nightstand pill organizer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ALERTS: CareAlert[] = [];

export const INITIAL_COMPLETIONS: Completion[] = (() => {
  const completions: Completion[] = [];
  const medicationRoutines = ['08:00', '21:00'].map((scheduledTime) =>
    buildMedicationRoutine({
      patient: PATIENT_PROFILE,
      medications: INITIAL_MEDICATIONS,
      scheduledTime,
      nowIso: new Date().toISOString(),
    })
  );
  const sampleRoutines = [
    { id: 'routine-1', stepsTotal: 5 },
    { id: medicationRoutines[0].id, stepsTotal: medicationRoutines[0].steps.length },
    { id: 'routine-3', stepsTotal: 5 },
    { id: medicationRoutines[1].id, stepsTotal: medicationRoutines[1].steps.length },
    { id: 'routine-4', stepsTotal: 5 },
  ];
  const moods = ['Good', 'Okay', 'Good', 'Tired', 'Good'];

  function getSampleStatus(dayOffset: number, routineIndex: number): RoutineStatus {
    if (dayOffset === 3 && routineIndex === 1) return 'partial';
    if (dayOffset === 6 && routineIndex === 3) return 'partial';
    if (dayOffset === 9 && routineIndex === 2) return 'missed';
    return 'completed';
  }

  function getStepEvents({
    status,
    routineId,
    stepsTotal,
    dayOffset,
  }: {
    status: RoutineStatus;
    routineId: string;
    stepsTotal: number;
    dayOffset: number;
  }): StepCompletion[] | undefined {
    if (status === 'completed') return undefined;
    const eventDate = subDays(new Date(), dayOffset);
    const startedAt = new Date(eventDate.setHours(8, 5, 0, 0)).toISOString();
    const helpEvent: StepCompletion = {
      stepId: `${routineId}-sample-help`,
      routineId,
      patientId: 'patient-1',
      startedAt,
      completedAt: new Date(new Date(startedAt).getTime() + 75_000).toISOString(),
      status: 'help_requested',
      elapsedSeconds: 75,
      helpRequested: true,
    };
    if (status === 'partial') {
      return [
        helpEvent,
        {
          stepId: `${routineId}-sample-skip`,
          routineId,
          patientId: 'patient-1',
          startedAt,
          completedAt: new Date(new Date(startedAt).getTime() + 120_000).toISOString(),
          status: 'skipped',
          elapsedSeconds: 120,
          skipped: true,
        },
      ];
    }
    return Array.from({ length: stepsTotal }, (_, index) => ({
      stepId: `${routineId}-sample-missed-${index + 1}`,
      routineId,
      patientId: 'patient-1',
      startedAt,
      completedAt: new Date(new Date(startedAt).getTime() + (index + 1) * 60_000).toISOString(),
      status: 'stuck',
      elapsedSeconds: (index + 1) * 60,
    }));
  }

  for (let dayOffset = 1; dayOffset <= 14; dayOffset += 1) {
    const date = format(subDays(new Date(), dayOffset), 'yyyy-MM-dd');
    sampleRoutines.forEach((routine, routineIndex) => {
      const status = getSampleStatus(dayOffset, routineIndex);
      const stepsCompleted = status === 'completed'
        ? routine.stepsTotal
        : status === 'partial'
          ? Math.max(1, routine.stepsTotal - 1)
          : 0;
      const createdAt = new Date(Date.now() - (dayOffset * 24 + routineIndex + 1) * 60 * 60 * 1000).toISOString();
      completions.push({
        id: uuidv4(),
        patientId: 'patient-1',
        date,
        routineId: routine.id,
        status,
        minutes: status === 'missed' ? 0 : 7 + routineIndex * 3,
        stepsCompleted,
        stepsTotal: routine.stepsTotal,
        mood: status === 'completed' ? moods[routineIndex] : 'Unsure',
        stepEvents: getStepEvents({ status, routineId: routine.id, stepsTotal: routine.stepsTotal, dayOffset }),
        createdAt,
      });
    });
  }
  return completions;
})();

export const INITIAL_SENSORS: SensorReading[] = (() => {
  const readings: SensorReading[] = [];
  for (let i = 0; i < 50; i++) {
     readings.push({
        id: uuidv4(),
        patientId: 'patient-1',
        sensorType: i % 3 === 0 ? 'motion' : i % 3 === 1 ? 'heart_rate' : 'door',
        value: i % 3 === 1 ? (65 + Math.floor(Math.random() * 20)).toString() : 'active',
        unit: i % 3 === 1 ? 'bpm' : 'state',
        timestamp: new Date(Date.now() - (i * 3600000)).toISOString()
     });
  }
  return readings;
})();

export const INITIAL_ADJUSTMENTS: ScheduleAdjustment[] = [
  {
    id: 'adj-1',
    patientId: 'patient-1',
    routineId: 'routine-1',
    routineName: 'Morning Hygiene',
    currentTime: '08:00',
    suggestedTime: '08:15',
    reason: 'Robert consistently starts his morning hygiene around 8:12-8:18 AM. Adjusting to 8:15 would better match his natural rhythm.',
    dataPoints: 12,
    confidence: 0.85,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];
