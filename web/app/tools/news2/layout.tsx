// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "NEWS2 Skoru — Klinik kötüleşme erken uyarı sistemi",
  description: "NEWS2 Skoru: Klinik kötüleşme erken uyarı sistemi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/news2" },
  openGraph: {
    type: "website",
    title: "NEWS2 Skoru — Klinik kötüleşme erken uyarı sistemi",
    description: "NEWS2 Skoru: Klinik kötüleşme erken uyarı sistemi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/news2",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "NEWS2 Skoru",
          aciklama: "NEWS2 Skoru: Klinik kötüleşme erken uyarı sistemi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/news2",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "NEWS2 Skoru", yol: "/tools/news2" },
        ])}
      />
      {children}
    </>
  );
}
