import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 24, text, fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex items-center gap-3 text-content-muted">
      <Loader2 size={size} className="animate-spin text-indigo-500" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}

export function PageLoading() {
  return <LoadingSpinner size={32} text="Loading..." fullPage />;
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-panel rounded-xl border border-line p-5">
      <div className="h-4 bg-panel-hover rounded w-1/3 mb-4" />
      <div className="h-8 bg-panel-hover rounded w-2/3 mb-4" />
      <div className="h-2 bg-panel-hover rounded w-full mb-2" />
      <div className="h-2 bg-panel-hover rounded w-3/4" />
    </div>
  );
}