-- Production RLS and realtime hardening for the web-first medication loop.
-- Supabase docs reviewed 2026-05-14:
-- - RLS must be enabled on public Data API tables.
-- - Grants expose tables; policies restrict rows.
-- - UPDATE needs a matching SELECT/USING policy.

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_alerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_patients_caregiver ON patients(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_user ON caregivers(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient_active ON medications(patient_id, is_active);
CREATE INDEX IF NOT EXISTS idx_completions_patient_created ON completions(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_care_alerts_patient_status_created ON care_alerts(patient_id, status, created_at DESC);

DROP POLICY IF EXISTS "Caregivers can view own medications" ON medications;
DROP POLICY IF EXISTS "Caregivers can insert own medications" ON medications;
DROP POLICY IF EXISTS "Caregivers can update own medications" ON medications;
DROP POLICY IF EXISTS "Caregivers can delete own medications" ON medications;

CREATE POLICY "Caregivers can view own medications" ON medications
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can insert own medications" ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can update own medications" ON medications
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can delete own medications" ON medications
  FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Caregivers can view own completions" ON completions;
DROP POLICY IF EXISTS "Caregivers can insert own completions" ON completions;
DROP POLICY IF EXISTS "Caregivers can update own completions" ON completions;
DROP POLICY IF EXISTS "Caregivers can delete own completions" ON completions;

CREATE POLICY "Caregivers can view own completions" ON completions
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can insert own completions" ON completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can update own completions" ON completions
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can delete own completions" ON completions
  FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Users can view their own care alerts" ON care_alerts;
DROP POLICY IF EXISTS "Users can manage their own care alerts" ON care_alerts;
DROP POLICY IF EXISTS "Caregivers can view own care alerts" ON care_alerts;
DROP POLICY IF EXISTS "Caregivers can insert own care alerts" ON care_alerts;
DROP POLICY IF EXISTS "Caregivers can update own care alerts" ON care_alerts;
DROP POLICY IF EXISTS "Caregivers can delete own care alerts" ON care_alerts;

CREATE POLICY "Caregivers can view own care alerts" ON care_alerts
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can insert own care alerts" ON care_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can update own care alerts" ON care_alerts
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

CREATE POLICY "Caregivers can delete own care alerts" ON care_alerts
  FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL
    AND patient_id IN (
      SELECT patients.id
      FROM patients
      WHERE patients.caregiver_id = (select auth.uid())
        OR patients.caregiver_id IN (
          SELECT caregivers.id
          FROM caregivers
          WHERE caregivers.user_id = (select auth.uid())
        )
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON medications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON completions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON care_alerts TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE medications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE completions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE care_alerts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
