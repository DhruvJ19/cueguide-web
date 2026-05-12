import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

export function initMonitoring() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured — crash reporting disabled');
    return false;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    release: `cueguide@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Don't send events in development mode
      if (import.meta.env.MODE === 'development') return null;
      return event;
    },
  });

  return true;
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (!SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}

export function setUser(userId: string, email?: string) {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearUser() {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export { Sentry };