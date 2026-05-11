-- migrate: up
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CAREGIVERS TABLE
CREATE TABLE IF NOT EXISTS caregivers (
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

CREATE POLICY "Users can view own caregiver record" ON caregivers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own caregiver record" ON caregivers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own caregiver record" ON caregivers
  FOR UPDATE USING (user_id = auth.uid());

-- STEPS TABLE
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  help_text TEXT,
  icon TEXT,
  estimated_seconds INTEGER DEFAULT 120
);

ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view steps for their routines" ON steps
  FOR SELECT USING (
    routine_id IN (SELECT id FROM routines WHERE patient_id IN
      (SELECT id FROM patients WHERE caregiver_id = auth.uid()))
  );

CREATE POLICY "Users can manage steps for their routines" ON steps
  FOR ALL USING (
    routine_id IN (SELECT id FROM routines WHERE patient_id IN
      (SELECT id FROM patients WHERE caregiver_id = auth.uid()))
  );

-- SCHEDULE ADJUSTMENTS TABLE
CREATE TABLE IF NOT EXISTS schedule_adjustments (
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

CREATE POLICY "Users can view their own schedule adjustments" ON schedule_adjustments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can manage their own schedule adjustments" ON schedule_adjustments
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

-- SENSOR READINGS TABLE
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  sensor_type TEXT,
  value TEXT,
  unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sensor readings for their patients" ON sensor_readings
  FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));

CREATE POLICY "Users can insert sensor readings for their patients" ON sensor_readings
  FOR INSERT WITH CHECK (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));

-- MOOD ENTRIES TABLE
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  mood TEXT CHECK (mood IN ('happy', 'calm', 'anxious', 'confused', 'agitated', 'tired', 'energetic')),
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mood entries for their patients" ON mood_entries
  FOR SELECT USING (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));

CREATE POLICY "Users can insert mood entries for their patients" ON mood_entries
  FOR INSERT WITH CHECK (patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid()));

-- DEVICES TABLE
CREATE TABLE IF NOT EXISTS devices (
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

CREATE POLICY "Users can manage own devices" ON devices
  FOR ALL USING (caregiver_id IN (SELECT id FROM caregivers WHERE user_id = auth.uid()));

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_routines_patient ON routines(patient_id);
CREATE INDEX IF NOT EXISTS idx_steps_routine ON steps(routine_id);
CREATE INDEX IF NOT EXISTS idx_completions_patient_date ON completions(patient_id, date);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_patient ON sensor_readings(patient_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_patient_date ON mood_entries(patient_id, date DESC);

-- REALTIME for completions
ALTER PUBLICATION supabase_realtime ADD TABLE completions;
