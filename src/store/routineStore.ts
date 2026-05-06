import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Routine, ScheduleAdjustment } from '../types';
import { INITIAL_ROUTINES, INITIAL_ADJUSTMENTS } from '../data';
import { db } from '../services/supabase';

interface RoutineState {
  routines: Routine[];
  adjustments: ScheduleAdjustment[];
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  approveAdjustment: (routineId: string, newTime: string) => void;
  rejectAdjustment: (routineId: string) => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: INITIAL_ROUTINES,
      adjustments: INITIAL_ADJUSTMENTS as any,
      setRoutines: (routines) => set({ routines }),
      addRoutine: async (routine) => {
        // Optimistic UI update
        set((state) => ({ routines: [...state.routines, routine] }));
        try {
          await db.routines.save(routine);
        } catch (e) {
          console.error("Failed to save routine to DB", e);
        }
      },
      updateRoutine: async (id, updates) => {
        const prevRoutines = get().routines;
        // Optimistic UI update
        set((state) => ({
          routines: state.routines.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
        
        const updatedRoutine = get().routines.find(r => r.id === id);
        if (updatedRoutine) {
           try {
             await db.routines.save(updatedRoutine);
           } catch (e) {
             console.error("Failed to update routine", e);
             set({ routines: prevRoutines }); // Rollback
           }
        }
      },
      deleteRoutine: async (id) => {
        const prevRoutines = get().routines;
        set((state) => ({ routines: state.routines.filter(r => r.id !== id) }));
        try {
           await db.routines.delete(id);
        } catch (e) {
           console.error("Failed to delete routine", e);
           set({ routines: prevRoutines }); // Rollback
        }
      },
      approveAdjustment: async (routineId, newTime) => {
        const state = get();
        const prevRoutines = state.routines;
        const prevAdjustments = state.adjustments;
        
        const updatedRoutines = state.routines.map(r => 
          r.id === routineId ? { ...r, scheduledTime: newTime } : r
        );
        const remainingAdjustments = state.adjustments.filter(a => a.routineId !== routineId);
        
        set({ routines: updatedRoutines, adjustments: remainingAdjustments });
        
        const updatedRoutine = updatedRoutines.find(r => r.id === routineId);
        const adjustment = state.adjustments.find(a => a.routineId === routineId);
        
        try {
           if (updatedRoutine) await db.routines.save(updatedRoutine);
           if (adjustment) await db.adjustments.save({ ...adjustment, status: 'approved' });
        } catch (e) {
           console.error("Failed to approve adjustment", e);
           set({ routines: prevRoutines, adjustments: prevAdjustments }); // Rollback
        }
      },
      rejectAdjustment: async (routineId) => {
        const state = get();
        const prevAdjustments = state.adjustments;
        const remainingAdjustments = state.adjustments.filter(a => a.routineId !== routineId);
        
        set({ adjustments: remainingAdjustments });
        
        const adjustment = state.adjustments.find(a => a.routineId === routineId);
        if (adjustment) {
           try {
              await db.adjustments.save({ ...adjustment, status: 'rejected' });
           } catch (e) {
              set({ adjustments: prevAdjustments });
           }
        }
      }
    }),
    {
      name: 'cueguide-routines',
    }
  )
);
