// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DLQI — Dermatoloji Yaşam Kalitesi İndeksi",
  description: "DLQI: Dermatoloji Yaşam Kalitesi İndeksi — 10 madde, 0–30. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dlqi" },
  openGraph: {
    type: "website",
    title: "DLQI — Dermatoloji Yaşam Kalitesi İndeksi",
    description: "DLQI: Dermatoloji Yaşam Kalitesi İndeksi — 10 madde, 0–30. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dlqi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DLQI",
          aciklama: "DLQI: Dermatoloji Yaşam Kalitesi İndeksi — 10 madde, 0–30. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/dlqi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DLQI", yol: "/tools/dlqi" },
        ])}
      />
      {children}
    </>
  );
}
