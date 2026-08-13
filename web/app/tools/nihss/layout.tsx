// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "NIHSS — NIH İnme Skalası",
  description: "NIHSS: NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nihss" },
  openGraph: {
    type: "website",
    title: "NIHSS — NIH İnme Skalası",
    description: "NIHSS: NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nihss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
