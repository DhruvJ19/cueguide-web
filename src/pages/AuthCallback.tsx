import React, { useEffect, useState } from 'react';
import { db, isSupabaseConfigured, supabase } from '../services/supabase';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseConfigured) {
        setRole('caregiver');
        navigate('/dashboard', { replace: true });
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setError(error?.message || 'Failed to authenticate. Please try again.');
        return;
      }

      const name = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : user.email?.split('@')[0] || 'Caregiver';
      const caregiver = await db.caregivers.getOrCreate(user.id, name, user.email || '');
      const caregiverPatients = caregiver ? await db.patients.get(caregiver.id) : [];
      const legacyPatients = caregiverPatients.length === 0 ? await db.patients.get(user.id) : [];
      const existingPatients = caregiverPatients.length > 0 ? caregiverPatients : legacyPatients;
      setRole('caregiver');

      if (existingPatients && existingPatients.length > 0) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, setRole]);

  if (error) {
    return (
      <main className="legal-shell">
        <section className="legal-card legal-card-narrow" aria-labelledby="auth-failed-title">
          <div className="legal-brand">
            <div><AlertTriangle size={20} /></div>
            <span>CueGuide</span>
          </div>
          <p className="cg-eyebrow">Sign-in issue</p>
          <h1 id="auth-failed-title">Authentication failed</h1>
          <p className="legal-lead">{error}</p>
          <div className="legal-actions">
            <a href="/login">Back to login</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="legal-shell">
      <section className="legal-card legal-card-narrow auth-callback-card" aria-label="Signing in">
        <Loader2 size={34} />
        <p className="cg-eyebrow">CueGuide</p>
        <h1>Signing you in</h1>
        <p className="legal-lead">Preparing the caregiver workspace.</p>
      </section>
    </main>
  );
}
