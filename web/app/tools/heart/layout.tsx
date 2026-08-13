// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "HEART Skoru — Akut göğüs ağrısı kardiyak risk triyajı",
  description: "HEART Skoru: Akut göğüs ağrısı kardiyak risk triyajı — 5 kriter (H-E-A-R-T). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/heart" },
  openGraph: {
    type: "website",
    title: "HEART Skoru — Akut göğüs ağrısı kardiyak risk triyajı",
    description: "HEART Skoru: Akut göğüs ağrısı kardiyak risk triyajı — 5 kriter (H-E-A-R-T). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/heart",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "HEART Skoru",
          aciklama: "HEART Skoru: Akut göğüs ağrısı kardiyak risk triyajı — 5 kriter (H-E-A-R-T). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/heart",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "HEART Skoru", yol: "/tools/heart" },
        ])}
      />
      {children}
    </>
  );
}
