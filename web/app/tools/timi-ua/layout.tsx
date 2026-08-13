// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "TIMI UA/NSTEMI — Kararsız angina/NSTEMI 14 günlük olay",
  description: "TIMI UA/NSTEMI: Kararsız angina/NSTEMI 14 günlük olay riski — 7 kriter. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/timi-ua" },
  openGraph: {
    type: "website",
    title: "TIMI UA/NSTEMI — Kararsız angina/NSTEMI 14 günlük olay",
    description: "TIMI UA/NSTEMI: Kararsız angina/NSTEMI 14 günlük olay riski — 7 kriter. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/timi-ua",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "TIMI UA/NSTEMI",
          aciklama: "TIMI UA/NSTEMI: Kararsız angina/NSTEMI 14 günlük olay riski — 7 kriter. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/timi-ua",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "TIMI UA/NSTEMI", yol: "/tools/timi-ua" },
        ])}
      />
      {children}
    </>
  );
}
