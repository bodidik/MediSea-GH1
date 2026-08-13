// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SDAI — Basitleştirilmiş Hastalık Aktivite İndeksi",
  description: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sdai" },
  openGraph: {
    type: "website",
    title: "SDAI — Basitleştirilmiş Hastalık Aktivite İndeksi",
    description: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sdai",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
