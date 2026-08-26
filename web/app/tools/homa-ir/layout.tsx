// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "HOMA-IR — İnsülin direnci indeksi",
  description: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/homa-ir" },
  openGraph: {
    type: "website",
    title: "HOMA-IR — İnsülin direnci indeksi",
    description: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/homa-ir",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "HOMA-IR",
          aciklama: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/homa-ir",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "HOMA-IR", yol: "/tools/homa-ir" },
        ])}
      />
      {children}
    </>
  );
}
