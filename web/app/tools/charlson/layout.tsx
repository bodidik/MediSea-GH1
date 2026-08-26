// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Charlson Komorbidite İndeksi",
  description: "Charlson Komorbidite İndeksi: CCI — 10 yıllık mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/charlson" },
  openGraph: {
    type: "website",
    title: "Charlson Komorbidite İndeksi",
    description: "Charlson Komorbidite İndeksi: CCI — 10 yıllık mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/charlson",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Charlson Komorbidite İndeksi",
          aciklama: "Charlson Komorbidite İndeksi: CCI — 10 yıllık mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/charlson",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Charlson Komorbidite İndeksi", yol: "/tools/charlson" },
        ])}
      />
      {children}
    </>
  );
}
