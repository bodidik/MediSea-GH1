// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "IPSS-R — MDS Revize Prognostik Skorlama",
  description: "IPSS-R: MDS Revize Prognostik Skorlama — sitogenetik + blast + CBC parametreleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ipss-r" },
  openGraph: {
    type: "website",
    title: "IPSS-R — MDS Revize Prognostik Skorlama",
    description: "IPSS-R: MDS Revize Prognostik Skorlama — sitogenetik + blast + CBC parametreleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ipss-r",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "IPSS-R",
          aciklama: "IPSS-R: MDS Revize Prognostik Skorlama — sitogenetik + blast + CBC parametreleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ipss-r",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "IPSS-R", yol: "/tools/ipss-r" },
        ])}
      />
      {children}
    </>
  );
}
