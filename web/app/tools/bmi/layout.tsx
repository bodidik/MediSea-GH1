// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BMI & İdeal Vücut Ağırlığı — Vücut kitle indeksi",
  description: "BMI & İdeal Vücut Ağırlığı: Vücut kitle indeksi + Devine / Hamwi formülleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bmi" },
  openGraph: {
    type: "website",
    title: "BMI & İdeal Vücut Ağırlığı — Vücut kitle indeksi",
    description: "BMI & İdeal Vücut Ağırlığı: Vücut kitle indeksi + Devine / Hamwi formülleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bmi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "BMI & İdeal Vücut Ağırlığı",
          aciklama: "BMI & İdeal Vücut Ağırlığı: Vücut kitle indeksi + Devine / Hamwi formülleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bmi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "BMI & İdeal Vücut Ağırlığı", yol: "/tools/bmi" },
        ])}
      />
      {children}
    </>
  );
}
