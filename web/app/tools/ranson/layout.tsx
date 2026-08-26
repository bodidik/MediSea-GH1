// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Ranson Kriterleri — Akut pankreatit şiddet",
  description: "Ranson Kriterleri: Akut pankreatit şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ranson" },
  openGraph: {
    type: "website",
    title: "Ranson Kriterleri — Akut pankreatit şiddet",
    description: "Ranson Kriterleri: Akut pankreatit şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ranson",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Ranson Kriterleri",
          aciklama: "Ranson Kriterleri: Akut pankreatit şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ranson",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Ranson Kriterleri", yol: "/tools/ranson" },
        ])}
      />
      {children}
    </>
  );
}
