// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Khorana Skoru — Kemoterapi ilişkili VTE riski",
  description: "Khorana Skoru: Kemoterapi ilişkili VTE riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/khorana" },
  openGraph: {
    type: "website",
    title: "Khorana Skoru — Kemoterapi ilişkili VTE riski",
    description: "Khorana Skoru: Kemoterapi ilişkili VTE riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/khorana",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Khorana Skoru",
          aciklama: "Khorana Skoru: Kemoterapi ilişkili VTE riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/khorana",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Khorana Skoru", yol: "/tools/khorana" },
        ])}
      />
      {children}
    </>
  );
}
