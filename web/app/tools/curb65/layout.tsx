// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CURB-65 Skoru — Toplum kökenli pnömoni triyaj kararı",
  description: "CURB-65 Skoru: Toplum kökenli pnömoni triyaj kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/curb65" },
  openGraph: {
    type: "website",
    title: "CURB-65 Skoru — Toplum kökenli pnömoni triyaj kararı",
    description: "CURB-65 Skoru: Toplum kökenli pnömoni triyaj kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/curb65",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CURB-65 Skoru",
          aciklama: "CURB-65 Skoru: Toplum kökenli pnömoni triyaj kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/curb65",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CURB-65 Skoru", yol: "/tools/curb65" },
        ])}
      />
      {children}
    </>
  );
}
