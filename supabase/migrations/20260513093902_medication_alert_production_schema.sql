-- Production medication and caregiver alert shape for CueGuide web-first MVP.
-- Keeps the existing tables compatible while adding the JSON/event fields now used by the app.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE steps
  ADD COLUMN IF NOT EXISTS medication_id UUID REFERENCES medications(id) ON DELETE SET NULL;

ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS step_events JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_prompts_used JSONB DEFAULT '[]'::jsonb;

ALTER TABLE medications
  ADD COLUMN IF NOT EXISTS purpose TEXT,
  ADD COLUMN IF NOT EXISTS instructions TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE medications
SET
  purpose = COALESCE(purpose, description, ''),
  instructions = COALESCE(instructions, notes, ''),
  updated_at = COALESCE(updated_at, created_at, NOW())
WHERE purpose IS NULL OR instructions IS NULL OR updated_at IS NULL;

CREATE TABLE IF NOT EXISTS care_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  step_id UUID REFERENCES steps(id) ON DELETE SET NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('missed_medication', 'step_skipped', 'help_requested', 'stuck_step', 'routine_completed')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'attention', 'urgent')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'acknowledged')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own care alerts" ON care_alerts;
CREATE POLICY "Users can view their own care alerts" ON care_alerts
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their own care alerts" ON care_alerts;
CREATE POLICY "Users can manage their own care alerts" ON care_alerts
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  )
  WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_steps_medication ON steps(medication_id);
CREATE INDEX IF NOT EXISTS idx_care_alerts_patient_created ON care_alerts(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_care_alerts_status ON care_alerts(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON medications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON completions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON care_alerts TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE care_alerts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
