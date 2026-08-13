// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Morse Düşme Riski — Hastanede düşme riski değerlendirme",
  description: "Morse Düşme Riski: Hastanede düşme riski değerlendirme skalası — 6 madde. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/morse-fall" },
  openGraph: {
    type: "website",
    title: "Morse Düşme Riski — Hastanede düşme riski değerlendirme",
    description: "Morse Düşme Riski: Hastanede düşme riski değerlendirme skalası — 6 madde. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/morse-fall",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
