// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SCORAD — Atopik dermatit şiddet skoru",
  description: "SCORAD: Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/scorad" },
  openGraph: {
    type: "website",
    title: "SCORAD — Atopik dermatit şiddet skoru",
    description: "SCORAD: Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/scorad",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SCORAD",
          aciklama: "SCORAD: Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/scorad",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SCORAD", yol: "/tools/scorad" },
        ])}
      />
      {children}
    </>
  );
}
