// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "HOMA-IR — İnsülin direnci indeksi",
  description: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/homa-ir" },
  openGraph: {
    type: "website",
    title: "HOMA-IR — İnsülin direnci indeksi",
    description: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/homa-ir",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
