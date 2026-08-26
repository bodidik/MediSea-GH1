// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ACR TI-RADS — Tiroid nodülü US değerlendirme",
  description: "ACR TI-RADS: Tiroid nodülü US değerlendirme — kompozisyon, ekojenite, şekil, sınır, odaklar + İİAB kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tirads" },
  openGraph: {
    type: "website",
    title: "ACR TI-RADS — Tiroid nodülü US değerlendirme",
    description: "ACR TI-RADS: Tiroid nodülü US değerlendirme — kompozisyon, ekojenite, şekil, sınır, odaklar + İİAB kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tirads",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ACR TI-RADS",
          aciklama: "ACR TI-RADS: Tiroid nodülü US değerlendirme — kompozisyon, ekojenite, şekil, sınır, odaklar + İİAB kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tirads",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ACR TI-RADS", yol: "/tools/tirads" },
        ])}
      />
      {children}
    </>
  );
}
