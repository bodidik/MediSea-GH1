// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SDAI — Basitleştirilmiş Hastalık Aktivite İndeksi",
  description: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sdai" },
  openGraph: {
    type: "website",
    title: "SDAI — Basitleştirilmiş Hastalık Aktivite İndeksi",
    description: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sdai",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SDAI",
          aciklama: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sdai",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SDAI", yol: "/tools/sdai" },
        ])}
      />
      {children}
    </>
  );
}
