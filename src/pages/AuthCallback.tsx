import React, { useEffect, useState } from 'react';
import { db, isSupabaseConfigured, supabase } from '../services/supabase';
import { Loader2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="glass-panel p-10 max-w-md w-full border border-red-500/20 text-center">
          <h1 className="text-xl font-semibold text-content mb-3">Authentication failed</h1>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <a href="/login" className="text-indigo-500 font-medium hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
        <p className="text-content-muted text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
