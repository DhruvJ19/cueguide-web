import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle2, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="glass-panel p-10 max-w-3xl w-full border border-indigo-500/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Scale size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-content">CueGuide<span className="text-indigo-400 font-black">.</span></h1>
        </div>

        <h2 className="text-2xl font-semibold text-content mb-2">Terms of Service</h2>
        <p className="text-content-muted text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-sm text-content-muted leading-relaxed">
          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Acceptance</h3>
            <p>By using CueGuide, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><FileText size={16} className="text-indigo-400" /> Service Description</h3>
            <p>CueGuide is a care assistance platform designed to help individuals with early-stage dementia complete daily routines through step-by-step guidance, voice prompts, and caregiver notifications. It is not a medical device, does not provide medical advice, and is not intended to diagnose, treat, or prevent any disease or condition.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Shield size={16} className="text-indigo-400" /> User Responsibilities</h3>
            <p>You are responsible for: maintaining the confidentiality of your account credentials, ensuring the patient profile information is accurate and up-to-date, notifying us of any unauthorized access, and using the service in accordance with these terms and applicable laws.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-400" /> Medical Disclaimer</h3>
            <p>CueGuide is not a substitute for professional medical care, diagnosis, or treatment. The service provides general care reminders and is not a medical device regulated by the FDA. Always consult with qualified healthcare providers for medical decisions. If a patient is in distress, contact emergency services immediately.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Scale size={16} className="text-indigo-400" /> Limitation of Liability</h3>
            <p>CueGuide and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of the service. We do not guarantee that the service will be uninterrupted, error-free, or completely accurate.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Account Termination</h3>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, or use the service for illegal purposes. You may delete your account at any time from the settings page.</p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-3 flex items-center gap-2"><Mail size={16} className="text-indigo-400" /> Contact</h3>
            <p>For questions about these terms, contact legal@cueguide.app.</p>
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