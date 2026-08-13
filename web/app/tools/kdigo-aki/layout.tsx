// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "KDIGO AKI Evrelemesi — Akut böbrek hasarı evrelemesi",
  description: "KDIGO AKI Evrelemesi: Akut böbrek hasarı evrelemesi (kreatinin + idrar çıkışı). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/kdigo-aki" },
  openGraph: {
    type: "website",
    title: "KDIGO AKI Evrelemesi — Akut böbrek hasarı evrelemesi",
    description: "KDIGO AKI Evrelemesi: Akut böbrek hasarı evrelemesi (kreatinin + idrar çıkışı). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/kdigo-aki",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "KDIGO AKI Evrelemesi",
          aciklama: "KDIGO AKI Evrelemesi: Akut böbrek hasarı evrelemesi (kreatinin + idrar çıkışı). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/kdigo-aki",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "KDIGO AKI Evrelemesi", yol: "/tools/kdigo-aki" },
        ])}
      />
      {children}
    </>
  );
}
