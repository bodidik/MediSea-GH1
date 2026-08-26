// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "HAS-BLED Skoru — Antikoagülasyon kanama riski",
  description: "HAS-BLED Skoru: Antikoagülasyon kanama riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/has-bled" },
  openGraph: {
    type: "website",
    title: "HAS-BLED Skoru — Antikoagülasyon kanama riski",
    description: "HAS-BLED Skoru: Antikoagülasyon kanama riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/has-bled",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "HAS-BLED Skoru",
          aciklama: "HAS-BLED Skoru: Antikoagülasyon kanama riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/has-bled",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "HAS-BLED Skoru", yol: "/tools/has-bled" },
        ])}
      />
      {children}
    </>
  );
}
