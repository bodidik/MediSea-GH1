// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "RASS — Richmond Ajitasyon–Sedasyon Skalası",
  description: "RASS: Richmond Ajitasyon–Sedasyon Skalası — −5/+4, sedasyon hedefi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rass" },
  openGraph: {
    type: "website",
    title: "RASS — Richmond Ajitasyon–Sedasyon Skalası",
    description: "RASS: Richmond Ajitasyon–Sedasyon Skalası — −5/+4, sedasyon hedefi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rass",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
