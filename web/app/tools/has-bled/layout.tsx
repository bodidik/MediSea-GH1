// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "HAS-BLED Skoru — Antikoagülasyon kanama riski",
  description: "HAS-BLED Skoru: Antikoagülasyon kanama riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/has-bled" },
  openGraph: {
    type: "website",
    title: "HAS-BLED Skoru — Antikoagülasyon kanama riski",
    description: "HAS-BLED Skoru: Antikoagülasyon kanama riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/has-bled",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
