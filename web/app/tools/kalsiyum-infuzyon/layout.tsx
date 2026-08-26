// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Kalsiyum İnfüzyonu — Glukonat/klorür dönüşümü",
  description: "Kalsiyum İnfüzyonu: Glukonat/klorür dönüşümü — aynı ampul üç kat farklı elementer kalsiyum taşır. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/kalsiyum-infuzyon" },
  openGraph: {
    type: "website",
    title: "Kalsiyum İnfüzyonu — Glukonat/klorür dönüşümü",
    description: "Kalsiyum İnfüzyonu: Glukonat/klorür dönüşümü — aynı ampul üç kat farklı elementer kalsiyum taşır. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/kalsiyum-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Kalsiyum İnfüzyonu",
          aciklama: "Kalsiyum İnfüzyonu: Glukonat/klorür dönüşümü — aynı ampul üç kat farklı elementer kalsiyum taşır. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/kalsiyum-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Kalsiyum İnfüzyonu", yol: "/tools/kalsiyum-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
