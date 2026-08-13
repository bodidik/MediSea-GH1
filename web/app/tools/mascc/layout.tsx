// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

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
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "MASCC Risk İndeksi",
          aciklama: "MASCC Risk İndeksi: Febril nötropenide komplikasyon riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mascc",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "MASCC Risk İndeksi", yol: "/tools/mascc" },
        ])}
      />
      {children}
    </>
  );
}
