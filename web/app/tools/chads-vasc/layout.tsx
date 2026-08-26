// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CHA₂DS₂-VASc Skoru — AF'de inme riski hesaplama",
  description: "CHA₂DS₂-VASc Skoru: AF'de inme riski hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/chads-vasc" },
  openGraph: {
    type: "website",
    title: "CHA₂DS₂-VASc Skoru — AF'de inme riski hesaplama",
    description: "CHA₂DS₂-VASc Skoru: AF'de inme riski hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/chads-vasc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CHA₂DS₂-VASc Skoru",
          aciklama: "CHA₂DS₂-VASc Skoru: AF'de inme riski hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/chads-vasc",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CHA₂DS₂-VASc Skoru", yol: "/tools/chads-vasc" },
        ])}
      />
      {children}
    </>
  );
}
