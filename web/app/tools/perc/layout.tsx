// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "PERC Kriterleri — PE düşük risk dışlama protokolü",
  description: "PERC Kriterleri: PE düşük risk dışlama protokolü. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/perc" },
  openGraph: {
    type: "website",
    title: "PERC Kriterleri — PE düşük risk dışlama protokolü",
    description: "PERC Kriterleri: PE düşük risk dışlama protokolü. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/perc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
