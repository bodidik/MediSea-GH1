// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Barthel ADL İndeksi — Günlük yaşam aktiviteleri",
  description: "Barthel ADL İndeksi: Günlük yaşam aktiviteleri — fonksiyonel bağımsızlık değerlendirmesi (0–100). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/barthel" },
  openGraph: {
    type: "website",
    title: "Barthel ADL İndeksi — Günlük yaşam aktiviteleri",
    description: "Barthel ADL İndeksi: Günlük yaşam aktiviteleri — fonksiyonel bağımsızlık değerlendirmesi (0–100). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/barthel",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
