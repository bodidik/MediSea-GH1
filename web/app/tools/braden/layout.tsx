// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Braden Skalası — Bası yarası risk değerlendirmesi",
  description: "Braden Skalası: Bası yarası risk değerlendirmesi — 6 alt ölçek, 6–23 puan. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/braden" },
  openGraph: {
    type: "website",
    title: "Braden Skalası — Bası yarası risk değerlendirmesi",
    description: "Braden Skalası: Bası yarası risk değerlendirmesi — 6 alt ölçek, 6–23 puan. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/braden",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Braden Skalası",
          aciklama: "Braden Skalası: Bası yarası risk değerlendirmesi — 6 alt ölçek, 6–23 puan. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/braden",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Braden Skalası", yol: "/tools/braden" },
        ])}
      />
      {children}
    </>
  );
}
