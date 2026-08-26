// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Düzeltilmiş Kalsiyum — Albumin'e göre Ca+2 hesaplama",
  description: "Düzeltilmiş Kalsiyum: Albumin'e göre Ca+2 hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/corrected-calcium" },
  openGraph: {
    type: "website",
    title: "Düzeltilmiş Kalsiyum — Albumin'e göre Ca+2 hesaplama",
    description: "Düzeltilmiş Kalsiyum: Albumin'e göre Ca+2 hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/corrected-calcium",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Düzeltilmiş Kalsiyum",
          aciklama: "Düzeltilmiş Kalsiyum: Albumin'e göre Ca+2 hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/corrected-calcium",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Düzeltilmiş Kalsiyum", yol: "/tools/corrected-calcium" },
        ])}
      />
      {children}
    </>
  );
}
