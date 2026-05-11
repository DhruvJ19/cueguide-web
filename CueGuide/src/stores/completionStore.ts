import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Completion, RoutineStatus } from '../types';

interface CompletionState {
  completions: Completion[];
  loading: boolean;
  syncFromSupabase: (patientId: string) => Promise<void>;
  addCompletion: (completion: Omit<Completion, 'id' | 'createdAt'> & { patientId?: string }) => Promise<void>;
  getTodayCompletions: () => Completion[];
  getWeeklyStats: () => { total: number; completed: number; partial: number; missed: number };
  setCompletions: (completions: Completion[]) => void;
}

export const useCompletionStore = create<CompletionState>((set, get) => ({
  completions: [],
  loading: false,

  syncFromSupabase: async (patientId: string) => {
    set({ loading: true });
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('completions')
        .select('*')
        .eq('patient_id', patientId)
        .gte('date', weekAgoStr)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching completions:', error);
        set({ loading: false });
        return;
      }

      const completions: Completion[] = (data || []).map((c: any) => ({
        id: c.id,
        patientId: c.patient_id,
        routineId: c.routine_id,
        date: c.date,
        status: c.status as RoutineStatus,
        minutes: c.minutes || 0,
        stepsCompleted: c.steps_completed || 0,
        stepsTotal: c.steps_total || 0,
        mood: c.mood,
        createdAt: c.created_at,
      }));

      set({ completions, loading: false });
    } catch (err) {
      console.error('Exception syncing completions:', err);
      set({ loading: false });
    }
  },

  addCompletion: async (completion) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('completions')
      .upsert({
        patient_id: completion.patientId,
        routine_id: completion.routineId,
        date: completion.date || today,
        status: completion.status,
        minutes: completion.minutes,
        steps_completed: completion.stepsCompleted,
        steps_total: completion.stepsTotal,
        mood: completion.mood,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving completion to Supabase:', error);
      set((state) => ({
        completions: [
          ...state.completions,
          { ...completion, id: 'local-' + Date.now(), createdAt: new Date().toISOString() } as Completion,
        ],
      }));
    } else if (data) {
      set((state) => ({
        completions: [
          ...state.completions.filter((c) => c.routineId !== completion.routineId || c.date !== (completion.date || today)),
          {
            id: data.id,
            patientId: data.patient_id,
            routineId: data.routine_id,
            date: data.date,
            status: data.status as RoutineStatus,
            minutes: data.minutes || 0,
            stepsCompleted: data.steps_completed || 0,
            stepsTotal: data.steps_total || 0,
            mood: data.mood,
            createdAt: data.created_at,
          } as Completion,
        ],
      }));
    }
  },

  getTodayCompletions: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().completions.filter((c) => c.date === today);
  },

  getWeeklyStats: () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const weekCompletions = get().completions.filter((c) => c.date >= weekAgoStr);

    return {
      total: weekCompletions.length,
      completed: weekCompletions.filter((c) => c.status === 'completed').length,
      partial: weekCompletions.filter((c) => c.status === 'partial').length,
      missed: weekCompletions.filter((c) => c.status === 'missed').length,
    };
  },

  setCompletions: (completions) => set({ completions }),
}));