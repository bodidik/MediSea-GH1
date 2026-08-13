// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "eGFR (CKD-EPI 2021) — Race-free böbrek fonksiyon analizi",
  description: "eGFR (CKD-EPI 2021): Race-free böbrek fonksiyon analizi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/egfr" },
  openGraph: {
    type: "website",
    title: "eGFR (CKD-EPI 2021) — Race-free böbrek fonksiyon analizi",
    description: "eGFR (CKD-EPI 2021): Race-free böbrek fonksiyon analizi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/egfr",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
