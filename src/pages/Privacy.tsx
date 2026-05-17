import React from 'react';
import { CheckCircle2, Lock, Eye, Trash2, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  const privacySections = [
    {
      icon: <Lock size={16} />,
      title: 'Data Collection',
      body: 'CueGuide collects caregiver account details, patient profile information, medication schedules, routine data, completion logs, and optional health context needed to support care workflows.',
    },
    {
      icon: <Eye size={16} />,
      title: 'How We Use Your Data',
      body: 'Data is used to create step-by-step care prompts, notify caregivers of care events, improve prompt quality, and generate caregiver reports. CueGuide does not sell data or share it for marketing.',
    },
    {
      icon: <Shield size={16} />,
      title: 'Healthcare Privacy Posture',
      body: 'CueGuide is designed with healthcare privacy controls in mind. Patient context is minimized before AI processing, provider keys stay server-side, and row-level security is the production data target.',
    },
    {
      icon: <Trash2 size={16} />,
      title: 'Your Rights',
      body: 'You can request access, correction, deletion, or account removal by contacting privacy@cueguide.app.',
    },
    {
      icon: <FileText size={16} />,
      title: 'Data Retention',
      body: 'Routine and completion data is retained for care review unless deleted earlier by request. Operational security logs may be retained for abuse prevention and audit needs.',
    },
    {
      icon: <CheckCircle2 size={16} />,
      title: 'Contact',
      body: 'For privacy concerns, contact privacy@cueguide.app. Data requests are reviewed within 30 days.',
    },
  ];

  return (
    <main className="legal-shell">
      <section className="legal-card" aria-labelledby="privacy-title">
        <div className="legal-brand">
          <div><Shield size={20} /></div>
          <span>CueGuide</span>
        </div>

        <p className="cg-eyebrow">Last updated May 2026</p>
        <h1 id="privacy-title">Privacy Policy</h1>
        <p className="legal-lead">Plain-language privacy posture for caregiver medication support, patient prompts, voice, AI, and care-event records.</p>

        <div className="legal-list">
          {privacySections.map((section) => (
            <article key={section.title} className="legal-row">
              <div>{section.icon}</div>
              <span>
                <strong>{section.title}</strong>
                <p>{section.body}</p>
              </span>
            </article>
          ))}
        </div>

        <div className="legal-actions">
          <Link to="/dashboard">Back to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
