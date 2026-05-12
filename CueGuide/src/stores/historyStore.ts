import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityType = 
  | 'routine_completed'
  | 'routine_started'
  | 'routine_skipped'
  | 'medication_taken'
  | 'medication_missed'
  | 'health_sync'
  | 'ai_interaction'
  | 'session_start'
  | 'session_end'
  | 'caregiver_action'
  | 'patient_action';

export interface Activity {
  id: string;
  type: ActivityType;
  patientId: string;
  caregiverId?: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

interface HistoryState {
  activities: Activity[];
  
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getActivitiesByPatient: (patientId: string, limit?: number) => Activity[];
  getActivitiesByType: (type: ActivityType, limit?: number) => Activity[];
  getRecentActivities: (limit?: number) => Activity[];
  clearHistory: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const useHistoryStore = create<HistoryState>()(
  (set, get) => ({
    activities: [],

    logActivity: (activity) => {
      const entry: Activity = {
        ...activity,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        activities: [entry, ...state.activities].slice(0, 1000),
      }));
      
      AsyncStorage.setItem('cueguide-history', JSON.stringify(get().activities));
    },

    getActivitiesByPatient: (patientId, limit = 50) => {
      return get()
        .activities.filter((a) => a.patientId === patientId)
        .slice(0, limit);
    },

    getActivitiesByType: (type, limit = 50) => {
      return get()
        .activities.filter((a) => a.type === type)
        .slice(0, limit);
    },

    getRecentActivities: (limit = 50) => {
      return get().activities.slice(0, limit);
    },

    clearHistory: () => {
      set({ activities: [] });
      AsyncStorage.removeItem('cueguide-history');
    },
  })
);

export const logRoutineCompleted = (
  patientId: string,
  routineName: string,
  caregiverId?: string,
  metadata?: Record<string, unknown>
) => {
  useHistoryStore.getState().logActivity({
    type: 'routine_completed',
    patientId,
    caregiverId,
    title: `Completed: ${routineName}`,
    description: `Patient completed ${routineName} routine`,
    metadata: { routineName, ...metadata },
  });
};

export const logMedicationTaken = (
  patientId: string,
  medicationName: string,
  caregiverId?: string
) => {
  useHistoryStore.getState().logActivity({
    type: 'medication_taken',
    patientId,
    caregiverId,
    title: `Medication: ${medicationName}`,
    description: `Took ${medicationName}`,
    metadata: { medicationName },
  });
};

export const logAIInteraction = (
  patientId: string,
  interactionType: string,
  details: string
) => {
  useHistoryStore.getState().logActivity({
    type: 'ai_interaction',
    patientId,
    title: `AI: ${interactionType}`,
    description: details,
    metadata: { interactionType, details },
  });
};