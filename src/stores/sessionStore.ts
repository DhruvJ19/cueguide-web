import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Session {
  id: string;
  userId: string;
  role: 'caregiver' | 'patient';
  startedAt: string;
  lastActiveAt: string;
  patientId?: string;
  caregiverId?: string;
}

interface SessionState {
  sessions: Session[];
  currentSessionId: string | null;
  addSession: (session: Omit<Session, 'id' | 'startedAt' | 'lastActiveAt'>) => string;
  updateSession: (id: string, updates: Partial<Session>) => void;
  getCurrentSession: () => Session | null;
  getSessionsByUser: (userId: string) => Session[];
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      addSession: (sessionData) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const session: Session = {
          ...sessionData,
          id,
          startedAt: now,
          lastActiveAt: now,
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          currentSessionId: id,
        }));
        return id;
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates, lastActiveAt: new Date().toISOString() } : s
          ),
        }));
      },

      getCurrentSession: () => {
        const state = get();
        return state.sessions.find((s) => s.id === state.currentSessionId) || null;
      },

      getSessionsByUser: (userId) => {
        return get().sessions.filter((s) => s.userId === userId);
      },

      clearSessions: () => {
        set({ sessions: [], currentSessionId: null });
      },
    }),
    { name: 'cueguide-sessions' }
  )
);