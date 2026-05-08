import { PatientProfile, Routine, Completion, ScheduleAdjustment } from './types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, format } from 'date-fns';

export const PATIENT_PROFILE: PatientProfile = {
  id: 'patient-1',
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
  }
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
      { id: uuidv4(), position: 2, instruction: 'Brush your teeth for 2 minutes', icon: '🪥' },
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

export const INITIAL_COMPLETIONS: Completion[] = (() => {
  const completions: Completion[] = [];
  const routines = ['routine-1', 'routine-2', 'routine-3', 'routine-4'];
  const moods = ['Great', 'Good', 'Okay', 'Confused', 'Tired'];
  
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    routines.forEach(rId => {
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
        minutes = 8 + Math.floor(Math.random() * 8);
      }
      
      completions.push({
        id: uuidv4(),
        patientId: 'patient-1',
        routineId: rId,
        date: d,
        status,
        minutes,
        stepsCompleted,
        stepsTotal: 5,
        mood: status === 'completed' ? moods[Math.floor(Math.random() * moods.length)] : undefined,
        createdAt: new Date().toISOString()
      });
    });
  }
  return completions;
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

export const INITIAL_MEDICATIONS = [
  {
    id: 'med-1',
    patientId: 'patient-1',
    name: 'Lisinopril',
    description: 'Small blue heart-shaped pill',
    pillColor: 'blue',
    pillShape: 'heart',
    dosage: '10mg',
    frequency: 'daily',
    times: ['08:30'],
    notes: 'Take with breakfast',
    isActive: true
  },
  {
    id: 'med-2',
    patientId: 'patient-1',
    name: 'Vitamin D',
    description: 'White round pill',
    pillColor: 'white',
    pillShape: 'round',
    dosage: '1000 IU',
    frequency: 'daily',
    times: ['08:30'],
    notes: 'Take with breakfast',
    isActive: true
  }
];