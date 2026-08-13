// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Spot İdrar Hesaplamaları — PCR · ACR · FENa · FEÜre",
  description: "Spot İdrar Hesaplamaları: PCR · ACR · FENa · FEÜre · TTKG · İdrar Anyon Açığı · İdrar Osmolal Gap. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/spot-urine" },
  openGraph: {
    type: "website",
    title: "Spot İdrar Hesaplamaları — PCR · ACR · FENa · FEÜre",
    description: "Spot İdrar Hesaplamaları: PCR · ACR · FENa · FEÜre · TTKG · İdrar Anyon Açığı · İdrar Osmolal Gap. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/spot-urine",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
