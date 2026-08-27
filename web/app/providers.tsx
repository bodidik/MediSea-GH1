'use client';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { useStudySync } from '@/app/hooks/useStudySync';
import { girisiKaydet } from '@/app/lib/gecmis';

function SyncBridge() {
  useStudySync();
  return null;
}

/* Oturumun İLK yüklemesindeki geçmiş uzunluğunu kaydeder — "Geri"
   düğmesinin kullanıcıyı siteden atıp atmayacağını ayırt eden tek sinyal.
   Kök düzende olduğu için (site) grubunun DIŞINDAKİ araç sayfalarında da
   çalışır; ölçülen kusur tam oradaydı. Bkz. app/lib/gecmis.ts */
function GecmisKaydedici() {
  useEffect(() => { girisiKaydet(); }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GecmisKaydedici />
      <SyncBridge />
      {children}
    </SessionProvider>
  );
}
