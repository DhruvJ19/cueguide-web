export interface LocalBackupEntry {
  key: string;
  value: unknown;
}

export interface LocalBackup {
  exportedAt: string;
  app: 'CueGuide';
  version: 1;
  entries: LocalBackupEntry[];
}

const LOCAL_BACKUP_KEYS = [
  'cueguide-patient',
  'cueguide-medications',
  'cueguide-routines',
  'cueguide-completions',
  'cueguide-alerts',
  'cueguide-settings',
  'cueguide-auth',
  'cueguide-active-tab',
  'cueguide-voice-review-state',
];

function parseStoredValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function buildLocalBackup(storage: Storage, exportedAt: string): LocalBackup {
  const entries = LOCAL_BACKUP_KEYS
    .map((key) => {
      const value = storage.getItem(key);
      if (value === null) return null;
      return { key, value: parseStoredValue(value) };
    })
    .filter((entry): entry is LocalBackupEntry => Boolean(entry));

  return {
    exportedAt,
    app: 'CueGuide',
    version: 1,
    entries,
  };
}

export function downloadLocalBackup(storage: Storage, exportedAt: string): void {
  const backup = buildLocalBackup(storage, exportedAt);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = exportedAt.slice(0, 10);
  link.href = url;
  link.download = `cueguide-local-backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
