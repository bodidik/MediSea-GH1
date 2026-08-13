// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MNA® (Kısa Form) — Geriatrik popülasyon nütrisyonel",
  description: "MNA® (Kısa Form): Geriatrik popülasyon nütrisyonel değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mna" },
  openGraph: {
    type: "website",
    title: "MNA® (Kısa Form) — Geriatrik popülasyon nütrisyonel",
    description: "MNA® (Kısa Form): Geriatrik popülasyon nütrisyonel değerlendirme. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mna",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
