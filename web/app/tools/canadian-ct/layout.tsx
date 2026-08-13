// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kanada BT Kural — Minör kafa travmasında BT endikasyonu",
  description: "Kanada BT Kural: Minör kafa travmasında BT endikasyonu — yüksek/orta risk kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/canadian-ct" },
  openGraph: {
    type: "website",
    title: "Kanada BT Kural — Minör kafa travmasında BT endikasyonu",
    description: "Kanada BT Kural: Minör kafa travmasında BT endikasyonu — yüksek/orta risk kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/canadian-ct",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
