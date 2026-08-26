// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Magnezyum İnfüzyonu — Endikasyona göre doz, süre ve",
  description: "Magnezyum İnfüzyonu: Endikasyona göre doz, süre ve pompa hızı — torsades ile replasman hızları zıt. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/magnezyum-infuzyon" },
  openGraph: {
    type: "website",
    title: "Magnezyum İnfüzyonu — Endikasyona göre doz, süre ve",
    description: "Magnezyum İnfüzyonu: Endikasyona göre doz, süre ve pompa hızı — torsades ile replasman hızları zıt. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/magnezyum-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Magnezyum İnfüzyonu",
          aciklama: "Magnezyum İnfüzyonu: Endikasyona göre doz, süre ve pompa hızı — torsades ile replasman hızları zıt. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/magnezyum-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Magnezyum İnfüzyonu", yol: "/tools/magnezyum-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
