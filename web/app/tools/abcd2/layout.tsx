// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ABCD² Skoru — TİA sonrası 2 günlük inme riski tahmini",
  description: "ABCD² Skoru: TİA sonrası 2 günlük inme riski tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/abcd2" },
  openGraph: {
    type: "website",
    title: "ABCD² Skoru — TİA sonrası 2 günlük inme riski tahmini",
    description: "ABCD² Skoru: TİA sonrası 2 günlük inme riski tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/abcd2",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ABCD² Skoru",
          aciklama: "ABCD² Skoru: TİA sonrası 2 günlük inme riski tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/abcd2",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ABCD² Skoru", yol: "/tools/abcd2" },
        ])}
      />
      {children}
    </>
  );
}
