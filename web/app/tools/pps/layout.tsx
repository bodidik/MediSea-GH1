// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Palliative Performance Scale",
  description: "Palliative Performance Scale: PPS v2 — palyatif bakımda 5 domain fonksiyonel durum. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/pps" },
  openGraph: {
    type: "website",
    title: "Palliative Performance Scale",
    description: "Palliative Performance Scale: PPS v2 — palyatif bakımda 5 domain fonksiyonel durum. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/pps",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
