export type RoutineStatus = 'upcoming' | 'in_progress' | 'completed' | 'partial' | 'missed';
export type RoutineCategory = 'hygiene' | 'medication' | 'meals' | 'exercise' | 'social' | 'other';
export type StepEventStatus = 'completed' | 'skipped' | 'help_requested' | 'stuck' | 'started';
export type CareAlertType = 'missed_medication' | 'step_skipped' | 'help_requested' | 'stuck_step' | 'routine_completed';

export interface Caregiver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  patientCallName?: string;
  notificationPrefs?: {
    smsEnabled: boolean;
    pushEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    maxAlertsPerHour: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface PatientProfile {
  id: string;
  caregiverId: string;
  name: string;
  preferredName: string;
  primaryCaregiverName?: string;
  avatar?: string;
  dateOfBirth: string;
  stage: string;
  context: string;
  preferences: {
    fontSize: number;
    theme: string;
    voice: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  id: string;
  routineId?: string;
  medicationId?: string;
  position: number;
  instruction: string;
  helpText?: string;
  icon: string;
  estimatedSeconds?: number;
}

export interface Routine {
  id: string;
  patientId: string;
  name: string;
  category: RoutineCategory | string;
  scheduledTime: string; // HH:mm format
  recurrence: string[];
  isActive: boolean;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}

export interface Completion {
  id: string;
  patientId: string;
  routineId: string;
  date: string; // YYYY-MM-DD
  status: RoutineStatus;
  minutes: number;
  stepsCompleted: number;
  stepsTotal: number;
  stepEvents?: StepCompletion[];
  aiPromptsUsed?: AICueStep[];
  mood?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  purpose: string;
  dosage: string;
  pillColor: string;
  pillShape: string;
  times: string[];
  instructions?: string;
  location?: string;
  refillDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSchedule {
  id: string;
  patientId: string;
  medicationId: string;
  time: string;
  recurrence: string[];
  isActive: boolean;
}

export interface StepCompletion {
  stepId: string;
  routineId: string;
  patientId: string;
  medicationId?: string;
  startedAt: string;
  completedAt?: string;
  status: StepEventStatus;
  elapsedSeconds: number;
  skipped?: boolean;
  helpRequested?: boolean;
}

export interface CareAlert {
  id: string;
  patientId: string;
  routineId?: string;
  stepId?: string;
  medicationId?: string;
  type: CareAlertType;
  severity: 'info' | 'attention' | 'urgent';
  title: string;
  message: string;
  status: 'unread' | 'acknowledged';
  createdAt: string;
}

export interface AICueStep {
  stepId?: string;
  text: string;
  audio_text: string;
  help_text?: string;
}

export interface AICueData {
  greeting: string;
  steps: AICueStep[];
  encouragement: string;
  reviewed: boolean;
  source: 'ai' | 'fallback';
}

export interface ScheduleAdjustment {
  id: string;
  patientId: string;
  routineId: string;
  routineName: string;
  currentTime: string;
  suggestedTime: string;
  reason: string;
  dataPoints: number;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  patientId: string;
  routineId?: string;
  mood: string;
  notes?: string;
  createdAt: string;
}

export interface SensorReading {
  id: string;
  patientId: string;
  sensorType: 'motion' | 'door' | 'temperature' | 'heart_rate' | 'sleep';
  value: number | string;
  unit?: string;
  timestamp: string;
}
