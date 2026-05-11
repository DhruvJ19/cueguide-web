import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { PatientProfile } from '../types';

interface PatientState {
  profile: PatientProfile | null;
  loading: boolean;
  fetchProfile: (caregiverId: string) => Promise<void>;
  updateProfile: (updates: Partial<PatientProfile>) => void;
  updatePreferences: (prefs: Partial<PatientProfile['preferences']>) => void;
  setProfile: (profile: PatientProfile) => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  profile: null,
  loading: false,

  fetchProfile: async (caregiverId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('caregiver_id', caregiverId)
        .single();

      if (error) {
        console.error('Error fetching patient profile:', error);
        set({ loading: false });
        return;
      }

      if (data) {
        set({
          profile: {
            id: data.id,
            caregiverId: data.caregiver_id,
            name: data.name,
            preferredName: data.preferred_name || 'Patient',
            primaryCaregiverName: data.primary_caregiver_name || 'Sarah',
            avatar: data.avatar,
            dateOfBirth: data.date_of_birth || '1958-03-15',
            stage: data.stage || 'early',
            context: data.context || '',
            preferences: data.preferences ? JSON.parse(JSON.stringify(data.preferences)) : { fontSize: 28, theme: 'warm', voice: 'female' },
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
          loading: false,
        });
      }
    } catch (err) {
      console.error('Exception fetching patient profile:', err);
      set({ loading: false });
    }
  },

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),

  updatePreferences: (prefs) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, preferences: { ...state.profile.preferences, ...prefs } }
        : null,
    })),

  setProfile: (profile) => set({ profile }),
}));