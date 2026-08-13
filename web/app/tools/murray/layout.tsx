// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Murray Skoru — Akciğer hasar skoru",
  description: "Murray Skoru: Akciğer hasar skoru — ARDS şiddet değerlendirmesi, ECMO eşiği ≥ 2.5. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/murray" },
  openGraph: {
    type: "website",
    title: "Murray Skoru — Akciğer hasar skoru",
    description: "Murray Skoru: Akciğer hasar skoru — ARDS şiddet değerlendirmesi, ECMO eşiği ≥ 2.5. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/murray",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Murray Skoru",
          aciklama: "Murray Skoru: Akciğer hasar skoru — ARDS şiddet değerlendirmesi, ECMO eşiği ≥ 2.5. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/murray",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Murray Skoru", yol: "/tools/murray" },
        ])}
      />
      {children}
    </>
  );
}
