// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Wells Skoru (DVT) — Derin ven trombozu klinik olasılığı",
  description: "Wells Skoru (DVT): Derin ven trombozu klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/wells-dvt" },
  openGraph: {
    type: "website",
    title: "Wells Skoru (DVT) — Derin ven trombozu klinik olasılığı",
    description: "Wells Skoru (DVT): Derin ven trombozu klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/wells-dvt",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Wells Skoru (DVT)",
          aciklama: "Wells Skoru (DVT): Derin ven trombozu klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/wells-dvt",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Wells Skoru (DVT)", yol: "/tools/wells-dvt" },
        ])}
      />
      {children}
    </>
  );
}
