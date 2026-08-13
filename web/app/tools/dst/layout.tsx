// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Deksametazon Süpresyon Testi (DST) — 1 mg / 2 mg LDDST",
  description: "Deksametazon Süpresyon Testi (DST): 1 mg / 2 mg LDDST / 8 mg HDDST — Cushing tarama & lokalizasyon. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dst" },
  openGraph: {
    type: "website",
    title: "Deksametazon Süpresyon Testi (DST) — 1 mg / 2 mg LDDST",
    description: "Deksametazon Süpresyon Testi (DST): 1 mg / 2 mg LDDST / 8 mg HDDST — Cushing tarama & lokalizasyon. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dst",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
