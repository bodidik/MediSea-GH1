// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ESAS — Edmonton Semptom Değerlendirme",
  description: "ESAS: Edmonton Semptom Değerlendirme — 9 semptom, 0–10 skala. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/esas" },
  openGraph: {
    type: "website",
    title: "ESAS — Edmonton Semptom Değerlendirme",
    description: "ESAS: Edmonton Semptom Değerlendirme — 9 semptom, 0–10 skala. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/esas",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
