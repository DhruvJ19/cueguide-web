import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Completion, RoutineStatus } from '../types';
import { INITIAL_COMPLETIONS } from '../data';
import { v4 as uuidv4 } from 'uuid';

interface CompletionState {
  completions: Completion[];
  addCompletion: (completion: Omit<Completion, 'id' | 'createdAt'>) => void;
  getTodayCompletions: () => Completion[];
  getWeeklyStats: () => { total: number; completed: number; partial: number; missed: number };
}

export const useCompletionStore = create<CompletionState>()(
  persist(
    (set, get) => ({
      completions: INITIAL_COMPLETIONS,
      addCompletion: (completion) =>
        set((state) => ({
          completions: [
            ...state.completions,
            {
              ...completion,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
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
    }),
    {
      name: 'cueguide-completions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);