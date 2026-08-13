// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "HEART Skoru — Göğüs ağrısı risk stratifikasyonu",
  description: "HEART Skoru: Göğüs ağrısı risk stratifikasyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/heart-score" },
  openGraph: {
    type: "website",
    title: "HEART Skoru — Göğüs ağrısı risk stratifikasyonu",
    description: "HEART Skoru: Göğüs ağrısı risk stratifikasyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/heart-score",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "HEART Skoru",
          aciklama: "HEART Skoru: Göğüs ağrısı risk stratifikasyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/heart-score",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "HEART Skoru", yol: "/tools/heart-score" },
        ])}
      />
      {children}
    </>
  );
}
