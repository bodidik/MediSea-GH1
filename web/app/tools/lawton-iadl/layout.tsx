// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lawton IADL — Enstrümental günlük yaşam aktiviteleri",
  description: "Lawton IADL: Enstrümental günlük yaşam aktiviteleri — 8 madde (alışveriş, ilaç, finans). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/lawton-iadl" },
  openGraph: {
    type: "website",
    title: "Lawton IADL — Enstrümental günlük yaşam aktiviteleri",
    description: "Lawton IADL: Enstrümental günlük yaşam aktiviteleri — 8 madde (alışveriş, ilaç, finans). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/lawton-iadl",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
