// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "IPI Skoru — Uluslararası Prognostik İndeks",
  description: "IPI Skoru: Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ipi" },
  openGraph: {
    type: "website",
    title: "IPI Skoru — Uluslararası Prognostik İndeks",
    description: "IPI Skoru: Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ipi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "IPI Skoru",
          aciklama: "IPI Skoru: Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ipi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "IPI Skoru", yol: "/tools/ipi" },
        ])}
      />
      {children}
    </>
  );
}
