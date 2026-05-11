-- CueGuide Production Schema v2
-- Single Supabase project serving both web + mobile apps
-- All column names in camelCase to match TypeScript interfaces
-- Run this in: https://supabase.com/dashboard/project/kueqtpekkqapclczvahc/sql

BEGIN;

-- =====================================================================
-- 1. CAREGIVERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  patientCallName TEXT DEFAULT 'Sarah',
  notificationPrefs JSONB DEFAULT '{"smsEnabled":true,"pushEnabled":true,"quietHoursStart":"22:00","quietHoursEnd":"08:00","maxAlertsPerHour":3}',
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userId)
);

-- =====================================================================
-- 2. PATIENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiverId UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  preferredName TEXT,
  dateOfBirth DATE,
  stage TEXT CHECK (stage IN ('early', 'moderate', 'late')),
  context TEXT,
  preferences JSONB DEFAULT '{"fontSize":28,"theme":"warm","voice":"female"}',
  avatar TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 3. ROUTINES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('hygiene', 'medication', 'meals', 'exercise', 'social', 'other')),
  scheduledTime TIME NOT NULL,
  recurrence TEXT[] DEFAULT ARRAY['daily'],
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. STEPS TABLE (child of routines)
-- =====================================================================
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routineId UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  helpText TEXT,
  icon TEXT,
  estimatedSeconds INTEGER DEFAULT 120
);

-- =====================================================================
-- 5. COMPLETIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  routineId UUID REFERENCES routines(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('completed', 'partial', 'missed', 'in_progress')),
  minutes INTEGER,
  stepsCompleted INTEGER,
  stepsTotal INTEGER,
  mood TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 6. MEDICATIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pillColor TEXT,
  pillShape TEXT,
  dosage TEXT,
  frequency TEXT,
  times TEXT[] NOT NULL,
  notes TEXT,
  refillDate DATE,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 7. SCHEDULE ADJUSTMENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS scheduleAdjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  routineId UUID REFERENCES routines(id) ON DELETE SET NULL,
  routineName TEXT,
  currentTime TIME,
  suggestedTime TIME,
  reason TEXT,
  dataPoints INTEGER,
  confidence DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 8. SENSOR READINGS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS sensorReadings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sensorType TEXT CHECK (sensorType IN ('motion', 'door', 'temperature', 'heart_rate', 'sleep', 'steps')),
  value TEXT NOT NULL,
  unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 9. MOOD ENTRIES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS moodEntries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  routineId UUID REFERENCES routines(id) ON DELETE SET NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 10. DEVICES TABLE (paired patient devices)
-- =====================================================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiverId UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  patientId UUID REFERENCES patients(id) ON DELETE SET NULL,
  deviceType TEXT CHECK (deviceType IN ('phone', 'tablet', 'kiosk')),
  deviceName TEXT,
  pairingCode TEXT,
  isPaired BOOLEAN DEFAULT false,
  lastSeen TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduleAdjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensorReadings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodEntries ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Caregivers: own data only
CREATE POLICY "Caregivers see own record" ON caregivers
  FOR SELECT USING (userId = auth.uid());

CREATE POLICY "Caregivers insert own record" ON caregivers
  FOR INSERT WITH CHECK (userId = auth.uid());

CREATE POLICY "Caregivers update own record" ON caregivers
  FOR UPDATE USING (userId = auth.uid());

-- Patients: caregivers see only their own patients
CREATE POLICY "Caregivers manage their patients" ON patients
  FOR ALL USING (caregiverId IN (
    SELECT id FROM caregivers WHERE userId = auth.uid()
  ));

-- Routines: through patients
CREATE POLICY "Caregivers manage their routines" ON routines
  FOR ALL USING (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

-- Steps: through routines
CREATE POLICY "Caregivers manage steps" ON steps
  FOR ALL USING (routineId IN (
    SELECT id FROM routines WHERE patientId IN (
      SELECT id FROM patients WHERE caregiverId IN (
        SELECT id FROM caregivers WHERE userId = auth.uid()
      )
    )
  ));

-- Completions: through patients
CREATE POLICY "Caregivers manage completions" ON completions
  FOR ALL USING (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

-- Medications: through patients
CREATE POLICY "Caregivers manage medications" ON medications
  FOR ALL USING (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

-- Schedule Adjustments: through patients
CREATE POLICY "Caregivers manage adjustments" ON scheduleAdjustments
  FOR ALL USING (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

-- Sensor Readings: through patients
CREATE POLICY "Caregivers view sensor readings" ON sensorReadings
  FOR SELECT USING (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

CREATE POLICY "Caregivers insert sensor readings" ON sensorReadings
  FOR INSERT WITH CHECK (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

-- Mood Entries: through patients
CREATE POLICY "Caregivers manage mood entries" ON moodEntries
  FOR ALL USING (patientId IN (
    SELECT id FROM patients WHERE caregiverId IN (
      SELECT id FROM caregivers WHERE userId = auth.uid()
    )
  ));

-- Devices: own devices only
CREATE POLICY "Caregivers manage their devices" ON devices
  FOR ALL USING (caregiverId IN (
    SELECT id FROM caregivers WHERE userId = auth.uid()
  ));

-- =====================================================================
-- INDEXES
-- =====================================================================
CREATE INDEX idx_patients_caregiver ON patients(caregiverId);
CREATE INDEX idx_routines_patient ON routines(patientId);
CREATE INDEX idx_steps_routine ON steps(routineId);
CREATE INDEX idx_completions_patient_date ON completions(patientId, date);
CREATE INDEX idx_completions_routine_date ON completions(routineId, date);
CREATE INDEX idx_medications_patient ON medications(patientId);
CREATE INDEX idx_sensorReadings_patient_time ON sensorReadings(patientId, timestamp DESC);
CREATE INDEX idx_moodEntries_patient ON moodEntries(patientId);
CREATE INDEX idx_devices_caregiver ON devices(caregiverId);
CREATE INDEX idx_devices_pairing ON devices(pairingCode) WHERE pairingCode IS NOT NULL;

-- =====================================================================
-- REALTIME
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE completions;
ALTER PUBLICATION supabase_realtime ADD TABLE scheduleAdjustments;

COMMIT;