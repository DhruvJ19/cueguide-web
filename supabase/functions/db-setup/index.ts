import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const SCHEMA_SQL = `
DO $$
BEGIN
  -- CAREGIVERS
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'caregivers') THEN
    CREATE TABLE caregivers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      patient_call_name TEXT DEFAULT 'Sarah',
      notification_prefs JSONB DEFAULT '{"smsEnabled":true,"pushEnabled":true,"quietHoursStart":"22:00","quietHoursEnd":"08:00","maxAlertsPerHour":3}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "cg_view" ON caregivers FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "cg_insert" ON caregivers FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY "cg_update" ON caregivers FOR UPDATE USING (user_id = auth.uid());
  END IF;

  -- STEPS
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'steps') THEN
    CREATE TABLE steps (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      help_text TEXT,
      icon TEXT,
      estimated_seconds INTEGER DEFAULT 120
    );
    ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "steps_view" ON steps FOR SELECT USING (routine_id IN (SELECT id FROM routines WHERE patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())));
    CREATE POLICY "steps_manage" ON steps FOR ALL USING (routine_id IN (SELECT id FROM routines WHERE patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())));
  END IF;

  -- SCHEDULE_ADJUSTMENTS
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedule_adjustments') THEN
    CREATE TABLE schedule_adjustments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
      routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
      routine_name TEXT,
      current_time TIME,
      suggested_time TIME,
      reason TEXT,
      data_points INTEGER,
      confidence DECIMAL(3,2),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE schedule_adjustments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "adj_view" ON schedule_adjustments FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));
    CREATE POLICY "adj_manage" ON schedule_adjustments FOR ALL USING (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));
  END IF;

  -- SENSOR_READINGS
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sensor_readings') THEN
    CREATE TABLE sensor_readings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
      sensor_type TEXT,
      value TEXT,
      unit TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "sr_view" ON sensor_readings FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));
    CREATE POLICY "sr_insert" ON sensor_readings FOR INSERT WITH CHECK (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));
  END IF;

  -- MOOD_ENTRIES
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mood_entries') THEN
    CREATE TABLE mood_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
      mood TEXT CHECK (mood IN ('happy', 'calm', 'anxious', 'confused', 'agitated', 'tired', 'energetic')),
      notes TEXT,
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "me_view" ON mood_entries FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));
    CREATE POLICY "me_insert" ON mood_entries FOR INSERT WITH CHECK (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));
  END IF;

  -- DEVICES
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'devices') THEN
    CREATE TABLE devices (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      caregiver_id UUID REFERENCES caregivers(id) ON DELETE CASCADE,
      name TEXT,
      type TEXT CHECK (type IN ('tablet', 'phone', 'watch', 'display')),
      push_token TEXT,
      is_active BOOLEAN DEFAULT true,
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "dev_manage" ON devices FOR ALL USING (caregiver_id IN (SELECT id FROM caregivers WHERE user_id = auth.uid()));
  END IF;

  -- INDEXES
  CREATE INDEX IF NOT EXISTS idx_routines_patient ON routines(patient_id);
  CREATE INDEX IF NOT EXISTS idx_steps_routine ON steps(routine_id);
  CREATE INDEX IF NOT EXISTS idx_completions_patient_date ON completions(patient_id, date);
  CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);

  -- REALTIME
  ALTER PUBLICATION supabase_realtime ADD TABLE completions;
END $$;
`

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await supabase.rpc('exec', { sql: SCHEMA_SQL })

    if (error) {
      console.error('Schema error:', JSON.stringify(error))
      return new Response(JSON.stringify({ error: error.message, details: error }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      })
    }

    return new Response(JSON.stringify({ message: 'schema-applied', data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
