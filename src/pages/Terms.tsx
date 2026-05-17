import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle2, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  const termSections = [
    {
      icon: <CheckCircle2 size={16} />,
      title: 'Acceptance',
      body: 'By using CueGuide, you agree to these Terms of Service. If you do not agree, do not use the service.',
    },
    {
      icon: <FileText size={16} />,
      title: 'Service Description',
      body: 'CueGuide helps caregivers organize medication schedules, patient prompts, and care-event review. It is not a medical device and does not diagnose, treat, or prevent disease.',
    },
    {
      icon: <Shield size={16} />,
      title: 'User Responsibilities',
      body: 'Caregivers are responsible for accurate medication information, appropriate supervision, account security, and using CueGuide alongside qualified healthcare guidance.',
    },
    {
      icon: <AlertTriangle size={16} />,
      title: 'Medical Disclaimer',
      body: 'CueGuide is not a substitute for professional medical care. If a patient is in distress, contact emergency services or a qualified healthcare provider.',
    },
    {
      icon: <Scale size={16} />,
      title: 'Liability',
      body: 'CueGuide does not guarantee uninterrupted service or physical medication administration proof. Patient Done events are confirmation inside CueGuide only.',
    },
    {
      icon: <Mail size={16} />,
      title: 'Contact',
      body: 'For questions about these terms, contact legal@cueguide.app.',
    },
  ];

  return (
    <main className="legal-shell">
      <section className="legal-card" aria-labelledby="terms-title">
        <div className="legal-brand">
          <div><Scale size={20} /></div>
          <span>CueGuide</span>
        </div>

        <p className="cg-eyebrow">Last updated May 2026</p>
        <h1 id="terms-title">Terms of Service</h1>
        <p className="legal-lead">Terms for a caregiver support product that assists with medication routines, patient prompts, and event review.</p>

        <div className="legal-list">
          {termSections.map((section) => (
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
