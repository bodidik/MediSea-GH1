// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "NAC İnfüzyonu — Parasetamol intoksikasyonunda IV",
  description: "NAC İnfüzyonu: Parasetamol intoksikasyonunda IV N-asetilsistein — 3 torba ve SNAP rejimi, kiloya göre doz ve mL/saat. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nac-infuzyon" },
  openGraph: {
    type: "website",
    title: "NAC İnfüzyonu — Parasetamol intoksikasyonunda IV",
    description: "NAC İnfüzyonu: Parasetamol intoksikasyonunda IV N-asetilsistein — 3 torba ve SNAP rejimi, kiloya göre doz ve mL/saat. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nac-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "NAC İnfüzyonu",
          aciklama: "NAC İnfüzyonu: Parasetamol intoksikasyonunda IV N-asetilsistein — 3 torba ve SNAP rejimi, kiloya göre doz ve mL/saat. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/nac-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "NAC İnfüzyonu", yol: "/tools/nac-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
