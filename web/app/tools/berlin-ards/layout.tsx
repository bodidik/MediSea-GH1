// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Berlin ARDS Kriterleri — ARDS tanı ve şiddet sınıflaması",
  description: "Berlin ARDS Kriterleri: ARDS tanı ve şiddet sınıflaması — hafif/orta/ağır. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/berlin-ards" },
  openGraph: {
    type: "website",
    title: "Berlin ARDS Kriterleri — ARDS tanı ve şiddet sınıflaması",
    description: "Berlin ARDS Kriterleri: ARDS tanı ve şiddet sınıflaması — hafif/orta/ağır. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/berlin-ards",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Berlin ARDS Kriterleri",
          aciklama: "Berlin ARDS Kriterleri: ARDS tanı ve şiddet sınıflaması — hafif/orta/ağır. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/berlin-ards",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Berlin ARDS Kriterleri", yol: "/tools/berlin-ards" },
        ])}
      />
      {children}
    </>
  );
}
