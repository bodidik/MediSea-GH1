// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "RTS — Revize Travma Skoru",
  description: "RTS: Revize Travma Skoru — GCS + SKB + Solunum hızı, tahmini sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rts" },
  openGraph: {
    type: "website",
    title: "RTS — Revize Travma Skoru",
    description: "RTS: Revize Travma Skoru — GCS + SKB + Solunum hızı, tahmini sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rts",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "RTS",
          aciklama: "RTS: Revize Travma Skoru — GCS + SKB + Solunum hızı, tahmini sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rts",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "RTS", yol: "/tools/rts" },
        ])}
      />
      {children}
    </>
  );
}
