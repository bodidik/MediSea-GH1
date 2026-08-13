// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CAM-ICU — YBÜ deliryum taraması",
  description: "CAM-ICU: YBÜ deliryum taraması — 4 özellik, PADIS kılavuzu önerisi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/cam-icu" },
  openGraph: {
    type: "website",
    title: "CAM-ICU — YBÜ deliryum taraması",
    description: "CAM-ICU: YBÜ deliryum taraması — 4 özellik, PADIS kılavuzu önerisi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/cam-icu",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
