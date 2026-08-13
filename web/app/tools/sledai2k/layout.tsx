// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SLEDAI-2K — SLE hastalık aktivite indeksi",
  description: "SLEDAI-2K: SLE hastalık aktivite indeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sledai2k" },
  openGraph: {
    type: "website",
    title: "SLEDAI-2K — SLE hastalık aktivite indeksi",
    description: "SLEDAI-2K: SLE hastalık aktivite indeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sledai2k",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SLEDAI-2K",
          aciklama: "SLEDAI-2K: SLE hastalık aktivite indeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sledai2k",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SLEDAI-2K", yol: "/tools/sledai2k" },
        ])}
      />
      {children}
    </>
  );
}
