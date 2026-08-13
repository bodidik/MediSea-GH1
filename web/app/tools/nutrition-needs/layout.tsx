// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Enerji & Protein Gereksinimi — Klinik duruma göre",
  description: "Enerji & Protein Gereksinimi: Klinik duruma göre kcal/pro hesaplayıcı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nutrition-needs" },
  openGraph: {
    type: "website",
    title: "Enerji & Protein Gereksinimi — Klinik duruma göre",
    description: "Enerji & Protein Gereksinimi: Klinik duruma göre kcal/pro hesaplayıcı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nutrition-needs",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Enerji & Protein Gereksinimi",
          aciklama: "Enerji & Protein Gereksinimi: Klinik duruma göre kcal/pro hesaplayıcı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/nutrition-needs",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Enerji & Protein Gereksinimi", yol: "/tools/nutrition-needs" },
        ])}
      />
      {children}
    </>
  );
}
