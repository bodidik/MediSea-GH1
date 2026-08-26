// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "NIHSS — NIH İnme Skalası",
  description: "NIHSS: NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nihss" },
  openGraph: {
    type: "website",
    title: "NIHSS — NIH İnme Skalası",
    description: "NIHSS: NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nihss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "NIHSS",
          aciklama: "NIHSS: NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/nihss",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "NIHSS", yol: "/tools/nihss" },
        ])}
      />
      {children}
    </>
  );
}
