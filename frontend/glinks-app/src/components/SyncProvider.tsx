import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingCount, startSync, initSyncScheduler, stopSyncScheduler, checkConnection } from '@/services/api/syncService';

interface SyncContextValue {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  forceSync: () => Promise<void>;
}

export const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    initSyncScheduler();
    
    const interval = setInterval(async () => {
      const online = await checkConnection();
      setIsOnline(online);
      
      const count = await getPendingCount();
      setPendingCount(count);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      stopSyncScheduler();
    };
  }, [user]);

  const forceSync = async () => {
    setIsSyncing(true);
    await startSync();
    setIsSyncing(false);
    const count = await getPendingCount();
    setPendingCount(count);
  };

  return (
    <SyncContext.Provider value={{ isOnline, pendingCount, isSyncing, forceSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}