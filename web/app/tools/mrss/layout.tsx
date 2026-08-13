// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "mRSS — Modifiye Rodnan Deri Skoru",
  description: "mRSS: Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mrss" },
  openGraph: {
    type: "website",
    title: "mRSS — Modifiye Rodnan Deri Skoru",
    description: "mRSS: Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mrss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "mRSS",
          aciklama: "mRSS: Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mrss",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "mRSS", yol: "/tools/mrss" },
        ])}
      />
      {children}
    </>
  );
}
