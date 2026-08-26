// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Serum Osmolal Gap — Ölçülen − hesaplanan osmolalite",
  description: "Serum Osmolal Gap: Ölçülen − hesaplanan osmolalite · toksik alkol taraması · tahmini madde düzeyleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/osmolal-gap" },
  openGraph: {
    type: "website",
    title: "Serum Osmolal Gap — Ölçülen − hesaplanan osmolalite",
    description: "Serum Osmolal Gap: Ölçülen − hesaplanan osmolalite · toksik alkol taraması · tahmini madde düzeyleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/osmolal-gap",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Serum Osmolal Gap",
          aciklama: "Serum Osmolal Gap: Ölçülen − hesaplanan osmolalite · toksik alkol taraması · tahmini madde düzeyleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/osmolal-gap",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Serum Osmolal Gap", yol: "/tools/osmolal-gap" },
        ])}
      />
      {children}
    </>
  );
}
