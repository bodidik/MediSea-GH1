// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Fibromiyalji 2016 — ACR 2016",
  description: "Fibromiyalji 2016: ACR 2016 — WPI + Semptom Şiddet Skalası tanı kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/fibromiyalji" },
  openGraph: {
    type: "website",
    title: "Fibromiyalji 2016 — ACR 2016",
    description: "Fibromiyalji 2016: ACR 2016 — WPI + Semptom Şiddet Skalası tanı kriterleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/fibromiyalji",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
