'use client';
import { SessionProvider } from 'next-auth/react';
import { useStudySync } from '@/app/hooks/useStudySync';

function SyncBridge() {
  useStudySync();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SyncBridge />
      {children}
    </SessionProvider>
  );
}
