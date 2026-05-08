import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'caregiver' | 'patient';

interface AuthState {
  role: Role;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: 'caregiver',
      isAuthenticated: true, // Default to true for MVP (demo mode)
      setRole: (role) => set({ role }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
    }),
    {
      name: 'cueguide-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);