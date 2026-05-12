import { useState, useEffect } from 'react';
import { dataSync } from '../services/dataSync';
import { useAuthStore } from '../store/authStore';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, caregiverId, patientId } = useAuthStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && caregiverId && patientId) {
      syncData();
    }
  }, [isAuthenticated, caregiverId, patientId]);

  const syncData = async () => {
    if (!caregiverId || !patientId) return;
    
    setError(null);
    const result = await dataSync.syncAll(caregiverId, patientId);
    
    if (result.success) {
      setLastSynced(new Date().toLocaleTimeString());
    } else {
      setError(result.error || 'Sync failed');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
        ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
      `}>
        {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      
      {lastSynced && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-panel border border-line rounded-full text-xs text-content-muted">
          <CheckCircle size={12} className="text-emerald-500" />
          <span>Synced {lastSynced}</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-xs">
          <AlertCircle size={12} />
          <span>{error}</span>
          <button onClick={syncData} className="ml-1 hover:text-red-300">
            <RefreshCw size={12} />
          </button>
        </div>
      )}
    </div>
  );
}