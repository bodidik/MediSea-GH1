// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BODE İndeksi — KOAH 4 yıllık mortalite tahmini",
  description: "BODE İndeksi: KOAH 4 yıllık mortalite tahmini — BMI + FEV1 + mMRC + 6DYT. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bode" },
  openGraph: {
    type: "website",
    title: "BODE İndeksi — KOAH 4 yıllık mortalite tahmini",
    description: "BODE İndeksi: KOAH 4 yıllık mortalite tahmini — BMI + FEV1 + mMRC + 6DYT. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bode",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "BODE İndeksi",
          aciklama: "BODE İndeksi: KOAH 4 yıllık mortalite tahmini — BMI + FEV1 + mMRC + 6DYT. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bode",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "BODE İndeksi", yol: "/tools/bode" },
        ])}
      />
      {children}
    </>
  );
}
