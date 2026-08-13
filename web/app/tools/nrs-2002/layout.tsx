// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "NRS-2002 — Yatan hastalarda beslenme riski taraması",
  description: "NRS-2002: Yatan hastalarda beslenme riski taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nrs-2002" },
  openGraph: {
    type: "website",
    title: "NRS-2002 — Yatan hastalarda beslenme riski taraması",
    description: "NRS-2002: Yatan hastalarda beslenme riski taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nrs-2002",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "NRS-2002",
          aciklama: "NRS-2002: Yatan hastalarda beslenme riski taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/nrs-2002",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "NRS-2002", yol: "/tools/nrs-2002" },
        ])}
      />
      {children}
    </>
  );
}
