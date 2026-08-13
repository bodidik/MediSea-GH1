// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "RAPID3 — Rutin Değerlendirme 3 Hasta Ölçütü",
  description: "RAPID3: Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rapid3" },
  openGraph: {
    type: "website",
    title: "RAPID3 — Rutin Değerlendirme 3 Hasta Ölçütü",
    description: "RAPID3: Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rapid3",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "RAPID3",
          aciklama: "RAPID3: Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rapid3",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "RAPID3", yol: "/tools/rapid3" },
        ])}
      />
      {children}
    </>
  );
}
