// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ASDAS-CRP/ESR — Ankilozan Spondilit Hastalık Aktivite",
  description: "ASDAS-CRP/ESR: Ankilozan Spondilit Hastalık Aktivite Skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/asdas" },
  openGraph: {
    type: "website",
    title: "ASDAS-CRP/ESR — Ankilozan Spondilit Hastalık Aktivite",
    description: "ASDAS-CRP/ESR: Ankilozan Spondilit Hastalık Aktivite Skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/asdas",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ASDAS-CRP/ESR",
          aciklama: "ASDAS-CRP/ESR: Ankilozan Spondilit Hastalık Aktivite Skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/asdas",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ASDAS-CRP/ESR", yol: "/tools/asdas" },
        ])}
      />
      {children}
    </>
  );
}
