import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterLocalMode = () => {
    setRole('caregiver');
    localStorage.setItem('cueguide-active-tab', 'today');
    navigate('/dashboard');
  };

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    if (!isSupabaseConfigured) {
      setError('Cloud sign-in is not configured in this environment. Continue with local data or add Supabase credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthLayout
        eyebrow="Secure caregiver sign-in"
        title="Check your email"
        subtitle={`We sent a private sign-in link to ${email}.`}
      >
        <div className="auth-success">
          <p>Open the email on this device. The link will bring you back to CueGuide and load the caregiver workspace.</p>
          <button type="button" className="cg-secondary" onClick={() => { setSent(false); setEmail(''); }}>
            Use a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Caregiver sign-in"
      title="Welcome back"
      subtitle="Open the caregiver workspace for medication schedules, sessions, and alerts."
    >
      {error && <div className="auth-alert">{error}</div>}

      <form onSubmit={handleMagicLink} className="auth-form">
        <div className={`auth-mode-banner ${isSupabaseConfigured ? 'cloud' : 'local'}`}>
          <strong>{isSupabaseConfigured ? 'Cloud sign-in path available' : 'Local data mode active'}</strong>
          <span>{isSupabaseConfigured ? 'Use email for cloud data, or open local data on this device.' : 'Use this device while cloud production proof is pending.'}</span>
        </div>

        <label>
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="caregiver@example.com"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="cg-primary auth-submit">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send secure link <ArrowRight size={18} /></>}
        </button>
      </form>

      <button type="button" className="cg-secondary auth-local" onClick={enterLocalMode}>
        Continue with local data
      </button>

      <p className="auth-switch">
        New to CueGuide? <Link to="/signup">Create caregiver account</Link>
      </p>
    </AuthLayout>
  );
}
