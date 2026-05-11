import React, { useEffect, useState } from 'react';
import { supabase, db } from '../services/supabase';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setError(error?.message || 'Failed to authenticate. Please try again.');
        return;
      }

      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Sarah';
      const existingPatients = await db.patients.get(user.id);

      if (existingPatients && existingPatients.length > 0) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

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