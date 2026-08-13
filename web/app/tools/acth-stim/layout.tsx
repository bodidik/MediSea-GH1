// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ACTH Stimülasyon Testi — 250 μg / 1 μg protokol",
  description: "ACTH Stimülasyon Testi: 250 μg / 1 μg protokol — adrenal yetmezlik kortizol yanıtı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/acth-stim" },
  openGraph: {
    type: "website",
    title: "ACTH Stimülasyon Testi — 250 μg / 1 μg protokol",
    description: "ACTH Stimülasyon Testi: 250 μg / 1 μg protokol — adrenal yetmezlik kortizol yanıtı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/acth-stim",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ACTH Stimülasyon Testi",
          aciklama: "ACTH Stimülasyon Testi: 250 μg / 1 μg protokol — adrenal yetmezlik kortizol yanıtı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/acth-stim",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ACTH Stimülasyon Testi", yol: "/tools/acth-stim" },
        ])}
      />
      {children}
    </>
  );
}
