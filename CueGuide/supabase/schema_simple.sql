-- CueGuide Database Schema for Supabase
-- Created: May 7, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE,
  stage TEXT CHECK (stage IN ('early', 'moderate', 'late')),
  context TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROUTINES TABLE
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  scheduled_time TIME NOT NULL,
  recurrence TEXT[] DEFAULT ARRAY['daily'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('completed', 'partial', 'missed', 'in_progress')),
  minutes INTEGER,
  steps_completed INTEGER,
  steps_total INTEGER,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pill_color TEXT,
  pill_shape TEXT,
  dosage TEXT,
  frequency TEXT,
  times TEXT[] NOT NULL,
  notes TEXT,
  refill_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCHEDULE ADJUSTMENTS TABLE
CREATE TABLE IF NOT EXISTS schedule_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  current_time TIME,
  suggested_time TIME,
  reason TEXT,
  data_points INTEGER,
  confidence DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for MVP - allows authenticated users)
CREATE POLICY "Allow authenticated access on patients" ON patients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access on routines" ON routines
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access on completions" ON completions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access on medications" ON medications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access on schedule_adjustments" ON schedule_adjustments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_routines_patient ON routines(patient_id);
CREATE INDEX idx_completions_patient_date ON completions(patient_id, date);
CREATE INDEX idx_medications_patient ON medications(patient_id);