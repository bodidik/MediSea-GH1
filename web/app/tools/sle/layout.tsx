// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SLE Kriterleri — Sistemik Lupus Eritematozus sınıflama",
  description: "SLE Kriterleri: Sistemik Lupus Eritematozus sınıflama kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sle" },
  openGraph: {
    type: "website",
    title: "SLE Kriterleri — Sistemik Lupus Eritematozus sınıflama",
    description: "SLE Kriterleri: Sistemik Lupus Eritematozus sınıflama kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sle",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SLE Kriterleri",
          aciklama: "SLE Kriterleri: Sistemik Lupus Eritematozus sınıflama kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sle",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SLE Kriterleri", yol: "/tools/sle" },
        ])}
      />
      {children}
    </>
  );
}
