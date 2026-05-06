import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'caregiver' | 'patient' | null;

interface AuthState {
  role: Role;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: 'caregiver', // Default for demo
      isAuthenticated: true, // Auto login for demo
      setRole: (role) => set({ role, isAuthenticated: true }),
      logout: () => set({ role: null, isAuthenticated: false }),
    }),
    {
      name: 'cueguide-auth',
    }
  )
);
