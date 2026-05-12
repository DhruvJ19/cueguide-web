import { db, supabase } from './supabase';
import { usePatientStore } from '../store/patientStore';
import { useRoutineStore } from '../store/routineStore';
import { useCompletionStore } from '../store/completionStore';
import { logAIInteraction } from '../stores/historyStore';

interface SyncResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

class DataSyncService {
  private isLoading = false;
  private lastSyncedAt: string | null = null;
  private syncError: string | null = null;

  get isSyncing() { return this.isLoading; }
  get lastSynced() { return this.lastSyncedAt; }
  get error() { return this.syncError; }

  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('patients').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async syncPatients(caregiverId: string): Promise<SyncResult> {
    this.isLoading = true;
    this.syncError = null;
    try {
      const patients = await db.patients.get(caregiverId);
      if (patients.length > 0) {
        usePatientStore.getState().setProfile(patients[0]);
      }
      this.lastSyncedAt = new Date().toISOString();
      return { success: true, data: patients };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to sync patients';
      this.syncError = errMsg;
      return { success: false, error: errMsg };
    } finally {
      this.isLoading = false;
    }
  }

  async syncRoutines(patientId: string): Promise<SyncResult> {
    this.isLoading = true;
    this.syncError = null;
    try {
      const routines = await db.routines.getForPatient(patientId);
      const { data: adjData } = await supabase
        .from('schedule_adjustments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'pending');
      
      useRoutineStore.getState().setRoutines(routines);
      
      if (adjData && adjData.length > 0) {
        adjData.forEach((adj: any) => {
          useRoutineStore.getState().approveAdjustment(adj.routine_id, adj.suggested_time);
        });
      }
      
      this.lastSyncedAt = new Date().toISOString();
      return { success: true, data: { routines, adjustments: adjData } };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to sync routines';
      this.syncError = errMsg;
      return { success: false, error: errMsg };
    } finally {
      this.isLoading = false;
    }
  }

  async syncCompletions(patientId: string): Promise<SyncResult> {
    this.isLoading = true;
    this.syncError = null;
    try {
      const completions = await db.completions.getForPatient(patientId, 30);
      useCompletionStore.getState().setCompletions(completions);
      this.lastSyncedAt = new Date().toISOString();
      return { success: true, data: completions };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to sync completions';
      this.syncError = errMsg;
      return { success: false, error: errMsg };
    } finally {
      this.isLoading = false;
    }
  }

  async syncAll(caregiverId: string, patientId: string): Promise<SyncResult> {
    this.isLoading = true;
    this.syncError = null;
    try {
      const [patientsRes, routinesRes, completionsRes] = await Promise.all([
        db.patients.get(caregiverId),
        db.routines.getForPatient(patientId),
        db.completions.getForPatient(patientId, 30)
      ]);

      if (patientsRes.length > 0) {
        usePatientStore.getState().setProfile(patientsRes[0]);
      }
      
      useRoutineStore.getState().setRoutines(routinesRes);
      useCompletionStore.getState().setCompletions(completionsRes);
      
      logAIInteraction(patientId, 'data_sync', 'Synced all patient data');
      this.lastSyncedAt = new Date().toISOString();
      
      return { 
        success: true, 
        data: { 
          patient: patientsRes[0], 
          routines: routinesRes, 
          completions: completionsRes 
        } 
      };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to sync data';
      this.syncError = errMsg;
      logAIInteraction(patientId, 'sync_error', errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isLoading = false;
    }
  }
}

export const dataSync = new DataSyncService();