// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "PaP Score — Palyatif Prognostik Skor",
  description: "PaP Score: Palyatif Prognostik Skor — 30 günlük sağkalım (Grup A/B/C). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/pap-score" },
  openGraph: {
    type: "website",
    title: "PaP Score — Palyatif Prognostik Skor",
    description: "PaP Score: Palyatif Prognostik Skor — 30 günlük sağkalım (Grup A/B/C). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/pap-score",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "PaP Score",
          aciklama: "PaP Score: Palyatif Prognostik Skor — 30 günlük sağkalım (Grup A/B/C). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/pap-score",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "PaP Score", yol: "/tools/pap-score" },
        ])}
      />
      {children}
    </>
  );
}
