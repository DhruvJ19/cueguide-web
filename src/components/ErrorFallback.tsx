import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <main className="legal-shell">
      <section className="legal-card legal-card-narrow" aria-labelledby="error-title">
        <div className="legal-brand">
          <div><AlertTriangle size={20} /></div>
          <span>CueGuide</span>
        </div>
        <p className="cg-eyebrow">Care workspace</p>
        <h1 id="error-title">Something went wrong</h1>
        <p className="legal-lead">{error.message || 'An unexpected error occurred'}</p>
        <div className="legal-button-row">
          <button
            onClick={resetErrorBoundary}
            className="cg-primary"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <Link
            to="/"
            className="cg-secondary"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}
