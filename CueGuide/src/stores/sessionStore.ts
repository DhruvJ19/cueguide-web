import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const useSessionStore = create<SessionState>()(
  (set, get) => ({
    sessions: [],
    currentSessionId: null,

    addSession: (sessionData) => {
      const id = generateId();
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
      AsyncStorage.setItem('cueguide-sessions', JSON.stringify(get().sessions));
      return id;
    },

    updateSession: (id, updates) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, ...updates, lastActiveAt: new Date().toISOString() } : s
        ),
      }));
      AsyncStorage.setItem('cueguide-sessions', JSON.stringify(get().sessions));
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
      AsyncStorage.removeItem('cueguide-sessions');
    },
  })
);