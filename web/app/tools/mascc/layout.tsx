// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MASCC Risk İndeksi — Febril nötropenide komplikasyon",
  description: "MASCC Risk İndeksi: Febril nötropenide komplikasyon riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mascc" },
  openGraph: {
    type: "website",
    title: "MASCC Risk İndeksi — Febril nötropenide komplikasyon",
    description: "MASCC Risk İndeksi: Febril nötropenide komplikasyon riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mascc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
