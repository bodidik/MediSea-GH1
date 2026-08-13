// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "mMRC Dispne — Modifiye Medical Research Council dispne",
  description: "mMRC Dispne: Modifiye Medical Research Council dispne ölçeği — Grade 0–4. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mmrc" },
  openGraph: {
    type: "website",
    title: "mMRC Dispne — Modifiye Medical Research Council dispne",
    description: "mMRC Dispne: Modifiye Medical Research Council dispne ölçeği — Grade 0–4. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mmrc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
