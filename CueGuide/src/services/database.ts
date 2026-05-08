import { supabase } from './supabase';
import { PatientProfile, Routine, Completion, Medication } from '../types';

export const db = {
  patients: {
    async get(id: string) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    
    async getByCaregiver(caregiverId: string) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('caregiver_id', caregiverId);
      return { data, error };
    },
    
    async save(patient: PatientProfile) {
      const { data, error } = await supabase
        .from('patients')
        .upsert(patient)
        .select()
        .single();
      return { data, error };
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  routines: {
    async getByPatient(patientId: string) {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduled_time');
      return { data, error };
    },
    
    async save(routine: Routine) {
      const { data, error } = await supabase
        .from('routines')
        .upsert(routine)
        .select()
        .single();
      return { data, error };
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  completions: {
    async getByPatient(patientId: string, startDate?: string, endDate?: string) {
      let query = supabase
        .from('completions')
        .select('*')
        .eq('patient_id', patientId);
      
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      
      const { data, error } = await query.order('date', { ascending: false });
      return { data, error };
    },
    
    async save(completion: Completion) {
      const { data, error } = await supabase
        .from('completions')
        .upsert(completion)
        .select()
        .single();
      return { data, error };
    },
  },

  medications: {
    async getByPatient(patientId: string) {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('times');
      return { data, error };
    },
    
    async save(medication: Medication) {
      const { data, error } = await supabase
        .from('medications')
        .upsert(medication)
        .select()
        .single();
      return { data, error };
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  scheduleAdjustments: {
    async getPending(patientId: string) {
      const { data, error } = await supabase
        .from('schedule_adjustments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'pending');
      return { data, error };
    },
    
    async updateStatus(id: string, status: 'approved' | 'rejected') {
      const { data, error } = await supabase
        .from('schedule_adjustments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },
};

export const syncToSupabase = async () => {
  console.log('Syncing to Supabase...');
  console.log('Supabase URL configured:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log('Supabase key configured:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
};

export const subscribeToRealtime = (table: string, callback: (payload: any) => void) => {
  return supabase.channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};