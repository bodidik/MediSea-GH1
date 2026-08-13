// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MUST — Malnutrition Universal Screening Tool",
  description: "MUST: Malnutrition Universal Screening Tool — toplum & poliklinik. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/must" },
  openGraph: {
    type: "website",
    title: "MUST — Malnutrition Universal Screening Tool",
    description: "MUST: Malnutrition Universal Screening Tool — toplum & poliklinik. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/must",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
