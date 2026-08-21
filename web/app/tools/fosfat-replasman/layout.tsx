// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Fosfat Replasmanı — Zorunlu potasyum/sodyum yükü",
  description: "Fosfat Replasmanı: Zorunlu potasyum/sodyum yükü — süreyi çoğu zaman fosfat değil potasyum sınırlıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/fosfat-replasman" },
  openGraph: {
    type: "website",
    title: "Fosfat Replasmanı — Zorunlu potasyum/sodyum yükü",
    description: "Fosfat Replasmanı: Zorunlu potasyum/sodyum yükü — süreyi çoğu zaman fosfat değil potasyum sınırlıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/fosfat-replasman",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Fosfat Replasmanı",
          aciklama: "Fosfat Replasmanı: Zorunlu potasyum/sodyum yükü — süreyi çoğu zaman fosfat değil potasyum sınırlıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/fosfat-replasman",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Fosfat Replasmanı", yol: "/tools/fosfat-replasman" },
        ])}
      />
      {children}
    </>
  );
}
