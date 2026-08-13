// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Palyatif Prognostik İndeks (PPI) — Terminal kanserde",
  description: "Palyatif Prognostik İndeks (PPI): Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ppi" },
  openGraph: {
    type: "website",
    title: "Palyatif Prognostik İndeks (PPI) — Terminal kanserde",
    description: "Palyatif Prognostik İndeks (PPI): Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ppi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Palyatif Prognostik İndeks (PPI)",
          aciklama: "Palyatif Prognostik İndeks (PPI): Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ppi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Palyatif Prognostik İndeks (PPI)", yol: "/tools/ppi" },
        ])}
      />
      {children}
    </>
  );
}
