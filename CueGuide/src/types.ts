export type RoutineStatus = 'upcoming' | 'in_progress' | 'completed' | 'partial' | 'missed';

export interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'primary' | 'secondary' | 'admin';
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  caregiverId?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Step {
  id: string;
  routineId?: string;
  position: number;
  instruction: string;
  icon: string;
}

export interface Routine {
  id: string;
  patientId: string;
  name: string;
  category: string;
  scheduledTime: string;
  recurrence: string[];
  isActive: boolean;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}

export interface Completion {
  id: string;
  patientId?: string;
  routineId: string;
  date: string;
  status: RoutineStatus;
  minutes: number;
  stepsCompleted: number;
  stepsTotal: number;
  mood?: string;
  createdAt?: string;
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

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  description: string;
  pillColor?: string;
  pillShape?: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
  refillDate?: string;
  isActive: boolean;
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

export interface AIConfig {
  isEnabled: boolean;
  apiKey: string;
  provider: 'gemini' | 'claude';
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  aiConfig: AIConfig;
}