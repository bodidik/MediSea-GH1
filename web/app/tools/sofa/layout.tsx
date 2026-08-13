// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SOFA Skoru — Yoğun bakımda organ yetmezliği takibi",
  description: "SOFA Skoru: Yoğun bakımda organ yetmezliği takibi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sofa" },
  openGraph: {
    type: "website",
    title: "SOFA Skoru — Yoğun bakımda organ yetmezliği takibi",
    description: "SOFA Skoru: Yoğun bakımda organ yetmezliği takibi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sofa",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SOFA Skoru",
          aciklama: "SOFA Skoru: Yoğun bakımda organ yetmezliği takibi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sofa",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SOFA Skoru", yol: "/tools/sofa" },
        ])}
      />
      {children}
    </>
  );
}
