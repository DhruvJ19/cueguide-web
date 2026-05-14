import type { ReactNode } from 'react';
import { Bell, HeartPulse, ShieldCheck, Volume2 } from 'lucide-react';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <section className="auth-intro" aria-label="CueGuide care context">
        <div className="auth-brand">
          <span><HeartPulse size={22} /></span>
          <strong>CueGuide</strong>
        </div>
        <p className="cg-eyebrow">{eyebrow}</p>
        <h1>Caregiver medication guidance.</h1>
        <p>
          Schedule meds, launch a calm patient prompt, and review only the events that need attention.
        </p>
        <div className="auth-trust-list">
          <span><Volume2 size={16} /> Gentle voice</span>
          <span><Bell size={16} /> Caregiver alerts</span>
          <span><ShieldCheck size={16} /> Server-only keys</span>
        </div>
      </section>

      <section className="auth-card" aria-label={title}>
        <div className="auth-card-header">
          <p className="cg-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
