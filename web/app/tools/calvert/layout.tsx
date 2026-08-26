// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Calvert Formülü — Karboplatin AUC bazlı doz hesaplama",
  description: "Calvert Formülü: Karboplatin AUC bazlı doz hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/calvert" },
  openGraph: {
    type: "website",
    title: "Calvert Formülü — Karboplatin AUC bazlı doz hesaplama",
    description: "Calvert Formülü: Karboplatin AUC bazlı doz hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/calvert",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Calvert Formülü",
          aciklama: "Calvert Formülü: Karboplatin AUC bazlı doz hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/calvert",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Calvert Formülü", yol: "/tools/calvert" },
        ])}
      />
      {children}
    </>
  );
}
