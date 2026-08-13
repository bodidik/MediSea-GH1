// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ESSDAI — Sjögren Hastalık Aktivite İndeksi",
  description: "ESSDAI: Sjögren Hastalık Aktivite İndeksi — 12 ekstraglandüler domain. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/essdai" },
  openGraph: {
    type: "website",
    title: "ESSDAI — Sjögren Hastalık Aktivite İndeksi",
    description: "ESSDAI: Sjögren Hastalık Aktivite İndeksi — 12 ekstraglandüler domain. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/essdai",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
