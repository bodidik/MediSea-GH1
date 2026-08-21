// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Heparin Nomogramı — Kiloya göre IV heparin yükleme ve",
  description: "Heparin Nomogramı: Kiloya göre IV heparin yükleme ve idame dozu — VTE ve AKS ayrı, tavanlar açıkça bildiriliyor. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/heparin-nomogram" },
  openGraph: {
    type: "website",
    title: "Heparin Nomogramı — Kiloya göre IV heparin yükleme ve",
    description: "Heparin Nomogramı: Kiloya göre IV heparin yükleme ve idame dozu — VTE ve AKS ayrı, tavanlar açıkça bildiriliyor. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/heparin-nomogram",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Heparin Nomogramı",
          aciklama: "Heparin Nomogramı: Kiloya göre IV heparin yükleme ve idame dozu — VTE ve AKS ayrı, tavanlar açıkça bildiriliyor. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/heparin-nomogram",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Heparin Nomogramı", yol: "/tools/heparin-nomogram" },
        ])}
      />
      {children}
    </>
  );
}
