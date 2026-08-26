// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CIWA-Ar — Alkol yoksunluğu şiddeti",
  description: "CIWA-Ar: Alkol yoksunluğu şiddeti — 10 madde, nöbet/deliryum riski değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ciwa-ar" },
  openGraph: {
    type: "website",
    title: "CIWA-Ar — Alkol yoksunluğu şiddeti",
    description: "CIWA-Ar: Alkol yoksunluğu şiddeti — 10 madde, nöbet/deliryum riski değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ciwa-ar",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CIWA-Ar",
          aciklama: "CIWA-Ar: Alkol yoksunluğu şiddeti — 10 madde, nöbet/deliryum riski değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ciwa-ar",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CIWA-Ar", yol: "/tools/ciwa-ar" },
        ])}
      />
      {children}
    </>
  );
}
