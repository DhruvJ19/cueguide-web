-- CueGuide Database Schema for Supabase
-- Run this in the Supabase SQL Editor

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
  category TEXT CHECK (category IN ('hygiene', 'medication', 'meals', 'exercise', 'social', 'other')),
  scheduled_time TIME NOT NULL,
  recurrence TEXT[] DEFAULT ARRAY['daily'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STEPS TABLE
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  help_text TEXT,
  icon TEXT,
  estimated_seconds INTEGER DEFAULT 120
);

-- 4. COMPLETIONS TABLE
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

-- 5. MEDICATIONS TABLE
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

-- 6. SCHEDULE ADJUSTMENTS TABLE
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

-- Row Level Security (RLS) Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_adjustments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view their own patients" ON patients
  FOR SELECT USING (caregiver_id = auth.uid());

CREATE POLICY "Users can insert their own patients" ON patients
  FOR INSERT WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Users can update their own patients" ON patients
  FOR UPDATE USING (caregiver_id = auth.uid());

CREATE POLICY "Users can view their own routines" ON routines
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can insert their own routines" ON routines
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can update their own routines" ON routines
  FOR UPDATE USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can delete their own routines" ON routines
  FOR DELETE USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

-- Steps inherit from routines (users can see steps for their routines)
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

CREATE POLICY "Users can view their own completions" ON completions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can insert their own completions" ON completions
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can view their own medications" ON medications
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can manage their own medications" ON medications
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can view their own schedule adjustments" ON schedule_adjustments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE POLICY "Users can manage their own schedule adjustments" ON schedule_adjustments
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_routines_patient ON routines(patient_id);
CREATE INDEX idx_steps_routine ON steps(routine_id);
CREATE INDEX idx_completions_patient_date ON completions(patient_id, date);
CREATE INDEX idx_medications_patient ON medications(patient_id);