// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "TNSS — Total Nazal Semptom Skoru",
  description: "TNSS: Total Nazal Semptom Skoru — 4 semptom, 0–12. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tnss" },
  openGraph: {
    type: "website",
    title: "TNSS — Total Nazal Semptom Skoru",
    description: "TNSS: Total Nazal Semptom Skoru — 4 semptom, 0–12. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tnss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "TNSS",
          aciklama: "TNSS: Total Nazal Semptom Skoru — 4 semptom, 0–12. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tnss",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "TNSS", yol: "/tools/tnss" },
        ])}
      />
      {children}
    </>
  );
}
