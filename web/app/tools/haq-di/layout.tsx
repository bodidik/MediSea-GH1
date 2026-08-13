// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "HAQ-DI — Sağlık Değerlendirme Anketi",
  description: "HAQ-DI: Sağlık Değerlendirme Anketi — Engellilik İndeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/haq-di" },
  openGraph: {
    type: "website",
    title: "HAQ-DI — Sağlık Değerlendirme Anketi",
    description: "HAQ-DI: Sağlık Değerlendirme Anketi — Engellilik İndeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/haq-di",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "HAQ-DI",
          aciklama: "HAQ-DI: Sağlık Değerlendirme Anketi — Engellilik İndeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/haq-di",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "HAQ-DI", yol: "/tools/haq-di" },
        ])}
      />
      {children}
    </>
  );
}
