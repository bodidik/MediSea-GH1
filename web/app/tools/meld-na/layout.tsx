// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MELD-Na Skoru — ESKH mortalite tahmini",
  description: "MELD-Na Skoru: ESKH mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/meld-na" },
  openGraph: {
    type: "website",
    title: "MELD-Na Skoru — ESKH mortalite tahmini",
    description: "MELD-Na Skoru: ESKH mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/meld-na",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
