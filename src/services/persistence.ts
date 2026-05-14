export type PersistenceSource = 'supabase' | 'local';

export type PersistenceResult<T> =
  | {
      ok: true;
      source: PersistenceSource;
      data: T | null;
    }
  | {
      ok: false;
      source: PersistenceSource;
      error: string;
    };

export function createPersistenceSuccess<T>(
  source: PersistenceSource,
  data: T | null,
): PersistenceResult<T> {
  return { ok: true, source, data };
}

export function createPersistenceFailure<T>(
  source: PersistenceSource,
  context: string,
  error: unknown,
): PersistenceResult<T> {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error');
  return {
    ok: false,
    source,
    error: `${context}: ${message}`,
  };
}
