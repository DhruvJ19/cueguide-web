import React from 'react';
import { CheckCircle2, Lock, Eye, Trash2, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="glass-panel p-10 max-w-3xl w-full border border-indigo-500/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-content">CueGuide<span className="text-indigo-400 font-black">.</span></h1>
        </div>

        <h2 className="text-2xl font-semibold text-content mb-2">Privacy Policy</h2>
        <p className="text-content-muted text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-sm text-content-muted leading-relaxed">
          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Lock size={16} className="text-indigo-400" /> Data Collection</h3>
            <p>CueGuide collects health and routine data to provide personalized care assistance for individuals with early-stage dementia. We collect: name, email, phone number (optional), patient profile information, daily routine data, completion logs, and optional health metrics from Apple Health or Samsung Health.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Eye size={16} className="text-indigo-400" /> How We Use Your Data</h3>
            <p>Your data is used exclusively to: generate personalized step-by-step care prompts, notify caregivers of missed routines, improve AI prompt quality, and generate weekly care reports. We <strong className="text-content">never sell</strong> your data or share it with third parties for marketing purposes.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Shield size={16} className="text-indigo-400" /> HIPAA Compliance</h3>
            <p>CueGuide is designed with HIPAA compliance in mind. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Patient Health Information (PHI) is anonymized before any AI processing — your loved one's name and medical details never reach our AI API in identifiable form. Row-level security ensures each caregiver only sees their own patients' data.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Trash2 size={16} className="text-indigo-400" /> Your Rights</h3>
            <p>You can request deletion of all your data at any time by contacting us. You have the right to: access your data, correct inaccuracies, delete your account and all associated data, and revoke consent for data collection. To exercise these rights, email privacy@cueguide.app.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><FileText size={16} className="text-indigo-400" /> Data Retention</h3>
            <p>Routine and completion data is retained for 2 years by default. You can request earlier deletion. Auth logs are retained for 90 days for security purposes.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Contact</h3>
            <p>For privacy concerns, contact our Privacy Officer at privacy@cueguide.app. We respond to all data requests within 30 days.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-line">
          <Link to="/dashboard" className="text-indigo-500 text-sm font-medium hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}