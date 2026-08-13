// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "BMR & TDEE — Bazal metabolizma hızı",
  description: "BMR & TDEE: Bazal metabolizma hızı — Mifflin–St Jeor. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bmr" },
  openGraph: {
    type: "website",
    title: "BMR & TDEE — Bazal metabolizma hızı",
    description: "BMR & TDEE: Bazal metabolizma hızı — Mifflin–St Jeor. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bmr",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
