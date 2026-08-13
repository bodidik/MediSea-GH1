// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "GRACE 2.0 Skoru — AKS/NSTEMI hastane içi mortalite riski",
  description: "GRACE 2.0 Skoru: AKS/NSTEMI hastane içi mortalite riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/grace" },
  openGraph: {
    type: "website",
    title: "GRACE 2.0 Skoru — AKS/NSTEMI hastane içi mortalite riski",
    description: "GRACE 2.0 Skoru: AKS/NSTEMI hastane içi mortalite riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/grace",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "GRACE 2.0 Skoru",
          aciklama: "GRACE 2.0 Skoru: AKS/NSTEMI hastane içi mortalite riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/grace",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "GRACE 2.0 Skoru", yol: "/tools/grace" },
        ])}
      />
      {children}
    </>
  );
}
