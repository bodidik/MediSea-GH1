// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Düzeltilmiş Sodyum — Hiperglisemi düzeltmesi",
  description: "Düzeltilmiş Sodyum: Hiperglisemi düzeltmesi (Katz formülü). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/corrected-sodium" },
  openGraph: {
    type: "website",
    title: "Düzeltilmiş Sodyum — Hiperglisemi düzeltmesi",
    description: "Düzeltilmiş Sodyum: Hiperglisemi düzeltmesi (Katz formülü). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/corrected-sodium",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
