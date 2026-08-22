// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Naloksan İnfüzyonu — Saatlik hız uyandıran bolusun 2/3'ü",
  description: "Naloksan İnfüzyonu: Saatlik hız uyandıran bolusun 2/3'ü — antidot zehirden ÖNCE bitiyor, izlem süresi opioide göre değişir. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/naloksan-infuzyon" },
  openGraph: {
    type: "website",
    title: "Naloksan İnfüzyonu — Saatlik hız uyandıran bolusun 2/3'ü",
    description: "Naloksan İnfüzyonu: Saatlik hız uyandıran bolusun 2/3'ü — antidot zehirden ÖNCE bitiyor, izlem süresi opioide göre değişir. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/naloksan-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Naloksan İnfüzyonu",
          aciklama: "Naloksan İnfüzyonu: Saatlik hız uyandıran bolusun 2/3'ü — antidot zehirden ÖNCE bitiyor, izlem süresi opioide göre değişir. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/naloksan-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Naloksan İnfüzyonu", yol: "/tools/naloksan-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
