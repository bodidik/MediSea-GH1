// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "İnfüzyon Hesaplama — IV doz ve damla sayısı asistanı",
  description: "İnfüzyon Hesaplama: IV doz ve damla sayısı asistanı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/infusion" },
  openGraph: {
    type: "website",
    title: "İnfüzyon Hesaplama — IV doz ve damla sayısı asistanı",
    description: "İnfüzyon Hesaplama: IV doz ve damla sayısı asistanı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/infusion",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "İnfüzyon Hesaplama",
          aciklama: "İnfüzyon Hesaplama: IV doz ve damla sayısı asistanı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/infusion",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "İnfüzyon Hesaplama", yol: "/tools/infusion" },
        ])}
      />
      {children}
    </>
  );
}
