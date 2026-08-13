// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Refeeding Sendromu Riski — NICE kriterleri",
  description: "Refeeding Sendromu Riski: NICE kriterleri — beslenme başlatmada hipofosfatemi riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/refeeding-risk" },
  openGraph: {
    type: "website",
    title: "Refeeding Sendromu Riski — NICE kriterleri",
    description: "Refeeding Sendromu Riski: NICE kriterleri — beslenme başlatmada hipofosfatemi riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/refeeding-risk",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
