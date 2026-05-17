import type { ReactNode } from 'react';

export type CaregiverTone = 'ready' | 'attention' | 'urgent' | 'muted';

export function Section({
  title,
  children,
  action,
  eyebrow,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className="cg-section">
      <div className="cg-section-header">
        <div>
          {eyebrow && <p>{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: CaregiverTone;
}) {
  return (
    <div className={`cg-stat ${tone ? `cg-stat-${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="cg-empty">
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function ReadinessItem({
  icon,
  label,
  value,
  detail,
  status,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  status: 'ready' | 'fallback' | 'review' | 'blocked';
}) {
  return (
    <div className={`cg-readiness-item ${status}`}>
      <div className="cg-readiness-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
