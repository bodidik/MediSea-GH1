// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CAT Skoru — KOAH Değerlendirme Testi",
  description: "CAT Skoru: KOAH Değerlendirme Testi — 8 Likert maddesi, semptom yükü. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/cat-copd" },
  openGraph: {
    type: "website",
    title: "CAT Skoru — KOAH Değerlendirme Testi",
    description: "CAT Skoru: KOAH Değerlendirme Testi — 8 Likert maddesi, semptom yükü. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/cat-copd",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CAT Skoru",
          aciklama: "CAT Skoru: KOAH Değerlendirme Testi — 8 Likert maddesi, semptom yükü. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/cat-copd",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CAT Skoru", yol: "/tools/cat-copd" },
        ])}
      />
      {children}
    </>
  );
}
