export type RoutineStatus = 'upcoming' | 'in_progress' | 'completed' | 'partial' | 'missed';

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
  category: string;
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
  mood?: string;
  createdAt: string;
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
