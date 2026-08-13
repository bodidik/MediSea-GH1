// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Glasgow Koma Skalası — Bilinç düzeyi değerlendirmesi",
  description: "Glasgow Koma Skalası: Bilinç düzeyi değerlendirmesi (E+V+M). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gcs" },
  openGraph: {
    type: "website",
    title: "Glasgow Koma Skalası — Bilinç düzeyi değerlendirmesi",
    description: "Glasgow Koma Skalası: Bilinç düzeyi değerlendirmesi (E+V+M). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gcs",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
