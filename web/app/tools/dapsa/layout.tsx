// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "DAPSA — Psoriatik Artrit Hastalık Aktivite Skoru",
  description: "DAPSA: Psoriatik Artrit Hastalık Aktivite Skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dapsa" },
  openGraph: {
    type: "website",
    title: "DAPSA — Psoriatik Artrit Hastalık Aktivite Skoru",
    description: "DAPSA: Psoriatik Artrit Hastalık Aktivite Skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dapsa",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
