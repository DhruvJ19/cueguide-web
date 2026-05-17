import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ path: '.env', quiet: true });

type ProofTable =
  | 'caregivers'
  | 'patients'
  | 'medications'
  | 'completions'
  | 'care_alerts';

interface ProofIds {
  caregiverId?: string;
  patientId: string;
  medicationId: string;
  routineId: string;
  completionId: string;
  alertId: string;
}

interface ProofResult {
  ok: boolean;
  projectUrl: string;
  userId: string;
  inserted: Record<ProofTable, boolean>;
  readBack: Record<ProofTable, boolean>;
  anonymousBlocked: boolean;
  cleanup: Record<string, boolean>;
}

function readEnv(name: string): string {
  return process.env[name]?.trim() || '';
}

function buildClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function assertConfigured(name: string, value: string): void {
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local or export it before running npm run proof:supabase.`);
  }
}

async function signIn(client: SupabaseClient, email: string, password: string): Promise<User> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(`Supabase test sign-in failed for ${email}: ${error?.message || 'no user returned'}`);
  }
  return data.user;
}

async function getOrCreateCaregiver(client: SupabaseClient, user: User, runId: string): Promise<string> {
  const existing = await client
    .from('caregivers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing.error) {
    throw new Error(`Failed to read caregiver for user ${user.id}: ${existing.error.message}`);
  }

  if (existing.data?.id) return existing.data.id as string;

  const inserted = await client
    .from('caregivers')
    .insert({
      user_id: user.id,
      name: `CueGuide Proof ${runId}`,
      email: user.email || 'supabase-proof@example.com',
      patient_call_name: 'Caregiver',
      notification_prefs: {
        smsEnabled: false,
        pushEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        maxAlertsPerHour: 3,
      },
    })
    .select('id')
    .single();

  if (inserted.error || !inserted.data?.id) {
    throw new Error(`Failed to insert caregiver for user ${user.id}: ${inserted.error?.message || 'no id returned'}`);
  }

  return inserted.data.id as string;
}

async function insertProofRows(client: SupabaseClient, caregiverId: string, ids: ProofIds, runId: string): Promise<void> {
  const patient = await client.from('patients').insert({
    id: ids.patientId,
    caregiver_id: caregiverId,
    name: `CueGuide Proof Patient ${runId}`,
    preferred_name: 'Proof',
    date_of_birth: null,
    stage: 'early',
    context: 'Automated cloud proof row. Safe to delete.',
    preferences: { fontSize: 28, theme: 'warm', voice: 'female' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (patient.error) throw new Error(`Patient insert failed: ${patient.error.message}`);

  const medication = await client.from('medications').insert({
    id: ids.medicationId,
    patient_id: ids.patientId,
    name: `Proof Medication ${runId}`,
    purpose: 'cloud data proof',
    dosage: '1 tablet',
    pill_color: 'white',
    pill_shape: 'small oval',
    times: ['08:00'],
    instructions: 'Proof row only.',
    location: 'proof organizer',
    refill_date: '2026-06-01',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (medication.error) throw new Error(`Medication insert failed: ${medication.error.message}`);

  const completion = await client.from('completions').insert({
    id: ids.completionId,
    patient_id: ids.patientId,
    routine_id: ids.routineId,
    date: new Date().toISOString().slice(0, 10),
    status: 'partial',
    minutes: 2,
    steps_completed: 1,
    steps_total: 2,
    step_events: [
      {
        stepId: 'proof-step',
        routineId: ids.routineId,
        patientId: ids.patientId,
        medicationId: ids.medicationId,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'help_requested',
        elapsedSeconds: 20,
        helpRequested: true,
      },
    ],
    ai_prompts_used: [],
    mood: 'Okay',
    created_at: new Date().toISOString(),
  });
  if (completion.error) throw new Error(`Completion insert failed: ${completion.error.message}`);

  const alert = await client.from('care_alerts').insert({
    id: ids.alertId,
    patient_id: ids.patientId,
    routine_id: ids.routineId,
    medication_id: ids.medicationId,
    type: 'help_requested',
    severity: 'attention',
    title: `Proof alert ${runId}`,
    message: 'Automated cloud proof alert. Safe to delete.',
    status: 'unread',
    created_at: new Date().toISOString(),
  });
  if (alert.error) throw new Error(`Care alert insert failed: ${alert.error.message}`);
}

async function verifyReadBack(client: SupabaseClient, ids: ProofIds): Promise<Record<ProofTable, boolean>> {
  const [patient, medication, completion, alert] = await Promise.all([
    client.from('patients').select('id').eq('id', ids.patientId).maybeSingle(),
    client.from('medications').select('id').eq('id', ids.medicationId).maybeSingle(),
    client.from('completions').select('id').eq('id', ids.completionId).maybeSingle(),
    client.from('care_alerts').select('id').eq('id', ids.alertId).maybeSingle(),
  ]);

  return {
    caregivers: Boolean(ids.caregiverId),
    patients: Boolean(patient.data?.id),
    medications: Boolean(medication.data?.id),
    completions: Boolean(completion.data?.id),
    care_alerts: Boolean(alert.data?.id),
  };
}

async function verifyAnonymousBlocked(url: string, anonKey: string, patientId: string): Promise<boolean> {
  const anonymous = buildClient(url, anonKey);
  const response = await anonymous.from('patients').select('id').eq('id', patientId);
  if (response.error) return true;
  return (response.data || []).length === 0;
}

async function cleanupProofRows(client: SupabaseClient, ids: ProofIds): Promise<Record<string, boolean>> {
  const cleanup: Record<string, boolean> = {};
  const tables = [
    { name: 'care_alerts', column: 'id', id: ids.alertId },
    { name: 'completions', column: 'id', id: ids.completionId },
    { name: 'medications', column: 'id', id: ids.medicationId },
    { name: 'patients', column: 'id', id: ids.patientId },
  ];

  for (const table of tables) {
    const result = await client.from(table.name).delete().eq(table.column, table.id);
    cleanup[table.name] = !result.error;
  }

  return cleanup;
}

async function runProof(): Promise<ProofResult> {
  const url = readEnv('VITE_SUPABASE_URL') || readEnv('SUPABASE_URL');
  const anonKey = readEnv('VITE_SUPABASE_ANON_KEY') || readEnv('SUPABASE_ANON_KEY');
  const email = readEnv('CUEGUIDE_SUPABASE_TEST_EMAIL');
  const password = readEnv('CUEGUIDE_SUPABASE_TEST_PASSWORD');

  assertConfigured('VITE_SUPABASE_URL or SUPABASE_URL', url);
  assertConfigured('VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY', anonKey);
  assertConfigured('CUEGUIDE_SUPABASE_TEST_EMAIL', email);
  assertConfigured('CUEGUIDE_SUPABASE_TEST_PASSWORD', password);

  const client = buildClient(url, anonKey);
  const user = await signIn(client, email, password);
  const runId = Date.now().toString();
  const ids: ProofIds = {
    patientId: randomUUID(),
    medicationId: randomUUID(),
    routineId: randomUUID(),
    completionId: randomUUID(),
    alertId: randomUUID(),
  };

  let cleanup: Record<string, boolean> = {};

  try {
    const caregiverId = await getOrCreateCaregiver(client, user, runId);
    ids.caregiverId = caregiverId;
    await insertProofRows(client, caregiverId, ids, runId);
    const readBack = await verifyReadBack(client, ids);
    const anonymousBlocked = await verifyAnonymousBlocked(url, anonKey, ids.patientId);
    cleanup = await cleanupProofRows(client, ids);

    const inserted = {
      caregivers: Boolean(caregiverId),
      patients: true,
      medications: true,
      completions: true,
      care_alerts: true,
    };

    const ok = Object.values(inserted).every(Boolean)
      && Object.values(readBack).every(Boolean)
      && anonymousBlocked
      && Object.values(cleanup).every(Boolean);

    return {
      ok,
      projectUrl: url,
      userId: user.id,
      inserted,
      readBack,
      anonymousBlocked,
      cleanup,
    };
  } catch (error) {
    cleanup = await cleanupProofRows(client, ids);
    const message = error instanceof Error ? error.message : 'Unknown Supabase proof failure';
    throw new Error(`${message}. Cleanup status: ${JSON.stringify(cleanup)}`);
  } finally {
    await client.auth.signOut();
  }
}

runProof()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown Supabase proof failure';
    console.error(message);
    process.exit(1);
  });
