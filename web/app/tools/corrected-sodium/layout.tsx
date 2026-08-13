// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Düzeltilmiş Sodyum — Hiperglisemi düzeltmesi",
  description: "Düzeltilmiş Sodyum: Hiperglisemi düzeltmesi (Katz formülü). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/corrected-sodium" },
  openGraph: {
    type: "website",
    title: "Düzeltilmiş Sodyum — Hiperglisemi düzeltmesi",
    description: "Düzeltilmiş Sodyum: Hiperglisemi düzeltmesi (Katz formülü). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/corrected-sodium",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Düzeltilmiş Sodyum",
          aciklama: "Düzeltilmiş Sodyum: Hiperglisemi düzeltmesi (Katz formülü). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/corrected-sodium",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Düzeltilmiş Sodyum", yol: "/tools/corrected-sodium" },
        ])}
      />
      {children}
    </>
  );
}
