// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "GDS-15 — Geriatrik Depresyon Ölçeği kısa form",
  description: "GDS-15: Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gds-15" },
  openGraph: {
    type: "website",
    title: "GDS-15 — Geriatrik Depresyon Ölçeği kısa form",
    description: "GDS-15: Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gds-15",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "GDS-15",
          aciklama: "GDS-15: Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/gds-15",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "GDS-15", yol: "/tools/gds-15" },
        ])}
      />
      {children}
    </>
  );
}
