import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="legal-shell">
      <section className="legal-card legal-card-narrow" aria-labelledby="not-found-title">
        <div className="legal-brand">
          <div><Home size={20} /></div>
          <span>CueGuide</span>
        </div>
        <p className="cg-eyebrow">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p className="legal-lead">The page does not exist or has moved.</p>
        <div className="legal-button-row">
          <Link
            to="/"
            className="cg-primary"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="cg-secondary"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
}
