// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Duke Kriterleri — Enfektif Endokardit tanı deşifresi",
  description: "Duke Kriterleri: Enfektif Endokardit tanı deşifresi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/endocarditis" },
  openGraph: {
    type: "website",
    title: "Duke Kriterleri — Enfektif Endokardit tanı deşifresi",
    description: "Duke Kriterleri: Enfektif Endokardit tanı deşifresi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/endocarditis",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
