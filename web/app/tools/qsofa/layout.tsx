// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "qSOFA Skoru — Hızlı sepsis yatak başı değerlendirme",
  description: "qSOFA Skoru: Hızlı sepsis yatak başı değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/qsofa" },
  openGraph: {
    type: "website",
    title: "qSOFA Skoru — Hızlı sepsis yatak başı değerlendirme",
    description: "qSOFA Skoru: Hızlı sepsis yatak başı değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/qsofa",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "qSOFA Skoru",
          aciklama: "qSOFA Skoru: Hızlı sepsis yatak başı değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/qsofa",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "qSOFA Skoru", yol: "/tools/qsofa" },
        ])}
      />
      {children}
    </>
  );
}
