// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
  return <>{children}</>;
}
