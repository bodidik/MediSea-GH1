// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sodyum Yönetimi — TBW · Hiponatremi · Hipernatremi",
  description: "Sodyum Yönetimi: TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sodium" },
  openGraph: {
    type: "website",
    title: "Sodyum Yönetimi — TBW · Hiponatremi · Hipernatremi",
    description: "Sodyum Yönetimi: TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sodium",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
