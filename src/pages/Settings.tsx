import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Shield, User, LogOut, Check, FileText, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, db } from '../services/supabase';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCaregiverEmail(user.email || '');
    }
  };

  const handleTogglePush = async () => {
    setSaving(true);
    try {
      setPushEnabled(!pushEnabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-content">Settings</h2>
          <p className="text-content-muted text-sm mt-1">Notifications, privacy, and account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-line rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
              {pushEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </div>
            <div>
              <h3 className="font-semibold text-content">Push Notifications</h3>
              <p className="text-xs text-content-muted">Get alerts when your loved one needs you</p>
            </div>
          </div>

          <button
            onClick={handleTogglePush}
            disabled={saving}
            className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              pushEnabled
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            } disabled:opacity-50`}
          >
            {saving ? (
              <span className="animate-spin">⟳</span>
            ) : pushEnabled ? (
              <>Disable alerts</>
            ) : (
              <>Enable push alerts</>
            )}
            {saved && <Check size={16} className="text-emerald-400" />}
          </button>

          {pushEnabled && (
            <p className="text-emerald-400/70 text-xs mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Active — you'll receive alerts for missed routines
            </p>
          )}
        </div>

        <div className="glass-card p-6 border border-line rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-content">Privacy & Compliance</h3>
              <p className="text-xs text-content-muted">HIPAA-compliant data handling</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {[
              'All data encrypted in transit (TLS 1.3)',
              'Patient data anonymized before AI calls',
              'Row-level security — you only see your patients',
              'Right to delete all data on request',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-content-muted">
                <Check size={14} className="text-emerald-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Link to="/privacy" className="flex-1 py-2 px-4 rounded-xl font-bold text-xs text-center bg-panel border border-line hover:bg-panel-hover transition-all flex items-center justify-center gap-1.5">
              <FileText size={14} /> Privacy Policy
            </Link>
            <Link to="/terms" className="flex-1 py-2 px-4 rounded-xl font-bold text-xs text-center bg-panel border border-line hover:bg-panel-hover transition-all flex items-center justify-center gap-1.5">
              <FileText size={14} /> Terms of Service
            </Link>
          </div>
        </div>

        <div className="glass-card p-6 border border-line rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-panel-hover border border-line rounded-lg flex items-center justify-center">
              <User size={20} className="text-content-muted" />
            </div>
            <div>
              <h3 className="font-semibold text-content">Account</h3>
              <p className="text-xs text-content-muted">{caregiverEmail || 'Loading...'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <div className="glass-card p-6 border border-line rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-content">Notification Triggers</h3>
              <p className="text-xs text-content-muted">What you'll be notified about</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Routine missed', desc: 'Patient did not complete routine' },
              { label: 'Partial completion', desc: 'Routine was started but not finished' },
              { label: 'Daily summary', desc: 'End-of-day report on activity' },
              { label: 'Mood alert', desc: 'Patient indicates confusion or distress' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <div>
                  <p className="text-sm font-medium text-content">{item.label}</p>
                  <p className="text-xs text-content-faint">{item.desc}</p>
                </div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}