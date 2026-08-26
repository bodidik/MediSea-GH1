// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DAS28 (ESR/CRP) — Romatoid artrit hastalık aktivite",
  description: "DAS28 (ESR/CRP): Romatoid artrit hastalık aktivite skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/das28" },
  openGraph: {
    type: "website",
    title: "DAS28 (ESR/CRP) — Romatoid artrit hastalık aktivite",
    description: "DAS28 (ESR/CRP): Romatoid artrit hastalık aktivite skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/das28",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DAS28 (ESR/CRP)",
          aciklama: "DAS28 (ESR/CRP): Romatoid artrit hastalık aktivite skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/das28",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DAS28 (ESR/CRP)", yol: "/tools/das28" },
        ])}
      />
      {children}
    </>
  );
}
