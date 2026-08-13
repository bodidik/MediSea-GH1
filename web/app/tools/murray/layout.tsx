// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Murray Skoru — Akciğer hasar skoru",
  description: "Murray Skoru: Akciğer hasar skoru — ARDS şiddet değerlendirmesi, ECMO eşiği ≥ 2.5. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/murray" },
  openGraph: {
    type: "website",
    title: "Murray Skoru — Akciğer hasar skoru",
    description: "Murray Skoru: Akciğer hasar skoru — ARDS şiddet değerlendirmesi, ECMO eşiği ≥ 2.5. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/murray",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
