import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Completion } from '../types';
import { INITIAL_COMPLETIONS } from '../data';
import { db } from '../services/supabase';

interface CompletionState {
  completions: Completion[];
  setCompletions: (completions: Completion[]) => void;
  addCompletion: (completion: Completion) => void;
  updateCompletion: (id: string, updates: Partial<Completion>) => void;
}

export const useCompletionStore = create<CompletionState>()(
  persist(
    (set, get) => ({
      completions: INITIAL_COMPLETIONS as any,
      setCompletions: (completions) => set({ completions }),
      addCompletion: async (completion) => {
        set((state) => ({ completions: [...state.completions, completion] }));
        try {
          await db.completions.save(completion);
        } catch (e) {
          console.error("Failed to save completion", e);
        }
      },
      updateCompletion: async (id, updates) => {
        const prevCompletions = get().completions;
        set((state) => ({
          completions: state.completions.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
        const updated = get().completions.find(c => c.id === id);
        if (updated) {
           try {
             await db.completions.save(updated);
           } catch (e) {
             set({ completions: prevCompletions }); // Rollback
           }
        }
      }
    }),
    {
      name: 'cueguide-completions',
    }
  )
);
