// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Rockall Skoru — Üst GİS kanaması",
  description: "Rockall Skoru: Üst GİS kanaması — yeniden kanama ve mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rockall" },
  openGraph: {
    type: "website",
    title: "Rockall Skoru — Üst GİS kanaması",
    description: "Rockall Skoru: Üst GİS kanaması — yeniden kanama ve mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rockall",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Rockall Skoru",
          aciklama: "Rockall Skoru: Üst GİS kanaması — yeniden kanama ve mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rockall",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Rockall Skoru", yol: "/tools/rockall" },
        ])}
      />
      {children}
    </>
  );
}
