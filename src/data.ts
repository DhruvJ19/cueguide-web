import { PatientProfile, Routine, Completion, ScheduleAdjustment, SensorReading, Medication, CareAlert } from './types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, format } from 'date-fns';

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

export const INITIAL_ALERTS: CareAlert[] = [
  {
    id: 'alert-demo-1',
    patientId: 'patient-1',
    routineId: 'routine-2',
    type: 'routine_completed',
    severity: 'info',
    title: 'Morning medication completed',
    message: 'Robert completed both scheduled morning medications with no skipped steps.',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
];

export const INITIAL_COMPLETIONS: Completion[] = (() => {
  const completions: Completion[] = [];
  const routines = ['routine-1', 'routine-2', 'routine-3', 'routine-4'];
  const moods = ['Great', 'Good', 'Okay', 'Confused', 'Tired'];
  
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    routines.forEach((rId, routineIndex) => {
       // Randomize completion chance
       const rand = Math.random();
       let status: 'completed' | 'partial' | 'missed' = 'completed';
       let stepsCompleted = 5;
       let minutes = 15 + Math.floor(Math.random() * 10);
       
       if (rand > 0.85) {
         status = 'missed';
         stepsCompleted = 0;
         minutes = 0;
       } else if (rand > 0.7) {
         status = 'partial';
         stepsCompleted = Math.floor(Math.random() * 4) + 1;
         minutes = 5 + Math.floor(Math.random() * 5);
       }

completions.push({
          id: uuidv4(),
          patientId: 'patient-1',
          date: d,
          routineId: rId,
          status,
          minutes,
          stepsCompleted,
          stepsTotal: 5,
          mood: status === 'completed' ? moods[Math.floor(Math.random() * 3)] : moods[2 + Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - (i * 24 + routines.length - routineIndex + 1) * 60 * 60 * 1000).toISOString()
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
