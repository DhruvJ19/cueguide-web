import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, db } from '../services/supabase';
import { dataSync } from '../services/dataSync';
import { useSessionStore } from '../stores/sessionStore';
import { logAIInteraction } from '../stores/historyStore';

type Role = 'caregiver' | 'patient' | null;

interface AuthState {
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  caregiverId: string | null;
  patientId: string | null;
  
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setRole: (role: Role) => void;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      role: 'caregiver',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      userId: null,
      caregiverId: null,
      patientId: null,

      signIn: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: window.location.origin + '/auth/callback',
            },
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data.user) {
            const session = useSessionStore.getState().addSession({
              userId: data.user.id,
              role: 'caregiver',
            });
            
            logAIInteraction('system', 'login', `User logged in: ${email}`);
          }

          set({ isLoading: false });
          return { success: true };
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Sign in failed';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      signUp: async (email: string, name: string, phone?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: window.location.origin + '/auth/callback',
              data: { name, phone: phone || null },
            },
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          logAIInteraction('system', 'signup', `New user signed up: ${email}`);
          set({ isLoading: false });
          return { success: true };
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Sign up failed';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          useSessionStore.getState().clearSessions();
          set({ 
            role: null, 
            isAuthenticated: false, 
            isLoading: false, 
            userId: null, 
            caregiverId: null, 
            patientId: null 
          });
          logAIInteraction('system', 'logout', 'User logged out');
        } catch (e) {
          console.error('Sign out error', e);
          set({ isLoading: false });
        }
      },

      setRole: (role) => set({ role, isAuthenticated: !!role }),

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const caregiver = await db.caregivers.getByUserId(session.user.id);
            
            if (caregiver) {
              const patients = await db.patients.get(caregiver.id);
              const patient = patients[0];
              
              set({ 
                userId: session.user.id,
                caregiverId: caregiver.id,
                patientId: patient?.id || null,
                role: 'caregiver',
                isAuthenticated: true,
                isLoading: false,
              });

              if (patient) {
                await dataSync.syncAll(caregiver.id, patient.id);
              }
            } else {
              set({ 
                userId: session.user.id,
                isAuthenticated: true,
                isLoading: false,
                role: 'caregiver'
              });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (e) {
          console.error('Auth init error', e);
          set({ isLoading: false, error: 'Failed to initialize auth' });
        }
      },

      refreshSession: async () => {
        const { data: { session } } = await supabase.auth.refreshSession();
        if (!session) {
          get().signOut();
        }
      },
    }),
    {
      name: 'cueguide-auth',
      partialize: (state) => ({ 
        role: state.role, 
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
      }),
    }
  )
);