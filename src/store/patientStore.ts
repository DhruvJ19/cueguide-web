import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatientProfile } from '../types';
import { PATIENT_PROFILE } from '../data';
import { db } from '../services/supabase';

interface PatientState {
  profile: PatientProfile | null;
  setProfile: (profile: PatientProfile) => void;
  updatePreferences: (prefs: Partial<PatientProfile['preferences']>) => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      profile: PATIENT_PROFILE as any,
      setProfile: async (profile) => {
         set({ profile });
         try {
           await db.patients.save(profile);
         } catch(e) {
           console.error("Failed to save patient profile", e);
         }
      },
      updatePreferences: async (prefs) => {
        const prevProfile = get().profile;
        set((state) => ({
          profile: state.profile ? {
            ...state.profile,
            preferences: { ...state.profile.preferences, ...prefs }
          } : null
        }));
        
        const newProfile = get().profile;
        if (newProfile) {
           try {
             await db.patients.save(newProfile);
           } catch(e) {
             console.error("Failed to update preferences", e);
             set({ profile: prevProfile });
           }
        }
      },
    }),
    {
      name: 'cueguide-patient',
    }
  )
);
