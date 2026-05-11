-- CueGuide Extended Schema
-- Add missing tables to existing deployed schema
-- Run this in the Supabase SQL Editor after schema.sql is already applied

-- 1. CAREGIVERS TABLE (needed for onboarding)
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

-- 2. SENSOR READINGS TABLE
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

CREATE INDEX idx_sensor_readings_patient ON sensor_readings(patient_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);

-- 3. MOOD ENTRIES TABLE
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

CREATE INDEX idx_mood_entries_patient_date ON mood_entries(patient_id, date DESC);

-- 4. DEVICES TABLE
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

-- 5. SCHEDULE ADJUSTMENTS (ensure routine_name column exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schedule_adjustments' AND column_name = 'routine_name'
  ) THEN
    ALTER TABLE schedule_adjustments ADD COLUMN routine_name TEXT;
  END IF;
END $$;

-- 6. ENABLE REALTIME for completions (for push-alert edge function)
ALTER PUBLICATION supabase_realtime ADD TABLE completions;
