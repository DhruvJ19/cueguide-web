import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, ScheduleAdjustment } from '../types';
import { INITIAL_ROUTINES, INITIAL_ADJUSTMENTS } from '../data';
import { v4 as uuidv4 } from 'uuid';

interface RoutineState {
  routines: Routine[];
  adjustments: ScheduleAdjustment[];
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  approveAdjustment: (routineId: string, newTime: string) => void;
  rejectAdjustment: (routineId: string) => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      routines: INITIAL_ROUTINES,
      adjustments: INITIAL_ADJUSTMENTS as ScheduleAdjustment[],
      setRoutines: (routines) => set({ routines }),
      addRoutine: (routine) =>
        set((state) => ({
          routines: [
            ...state.routines,
            {
              ...routine,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateRoutine: (id, updates) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),
      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        })),
      approveAdjustment: (routineId, newTime) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId ? { ...r, scheduledTime: newTime } : r
          ),
          adjustments: state.adjustments.filter((a) => a.routineId !== routineId),
        })),
      rejectAdjustment: (routineId) =>
        set((state) => ({
          adjustments: state.adjustments.filter((a) => a.routineId !== routineId),
        })),
    }),
    {
      name: 'cueguide-routines',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);