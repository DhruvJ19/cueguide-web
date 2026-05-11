import React, { useState } from 'react';
import { supabase, db } from '../services/supabase';
import { HeartPulse, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="glass-panel p-10 max-w-md w-full border border-indigo-500/20 text-center">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HeartPulse size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-content mb-3">Check your email</h1>
          <p className="text-content-muted mb-2">
            We sent a magic link to <span className="text-content font-medium">{email}</span>
          </p>
          <p className="text-content-faint text-sm mb-8">
            Click the link in the email to sign in. It expires in 1 hour.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="text-indigo-500 text-sm font-medium hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="glass-panel p-10 max-w-md w-full border border-indigo-500/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <HeartPulse size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-content">CueGuide<span className="text-indigo-400 font-black">.</span></h1>
        </div>

        <h2 className="text-xl font-semibold text-content mb-2">Welcome back</h2>
        <p className="text-content-muted mb-8 text-sm">Sign in to check on your loved one</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-content-faint mb-2 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              required
              className="w-full px-4 py-3 bg-panel border border-line rounded-xl text-content placeholder:text-content-faint focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Send magic link <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-content-muted text-sm">
            New to CueGuide?{' '}
            <Link to="/signup" className="text-indigo-500 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}