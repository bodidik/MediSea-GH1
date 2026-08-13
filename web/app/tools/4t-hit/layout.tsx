// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "4T Skoru — HIT — Heparine bağlı trombositopeni klinik",
  description: "4T Skoru — HIT: Heparine bağlı trombositopeni klinik olasılık skoru (4 kriter, 0–8 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/4t-hit" },
  openGraph: {
    type: "website",
    title: "4T Skoru — HIT — Heparine bağlı trombositopeni klinik",
    description: "4T Skoru — HIT: Heparine bağlı trombositopeni klinik olasılık skoru (4 kriter, 0–8 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/4t-hit",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
