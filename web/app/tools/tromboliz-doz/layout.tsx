// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Tromboliz Dozu (rt-PA) — İnmede kiloya göre + 90 mg",
  description: "Tromboliz Dozu (rt-PA): İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tromboliz-doz" },
  openGraph: {
    type: "website",
    title: "Tromboliz Dozu (rt-PA) — İnmede kiloya göre + 90 mg",
    description: "Tromboliz Dozu (rt-PA): İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tromboliz-doz",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Tromboliz Dozu (rt-PA)",
          aciklama: "Tromboliz Dozu (rt-PA): İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tromboliz-doz",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Tromboliz Dozu (rt-PA)", yol: "/tools/tromboliz-doz" },
        ])}
      />
      {children}
    </>
  );
}
