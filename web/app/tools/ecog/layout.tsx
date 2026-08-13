// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ECOG Performans Durumu — Fonksiyonel kapasite / tedavi",
  description: "ECOG Performans Durumu: Fonksiyonel kapasite / tedavi uygunluğu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ecog" },
  openGraph: {
    type: "website",
    title: "ECOG Performans Durumu — Fonksiyonel kapasite / tedavi",
    description: "ECOG Performans Durumu: Fonksiyonel kapasite / tedavi uygunluğu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ecog",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
