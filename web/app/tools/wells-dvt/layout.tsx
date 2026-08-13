// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Wells Skoru (DVT) — Derin ven trombozu klinik olasılığı",
  description: "Wells Skoru (DVT): Derin ven trombozu klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/wells-dvt" },
  openGraph: {
    type: "website",
    title: "Wells Skoru (DVT) — Derin ven trombozu klinik olasılığı",
    description: "Wells Skoru (DVT): Derin ven trombozu klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/wells-dvt",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
