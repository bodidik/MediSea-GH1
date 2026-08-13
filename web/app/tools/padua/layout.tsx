// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Padua Skoru — Yatan dahili hastalarda VTE profilaksi",
  description: "Padua Skoru: Yatan dahili hastalarda VTE profilaksi kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/padua" },
  openGraph: {
    type: "website",
    title: "Padua Skoru — Yatan dahili hastalarda VTE profilaksi",
    description: "Padua Skoru: Yatan dahili hastalarda VTE profilaksi kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/padua",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Padua Skoru",
          aciklama: "Padua Skoru: Yatan dahili hastalarda VTE profilaksi kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/padua",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Padua Skoru", yol: "/tools/padua" },
        ])}
      />
      {children}
    </>
  );
}
