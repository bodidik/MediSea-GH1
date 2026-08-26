// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

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
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Morse Düşme Riski",
          aciklama: "Morse Düşme Riski: Hastanede düşme riski değerlendirme skalası — 6 madde. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/morse-fall",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Morse Düşme Riski", yol: "/tools/morse-fall" },
        ])}
      />
      {children}
    </>
  );
}
