import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-8">
      <div className="glass-panel p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold text-content mb-3">404</h1>
        <p className="text-xl text-content-muted mb-2">Page not found</p>
        <p className="text-content-faint text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-panel border border-line text-content px-6 py-3 rounded-xl font-semibold hover:bg-panel-hover transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}