// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "HbA1c → Ortalama Glukoz — Tahmini ortalama glukoz",
  description: "HbA1c → Ortalama Glukoz: Tahmini ortalama glukoz (ADA/NGSP). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/hba1c-eag" },
  openGraph: {
    type: "website",
    title: "HbA1c → Ortalama Glukoz — Tahmini ortalama glukoz",
    description: "HbA1c → Ortalama Glukoz: Tahmini ortalama glukoz (ADA/NGSP). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/hba1c-eag",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
