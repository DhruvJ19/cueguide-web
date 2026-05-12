import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-8">
      <div className="glass-panel p-8 max-w-md w-full border border-red-500/30">
        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center mb-6">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-content mb-2">Something went wrong</h2>
        <p className="text-content-muted mb-6 text-sm font-mono bg-panel-hover p-3 rounded-lg border border-line">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-panel border border-line text-content py-3 rounded-xl font-bold hover:bg-panel-hover transition-colors"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}