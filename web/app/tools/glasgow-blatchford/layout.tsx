// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Glasgow-Blatchford Skoru — Üst GİS kanaması",
  description: "Glasgow-Blatchford Skoru: Üst GİS kanaması — endoskopi öncesi risk. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/glasgow-blatchford" },
  openGraph: {
    type: "website",
    title: "Glasgow-Blatchford Skoru — Üst GİS kanaması",
    description: "Glasgow-Blatchford Skoru: Üst GİS kanaması — endoskopi öncesi risk. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/glasgow-blatchford",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Glasgow-Blatchford Skoru",
          aciklama: "Glasgow-Blatchford Skoru: Üst GİS kanaması — endoskopi öncesi risk. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/glasgow-blatchford",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Glasgow-Blatchford Skoru", yol: "/tools/glasgow-blatchford" },
        ])}
      />
      {children}
    </>
  );
}
