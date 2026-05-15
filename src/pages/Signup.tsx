import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLocalSetup = () => {
    setRole('caregiver');
    localStorage.setItem('cueguide-active-tab', 'today');
    navigate('/onboarding');
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    if (!normalizedName || !normalizedEmail) return;

    if (!isSupabaseConfigured) {
      setError('Cloud account creation is not configured in this environment. Continue with local setup or add Supabase credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        data: {
          name: normalizedName,
          phone: normalizedPhone || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthLayout
        eyebrow="Caregiver account"
        title={`Almost there, ${name}`}
        subtitle={`We sent a private setup link to ${email}.`}
      >
        <div className="auth-success">
          <p>Open the email to finish sign-in, then CueGuide will guide you through patient and medication setup.</p>
          <button type="button" className="cg-secondary" onClick={() => { setSent(false); setEmail(''); }}>
            Use a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Caregiver account"
      title="Create your account"
      subtitle="Start with the caregiver, patient, and first medication schedule."
    >
      {error && <div className="auth-alert">{error}</div>}

      <form onSubmit={handleSignup} className="auth-form">
        <div className={`auth-mode-banner ${isSupabaseConfigured ? 'cloud' : 'local'}`}>
          <strong>{isSupabaseConfigured ? 'Cloud account path available' : 'Local setup active'}</strong>
          <span>{isSupabaseConfigured ? 'Use email for cloud sign-in, or continue locally for this device.' : 'Data stays in this browser until Supabase is connected.'}</span>
        </div>

        <label>
          <span>Your name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sarah Chen"
            required
          />
        </label>

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

        <label>
          <span>Phone number <em>optional for SMS alerts</em></span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+1 555 000 1234"
          />
        </label>

        <button type="submit" disabled={loading} className="cg-primary auth-submit">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send setup link <ArrowRight size={18} /></>}
        </button>
      </form>

      <button type="button" className="cg-secondary auth-local" onClick={startLocalSetup}>
        Continue local setup
      </button>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
