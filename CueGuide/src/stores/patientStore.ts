import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PatientProfile } from '../types';
import { PATIENT_PROFILE } from '../data';

interface PatientState {
  profile: PatientProfile;
  updateProfile: (updates: Partial<PatientProfile>) => void;
  updatePreferences: (prefs: Partial<PatientProfile['preferences']>) => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      profile: PATIENT_PROFILE,
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      updatePreferences: (prefs) =>
        set((state) => ({
          profile: { ...state.profile, preferences: { ...state.profile.preferences, ...prefs } },
        })),
    }),
    {
      name: 'cueguide-patient',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);