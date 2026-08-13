// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FLIPI — Foliküler lenfoma prognoz indeksi",
  description: "FLIPI: Foliküler lenfoma prognoz indeksi — 0–5 puan, 10 yıllık OS / PF. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/flipi" },
  openGraph: {
    type: "website",
    title: "FLIPI — Foliküler lenfoma prognoz indeksi",
    description: "FLIPI: Foliküler lenfoma prognoz indeksi — 0–5 puan, 10 yıllık OS / PF. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/flipi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
