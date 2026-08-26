// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Fomepizol Dozu — Metanol ve etilen glikol",
  description: "Fomepizol Dozu: Metanol ve etilen glikol zehirlenmesinde yükleme ve idame dozları — diyaliz aralığı dahil. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/fomepizol" },
  openGraph: {
    type: "website",
    title: "Fomepizol Dozu — Metanol ve etilen glikol",
    description: "Fomepizol Dozu: Metanol ve etilen glikol zehirlenmesinde yükleme ve idame dozları — diyaliz aralığı dahil. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/fomepizol",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Fomepizol Dozu",
          aciklama: "Fomepizol Dozu: Metanol ve etilen glikol zehirlenmesinde yükleme ve idame dozları — diyaliz aralığı dahil. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/fomepizol",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Fomepizol Dozu", yol: "/tools/fomepizol" },
        ])}
      />
      {children}
    </>
  );
}
