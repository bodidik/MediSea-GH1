// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Child-Pugh Sınıflaması — Siroz şiddet ve prognozu",
  description: "Child-Pugh Sınıflaması: Siroz şiddet ve prognozu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/child-pugh" },
  openGraph: {
    type: "website",
    title: "Child-Pugh Sınıflaması — Siroz şiddet ve prognozu",
    description: "Child-Pugh Sınıflaması: Siroz şiddet ve prognozu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/child-pugh",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Child-Pugh Sınıflaması",
          aciklama: "Child-Pugh Sınıflaması: Siroz şiddet ve prognozu. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/child-pugh",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Child-Pugh Sınıflaması", yol: "/tools/child-pugh" },
        ])}
      />
      {children}
    </>
  );
}
