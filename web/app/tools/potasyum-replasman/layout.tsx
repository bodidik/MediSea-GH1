// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Potasyum Replasmanı — IV potasyumda hız, derişim ve",
  description: "Potasyum Replasmanı: IV potasyumda hız, derişim ve süre sınırları — periferik ve santral yol ayrı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/potasyum-replasman" },
  openGraph: {
    type: "website",
    title: "Potasyum Replasmanı — IV potasyumda hız, derişim ve",
    description: "Potasyum Replasmanı: IV potasyumda hız, derişim ve süre sınırları — periferik ve santral yol ayrı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/potasyum-replasman",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Potasyum Replasmanı",
          aciklama: "Potasyum Replasmanı: IV potasyumda hız, derişim ve süre sınırları — periferik ve santral yol ayrı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/potasyum-replasman",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Potasyum Replasmanı", yol: "/tools/potasyum-replasman" },
        ])}
      />
      {children}
    </>
  );
}
