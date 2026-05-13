import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import {
  PatientProfile,
  Routine,
  Completion,
  ScheduleAdjustment,
  MoodEntry,
  SensorReading,
  Caregiver,
  Medication,
  CareAlert
} from '../types';

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) &&
  !config.supabase.url.includes('mock-supabase-url') &&
  config.supabase.anonKey !== 'mock-anon-key';
export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
});

export const db = {
  caregivers: {
    get: async (id: string): Promise<Caregiver | null> => {
      if (!isSupabaseConfigured) return null;
      const { data, error } = await supabase.from('caregivers').select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') console.error(error);
      return data;
    },
    getByUserId: async (userId: string): Promise<Caregiver | null> => {
      if (!isSupabaseConfigured) return null;
      const { data, error } = await supabase.from('caregivers').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') console.error(error);
      return data;
    },
    save: async (caregiver: Caregiver) => {
      if (!isSupabaseConfigured) return null;
      const { data, error } = await supabase.from('caregivers').upsert(caregiver).select().single();
      if (error) console.error(error);
      return data;
    },
    getOrCreate: async (userId: string, name: string, email: string, phone?: string) => {
      if (!isSupabaseConfigured) return null;
      let existing = await db.caregivers.getByUserId(userId);
      if (existing) return existing;
      const { data, error } = await supabase.from('caregivers').insert({
        user_id: userId,
        name,
        email,
        phone,
        patient_call_name: 'Sarah',
        notification_prefs: {
          smsEnabled: true,
          pushEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          maxAlertsPerHour: 3
        }
      }).select().single();
      if (error) console.error(error);
      return data;
    }
  },
  patients: {
    get: async (caregiverId: string): Promise<PatientProfile[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: true });
      if (error) console.error(error);
      return data || [];
    },
    getById: async (id: string): Promise<PatientProfile | null> => {
      if (!isSupabaseConfigured) return null;
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') console.error(error);
      return data;
    },
    save: async (patient: PatientProfile) => {
      if (!isSupabaseConfigured) return null;
      const payload = {
        id: patient.id,
        caregiver_id: patient.caregiverId,
        name: patient.name,
        preferred_name: patient.preferredName,
        date_of_birth: patient.dateOfBirth || null,
        stage: patient.stage,
        context: patient.context,
        preferences: patient.preferences,
        avatar: patient.avatar || null,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt
      };
      const { data, error } = await supabase.from('patients').upsert(payload).select().single();
      if (error) console.error(error);
      return data;
    }
  },
  routines: {
    getForPatient: async (patientId: string): Promise<Routine[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('routines')
        .select('*, steps(*)')
        .eq('patient_id', patientId)
        .order('scheduled_time');
      if (error) console.error(error);

      if (data) {
        return data.map(r => ({
          ...r,
          scheduledTime: r.scheduled_time,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          steps: (r.steps || []).map((s: any) => ({
            ...s,
            routineId: s.routine_id,
            medicationId: s.medication_id,
            estimatedSeconds: s.estimated_seconds,
            helpText: s.help_text
          }))
        })) as Routine[];
      }
      return [];
    },
    save: async (routine: Routine) => {
      if (!isSupabaseConfigured) return null;
      const { steps, ...rest } = routine;
      const payload = {
        id: rest.id,
        patient_id: rest.patientId,
        name: rest.name,
        category: rest.category,
        scheduled_time: rest.scheduledTime,
        recurrence: rest.recurrence,
        is_active: rest.isActive,
        created_at: rest.createdAt,
        updated_at: rest.updatedAt
      };
      const { data, error } = await supabase.from('routines').upsert(payload).select().single();
      if (error) console.error(error);

      if (steps && steps.length > 0) {
        const { error: stepsError } = await supabase.from('steps').upsert(
          steps.map(s => ({
            id: s.id,
            routine_id: routine.id,
            medication_id: s.medicationId || null,
            position: s.position,
            instruction: s.instruction,
            help_text: s.helpText || null,
            icon: s.icon,
            estimated_seconds: s.estimatedSeconds || 120
          }))
        );
        if (stepsError) console.error(stepsError);
      }
      return data;
    },
    delete: async (id: string) => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) console.error(error);
    }
  },
  completions: {
    getForPatient: async (patientId: string, limit: number = 30): Promise<Completion[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase.from('completions')
         .select('*')
         .eq('patient_id', patientId)
         .order('date', { ascending: false })
         .limit(limit);
      if (error) console.error(error);
      if (data) {
        return data.map(c => ({
          ...c,
          patientId: c.patient_id,
          routineId: c.routine_id,
          stepsCompleted: c.steps_completed,
          stepsTotal: c.steps_total,
          stepEvents: c.step_events || [],
          aiPromptsUsed: c.ai_prompts_used || [],
          createdAt: c.created_at
        })) as Completion[];
      }
      return [];
    },
    save: async (completion: Completion) => {
       if (!isSupabaseConfigured) return null;
       const payload = {
         id: completion.id,
         patient_id: completion.patientId,
         routine_id: completion.routineId,
         date: completion.date,
         status: completion.status,
         minutes: completion.minutes,
         steps_completed: completion.stepsCompleted,
         steps_total: completion.stepsTotal,
         step_events: completion.stepEvents || [],
         ai_prompts_used: completion.aiPromptsUsed || [],
         mood: completion.mood || null,
         created_at: completion.createdAt
       };
       const { data, error } = await supabase.from('completions').upsert(payload).select().single();
       if (error) console.error(error);
       return data;
    }
  },
  medications: {
    getForPatient: async (patientId: string): Promise<Medication[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('name');
      if (error) console.error(error);
      return (data || []).map((medication: any) => ({
        id: medication.id,
        patientId: medication.patient_id,
        name: medication.name,
        purpose: medication.purpose || medication.description || '',
        dosage: medication.dosage || '',
        pillColor: medication.pill_color || medication.pillColor || 'white',
        pillShape: medication.pill_shape || medication.pillShape || 'round',
        times: medication.times || [],
        instructions: medication.instructions || medication.notes || '',
        location: medication.location || '',
        refillDate: medication.refill_date || medication.refillDate || undefined,
        isActive: medication.is_active ?? medication.isActive ?? true,
        createdAt: medication.created_at || medication.createdAt,
        updatedAt: medication.updated_at || medication.updatedAt || medication.created_at,
      }));
    },
    save: async (medication: Medication) => {
      if (!isSupabaseConfigured) return null;
      const payload = {
        id: medication.id,
        patient_id: medication.patientId,
        name: medication.name,
        purpose: medication.purpose,
        dosage: medication.dosage,
        pill_color: medication.pillColor,
        pill_shape: medication.pillShape,
        times: medication.times,
        instructions: medication.instructions || null,
        location: medication.location || null,
        refill_date: medication.refillDate || null,
        is_active: medication.isActive,
        created_at: medication.createdAt,
        updated_at: medication.updatedAt
      };
      const { data, error } = await supabase.from('medications').upsert(payload).select().single();
      if (error) console.error(error);
      return data;
    }
  },
  alerts: {
    getForPatient: async (patientId: string): Promise<CareAlert[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('care_alerts')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      return (data || []).map((alert: any) => ({
        id: alert.id,
        patientId: alert.patient_id,
        routineId: alert.routine_id || undefined,
        stepId: alert.step_id || undefined,
        medicationId: alert.medication_id || undefined,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        status: alert.status,
        createdAt: alert.created_at,
      }));
    },
    save: async (alert: CareAlert) => {
      if (!isSupabaseConfigured) return null;
      const payload = {
        id: alert.id,
        patient_id: alert.patientId,
        routine_id: alert.routineId || null,
        step_id: alert.stepId || null,
        medication_id: alert.medicationId || null,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        status: alert.status,
        created_at: alert.createdAt
      };
      const { data, error } = await supabase.from('care_alerts').upsert(payload).select().single();
      if (error) console.error(error);
      return data;
    }
  },
  adjustments: {
    getPending: async (patientId: string): Promise<ScheduleAdjustment[]> => {
       if (!isSupabaseConfigured) return [];
       const { data, error } = await supabase.from('schedule_adjustments')
         .select('*')
         .eq('patient_id', patientId)
         .eq('status', 'pending');
       if (error) console.error(error);
       if (data) {
         return data.map(a => ({
           ...a,
           patientId: a.patient_id,
           routineId: a.routine_id,
           dataPoints: a.data_points,
           createdAt: a.created_at
         })) as ScheduleAdjustment[];
       }
       return [];
    },
    save: async (adjustment: ScheduleAdjustment) => {
       if (!isSupabaseConfigured) return null;
       const payload = {
         id: adjustment.id,
         patient_id: adjustment.patientId,
         routine_id: adjustment.routineId,
         routine_name: adjustment.routineName,
         current_time: adjustment.currentTime,
         suggested_time: adjustment.suggestedTime,
         reason: adjustment.reason,
         data_points: adjustment.dataPoints,
         confidence: adjustment.confidence,
         status: adjustment.status,
         created_at: adjustment.createdAt
       };
       const { data, error } = await supabase.from('schedule_adjustments').upsert(payload).select().single();
       if (error) console.error(error);
       return data;
    }
  },
  sensors: {
    getRecent: async (patientId: string, hours: number = 24): Promise<SensorReading[]> => {
       if (!isSupabaseConfigured) return [];
       const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
       const { data, error } = await supabase.from('sensor_readings')
         .select('*')
         .eq('patient_id', patientId)
         .gte('timestamp', cutoff)
         .order('timestamp', { ascending: false });
       if (error && error.code !== 'PGRST116') console.error(error);
       if (data) {
         return data.map(r => ({
           ...r,
           patientId: r.patient_id,
           sensorType: r.sensor_type,
           timestamp: r.timestamp
         })) as SensorReading[];
       }
       return [];
    },
    save: async (reading: SensorReading) => {
       if (!isSupabaseConfigured) return null;
       const payload = {
         id: reading.id,
         patient_id: reading.patientId,
         sensor_type: reading.sensorType,
         value: reading.value,
         unit: reading.unit || null,
         timestamp: reading.timestamp
       };
       const { data, error } = await supabase.from('sensor_readings').insert(payload);
       if (error && error.code !== 'PGRST116') console.error(error);
       return data;
    }
  }
};

export const subscribeToRealtime = (table: string, callback: (payload: any) => void) => {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => undefined };
  }
  return supabase.channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};
