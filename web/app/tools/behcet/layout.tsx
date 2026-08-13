// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Behçet — ICBD 2014 — Behçet hastalığı tanı kriterleri",
  description: "Behçet — ICBD 2014: Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/behcet" },
  openGraph: {
    type: "website",
    title: "Behçet — ICBD 2014 — Behçet hastalığı tanı kriterleri",
    description: "Behçet — ICBD 2014: Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/behcet",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Behçet — ICBD 2014",
          aciklama: "Behçet — ICBD 2014: Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/behcet",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Behçet — ICBD 2014", yol: "/tools/behcet" },
        ])}
      />
      {children}
    </>
  );
}
