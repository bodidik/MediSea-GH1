// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SGA — Sübjektif Global Değerlendirme",
  description: "SGA: Sübjektif Global Değerlendirme — klinik nütrisyon muayenesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sga" },
  openGraph: {
    type: "website",
    title: "SGA — Sübjektif Global Değerlendirme",
    description: "SGA: Sübjektif Global Değerlendirme — klinik nütrisyon muayenesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sga",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
