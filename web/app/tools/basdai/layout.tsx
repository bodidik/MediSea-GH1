// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BASDAI — Bath Ankilozan Spondilit Hastalık Aktivite",
  description: "BASDAI: Bath Ankilozan Spondilit Hastalık Aktivite İndeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/basdai" },
  openGraph: {
    type: "website",
    title: "BASDAI — Bath Ankilozan Spondilit Hastalık Aktivite",
    description: "BASDAI: Bath Ankilozan Spondilit Hastalık Aktivite İndeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/basdai",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "BASDAI",
          aciklama: "BASDAI: Bath Ankilozan Spondilit Hastalık Aktivite İndeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/basdai",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "BASDAI", yol: "/tools/basdai" },
        ])}
      />
      {children}
    </>
  );
}
