// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Lipid Emülsiyon (LAST) — Bolus, idame ve kümülatif tavan",
  description: "Lipid Emülsiyon (LAST): Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/lipid-emulsiyon" },
  openGraph: {
    type: "website",
    title: "Lipid Emülsiyon (LAST) — Bolus, idame ve kümülatif tavan",
    description: "Lipid Emülsiyon (LAST): Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/lipid-emulsiyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Lipid Emülsiyon (LAST)",
          aciklama: "Lipid Emülsiyon (LAST): Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/lipid-emulsiyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Lipid Emülsiyon (LAST)", yol: "/tools/lipid-emulsiyon" },
        ])}
      />
      {children}
    </>
  );
}
