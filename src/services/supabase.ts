import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import {
  PatientProfile,
  Routine,
  Completion,
  ScheduleAdjustment,
  MoodEntry,
  SensorReading,
  Caregiver
} from '../types';

export const supabase = createClient(config.supabase.url, config.supabase.anonKey);

export const db = {
  caregivers: {
    get: async (id: string): Promise<Caregiver | null> => {
      const { data, error } = await supabase.from('caregivers').select('*').eq('id', id).single();
      if (error) console.error(error);
      return data;
    },
    save: async (caregiver: Caregiver) => {
      const { data, error } = await supabase.from('caregivers').upsert(caregiver);
      if (error) console.error(error);
      return data;
    }
  },
  patients: {
    get: async (caregiverId: string): Promise<PatientProfile[]> => {
      const { data, error } = await supabase.from('patients').select('*').eq('caregiverId', caregiverId);
      if (error) console.error(error);
      return data || [];
    },
    getById: async (id: string): Promise<PatientProfile | null> => {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (error) console.error(error);
      return data;
    },
    save: async (patient: PatientProfile) => {
      const { data, error } = await supabase.from('patients').upsert(patient);
      if (error) console.error(error);
      return data;
    }
  },
  routines: {
    getForPatient: async (patientId: string): Promise<Routine[]> => {
      const { data, error } = await supabase.from('routines').select('*, steps(*)').eq('patientId', patientId);
      if (error) console.error(error);
      return data || [];
    },
    save: async (routine: Routine) => {
      // First save routine without steps, then save steps
      const { steps, ...routineData } = routine;
      const { data, error } = await supabase.from('routines').upsert(routineData);
      if (error) console.error(error);
      
      if (steps && steps.length > 0) {
        const { error: stepsError } = await supabase.from('steps').upsert(
          steps.map(s => ({ ...s, routineId: routine.id }))
        );
        if (stepsError) console.error(stepsError);
      }
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) console.error(error);
    }
  },
  completions: {
    getForPatient: async (patientId: string, limit: number = 30): Promise<Completion[]> => {
      const { data, error } = await supabase.from('completions')
         .select('*')
         .eq('patientId', patientId)
         .order('date', { ascending: false })
         .limit(limit);
      if (error) console.error(error);
      return data || [];
    },
    save: async (completion: Completion) => {
       const { data, error } = await supabase.from('completions').upsert(completion);
       if (error) console.error(error);
       return data;
    }
  },
  adjustments: {
    getPending: async (patientId: string): Promise<ScheduleAdjustment[]> => {
       const { data, error } = await supabase.from('schedule_adjustments')
         .select('*')
         .eq('patientId', patientId)
         .eq('status', 'pending');
       if (error) console.error(error);
       return data || [];
    },
    save: async (adjustment: ScheduleAdjustment) => {
       const { data, error } = await supabase.from('schedule_adjustments').upsert(adjustment);
       if (error) console.error(error);
       return data;
    }
  },
  sensors: {
    getRecent: async (patientId: string, hours: number = 24): Promise<SensorReading[]> => {
       const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
       const { data, error } = await supabase.from('sensor_readings')
         .select('*')
         .eq('patientId', patientId)
         .gte('timestamp', cutoff)
         .order('timestamp', { ascending: false });
       if (error) console.error(error);
       return data || [];
    },
    save: async (reading: SensorReading) => {
       const { data, error } = await supabase.from('sensor_readings').insert(reading);
       if (error) console.error(error);
       return data;
    }
  }
};
