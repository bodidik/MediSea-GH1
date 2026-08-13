// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ANC Hesaplama — Mutlak nötrofil sayısı ve nötropeni",
  description: "ANC Hesaplama: Mutlak nötrofil sayısı ve nötropeni evrelemesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/anc" },
  openGraph: {
    type: "website",
    title: "ANC Hesaplama — Mutlak nötrofil sayısı ve nötropeni",
    description: "ANC Hesaplama: Mutlak nötrofil sayısı ve nötropeni evrelemesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/anc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ANC Hesaplama",
          aciklama: "ANC Hesaplama: Mutlak nötrofil sayısı ve nötropeni evrelemesi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/anc",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ANC Hesaplama", yol: "/tools/anc" },
        ])}
      />
      {children}
    </>
  );
}
