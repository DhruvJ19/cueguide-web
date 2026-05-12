import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  getRecentActivities: (limit: number) => Activity[];
  getActivitiesByDateRange: (start: string, end: string, patientId?: string) => Activity[];
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      activities: [],

      logActivity: (activity) => {
        const entry: Activity = {
          ...activity,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activities: [entry, ...state.activities].slice(0, 1000), // Keep last 1000
        }));
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

      getActivitiesByDateRange: (start, end, patientId) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return get().activities.filter((a) => {
          const date = new Date(a.timestamp);
          const matchesPatient = !patientId || a.patientId === patientId;
          return matchesPatient && date >= startDate && date <= endDate;
        });
      },

      clearHistory: () => {
        set({ activities: [] });
      },
    }),
    { name: 'cueguide-history' }
  )
);

// Helper to auto-log activities
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