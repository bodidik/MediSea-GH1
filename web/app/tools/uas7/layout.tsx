// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "UAS7 — Ürtikar Aktivite Skoru (7 gün)",
  description: "UAS7: Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/uas7" },
  openGraph: {
    type: "website",
    title: "UAS7 — Ürtikar Aktivite Skoru (7 gün)",
    description: "UAS7: Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/uas7",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "UAS7",
          aciklama: "UAS7: Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/uas7",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "UAS7", yol: "/tools/uas7" },
        ])}
      />
      {children}
    </>
  );
}
