import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Routine, ScheduleAdjustment, Step } from '../types';

interface RoutineState {
  routines: Routine[];
  adjustments: ScheduleAdjustment[];
  loading: boolean;
  syncFromSupabase: (patientId: string) => Promise<void>;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  approveAdjustment: (adjId: string) => Promise<void>;
  rejectAdjustment: (adjId: string) => Promise<void>;
  setRoutines: (routines: Routine[]) => void;
  setAdjustments: (adjustments: ScheduleAdjustment[]) => void;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  adjustments: [],
  loading: false,

  syncFromSupabase: async (patientId: string) => {
    set({ loading: true });
    try {
      const [routinesRes, adjustmentsRes] = await Promise.all([
        supabase.from('routines').select('*').eq('patient_id', patientId).eq('is_active', true),
        supabase.from('schedule_adjustments').select('*').eq('patient_id', patientId).eq('status', 'pending'),
      ]);

      if (routinesRes.error) console.error('Error fetching routines:', routinesRes.error);
      if (adjustmentsRes.error) console.error('Error fetching adjustments:', adjustmentsRes.error);

      const routines: Routine[] = [];
      const routineIds = routinesRes.data?.map((r: any) => r.id) || [];

      let stepsMap: Record<string, any[]> = {};
      if (routineIds.length > 0) {
        const { data: stepsData } = await supabase
          .from('steps')
          .select('*')
          .in('routine_id', routineIds)
          .order('position');
        for (const step of stepsData || []) {
          if (!stepsMap[step.routine_id]) stepsMap[step.routine_id] = [];
          stepsMap[step.routine_id].push({
            id: step.id,
            routineId: step.routine_id,
            position: step.position,
            instruction: step.instruction,
            icon: step.icon,
          });
        }
      }

      for (const r of routinesRes.data || []) {
        routines.push({
          id: r.id,
          patientId: r.patient_id,
          name: r.name,
          category: r.category,
          scheduledTime: r.scheduled_time,
          recurrence: r.recurrence || [],
          isActive: r.is_active,
          steps: stepsMap[r.id] || [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        });
      }

      const adjustments: ScheduleAdjustment[] = (adjustmentsRes.data || []).map((a: any) => ({
        id: a.id,
        patientId: a.patient_id,
        routineId: a.routine_id,
        routineName: a.routine_name,
        currentTime: a.current_time_val,
        suggestedTime: a.suggested_time_val,
        reason: a.reason,
        dataPoints: a.data_points,
        confidence: a.confidence,
        status: a.status,
        createdAt: a.created_at,
      }));

      set({ routines, adjustments, loading: false });
    } catch (err) {
      console.error('Exception syncing routines:', err);
      set({ loading: false });
    }
  },

  addRoutine: (routine) =>
    set((state) => ({ routines: [...state.routines, routine] })),

  updateRoutine: (id, updates) =>
    set((state) => ({
      routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  deleteRoutine: (id) =>
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    })),

  approveAdjustment: async (adjId) => {
    await supabase.from('schedule_adjustments').update({ status: 'approved' }).eq('id', adjId);
    set((state) => ({ adjustments: state.adjustments.filter((a) => a.id !== adjId) }));
  },

  rejectAdjustment: async (adjId) => {
    await supabase.from('schedule_adjustments').update({ status: 'rejected' }).eq('id', adjId);
    set((state) => ({ adjustments: state.adjustments.filter((a) => a.id !== adjId) }));
  },

  setRoutines: (routines) => set({ routines }),
  setAdjustments: (adjustments) => set({ adjustments }),
}));