// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CDAI — Klinik Hastalık Aktivite İndeksi",
  description: "CDAI: Klinik Hastalık Aktivite İndeksi — RA (lab gerektirmez). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/cdai" },
  openGraph: {
    type: "website",
    title: "CDAI — Klinik Hastalık Aktivite İndeksi",
    description: "CDAI: Klinik Hastalık Aktivite İndeksi — RA (lab gerektirmez). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/cdai",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CDAI",
          aciklama: "CDAI: Klinik Hastalık Aktivite İndeksi — RA (lab gerektirmez). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/cdai",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CDAI", yol: "/tools/cdai" },
        ])}
      />
      {children}
    </>
  );
}
