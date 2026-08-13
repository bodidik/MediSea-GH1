// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Anyon Açığı — Metabolik asidoz ayırıcı tanısı",
  description: "Anyon Açığı: Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/anion-gap" },
  openGraph: {
    type: "website",
    title: "Anyon Açığı — Metabolik asidoz ayırıcı tanısı",
    description: "Anyon Açığı: Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/anion-gap",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Anyon Açığı",
          aciklama: "Anyon Açığı: Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/anion-gap",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Anyon Açığı", yol: "/tools/anion-gap" },
        ])}
      />
      {children}
    </>
  );
}
